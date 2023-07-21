/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, CUSTOM_ELEMENTS_SCHEMA, DestroyRef, ElementRef, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, ActivatedRouteSnapshot, Params} from '@angular/router';
import {asapScheduler, combineLatest, EMPTY, firstValueFrom, Observable, of, OperatorFunction, Subject} from 'rxjs';
import {catchError, debounceTime, first, map, pairwise, startWith, switchMap, takeUntil} from 'rxjs/operators';
import {Application, ManifestService, mapToBody, MessageClient, MessageHeaders, OutletRouter, ResponseStatusCodes, SciRouterOutletElement, TopicMessage} from '@scion/microfrontend-platform';
import {WorkbenchViewCapability, ɵMicrofrontendRouteParams, ɵVIEW_ID_CONTEXT_KEY, ɵViewParamsUpdateCommand, ɵWorkbenchCommands} from '@scion/workbench-client';
import {Arrays, Dictionaries, Maps} from '@scion/toolkit/util';
import {Logger, LoggerNames} from '../../logging';
import {WorkbenchViewPreDestroy} from '../../workbench.model';
import {IFRAME_HOST, ViewContainerReference} from '../../content-projection/view-container.reference';
import {serializeExecution} from '../../common/operators';
import {ɵWorkbenchView} from '../../view/ɵworkbench-view.model';
import {filterArray, mapArray} from '@scion/toolkit/operators';
import {ViewMenuService} from '../../part/view-context-menu/view-menu.service';
import {WorkbenchRouter} from '../../routing/workbench-router.service';
import {stringifyError} from '../../common/stringify-error.util';
import {MicrofrontendViewRoutes} from '../routing/microfrontend-routes';
import {WorkbenchRouteData} from '../../routing/workbench-route-data';
import {WorkbenchNavigationalViewStates} from '../../routing/workbench-navigational-states';
import {MicrofrontendNavigationalStates} from '../routing/microfrontend-navigational-states';
import {Beans} from '@scion/toolkit/bean-manager';
import {AsyncPipe, NgClass} from '@angular/common';
import {ContentAsOverlayComponent} from '../../content-projection/content-as-overlay.component';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

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
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // required because <sci-router-outlet> is a custom element
})
export class MicrofrontendViewComponent implements OnInit, OnDestroy, WorkbenchViewPreDestroy {

  private _unsubscribeParamsUpdater$ = new Subject<void>();
  private _universalKeystrokes = [
    'keydown.escape', // allows closing notifications
  ];

  public viewCapability: WorkbenchViewCapability | undefined;

  @ViewChild('router_outlet', {static: true})
  public routerOutletElement!: ElementRef<SciRouterOutletElement>;

  /**
   * Keystrokes which to bubble across iframe boundaries of embedded content.
   */
  public keystrokesToBubble$: Observable<string[]>;

  constructor(private _route: ActivatedRoute,
              private _view: ɵWorkbenchView,
              private _outletRouter: OutletRouter,
              private _manifestService: ManifestService,
              private _messageClient: MessageClient,
              private _destroyRef: DestroyRef,
              private _logger: Logger,
              private _viewContextMenuService: ViewMenuService,
              private _workbenchRouter: WorkbenchRouter,
              @Inject(IFRAME_HOST) protected iframeHostRef: ViewContainerReference) {
    this._logger.debug(() => `Constructing MicrofrontendViewComponent. [viewId=${this._view.id}]`, LoggerNames.MICROFRONTEND_ROUTING);
    this.keystrokesToBubble$ = combineLatest([this.viewContextMenuKeystrokes$(), of(this._universalKeystrokes)])
      .pipe(map(keystrokes => new Array<string>().concat(...keystrokes)));
  }

  public ngOnInit(): void {
    // Construct the view context, allowing embedded content to interact with this view.
    this.routerOutletElement.nativeElement.setContextValue(ɵVIEW_ID_CONTEXT_KEY, this.viewId);

    // Since the iframe is added at a top-level location in the DOM, that is, not as a child element of this component,
    // the workbench view misses keyboard events from embedded content. As a result, menu item accelerators of the context
    // menu of this view do not work, so we install the accelerators on the router outlet as well.
    this._viewContextMenuService.installMenuItemAccelerators$(this.routerOutletElement.nativeElement, this._view)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe();

    combineLatest([this._route.params, this._route.data])
      .pipe(
        debounceTime(0, asapScheduler), // wait until the Angular router completed updating the route, similar to `ngOnChanges` in a component to wait for all input properties to be set
        map(() => this._route.snapshot),
        mapToMicrofrontendRouteSnapshot(),
        startWith(undefined! as ActivatedMicrofrontendRouteSnapshot), // initialize 'pairwise' operator
        pairwise(),
        serializeExecution(([prev, curr]) => this.onNavigate(prev, curr)),
        catchError((error, caught) => {
          this._logger.error(() => '[MicrofrontendLoadError] An unexpected error occurred.', LoggerNames.MICROFRONTEND_ROUTING, error);
          return caught; // re-subscribe to the params Observable
        }),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe();
  }

  private async onNavigate(prevRouteSnapshot: ActivatedMicrofrontendRouteSnapshot | undefined, currRouteSnapshot: ActivatedMicrofrontendRouteSnapshot): Promise<void> {
    const prevViewCapability = prevRouteSnapshot?.viewCapability;
    const {viewCapability, params, activatedRoute} = currRouteSnapshot;

    if (!viewCapability) {
      this._logger.warn(() => `[NullViewError] No application found to provide a view of id '${params[ɵMicrofrontendRouteParams.ɵVIEW_CAPABILITY_ID]}'. Maybe, the requested view is not public API or the providing application not available.`, LoggerNames.MICROFRONTEND_ROUTING);
      await this._view.close();
      return;
    }

    const application = this.lookupApplication(viewCapability.metadata!.appSymbolicName);
    if (!application) {
      this._logger.error(() => `[NullApplicationError] Unexpected. Cannot resolve application '${viewCapability.metadata!.appSymbolicName}'.`, LoggerNames.MICROFRONTEND_ROUTING, viewCapability);
      await this._view.close();
      return;
    }

    // Check if navigating to a new microfrontend.
    if (!prevViewCapability || prevViewCapability.metadata!.id !== viewCapability.metadata!.id) {
      this.viewCapability = viewCapability;
      this.setViewProperties(viewCapability, activatedRoute, params);
      this.installParamsUpdater(viewCapability);
    }

    // Signal that the currently loaded microfrontend, if any, is about to be replaced by a microfrontend of another application.
    if (prevViewCapability && prevViewCapability.metadata!.appSymbolicName !== viewCapability.metadata!.appSymbolicName) {
      await this._messageClient.publish(ɵWorkbenchCommands.viewUnloadingTopic(this.viewId));
    }

    // Provide route parameters including matrix parameters and qualifiers to the microfrontend.
    await this._messageClient.publish(ɵWorkbenchCommands.viewParamsTopic(this.viewId), Maps.coerce(params), {retain: true});

    // When navigating to another view capability of the same app, wait until transported the params to consumers before loading the
    // new microfrontend into the iframe, allowing the currently loaded microfrontend to cleanup subscriptions. Params include the
    // capability id.
    if (prevViewCapability
      && prevViewCapability.metadata!.appSymbolicName === viewCapability.metadata!.appSymbolicName
      && prevViewCapability.metadata!.id !== viewCapability.metadata!.id) {
      await this.waitForCapabilityParam(viewCapability.metadata!.id);
    }

    // Navigate to the microfrontend.
    this._logger.debug(() => `Loading microfrontend into workbench view [viewId=${this._view.id}, app=${viewCapability.metadata!.appSymbolicName}, baseUrl=${application.baseUrl}, path=${(viewCapability.properties.path)}].`, LoggerNames.MICROFRONTEND_ROUTING, params, viewCapability);
    await this._outletRouter.navigate(viewCapability.properties.path, {
      outlet: this.viewId,
      relativeTo: application.baseUrl,
      params: params,
      pushStateToSessionHistoryStack: false,
    });
  }

  /**
   * Subscribes to requests from the currently loaded microfrontend to update its parameters.
   */
  private installParamsUpdater(viewCapability: WorkbenchViewCapability): void {
    this._unsubscribeParamsUpdater$.next();
    const subscription = this._messageClient.observe$<ɵViewParamsUpdateCommand>(ɵWorkbenchCommands.viewParamsUpdateTopic(this.viewId, viewCapability.metadata!.id))
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

            const currentMicrofrontendParams = MicrofrontendViewRoutes.parseParams(this._route.snapshot);
            const currentParams = {...currentMicrofrontendParams.urlParams, ...currentMicrofrontendParams.transientParams};

            const paramsUpdateCommand: ɵViewParamsUpdateCommand = request.body!;
            const newParams = Dictionaries.coerce(paramsUpdateCommand.params); // coerce params for backward compatibility
            const mergedParams = Dictionaries.withoutUndefinedEntries(paramsUpdateCommand.paramsHandling === 'merge' ? {...currentParams, ...newParams} : newParams);
            const {urlParams, transientParams} = MicrofrontendViewRoutes.splitParams(mergedParams, viewCapability);

            return {
              layout,
              viewOutlets: {[this.viewId]: [urlParams]},
              viewStates: {[this.viewId]: {[MicrofrontendNavigationalStates.transientParams]: transientParams}},
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
  private setViewProperties(viewCapability: WorkbenchViewCapability, activatedRoute: ActivatedRouteSnapshot, params: Params): void {
    this._view.title = substituteNamedParameters(viewCapability.properties.title, params) ?? null;
    this._view.heading = substituteNamedParameters(viewCapability.properties.heading, params) ?? null;
    this._view.cssClass = new Array<string>()
      .concat(Arrays.coerce(viewCapability.properties.cssClass))
      .concat(Arrays.coerce(activatedRoute.data[WorkbenchRouteData.state]?.[WorkbenchNavigationalViewStates.cssClass]));
    this._view.closable = viewCapability.properties.closable ?? true;
    this._view.dirty = false;
  }

  /**
   * Looks up the application registered under the given symbolic name. Returns `undefined` if not found.
   */
  private lookupApplication(symbolicName: string): Application | undefined {
    return this._manifestService.applications.find(app => app.symbolicName === symbolicName);
  }

  /**
   * Unique identity of this view.
   */
  public get viewId(): string {
    return this._view.id;
  }

  public get viewCssClasses(): string[] {
    return this._view.cssClasses;
  }

  /**
   * Promise that resolves once params contain the given capability id.
   */
  private async waitForCapabilityParam(viewCapabilityId: string): Promise<void> {
    const viewParams$ = this._messageClient.observe$<Map<string, string>>(ɵWorkbenchCommands.viewParamsTopic(this.viewId))
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
    const closingTopic = ɵWorkbenchCommands.viewClosingTopic(this.viewId);

    // Allow the microfrontend to prevent this view from closing.
    const count = await firstValueFrom(this._messageClient.subscriberCount$(closingTopic));
    if (count === 0) {
      return true;
    }

    const doit = this._messageClient.request$<boolean>(closingTopic).pipe(mapToBody(), catchError(() => EMPTY));
    return firstValueFrom(doit, {defaultValue: true});
  }

  /**
   * Upon subscription, emits the keystrokes registered with menu items of this view's context menu,
   * and then continuously when they change. The observable never completes.
   */
  private viewContextMenuKeystrokes$(): Observable<string[]> {
    return this._view.menuItems$
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

  public ngOnDestroy(): void {
    // Instruct the message broker to delete retained messages to free resources.
    this._messageClient.publish(ɵWorkbenchCommands.viewActiveTopic(this.viewId), undefined, {retain: true}).then();
    this._messageClient.publish(ɵWorkbenchCommands.viewParamsTopic(this.viewId), undefined, {retain: true}).then();
  }
}

/**
 * Maps the passed {@link ActivatedRouteSnapshot} to a {@link ActivatedMicrofrontendRouteSnapshot} with resolved params and capability.
 */
function mapToMicrofrontendRouteSnapshot(): OperatorFunction<ActivatedRouteSnapshot, ActivatedMicrofrontendRouteSnapshot> {
  return switchMap((activatedRoute: ActivatedRouteSnapshot): Observable<ActivatedMicrofrontendRouteSnapshot> => {
    const {viewCapabilityId, urlParams, transientParams, qualifier} = MicrofrontendViewRoutes.parseParams(activatedRoute);
    return Beans.get(ManifestService).lookupCapabilities$<WorkbenchViewCapability>({id: viewCapabilityId}).pipe(map(capabilities => ({
      activatedRoute,
      params: {
        ...urlParams,
        ...transientParams,
        ...qualifier, // qualifier entries have a higher precedence than parameters
        [ɵMicrofrontendRouteParams.ɵVIEW_CAPABILITY_ID]: viewCapabilityId, // capability ID cannot be overwritten.
      },
      viewCapability: capabilities[0],
    })));
  });
}

/**
 * Contains the information about a microfrontend route at a particular moment in time.
 */
interface ActivatedMicrofrontendRouteSnapshot {
  activatedRoute: ActivatedRouteSnapshot;
  params: Params;
  viewCapability?: WorkbenchViewCapability;
}

/**
 * Replaces named parameters with values of the contained {@link Params}.
 */
function substituteNamedParameters(value: string | null | undefined, params: Params): string | null {
  return value?.replace(/:(\w+)/g, (match, paramName) => params[paramName] ?? match) || null;
}
