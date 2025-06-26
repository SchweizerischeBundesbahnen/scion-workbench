/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectorRef, Component, computed, CUSTOM_ELEMENTS_SCHEMA, DestroyRef, ElementRef, inject, Injector, Provider, Signal, untracked, viewChild} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {firstValueFrom, Observable, Subject, switchMap} from 'rxjs';
import {first, map, takeUntil} from 'rxjs/operators';
import {ManifestService, mapToBody, MessageClient, MessageHeaders, MicrofrontendPlatformConfig, OutletRouter, ResponseStatusCodes, SciRouterOutletElement, TopicMessage} from '@scion/microfrontend-platform';
import {ManifestObjectCache} from '../manifest-object-cache.service';
import {WorkbenchViewCapability, ɵMicrofrontendRouteParams, ɵVIEW_ID_CONTEXT_KEY, ɵViewParamsUpdateCommand, ɵWorkbenchCommands} from '@scion/workbench-client';
import {Arrays, Dictionaries, Maps} from '@scion/toolkit/util';
import {Logger, LoggerNames} from '../../logging';
import {CanCloseRef} from '../../workbench.model';
import {IFRAME_OVERLAY_HOST} from '../../workbench-element-references';
import {serializeExecution} from '../../common/operators';
import {ɵWorkbenchView} from '../../view/ɵworkbench-view.model';
import {ViewMenuService} from '../../part/view-context-menu/view-menu.service';
import {WorkbenchRouter} from '../../routing/workbench-router.service';
import {stringifyError} from '../../common/stringify-error.util';
import {MicrofrontendViewRoutes} from './microfrontend-view-routes';
import {NgClass, NgComponentOutlet} from '@angular/common';
import {ContentAsOverlayComponent, ContentAsOverlayConfig} from '../../content-projection/content-as-overlay.component';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {WorkbenchLayoutService} from '../../layout/workbench-layout.service';
import {MicrofrontendSplashComponent} from '../microfrontend-splash/microfrontend-splash.component';
import {GLASS_PANE_BLOCKABLE, GLASS_PANE_OPTIONS, GlassPaneDirective, GlassPaneOptions} from '../../glass-pane/glass-pane.directive';
import {MicrofrontendWorkbenchView} from './microfrontend-workbench-view.model';
import {Microfrontends} from '../common/microfrontend.util';
import {Objects} from '../../common/objects.util';
import {WorkbenchView} from '../../view/workbench-view.model';
import {rootEffect} from '../../common/root-effect';

/**
 * Embeds the microfrontend of a view capability.
 */
@Component({
  selector: 'wb-microfrontend-view',
  styleUrls: ['./microfrontend-view.component.scss'],
  templateUrl: './microfrontend-view.component.html',
  imports: [
    NgClass,
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
  private readonly _route = inject(ActivatedRoute);
  private readonly _outletRouter = inject(OutletRouter);
  private readonly _manifestService = inject(ManifestService);
  private readonly _manifestObjectCache = inject(ManifestObjectCache);
  private readonly _messageClient = inject(MessageClient);
  private readonly _logger = inject(Logger);
  private readonly _workbenchRouter = inject(WorkbenchRouter);
  private readonly _injector = inject(Injector);
  private readonly _changeDetectorRef = inject(ChangeDetectorRef);
  private readonly _destroyRef = inject(DestroyRef);

  private readonly _routerOutletElement = viewChild.required<ElementRef<SciRouterOutletElement>>('router_outlet');
  private readonly _unsubscribeParamsUpdater$ = new Subject<void>();
  private readonly _universalKeystrokes = [
    ['escape'], // keystroke to close notifications
    ['ctrl', 'shift', 'F12'], // keystroke to minimize activities
  ];

  protected readonly view = inject(ɵWorkbenchView);
  protected readonly workbenchLayoutService = inject(WorkbenchLayoutService);
  /** Splash to display until the microfrontend signals readiness. */
  protected readonly splash = inject(MicrofrontendPlatformConfig).splash ?? MicrofrontendSplashComponent;
  /** Keystrokes which to bubble across iframe boundaries from embedded content. */
  protected readonly keystrokesToBubble: Signal<string[]>;
  /** Configures iframe projection. */
  protected readonly overlayConfig: ContentAsOverlayConfig = {
    location: inject(IFRAME_OVERLAY_HOST),
    visible: this.view.portal.attached,
  };

  protected capability: WorkbenchViewCapability | null = null;

  constructor() {
    this._logger.debug(() => `Constructing MicrofrontendViewComponent. [viewId=${this.view.id}]`, LoggerNames.MICROFRONTEND_ROUTING);
    this.keystrokesToBubble = this.computeKeyStrokesToBubble();
    this.installViewActivePublisher();
    this.installPartIdPublisher();
    this.installCanCloseGuard();
    this.installMenuAccelerators();
    this.propagateWorkbenchTheme();
    this.propagateViewContext();
    this.installNavigator();

    inject(DestroyRef).onDestroy(() => this.unload());
  }

  private installNavigator(): void {
    this._route.params
      .pipe(
        switchMap(params => this.fetchCapability$(params[ɵMicrofrontendRouteParams.ɵVIEW_CAPABILITY_ID] as string).pipe(map(capability => ({capability, params})))),
        serializeExecution(({capability, params}) => this.onNavigate(this.capability, capability, params)),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  /**
   * Provides the view context to embedded content.
   */
  private propagateViewContext(): void {
    // Run as root effect to run even if the parent component is detached from change detection (e.g., if the view is not visible).
    rootEffect(() => {
      const routerOutletElement = this._routerOutletElement().nativeElement;
      untracked(() => routerOutletElement.setContextValue(ɵVIEW_ID_CONTEXT_KEY, this.view.id));
    });
  }

  private async onNavigate(prevCapability: WorkbenchViewCapability | null, capability: WorkbenchViewCapability | null, params: Params): Promise<void> {
    if (!capability) {
      this._logger.warn(() => `[NullCapabilityError] No application found to provide a view capability of id '${params[ɵMicrofrontendRouteParams.ɵVIEW_CAPABILITY_ID]}'. Maybe, the requested view is not public API or the providing application not available.`, LoggerNames.MICROFRONTEND_ROUTING);
      this.unload();
      return;
    }

    this.capability = capability;
    this.view.registerAdapter(MicrofrontendWorkbenchView, new MicrofrontendWorkbenchView(capability, params));

    // Check if navigating to a new microfrontend.
    if (!prevCapability || prevCapability.metadata!.id !== capability.metadata!.id) {
      this.setViewProperties(capability, params);
      this.installParamsUpdater(capability);
    }

    // Signal the currently loaded application to unload.
    if (prevCapability && prevCapability.metadata!.appSymbolicName !== capability.metadata!.appSymbolicName) {
      await this._messageClient.publish(ɵWorkbenchCommands.viewUnloadingTopic(this.view.id));
    }

    // Pass parameters to the microfrontend.
    await this._messageClient.publish(ɵWorkbenchCommands.viewParamsTopic(this.view.id), Maps.coerce(params), {retain: true});

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
    this._logger.debug(() => `Loading microfrontend into workbench view [viewId=${this.view.id}, app=${capability.metadata!.appSymbolicName}, baseUrl=${application.baseUrl}, path=${(capability.properties.path)}].`, LoggerNames.MICROFRONTEND_ROUTING, params, capability);
    await this._outletRouter.navigate(capability.properties.path, {
      outlet: this.view.id,
      relativeTo: application.baseUrl,
      params: params,
      pushStateToSessionHistoryStack: false,
      showSplash: capability.properties.showSplash,
      ɵcapabilityId: capability.metadata!.id,
    });

    // Inactive views are not checked for changes since detached from the Angular component tree.
    // So, we manually trigger change detection to update attributes on the `sci-router-outlet`.
    if (!this.view.active()) {
      this._changeDetectorRef.detectChanges();
    }
  }

  private fetchCapability$(capabilityId: string): Observable<WorkbenchViewCapability | null> {
    return this._manifestObjectCache.observeCapability$(capabilityId);
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
  private installParamsUpdater(viewCapability: WorkbenchViewCapability): void {
    this._unsubscribeParamsUpdater$.next();
    const subscription = this._messageClient.observe$<ɵViewParamsUpdateCommand>(ɵWorkbenchCommands.viewParamsUpdateTopic(this.view.id, viewCapability.metadata!.id))
      .pipe(takeUntilDestroyed(this._destroyRef), takeUntil(this._unsubscribeParamsUpdater$))
      .subscribe((request: TopicMessage<ɵViewParamsUpdateCommand>) => {
        const replyTo = request.headers.get(MessageHeaders.ReplyTo) as string;

        void this._workbenchRouter.navigate(layout => {
          // Cancel navigation if the subscription was closed in the meantime, e.g., because closed the view or navigated to another capability.
          if (subscription.closed) {
            return null;
          }

          const paramsHandling = request.body!.paramsHandling;
          const currentParams = this._route.snapshot.params;
          const newParams = Dictionaries.coerce(request.body!.params); // coerce params for backward compatibility
          const mergedParams = Objects.withoutUndefinedEntries(paramsHandling === 'merge' ? {...currentParams, ...newParams} : newParams);
          const {urlParams, transientParams} = MicrofrontendViewRoutes.splitParams(mergedParams, viewCapability);

          return layout.navigateView(this.view.id, [urlParams], {
            relativeTo: this._route,
            state: Objects.withoutUndefinedEntries({
              [MicrofrontendViewRoutes.STATE_TRANSIENT_PARAMS]: transientParams,
            }),
          });
        })
          .then(success => this._messageClient.publish(replyTo, success, {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.TERMINAL)}))
          .catch((error: unknown) => this._messageClient.publish(replyTo, stringifyError(error), {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.ERROR)}));
      });
  }

  /**
   * Updates the properties of this view, such as the view title, as defined by the capability.
   */
  private setViewProperties(viewCapability: WorkbenchViewCapability, params: Params): void {
    this.view.title = Microfrontends.substituteNamedParameters(viewCapability.properties.title, Maps.coerce(params)) ?? null;
    this.view.heading = Microfrontends.substituteNamedParameters(viewCapability.properties.heading, Maps.coerce(params)) ?? null;
    this.view.classList.application = viewCapability.properties.cssClass;
    this.view.closable = viewCapability.properties.closable ?? true;
    this.view.dirty = false;
  }

  private installViewActivePublisher(): void {
    // Run as root effect to run even if the parent component is detached from change detection (e.g., if the view is not visible).
    rootEffect(() => {
      const active = this.view.active();
      untracked(() => {
        const commandTopic = ɵWorkbenchCommands.viewActiveTopic(this.view.id);
        void this._messageClient.publish(commandTopic, active, {retain: true});
      });
    });
  }

  private installPartIdPublisher(): void {
    // Run as root effect to run even if the parent component is detached from change detection (e.g., if the view is not visible).
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
  private async waitForCapabilityParam(viewCapabilityId: string): Promise<void> {
    const viewParams$ = this._messageClient.observe$<Map<string, string>>(ɵWorkbenchCommands.viewParamsTopic(this.view.id))
      .pipe(
        mapToBody(),
        first(params => params.get(ɵMicrofrontendRouteParams.ɵVIEW_CAPABILITY_ID) === viewCapabilityId),
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
    }, {equal: (a, b) => Arrays.isEqual(a, b, {exactOrder: false})});
  }

  private propagateWorkbenchTheme(): void {
    Microfrontends.propagateTheme(this._routerOutletElement);
  }

  private unload(): void {
    // Delete retained messages to free resources.
    void this._messageClient.publish(ɵWorkbenchCommands.viewActiveTopic(this.view.id), undefined, {retain: true});
    void this._messageClient.publish(ɵWorkbenchCommands.viewParamsTopic(this.view.id), undefined, {retain: true});
    void this._messageClient.publish(ɵWorkbenchCommands.viewPartIdTopic(this.view.id), undefined, {retain: true});
    void this._outletRouter.navigate(null, {outlet: this.view.id});
    this.view.unregisterAdapter(MicrofrontendWorkbenchView);
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
      useFactory: () => ({attributes: {'data-viewid': inject(WorkbenchView).id}}) satisfies GlassPaneOptions,
    },
  ];
}
