/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { catchError, first, map, pairwise, startWith, switchMap, take, takeUntil } from 'rxjs/operators';
import { Application, ManifestService, mapToBody, MessageClient, OutletRouter, SciRouterOutletElement, takeUntilUnsubscribe } from '@scion/microfrontend-platform';
import { WorkbenchViewCapability, ɵMicrofrontendRouteParams, ɵVIEW_ID_CONTEXT_KEY, ɵWorkbenchCommands } from '@scion/workbench-client';
import { Maps } from '@scion/toolkit/util';
import { Logger, LoggerNames } from '../../logging';
import { WorkbenchView } from '../../view/workbench-view.model';
import { WbBeforeDestroy } from '../../workbench.model';
import { IFRAME_HOST, ViewContainerReference } from '../../content-projection/view-container.reference';

/**
 * Embeds the microfrontend of a view capability.
 */
@Component({
  selector: 'wb-microfrontend-view',
  styleUrls: ['./microfrontend-view.component.scss'],
  templateUrl: './microfrontend-view.component.html',
})
export class MicrofrontendViewComponent implements OnInit, OnDestroy, WbBeforeDestroy {

  private _destroy$ = new Subject<void>();

  public microfrontendCssClasses: string[];
  public iframeHost: Promise<ViewContainerRef>;

  @ViewChild('router_outlet', {static: true})
  public routerOutletElement: ElementRef<SciRouterOutletElement>;

  constructor(private _route: ActivatedRoute,
              private _view: WorkbenchView,
              private _outletRouter: OutletRouter,
              private _manifestService: ManifestService,
              private _messageClient: MessageClient,
              private _logger: Logger,
              @Inject(IFRAME_HOST) iframeHost: ViewContainerReference) {
    this._logger.debug(() => `Constructing MicrofrontendViewComponent. [viewId=${this._view.viewId}]`, LoggerNames.MICROFRONTEND);
    this.iframeHost = iframeHost.get();
  }

  public ngOnInit(): void {
    this.routerOutletElement.nativeElement.setContextValue(ɵVIEW_ID_CONTEXT_KEY, this.viewId);

    this._route.params
      .pipe(
        switchMap(params => this.observeViewCapability$(params[ɵMicrofrontendRouteParams.ɵVIEW_CAPABILITY_ID])),
        startWith(undefined as WorkbenchViewCapability), // initialize 'pairwise' operator
        pairwise(),
        switchMap(([prev, curr]) => this.onNavigate(this._route.snapshot.params, prev, curr)),
        catchError((error, caught) => {
          this._logger.error(() => '[MicrofrontendLoadError] An unexpected error occurred.', LoggerNames.MICROFRONTEND, error);
          return caught; // re-subscribe to the params Observable
        }),
        takeUntil(this._destroy$),
      )
      .subscribe();
  }

  private async onNavigate(params: Params, prevViewCapability: WorkbenchViewCapability | undefined, viewCapability: WorkbenchViewCapability | undefined): Promise<void> {
    if (!viewCapability) {
      this._logger.warn(() => `[NullViewError] No application found to provide a view of id '${params[ɵMicrofrontendRouteParams.ɵVIEW_CAPABILITY_ID]}'. Maybe, the requested view is not public API or the providing application not available.`, LoggerNames.MICROFRONTEND);
      await this._view.close();
      return;
    }

    const microfrontendPath = viewCapability.properties?.path;
    if (microfrontendPath === undefined || microfrontendPath === null) { // empty path is a valid path
      this._logger.error(() => `[ViewProviderError] Requested view has no path to the microfrontend defined.`, LoggerNames.MICROFRONTEND, viewCapability);
      await this._view.close();
      return;
    }

    const application = this.lookupApplication(viewCapability.metadata.appSymbolicName);
    if (!application) {
      this._logger.error(() => `[NullApplicationError] Unexpected. Cannot resolve application '${viewCapability.metadata.appSymbolicName}'.`, LoggerNames.MICROFRONTEND, viewCapability);
      await this._view.close();
      return;
    }

    // Set this view's properties, but only when displaying its initial microfrontend, or when navigating to another microfrontend.
    if (!prevViewCapability || prevViewCapability.metadata.id !== viewCapability.metadata.id) {
      this.setViewProperties(viewCapability);
    }

    // Signal that the currently loaded microfrontend, if any, is about to be replaced by a microfrontend of another application.
    if (prevViewCapability && prevViewCapability.metadata.appSymbolicName !== viewCapability.metadata.appSymbolicName) {
      await this._messageClient.publish(ɵWorkbenchCommands.viewUnloadingTopic(this.viewId));
    }

    // Provide route parameters including matrix parameters and qualifiers to the microfrontend.
    await this._messageClient.publish(ɵWorkbenchCommands.viewParamsTopic(this.viewId), Maps.coerce(params), {retain: true});

    // When navigating to another view capability of the same app, wait until transported the params to consumers before loading the
    // new microfrontend into the iframe, allowing the currently loaded microfrontend to cleanup subscriptions. Params include the
    // capability id.
    if (prevViewCapability
      && prevViewCapability.metadata.appSymbolicName === viewCapability.metadata.appSymbolicName
      && prevViewCapability.metadata.id !== viewCapability.metadata.id) {
      await this.waitForCapabilityParam(viewCapability.metadata.id);
    }

    // Navigate to the microfrontend.
    this._logger.debug(() => `Loading microfrontend into workbench view [viewId=${this._view.viewId}, app=${viewCapability.metadata.appSymbolicName}, baseUrl=${application.baseUrl}, path=${microfrontendPath}].`, LoggerNames.MICROFRONTEND, params, viewCapability);
    await this._outletRouter.navigate(microfrontendPath, {
      outlet: this.viewId,
      relativeTo: application.baseUrl,
      params: params,
      pushStateToSessionHistoryStack: false,
    });
  }

  /**
   * Updates the properties of this view, such as the view title, as defined by the capability.
   */
  private setViewProperties(viewCapability: WorkbenchViewCapability): void {
    this._view.title = viewCapability.properties?.title;
    this._view.heading = viewCapability.properties?.heading;
    this._view.cssClass = viewCapability.properties?.cssClass;
    this._view.closable = viewCapability.properties?.closable ?? true;
    this._view.dirty = false;
    this.microfrontendCssClasses = ['e2e-view', `e2e-${viewCapability.metadata.appSymbolicName}`, ...this._view.cssClasses];
  }

  /**
   * Observes the capability of the given id. If the capability is not found, the returned Observable emits `undefined`.
   * It never completes.
   */
  private observeViewCapability$(capabilityId: string): Observable<WorkbenchViewCapability | undefined> {
    return this._manifestService.lookupCapabilities$<WorkbenchViewCapability>({id: capabilityId})
      .pipe(map(capabilities => capabilities[0]));
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
    return this._view.viewId;
  }

  /**
   * Promise that resolves once params contain the given capability id.
   */
  private async waitForCapabilityParam(viewCapabilityId: string): Promise<void> {
    await this._messageClient.observe$<Map<string, string>>(ɵWorkbenchCommands.viewParamsTopic(this.viewId))
      .pipe(
        mapToBody(),
        first(params => params.get(ɵMicrofrontendRouteParams.ɵVIEW_CAPABILITY_ID) === viewCapabilityId),
      )
      .toPromise();
  }

  /**
   * Method invoked just before closing this view.
   *
   * If the embedded microfrontend has a listener installed to be notified when closing this view,
   * initiates a request-reply communication, allowing the microfrontend to prevent this view from closing.
   */
  public async wbBeforeDestroy(): Promise<boolean> {
    const closingTopic = ɵWorkbenchCommands.viewClosingTopic(this.viewId);

    // Check if the microfrontend wants to be notified when closing this view.
    const closingSubscriberCount = await this._messageClient.subscriberCount$(closingTopic)
      .pipe(
        take(1),
        takeUntil(this._destroy$),
      )
      .toPromise();
    if ((closingSubscriberCount ?? 0) === 0) {
      return true; // continue closing
    }

    // Allow the microfrontend to prevent this view from closing.
    return this._messageClient.request$<boolean>(closingTopic)
      .pipe(
        take(1),
        mapToBody(),
        takeUntilUnsubscribe(closingTopic),
        takeUntil(this._destroy$),
      )
      .toPromise()
      .then(close => close ?? true);
  }

  public ngOnDestroy(): void {
    // Instruct the message broker to delete retained messages to free resources.
    this._messageClient.publish(ɵWorkbenchCommands.viewActiveTopic(this.viewId), undefined, {retain: true}).then();
    this._messageClient.publish(ɵWorkbenchCommands.viewParamsTopic(this.viewId), undefined, {retain: true}).then();
    this._destroy$.next();
  }
}
