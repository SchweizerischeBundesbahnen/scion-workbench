/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectorRef, Component, computed, CUSTOM_ELEMENTS_SCHEMA, DestroyRef, ElementRef, inject, Injector, linkedSignal, Provider, signal, Signal, untracked, viewChild} from '@angular/core';
import {firstValueFrom, MonoTypeOperatorFunction, switchMap, tap} from 'rxjs';
import {filter, first, map, take} from 'rxjs/operators';
import {ManifestService, mapToBody, MessageClient, MessageHeaders, MicrofrontendPlatformConfig, OutletRouter, ResponseStatusCodes, SciRouterOutletElement, TopicMessage} from '@scion/microfrontend-platform';
import {ManifestObjectCache} from '../manifest-object-cache.service';
import {WorkbenchViewCapability, ɵVIEW_CAPABILITY_ID_PARAM_NAME, ɵVIEW_ID_CONTEXT_KEY, ɵViewParamsUpdateCommand, ɵWorkbenchCommands} from '@scion/workbench-client';
import {Dictionaries, Maps, Objects} from '@scion/toolkit/util';
import {Logger, LoggerNames} from '../../logging';
import {CanCloseRef} from '../../workbench.model';
import {IFRAME_OVERLAY_HOST} from '../../workbench-element-references';
import {serializeExecution} from '../../common/operators';
import {ɵWorkbenchView} from '../../view/ɵworkbench-view.model';
import {ViewMenuService} from '../../part/view-context-menu/view-menu.service';
import {WorkbenchRouter} from '../../routing/workbench-router.service';
import {stringifyError} from '../../common/stringify-error.util';
import {MICROFRONTEND_VIEW_NAVIGATION_HINT, MICROFRONTEND_VIEW_STATE_TRANSIENT_PARAMS, splitMicrofrontendViewParams} from './microfrontend-view-routes';
import {NgComponentOutlet} from '@angular/common';
import {ContentAsOverlayComponent, ContentAsOverlayConfig} from '../../content-projection/content-as-overlay.component';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {WorkbenchLayoutService} from '../../layout/workbench-layout.service';
import {MicrofrontendSplashComponent} from '../microfrontend-splash/microfrontend-splash.component';
import {GLASS_PANE_BLOCKABLE, GLASS_PANE_OPTIONS, GlassPaneDirective, GlassPaneOptions} from '../../glass-pane/glass-pane.directive';
import {Microfrontends} from '../common/microfrontend.util';
import {WorkbenchView} from '../../view/workbench-view.model';
import {rootEffect, toRootObservable} from '../../common/rxjs-interop.util';
import {createRemoteTranslatable} from '../microfrontend-text/remote-text-provider';
import {prune} from '../../common/prune.util';
import {MicrofrontendViewNavigationData} from './microfrontend-view-navigation-data';
import {Routing} from '../../routing/routing.util';

/**
 * Embeds the microfrontend of a view capability.
 */
@Component({
  selector: 'wb-microfrontend-view',
  styleUrls: ['./microfrontend-view.component.scss'],
  templateUrl: './microfrontend-view.component.html',
  imports: [
    ContentAsOverlayComponent,
    NgComponentOutlet,
    GlassPaneDirective,
  ],
  viewProviders: [
    configureMicrofrontendGlassPane(),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // required because <sci-router-outlet> is a custom element
})
export class MicrofrontendViewComponent {

  private readonly _host = inject(ElementRef).nativeElement as HTMLElement;
  private readonly _outletRouter = inject(OutletRouter);
  private readonly _manifestService = inject(ManifestService);
  private readonly _messageClient = inject(MessageClient);
  private readonly _logger = inject(Logger);
  private readonly _workbenchRouter = inject(WorkbenchRouter);
  private readonly _injector = inject(Injector);
  private readonly _changeDetectorRef = inject(ChangeDetectorRef);

  private readonly _routerOutletElement = viewChild.required<ElementRef<SciRouterOutletElement>>('router_outlet');
  private readonly _universalKeystrokes = [
    ['escape'], // keystroke to close notifications
    ['ctrl', 'shift', 'F12'], // keystroke to minimize activities
  ];

  protected readonly view = inject(ɵWorkbenchView);
  protected readonly workbenchLayoutService = inject(WorkbenchLayoutService);
  /** Splash to display until the microfrontend signals readiness. */
  protected readonly splash = inject(MicrofrontendPlatformConfig).splash ?? MicrofrontendSplashComponent;
  /** Keystrokes which to bubble across iframe boundaries from embedded content. */
  protected readonly keystrokesToBubble = this.computeKeyStrokesToBubble();
  protected readonly focusWithin = signal(false);
  /** Configures iframe projection. */
  protected readonly overlayConfig: ContentAsOverlayConfig = {
    location: inject(IFRAME_OVERLAY_HOST),
    visible: this.view.slot.portal.attached,
  };

  protected readonly navigationContext = this.computeNavigationContext();

  constructor() {
    this._logger.debug(() => `Constructing MicrofrontendViewComponent. [viewId=${this.view.id}]`, LoggerNames.MICROFRONTEND_ROUTING);
    this.installViewActivePublisher();
    this.installViewFocusedPublisher();
    this.installPartIdPublisher();
    this.installCanCloseGuard();
    this.installMenuAccelerators();
    this.propagateWorkbenchTheme();
    this.propagateViewContext();
    this.installNavigator();
    this.installParamsUpdater();

    inject(DestroyRef).onDestroy(() => this.unload());
  }

  private installNavigator(): void {
    // Use a root effect to emit even if detached from change detection.
    toRootObservable(this.navigationContext)
      .pipe(
        tap(context => this.onPreNavigate(context)),
        filter((context): context is NavigationContext => !!context.capability),
        delayIfLazy(),
        serializeExecution(context => this.onNavigate(context)),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  /**
   * Computes the current navigation of this microfrontend view.
   */
  private computeNavigationContext(): Signal<NavigationContext> {
    const manifestObjectCache = inject(ManifestObjectCache);
    const navigationData = computed(() => this.view.navigation()!.data as unknown as MicrofrontendViewNavigationData);
    const transientParams = computed(() => this.view.navigation()!.state?.[MICROFRONTEND_VIEW_STATE_TRANSIENT_PARAMS] ?? {});
    const capability = manifestObjectCache.capability<WorkbenchViewCapability>(computed(() => navigationData().capabilityId));

    return linkedSignal({
      source: () => ({navigationData: navigationData(), capability: capability(), transientParams: transientParams()}),
      computation: ({navigationData, capability, transientParams}, previousNavigationContext) => ({
        capabilityId: navigationData.capabilityId,
        capability: capability,
        prevCapability: previousNavigationContext?.value.capability,
        params: Maps.coerce({
          ...navigationData.params,
          ...transientParams,
        }),
        referrer: navigationData.referrer,
      }),
      equal: (a, b) => a.capability?.metadata!.id === b.capability?.metadata!.id && Objects.isEqual(a.params, b.params), // do not create new navigation context when navigating to the same capability with the same params
    });
  }

  /**
   * Provides the view context to embedded content.
   */
  private propagateViewContext(): void {
    // Use root effect to run even if the parent component is detached from change detection (e.g., if the view is not visible).
    rootEffect(() => {
      const routerOutletElement = this._routerOutletElement().nativeElement;
      untracked(() => routerOutletElement.setContextValue(ɵVIEW_ID_CONTEXT_KEY, this.view.id));
    });
  }

  /**
   * Method invoked before performing the actual navigation.
   *
   * Unlike {@link onNavigate}, this method is also invoked if the view is inactive, allowing for updating view properties such as the view tab title.
   */
  private onPreNavigate(context: NavigationContext): void {
    const {capability, params, prevCapability} = context;

    // Signal application about unloading.
    if (context.prevCapability?.metadata!.appSymbolicName !== capability?.metadata!.appSymbolicName) {
      void this._messageClient.publish(ɵWorkbenchCommands.viewUnloadingTopic(this.view.id));
    }

    // Unset view properties on capability change.
    if (!capability || prevCapability?.metadata!.id !== capability.metadata!.id) {
      this.view.title = null;
      this.view.heading = null;
      this.view.classList.application = capability?.properties.cssClass;
      this.view.closable = capability?.properties.closable ?? true;
      this.view.dirty = false;
    }

    // Update configured title, if any, to substitute interpolation parameters.
    if (capability?.properties.title) {
      this.view.title = createRemoteTranslatable(capability.properties.title, {appSymbolicName: capability.metadata!.appSymbolicName, valueParams: params, topicParams: capability.properties.resolve});
    }
    // Update configured heading, if any, to substitute interpolation parameters.
    if (capability?.properties.heading) {
      this.view.heading = createRemoteTranslatable(capability.properties.heading, {appSymbolicName: capability.metadata!.appSymbolicName, valueParams: params, topicParams: capability.properties.resolve});
    }

    // Trigger manual change detection to update attributes on the `sci-router-outlet`,
    // required for inactive views since detached from the Angular component tree.
    if (!this.view.active()) {
      this._changeDetectorRef.detectChanges();
    }

    // Unload microfrontend if capability was not found.
    if (!capability) {
      this._logger.warn(() => `[NullCapabilityError] No application found to provide a view capability of id '${context.capabilityId}'. Maybe, the requested view is not public API or the providing application not available.`, LoggerNames.MICROFRONTEND_ROUTING);

      // Unload microfrontend and free resources.
      this.unload();
      void Routing.runCanMatchGuards({injector: this._injector});
    }
  }

  /**
   * Method invoked to perform a navigation.
   *
   * This method is invoked only if the view is active, blocking any subsequent navigation until this method returns.
   */
  private async onNavigate(context: NavigationContext): Promise<void> {
    const capability = context.capability!;
    const params = context.params;
    const prevCapability = context.prevCapability;

    // Pass parameters to the microfrontend.
    await this._messageClient.publish(ɵWorkbenchCommands.viewParamsTopic(this.view.id), new Map(params).set(ɵVIEW_CAPABILITY_ID_PARAM_NAME, context.capabilityId), {retain: true});

    // When navigating to another view capability of the same app, wait until transported the params to the microfrontend before loading the
    // new microfrontend into the iframe, allowing the currently loaded microfrontend to clean up subscriptions.
    if (prevCapability &&
      prevCapability.metadata!.appSymbolicName === capability.metadata!.appSymbolicName &&
      prevCapability.metadata!.id !== capability.metadata!.id) {
      await this.waitForCapabilityParam(capability.metadata!.id);
    }

    // Wait for the context to be set on the router outlet, as @scion/workbench-client expects it to be available on startup.
    if (!prevCapability) {
      await Microfrontends.waitForContext(this._routerOutletElement, ɵVIEW_ID_CONTEXT_KEY, {injector: this._injector});
    }

    // Navigate to the microfrontend.
    const application = this._manifestService.getApplication(capability.metadata!.appSymbolicName);
    this._logger.debug(() => `Loading microfrontend into "${this.view.id}" [app=${capability.metadata!.appSymbolicName}, baseUrl=${application.baseUrl}, path=${(capability.properties.path)}].`, LoggerNames.MICROFRONTEND_ROUTING, params, capability);
    await this._outletRouter.navigate(capability.properties.path, {
      outlet: this.view.id,
      relativeTo: application.baseUrl,
      params: params,
      pushStateToSessionHistoryStack: false,
      showSplash: capability.metadata!.id !== prevCapability?.metadata?.id ? capability.properties.showSplash : false,
    });
  }

  private installMenuAccelerators(): void {
    // Since the iframe is added at a top-level location in the DOM, that is, not as a child element of this component,
    // the workbench view misses keyboard events from embedded content. As a result, menu item accelerators of the context
    // menu of this view do not work, so we install the accelerators on the router outlet as well.
    inject(ViewMenuService).installMenuAccelerators(this._routerOutletElement, this.view);
  }

  /**
   * Subscribes to requests from the currently loaded microfrontend to update its parameters.
   */
  private installParamsUpdater(): void {
    this._messageClient.observe$<ɵViewParamsUpdateCommand>(ɵWorkbenchCommands.viewParamsUpdateTopic(this.view.id, ':capabilityId'))
      .pipe(takeUntilDestroyed())
      .subscribe((request: TopicMessage<ɵViewParamsUpdateCommand>) => {
        const replyTo = request.headers.get(MessageHeaders.ReplyTo) as string;
        const context = this.navigationContext();

        // Ignore request if not target of this capability.
        if (request.params!.get('capabilityId') !== context.capabilityId) {
          return;
        }

        // Perform navigation to update view params.
        void this._workbenchRouter.navigate(layout => {
          // Cancel navigation if closed or navigated the view.
          if (this.view.destroyed() || this.navigationContext() !== context) {
            return null;
          }

          const paramsHandling = request.body!.paramsHandling;
          const currentParams = Dictionaries.coerce(context.params);
          const newParams = Dictionaries.coerce(request.body!.params);
          const mergedParams = prune(paramsHandling === 'merge' ? {...currentParams, ...newParams} : newParams);
          const {params, transientParams} = splitMicrofrontendViewParams(mergedParams, context.capability!);

          return layout.navigateView(this.view.id, [], {
            hint: MICROFRONTEND_VIEW_NAVIGATION_HINT,
            data: {
              capabilityId: context.capabilityId,
              params,
              referrer: context.referrer,
            } satisfies MicrofrontendViewNavigationData,
            state: prune({
              [MICROFRONTEND_VIEW_STATE_TRANSIENT_PARAMS]: Object.keys(transientParams).length ? transientParams : undefined,
            }),
          });
        })
          .then(success => this._messageClient.publish(replyTo, success, {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.TERMINAL)}))
          .catch((error: unknown) => this._messageClient.publish(replyTo, stringifyError(error), {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.ERROR)}));
      });
  }

  private installViewActivePublisher(): void {
    // Use root effect to run even if the parent component is detached from change detection (e.g., if the view is not visible).
    rootEffect(() => {
      const active = this.view.active();
      untracked(() => {
        const commandTopic = ɵWorkbenchCommands.viewActiveTopic(this.view.id);
        void this._messageClient.publish(commandTopic, active, {retain: true});
      });
    });
  }

  private installViewFocusedPublisher(): void {
    // Use root effect to run even if the parent component is detached from change detection (e.g., if the view is not visible).
    rootEffect(() => {
      const focused = this.view.focused();
      untracked(() => {
        const commandTopic = ɵWorkbenchCommands.viewFocusedTopic(this.view.id);
        void this._messageClient.publish(commandTopic, focused, {retain: true});
      });
    });
  }

  private installPartIdPublisher(): void {
    // Use root effect to run even if the parent component is detached from change detection (e.g., if the view is not visible).
    rootEffect(() => {
      const part = this.view.part();
      untracked(() => {
        const commandTopic = ɵWorkbenchCommands.viewPartIdTopic(this.view.id);
        void this._messageClient.publish(commandTopic, part.id, {retain: true});
      });
    });
  }

  /**
   * Promise that resolves once params contain the given capability id.
   */
  private async waitForCapabilityParam(capabilityId: string): Promise<void> {
    const viewParams$ = this._messageClient.observe$<Map<string, string>>(ɵWorkbenchCommands.viewParamsTopic(this.view.id))
      .pipe(
        mapToBody(),
        first(params => params.get(ɵVIEW_CAPABILITY_ID_PARAM_NAME) === capabilityId),
      );
    await firstValueFrom(viewParams$);
  }

  private installCanCloseGuard(): void {
    const canCloseTopic = ɵWorkbenchCommands.canCloseTopic(this.view.id);
    let canCloseRef: CanCloseRef | undefined;
    this._messageClient.subscriberCount$(canCloseTopic)
      .pipe(
        map(count => count > 0),
        takeUntilDestroyed(),
      )
      .subscribe(confirmClosing => {
        if (confirmClosing) {
          canCloseRef = this.view.canClose(() => this._messageClient.request$<boolean>(canCloseTopic).pipe(mapToBody()));
        }
        else {
          canCloseRef?.dispose();
        }
      });
  }

  protected onFocusWithin(event: Event): void {
    const {detail: focusWithin} = event as CustomEvent<boolean>;
    this.focusWithin.set(focusWithin);

    if (focusWithin) {
      this._host.dispatchEvent(new CustomEvent('sci-microfrontend-focusin', {bubbles: true}));
    }
  }

  /**
   * Computes keystrokes to bubble through the iframe boundary.
   */
  private computeKeyStrokesToBubble(): Signal<string[]> {
    return computed(() => {
      const accelerators = [
        ...this._universalKeystrokes,
        ...this.view.menuItems().map(menuItem => menuItem.accelerator ?? []),
      ];

      return accelerators
        .filter(accelerator => accelerator.length)
        .map(accelerator => accelerator.map(segment => {
          // Normalize keystrokes according to `SciRouterOutletElement#keystrokes`
          switch (segment) {
            case 'ctrl':
              return 'control';
            case '.':
              return 'dot';
            case ' ':
              return 'space';
            default:
              return segment;
          }
        }))
        .map(accelerator => `keydown.${accelerator.join('.')}{preventDefault=true}`);
    }, {equal: (a, b) => Objects.isEqual(a, b, {ignoreArrayOrder: true})});
  }

  private propagateWorkbenchTheme(): void {
    Microfrontends.propagateTheme(this._routerOutletElement);
  }

  private unload(): void {
    // Delete retained messages to free resources.
    void this._messageClient.publish(ɵWorkbenchCommands.viewActiveTopic(this.view.id), undefined, {retain: true});
    void this._messageClient.publish(ɵWorkbenchCommands.viewFocusedTopic(this.view.id), undefined, {retain: true});
    void this._messageClient.publish(ɵWorkbenchCommands.viewParamsTopic(this.view.id), undefined, {retain: true});
    void this._messageClient.publish(ɵWorkbenchCommands.viewPartIdTopic(this.view.id), undefined, {retain: true});
    void this._outletRouter.navigate(null, {outlet: this.view.id});
  }
}

/**
 * Blocks the microfrontend outlet when dialog(s) overlay this view.
 */
function configureMicrofrontendGlassPane(): Provider[] {
  return [
    {
      provide: GLASS_PANE_BLOCKABLE,
      useFactory: () => inject(ɵWorkbenchView),
    },
    {
      provide: GLASS_PANE_OPTIONS,
      useFactory: (): GlassPaneOptions => ({attributes: {'data-viewid': inject(WorkbenchView).id}}),
    },
  ];
}

/**
 * Mirrors the source if the view is active or non-lazy. Otherwise, emission is delayed until the view is activated.
 *
 * Cancels any previous delayed emission when the source emits again.
 */
function delayIfLazy(): MonoTypeOperatorFunction<NavigationContext> {
  // Use a root effect to continue emitting even if the component is detached from change detection.
  const active$ = toRootObservable(inject(ɵWorkbenchView).active);

  return switchMap(context => {
    const lazy = context.capability!.properties.lazy ?? true;
    return active$.pipe(
      filter(active => active || !lazy),
      map(() => context),
      take(1),
    );
  });
}

/**
 * Context available during a navigation.
 */
interface NavigationContext {
  capabilityId: string;
  capability?: WorkbenchViewCapability;
  prevCapability?: WorkbenchViewCapability;
  params: Map<string, unknown>;
  referrer: string;
}
