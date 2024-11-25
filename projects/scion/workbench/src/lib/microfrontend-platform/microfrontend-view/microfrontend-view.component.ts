/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, DestroyRef, effect, ElementRef, inject, Injector, OnDestroy, OnInit, Provider, runInInjectionContext, untracked, viewChild} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {combineLatest, firstValueFrom, Observable, of, Subject, switchMap} from 'rxjs';
import {first, map, takeUntil} from 'rxjs/operators';
import {ManifestService, mapToBody, MessageClient, MessageHeaders, MicrofrontendPlatformConfig, OutletRouter, ResponseStatusCodes, SciRouterOutletElement, TopicMessage} from '@scion/microfrontend-platform';
import {ManifestObjectCache} from '../manifest-object-cache.service';
import {WorkbenchViewCapability, ɵMicrofrontendRouteParams, ɵVIEW_ID_CONTEXT_KEY, ɵViewParamsUpdateCommand, ɵWorkbenchCommands} from '@scion/workbench-client';
import {Dictionaries, Maps} from '@scion/toolkit/util';
import {Logger, LoggerNames} from '../../logging';
import {CanCloseRef} from '../../workbench.model';
import {IFRAME_OVERLAY_HOST} from '../../content-projection/workbench-element-references';
import {serializeExecution} from '../../common/operators';
import {ɵWorkbenchView} from '../../view/ɵworkbench-view.model';
import {filterArray, mapArray} from '@scion/toolkit/operators';
import {ViewMenuService} from '../../part/view-context-menu/view-menu.service';
import {WorkbenchRouter} from '../../routing/workbench-router.service';
import {stringifyError} from '../../common/stringify-error.util';
import {MicrofrontendViewRoutes} from '../routing/microfrontend-view-routes';
import {AsyncPipe, NgClass, NgComponentOutlet} from '@angular/common';
import {ContentAsOverlayComponent, ContentAsOverlayConfig} from '../../content-projection/content-as-overlay.component';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {WorkbenchLayoutService} from '../../layout/workbench-layout.service';
import {MicrofrontendSplashComponent} from '../microfrontend-splash/microfrontend-splash.component';
import {GLASS_PANE_BLOCKABLE, GLASS_PANE_OPTIONS, GlassPaneDirective, GlassPaneOptions} from '../../glass-pane/glass-pane.directive';
import {MicrofrontendWorkbenchView} from './microfrontend-workbench-view.model';
import {Microfrontends} from '../common/microfrontend.util';
import {Objects} from '../../common/objects.util';
import {WorkbenchView} from '../../view/workbench-view.model';

/**
 * Embeds the microfrontend of a view capability.
 */
@Component({
  selector: 'wb-microfrontend-view',
  styleUrls: ['./microfrontend-view.component.scss'],
  templateUrl: './microfrontend-view.component.html',
  standalone: true,
  imports: [
    NgClass,
    AsyncPipe,
    ContentAsOverlayComponent,
    NgComponentOutlet,
    GlassPaneDirective,
  ],
  viewProviders: [
    configureMicrofrontendGlassPane(),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // required because <sci-router-outlet> is a custom element
})
export class MicrofrontendViewComponent implements OnInit, OnDestroy {

  private _host = inject(ElementRef<HTMLElement>);
  private _route = inject(ActivatedRoute);
  private _outletRouter = inject(OutletRouter);
  private _manifestService = inject(ManifestService);
  private _manifestObjectCache = inject(ManifestObjectCache);
  private _messageClient = inject(MessageClient);
  private _logger = inject(Logger);
  private _viewContextMenuService = inject(ViewMenuService);
  private _workbenchLayoutService = inject(WorkbenchLayoutService);
  private _workbenchRouter = inject(WorkbenchRouter);
  private _injector = inject(Injector);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _destroyRef = inject(DestroyRef);

  private _routerOutletElement = viewChild.required<ElementRef<SciRouterOutletElement>>('router_outlet');
  private _unsubscribeParamsUpdater$ = new Subject<void>();
  private _universalKeystrokes = [
    'keydown.escape', // allows closing notifications
  ];

  protected view = inject(ɵWorkbenchView);
  protected capability: WorkbenchViewCapability | null = null;
  /** Splash to display until the microfrontend signals readiness. */
  protected splash = inject(MicrofrontendPlatformConfig).splash ?? MicrofrontendSplashComponent;
  /** Keystrokes which to bubble across iframe boundaries from embedded content. */
  protected keystrokesToBubble$: Observable<string[]>;
  /** Indicates whether a workbench drag operation is in progress, such as when dragging a view or moving a sash. */
  protected isWorkbenchDrag = false;
  /** Configures iframe projection. */
  protected overlayConfig: ContentAsOverlayConfig = {
    location: inject(IFRAME_OVERLAY_HOST),
    visible: this.view.portal.attached,
  };

  constructor() {
    this._logger.debug(() => `Constructing MicrofrontendViewComponent. [viewId=${this.view.id}]`, LoggerNames.MICROFRONTEND_ROUTING);
    this.keystrokesToBubble$ = combineLatest([this.viewContextMenuKeystrokes$(), of(this._universalKeystrokes)])
      .pipe(map(keystrokes => new Array<string>().concat(...keystrokes)));
    this.installWorkbenchDragDetector();
    this.installViewActivePublisher();
    this.installPartIdPublisher();
    this.installCanCloseGuard(ɵWorkbenchCommands.canCloseTopic(this.view.id));
    this.installCanCloseGuard(ɵWorkbenchCommands.viewClosingTopic(this.view.id));
  }

  public ngOnInit(): void {
    this._routerOutletElement().nativeElement.setContextValue(ɵVIEW_ID_CONTEXT_KEY, this.view.id);
    this.propagateWorkbenchTheme();
    this.installMenuItemAccelerators$();
    this.installNavigator();
  }

  private installNavigator(): void {
    this._route.params
      .pipe(
        switchMap(params => this.fetchCapability$(params[ɵMicrofrontendRouteParams.ɵVIEW_CAPABILITY_ID]).pipe(map(capability => ({capability, params})))),
        serializeExecution(({capability, params}) => this.onNavigate(this.capability, capability, params)),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe();
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
    if (prevCapability
      && prevCapability.metadata!.appSymbolicName === capability.metadata!.appSymbolicName
      && prevCapability.metadata!.id !== capability.metadata!.id) {
      await this.waitForCapabilityParam(capability.metadata!.id);
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

  private installMenuItemAccelerators$(): void {
    // Since the iframe is added at a top-level location in the DOM, that is, not as a child element of this component,
    // the workbench view misses keyboard events from embedded content. As a result, menu item accelerators of the context
    // menu of this view do not work, so we install the accelerators on the router outlet as well.
    this._viewContextMenuService.installMenuItemAccelerators$(this._routerOutletElement().nativeElement, this.view)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe();
  }

  /**
   * Subscribes to requests from the currently loaded microfrontend to update its parameters.
   */
  private installParamsUpdater(viewCapability: WorkbenchViewCapability): void {
    this._unsubscribeParamsUpdater$.next();
    const subscription = this._messageClient.observe$<ɵViewParamsUpdateCommand>(ɵWorkbenchCommands.viewParamsUpdateTopic(this.view.id, viewCapability.metadata!.id))
      .pipe(takeUntil(this._unsubscribeParamsUpdater$), takeUntilDestroyed(this._destroyRef))
      .subscribe(async (request: TopicMessage<ɵViewParamsUpdateCommand>) => { // eslint-disable-line rxjs/no-async-subscribe
        // We DO NOT navigate if the subscription was closed, e.g., because closed the view or navigated to another capability.
        const replyTo = request.headers.get(MessageHeaders.ReplyTo);

        try {
          const success = await this._workbenchRouter.navigate(layout => {
            // Cancel pending navigation if the subscription was closed, e.g., because closed the view or navigated to another capability
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
          });

          await this._messageClient.publish(replyTo, success, {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.TERMINAL)});
        }
        catch (error) {
          await this._messageClient.publish(replyTo, stringifyError(error), {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.ERROR)});
        }
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
    effect(() => {
      const active = this.view.active();
      untracked(() => {
        const commandTopic = ɵWorkbenchCommands.viewActiveTopic(this.view.id);
        this._messageClient.publish(commandTopic, active, {retain: true}).then();
      });
    });
  }

  private installPartIdPublisher(): void {
    effect(() => {
      const part = this.view.part();
      untracked(() => {
        const commandTopic = ɵWorkbenchCommands.viewPartIdTopic(this.view.id);
        this._messageClient.publish(commandTopic, part.id, {retain: true}).then();
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

  private installCanCloseGuard(canCloseTopic: string): void {
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
      this._host.nativeElement.dispatchEvent(new CustomEvent('sci-microfrontend-focusin', {bubbles: true}));
    }
  }

  /**
   * Upon subscription, emits the keystrokes registered with menu items of this view's context menu,
   * and then continuously when they change. The observable never completes.
   */
  private viewContextMenuKeystrokes$(): Observable<string[]> {
    return this.view.menuItems$
      .pipe(
        filterArray(menuItem => !!menuItem.accelerator),
        mapArray(menuItem => menuItem.accelerator!.map(accelerator => {
          // Normalize keystrokes according to `SciRouterOutletElement#keystrokes`
          switch (accelerator) {
            case 'ctrl':
              return 'control';
            case '.':
              return 'dot';
            case ' ':
              return 'space';
            default:
              return accelerator;
          }
        })),
        mapArray(accelerator => ['keydown'].concat(accelerator).join('.')),
      );
  }

  /**
   * Sets the {@link isWorkbenchDrag} property when a workbench drag operation is detected,
   * such as when dragging a view or moving a sash.
   */
  private installWorkbenchDragDetector(): void {
    this._workbenchLayoutService.dragging$
      .pipe(takeUntilDestroyed())
      .subscribe(event => {
        this.isWorkbenchDrag = (event === 'start');
      });
  }

  private propagateWorkbenchTheme(): void {
    runInInjectionContext(this._injector, () => Microfrontends.propagateTheme(this._routerOutletElement().nativeElement));
  }

  private unload(): void {
    // Delete retained messages to free resources.
    this._messageClient.publish(ɵWorkbenchCommands.viewActiveTopic(this.view.id), undefined, {retain: true}).then();
    this._messageClient.publish(ɵWorkbenchCommands.viewParamsTopic(this.view.id), undefined, {retain: true}).then();
    this._messageClient.publish(ɵWorkbenchCommands.viewPartIdTopic(this.view.id), undefined, {retain: true}).then();
    this._outletRouter.navigate(null, {outlet: this.view.id}).then();
    this.view.unregisterAdapter(MicrofrontendWorkbenchView);
  }

  public ngOnDestroy(): void {
    this.unload();
  }
}

/**
 * Blocks the microfrontend outlet when dialog(s) overlay this view.
 */
function configureMicrofrontendGlassPane(): Provider[] {
  return [
    {
      provide: GLASS_PANE_BLOCKABLE,
      useExisting: ɵWorkbenchView,
    },
    {
      provide: GLASS_PANE_OPTIONS,
      useFactory: (): GlassPaneOptions => ({attributes: {'data-viewid': inject(WorkbenchView).id}}),
    },
  ];
}
