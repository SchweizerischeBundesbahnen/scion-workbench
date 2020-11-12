/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Injectable, OnDestroy } from '@angular/core';
import { VIEW_CAPABILITY_ID_PARAM, VIEW_PATH_PARAM } from './metadata';
import { Router } from '@angular/router';
import { ViewOutletComponent } from './view-outlet.component';
import { WbNavigationExtras, WorkbenchActivityPartService, WorkbenchAuxiliaryRoutesRegistrator, WorkbenchRouter, WorkbenchService, WorkbenchView } from '@scion/workbench';
import { noop, Subject } from 'rxjs';
import { ApplicationRegistry } from '../core/application-registry.service';
import { ManifestRegistry } from '../core/manifest-registry.service';
import { Url } from '../core/url.util';
import { MessageEnvelope, PlatformCapabilityTypes, Qualifier, ViewCapability, ViewIntentMessage } from '@scion/workbench-application-platform.api';
import { filter, takeUntil } from 'rxjs/operators';
import { MessageBus } from '../core/message-bus.service';
import { Logger } from '../core/logger.service';
import { ManifestCollector } from '../core/manifest-collector.service';

/**
 * Opens a workbench view for intents of the type 'view'.
 *
 * This class acts as mediator between view intents and view capabilities.
 *
 * If an application intends to navigate to a view, the respective view capability(-ies)
 * is looked up to provide metadata about the page to navigate to.
 */
@Injectable()
export class ViewIntentDispatcher implements OnDestroy {

  private _destroy$ = new Subject<void>();

  constructor(private _workbench: WorkbenchService,
              private _router: Router,
              private _wbRouter: WorkbenchRouter,
              private _routesRegistrator: WorkbenchAuxiliaryRoutesRegistrator,
              private _activityPartService: WorkbenchActivityPartService,
              private _applicationRegistry: ApplicationRegistry,
              private _manifestRegistry: ManifestRegistry,
              private _messageBus: MessageBus,
              private _logger: Logger,
              private _manifestCollector: ManifestCollector) {
  }

  public init(): void {
    this._manifestCollector.whenManifests.then(() => {
      this.installViewCapabilityRoutes();
      this.installIntentListener();
      this.addToActivityPanel();
    });
  }

  private onIntent(envelope: MessageEnvelope<ViewIntentMessage>): void {
    this._manifestRegistry.getCapabilities<ViewCapability>(PlatformCapabilityTypes.View, envelope.message.qualifier)
      .filter(capability => this._manifestRegistry.isVisibleForApplication(capability, envelope.sender))
      .forEach((viewCapability: ViewCapability) => {
        const intentMessage: ViewIntentMessage = envelope.message;
        const view = envelope._injector.get(WorkbenchView, null);

        const matrixParamObject = Url.writeMatrixParamObject({
          matrixParams: Url.substituteParamVariables({...viewCapability.properties.matrixParams, ...intentMessage.payload.matrixParams}, envelope.message.qualifier),
          queryParams: Url.substituteParamVariables({...viewCapability.properties.queryParams, ...intentMessage.payload.queryParams}, envelope.message.qualifier),
        });

        const extras: WbNavigationExtras = {
          activateIfPresent: intentMessage.payload.activateIfPresent,
          closeIfPresent: intentMessage.payload.closeIfPresent,
          selfViewId: view && view.viewId,
          blankPartId: view && this._workbench.resolveViewPart(view.viewId),
          blankInsertionIndex: intentMessage.payload.blankInsertionIndex,
        };

        // Check if to open the view in a specific view outlet.
        const target = intentMessage.payload.target || 'blank';
        if (target === 'self' || target === 'blank') {
          extras.target = target;
        }
        else {
          extras.target = 'self';
          extras.selfViewId = target;
        }

        const commands = this.createNavigateCommands(viewCapability, matrixParamObject, envelope.message.qualifier);
        this._wbRouter.navigate(commands, extras).then(noop);
      });
  }

  private installIntentListener(): void {
    this._messageBus.receiveIntents$()
      .pipe(
        filter(envelope => envelope.message.type === PlatformCapabilityTypes.View),
        takeUntil(this._destroy$),
      )
      .subscribe((envelope: MessageEnvelope<ViewIntentMessage>) => {
        try {
          this.onIntent(envelope);
        }
        catch (error) {
          this._logger.error(`Failed to handle intent [${JSON.stringify(envelope.message.qualifier || {})}]`, error);
        }
      });
  }

  private installViewCapabilityRoutes(): void {
    // Register capability routes as primary routes. Auxiliary routes are registered when the views are opened (by the workbench)
    this._routesRegistrator.replaceRouterConfig([
      ...this._router.config,
      ...this._applicationRegistry.getApplications().map(application => {
        return {
          path: `${application.symbolicName}/view/:${VIEW_CAPABILITY_ID_PARAM}/:${VIEW_PATH_PARAM}`,
          component: ViewOutletComponent,
        };
      }),
    ]);
  }

  private addToActivityPanel(): void {
    this._manifestRegistry.getCapabilitiesByType<ViewCapability>(PlatformCapabilityTypes.View)
      .filter(viewCapability => viewCapability.properties.activityItem)
      .forEach((viewCapability: ViewCapability) => {
        const activityItem = viewCapability.properties.activityItem;

        const activity = this._activityPartService.createActivity();
        activity.title = activityItem.title;
        activity.itemText = activityItem.itemText;
        activity.itemCssClass = activityItem.itemCssClass;
        activity.cssClass = activityItem.cssClass;
        activity.position = activityItem.position;
        activity.target = 'view';

        const matrixParamObject = Url.writeMatrixParamObject({
          matrixParams: Url.substituteParamVariables(viewCapability.properties.matrixParams, viewCapability.qualifier),
          queryParams: Url.substituteParamVariables(viewCapability.properties.queryParams, viewCapability.qualifier),
        });

        activity.routerLink = this.createNavigateCommands(viewCapability, matrixParamObject, viewCapability.qualifier);
        this._activityPartService.addActivity(activity);
      });
  }

  private createNavigateCommands(viewCapability: ViewCapability, matrixParamObject: any, qualifier: Qualifier): string [] {
    return [
      viewCapability.metadata.symbolicAppName,
      'view',
      viewCapability.metadata.id, // capabilityId
      Url.substitutePathVariables(viewCapability.properties.path, qualifier).join('/') || '/', // path as single parameter
      ...(matrixParamObject ? [matrixParamObject] : []),
    ];
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}

