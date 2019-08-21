/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Injectable, Type } from '@angular/core';
import { VIEW_CAPABILITY_ID_PARAM, VIEW_PATH_PARAM } from './metadata';
import { Router } from '@angular/router';
import { ViewOutletComponent } from './view-outlet.component';
import { WbNavigationExtras, WorkbenchActivityPartService, WorkbenchAuxiliaryRoutesRegistrator, WorkbenchRouter, WorkbenchService, WorkbenchView } from '@scion/workbench';
import { noop } from 'rxjs';
import { IntentHandler } from '../core/metadata';
import { ApplicationRegistry } from '../core/application-registry.service';
import { ManifestRegistry } from '../core/manifest-registry.service';
import { Url } from '../core/url.util';
import { AnyQualifier, MessageEnvelope, PlatformCapabilityTypes, Qualifier, ViewCapability, ViewIntentMessage } from '@scion/workbench-application-platform.api';

/**
 * Opens a workbench view for intents of the type 'view'.
 *
 * This class acts as mediator between view intents and view capabilities.
 *
 * If an application intends to navigate to a view, the respective view capability(-ies)
 * is looked up to provide metadata about the page to navigate to.
 */
@Injectable()
export class ViewIntentHandler implements IntentHandler {

  public readonly type: PlatformCapabilityTypes = PlatformCapabilityTypes.View;
  public readonly qualifier = AnyQualifier;
  public readonly proxy = true;
  public readonly description = 'Open a workbench view for capabilities of the type \'view\'.';

  private _applicationRegistry: ApplicationRegistry;
  private _manifestRegistry: ManifestRegistry;

  constructor(private _workbench: WorkbenchService,
              private _router: Router,
              private _wbRouter: WorkbenchRouter,
              private _routesRegistrator: WorkbenchAuxiliaryRoutesRegistrator,
              private _activityPartService: WorkbenchActivityPartService) {
  }

  public onInit(applicationRegistry: ApplicationRegistry, manifestRegistry: ManifestRegistry): void {
    this._applicationRegistry = applicationRegistry;
    this._manifestRegistry = manifestRegistry;
    this.installViewCapabilityRoutes();
    this.addToActivityPanel();
  }

  public onIntent(envelope: MessageEnvelope<ViewIntentMessage>): void {
    this._manifestRegistry.getCapabilities<ViewCapability>(this.type, envelope.message.qualifier)
      .filter(viewCapability => {
        // Skip proxy providers (e.g. this implementor class)
        return !viewCapability.metadata.proxy;
      })
      .filter(viewCapability => {
        // Skip if the capability has private visibility and the intending application does not provide the view capability itself
        return !viewCapability.private || this._manifestRegistry.isScopeCheckDisabled(envelope.sender) || envelope.sender === viewCapability.metadata.symbolicAppName;
      })
      .forEach((viewCapability: ViewCapability) => {
        const intentMessage: ViewIntentMessage = envelope.message;
        const view = envelope._injector.get(WorkbenchView as Type<WorkbenchView>, null); // TODO [Angular 9]: remove type cast for abstract symbols once 'angular/issues/29905' and 'angular/issues/23611' are fixed

        const matrixParamObject = Url.writeMatrixParamObject({
          matrixParams: Url.substituteParamVariables({...viewCapability.properties.matrixParams, ...intentMessage.payload.matrixParams}, envelope.message.qualifier),
          queryParams: Url.substituteParamVariables({...viewCapability.properties.queryParams, ...intentMessage.payload.queryParams}, envelope.message.qualifier),
        });

        const extras: WbNavigationExtras = {
          activateIfPresent: intentMessage.payload.activateIfPresent,
          closeIfPresent: intentMessage.payload.closeIfPresent,
          target: intentMessage.payload.target,
          selfViewRef: view && view.viewRef,
          blankViewPartRef: view && this._workbench.resolveViewPart(view.viewRef),
          blankInsertionIndex: intentMessage.payload.blankInsertionIndex,
        };

        const commands = this.createNavigateCommands(viewCapability, matrixParamObject, envelope.message.qualifier);
        this._wbRouter.navigate(commands, extras).then(noop);
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
    this._manifestRegistry.getCapabilitiesByType<ViewCapability>(this.type)
      .filter(viewCapability => !viewCapability.metadata.proxy)
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
}

