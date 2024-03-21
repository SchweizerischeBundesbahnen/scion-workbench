/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, DestroyRef, ElementRef, inject, Inject, OnDestroy, OnInit, Provider, ViewChild} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {combineLatest, EMPTY, firstValueFrom, Observable, of, Subject, switchMap} from 'rxjs';
import {catchError, first, map, takeUntil} from 'rxjs/operators';
import {ManifestService, mapToBody, MessageClient, MessageHeaders, MicrofrontendPlatformConfig, OutletRouter, ResponseStatusCodes, SciRouterOutletElement, TopicMessage} from '@scion/microfrontend-platform';
import {WorkbenchViewCapability, ɵMicrofrontendRouteParams, ɵTHEME_CONTEXT_KEY, ɵVIEW_ID_CONTEXT_KEY, ɵViewParamsUpdateCommand, ɵWorkbenchCommands} from '@scion/workbench-client';
import {Dictionaries, Maps} from '@scion/toolkit/util';
import {Logger, LoggerNames} from '../../logging';
import {WorkbenchTheme, WorkbenchViewPreDestroy} from '../../workbench.model';
import {IFRAME_HOST, ViewContainerReference} from '../../content-projection/view-container.reference';
import {serializeExecution} from '../../common/operators';
import {ɵWorkbenchView} from '../../view/ɵworkbench-view.model';
import {filterArray, mapArray} from '@scion/toolkit/operators';
import {ViewMenuService} from '../../part/view-context-menu/view-menu.service';
import {WorkbenchRouter} from '../../routing/workbench-router.service';
import {stringifyError} from '../../common/stringify-error.util';
import {MicrofrontendViewRoutes} from '../routing/microfrontend-view-routes';
import {AsyncPipe, NgClass, NgComponentOutlet} from '@angular/common';
import {ContentAsOverlayComponent} from '../../content-projection/content-as-overlay.component';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {WorkbenchLayoutService} from '../../layout/workbench-layout.service';
import {WorkbenchService} from '../../workbench.service';
import {ComponentType} from '@angular/cdk/portal';
import {MicrofrontendSplashComponent} from '../microfrontend-splash/microfrontend-splash.component';
import {GLASS_PANE_BLOCKABLE, GlassPaneDirective} from '../../glass-pane/glass-pane.directive';
import {MicrofrontendWorkbenchView} from './microfrontend-workbench-view.model';

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
export class MicrofrontendViewComponent implements OnInit, OnDestroy, WorkbenchViewPreDestroy {

  private _unsubscribeParamsUpdater$ = new Subject<void>();
  private _universalKeystrokes = [
    'keydown.escape', // allows closing notifications
  ];

  protected capability: WorkbenchViewCapability | undefined;

  /**
   * Splash to display until the microfrontend signals readiness.
   */
  protected splash: ComponentType<unknown>;

  @ViewChild('router_outlet', {static: true})
  public routerOutletElement!: ElementRef<SciRouterOutletElement>;

  /**
   * Keystrokes which to bubble across iframe boundaries of embedded content.
   */
  public keystrokesToBubble$: Observable<string[]>;

  /**
   * Indicates whether a workbench drag operation is in progress, such as when dragging a view or moving a sash.
   */
  public isWorkbenchDrag = false;

  constructor(private _host: ElementRef<HTMLElement>,
              private _route: ActivatedRoute,
              private _outletRouter: OutletRouter,
              private _manifestService: ManifestService,
              private _messageClient: MessageClient,
              private _destroyRef: DestroyRef,
              private _logger: Logger,
              private _viewContextMenuService: ViewMenuService,
              private _workbenchLayoutService: WorkbenchLayoutService,
              private _workbenchRouter: WorkbenchRouter,
              private _workbenchService: WorkbenchService,
              private _cd: ChangeDetectorRef,
              public view: ɵWorkbenchView,
              @Inject(IFRAME_HOST) protected iframeHostRef: ViewContainerReference) {
    this._logger.debug(() => `Constructing MicrofrontendViewComponent. [viewId=${this.view.id}]`, LoggerNames.MICROFRONTEND_ROUTING);
    this.keystrokesToBubble$ = combineLatest([this.viewContextMenuKeystrokes$(), of(this._universalKeystrokes)])
      .pipe(map(keystrokes => new Array<string>().concat(...keystrokes)));
    this.installWorkbenchDragDetector();
    this.splash = inject(MicrofrontendPlatformConfig).splash ?? MicrofrontendSplashComponent;
  }

  public ngOnInit(): void {
    // Construct the view context, allowing embedded content to interact with this view.
    this.routerOutletElement.nativeElement.setContextValue(ɵVIEW_ID_CONTEXT_KEY, this.view.id);

    this.installNavigator();
    this.installMenuItemAccelerators$();
    this.installThemePropagator();
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

  private async onNavigate(prevCapability: WorkbenchViewCapability | undefined, capability: WorkbenchViewCapability | undefined, params: Params): Promise<void> {
    if (!capability) {
      this._logger.warn(() => `[NullCapabilityError] No application found to provide a view capability of id '${params[ɵMicrofrontendRouteParams.ɵVIEW_CAPABILITY_ID]}'. Maybe, the requested view is not public API or the providing application not available.`, LoggerNames.MICROFRONTEND_ROUTING);
      await this.view.close();
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
    const application = this._manifestService.applications.find(app => app.symbolicName === capability.metadata!.appSymbolicName)!;
    this._logger.debug(() => `Loading microfrontend into workbench view [viewId=${this.view.id}, app=${capability.metadata!.appSymbolicName}, baseUrl=${application.baseUrl}, path=${(capability.properties.path)}].`, LoggerNames.MICROFRONTEND_ROUTING, params, capability);
    await this._outletRouter.navigate(capability.properties.path, {
      outlet: this.view.id,
      relativeTo: application.baseUrl,
      params: params,
      pushStateToSessionHistoryStack: false,
      showSplash: capability.properties.showSplash,
      ɵcapabilityId: capability.metadata!.id,
    });

    // Inactive views are detached from the Angular change detection tree.
    // Therefore, manually detect this component for changes for updating attributes on the `sci-router-outlet`.
    if (!this.view.active) {
      this._cd.detectChanges();
    }
  }

  private fetchCapability$(capabilityId: string): Observable<WorkbenchViewCapability | undefined> {
    return this._manifestService.lookupCapabilities$<WorkbenchViewCapability>({id: capabilityId}).pipe(map(capabilities => capabilities.at(0)));
  }

  private installMenuItemAccelerators$(): void {
    // Since the iframe is added at a top-level location in the DOM, that is, not as a child element of this component,
    // the workbench view misses keyboard events from embedded content. As a result, menu item accelerators of the context
    // menu of this view do not work, so we install the accelerators on the router outlet as well.
    this._viewContextMenuService.installMenuItemAccelerators$(this.routerOutletElement.nativeElement, this.view)
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
          const success = await this._workbenchRouter.ɵnavigate(layout => {
            // Cancel pending navigation if the subscription was closed, e.g., because closed the view or navigated to another capability
            if (subscription.closed) {
              return null;
            }

            const paramsHandling = request.body!.paramsHandling;
            const currentParams = this._route.snapshot.params;
            const newParams = Dictionaries.coerce(request.body!.params); // coerce params for backward compatibility
            const mergedParams = Dictionaries.withoutUndefinedEntries(paramsHandling === 'merge' ? {...currentParams, ...newParams} : newParams);
            const {urlParams, transientParams} = MicrofrontendViewRoutes.splitParams(mergedParams, viewCapability);

            return {
              layout,
              viewOutlets: {[this.view.id]: [urlParams]},
              viewStates: {[this.view.id]: {[MicrofrontendViewRoutes.STATE_TRANSIENT_PARAMS]: transientParams}},
            };
          }, {relativeTo: this._route});

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
    this.view.title = substituteNamedParameters(viewCapability.properties.title, params) ?? null;
    this.view.heading = substituteNamedParameters(viewCapability.properties.heading, params) ?? null;
    this.view.classList.set(viewCapability.properties.cssClass, {scope: 'application'});
    this.view.closable = viewCapability.properties.closable ?? true;
    this.view.dirty = false;
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

  /**
   * Method invoked just before closing this view.
   *
   * If the embedded microfrontend has a listener installed to be notified when closing this view,
   * initiates a request-reply communication, allowing the microfrontend to prevent this view from closing.
   */
  public async onWorkbenchViewPreDestroy(): Promise<boolean> {
    const closingTopic = ɵWorkbenchCommands.viewClosingTopic(this.view.id);

    // Allow the microfrontend to prevent this view from closing.
    const count = await firstValueFrom(this._messageClient.subscriberCount$(closingTopic));
    if (count === 0) {
      return true;
    }

    const doit = this._messageClient.request$<boolean>(closingTopic).pipe(mapToBody(), catchError(() => EMPTY));
    return firstValueFrom(doit, {defaultValue: true});
  }

  public onFocusWithin(event: Event): void {
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

  /**
   * Propagates the current theme and color scheme to embedded content.
   */
  private installThemePropagator(): void {
    this._workbenchService.theme$
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(theme => {
        if (theme) {
          this.routerOutletElement.nativeElement.setContextValue<WorkbenchTheme>(ɵTHEME_CONTEXT_KEY, theme);
          this.routerOutletElement.nativeElement.setContextValue('color-scheme', theme.colorScheme);
        }
        else {
          this.routerOutletElement.nativeElement.removeContextValue(ɵTHEME_CONTEXT_KEY);
          this.routerOutletElement.nativeElement.removeContextValue('color-scheme');
        }
      });
  }

  public ngOnDestroy(): void {
    // Instruct the message broker to delete retained messages to free resources.
    this._messageClient.publish(ɵWorkbenchCommands.viewActiveTopic(this.view.id), undefined, {retain: true}).then();
    this._messageClient.publish(ɵWorkbenchCommands.viewParamsTopic(this.view.id), undefined, {retain: true}).then();
    this._outletRouter.navigate(null, {outlet: this.view.id}).then();
    this.view.unregisterAdapter(MicrofrontendWorkbenchView);
  }
}

/**
 * Replaces named parameters with values of the contained {@link Params}.
 */
function substituteNamedParameters(value: string | null | undefined, params: Params): string | null {
  return value?.replace(/:(\w+)/g, (match, paramName) => params[paramName] ?? match) || null;
}

/**
 * Blocks the microfrontend outlet when dialog(s) overlay this view.
 */
function configureMicrofrontendGlassPane(): Provider {
  return {
    provide: GLASS_PANE_BLOCKABLE,
    useExisting: ɵWorkbenchView,
  };
}
