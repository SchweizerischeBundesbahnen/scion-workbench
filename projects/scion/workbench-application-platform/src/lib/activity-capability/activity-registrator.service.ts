/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Injectable } from '@angular/core';
import { ACTIVITY_CAPABILITY_ROUTE_DATA_KEY } from './metadata';
import { Route, Router } from '@angular/router';
import { WorkbenchActivityPartService, WorkbenchAuxiliaryRoutesRegistrator } from '@scion/workbench';
import { ActivityOutletComponent } from './activity-outlet.component';
import { ManifestCollector } from '../core/manifest-collector.service';
import { ActivityCapability, PlatformCapabilityTypes } from '@scion/workbench-application-platform.api';

/**
 * Registers workbench activities for capabilities of the type 'activity'.
 */
@Injectable()
export class ActivityRegistrator {

  constructor(private _manifestCollector: ManifestCollector,
              private _router: Router,
              private _activityPartService: WorkbenchActivityPartService,
              private _routesRegistrator: WorkbenchAuxiliaryRoutesRegistrator) {
  }

  /**
   * Initializes this service upon application startup.
   * @Internal
   */
  public init(): void {
    this._manifestCollector.whenManifests.then(manifestRegistry => {
      const activityCapabilities: ActivityCapability[] = manifestRegistry.getCapabilitiesByType<ActivityCapability>(PlatformCapabilityTypes.Activity)
        .filter(capability => !capability.metadata.proxy);
      this.installActivityCapabilityRoutes(activityCapabilities);
      this.registerActivities(activityCapabilities);
    });
  }

  private installActivityCapabilityRoutes(activityCapabilities: ActivityCapability[]): void {
    // Register capability routes as primary routes
    this._routesRegistrator.replaceRouterConfig([
      ...this._router.config,
      ...activityCapabilities
        .filter(activityCapability => !activityCapability.metadata.proxy)
        .map((activityCapability: ActivityCapability): Route => {
          return {
            path: `${activityCapability.metadata.symbolicAppName}/${activityCapability.metadata.id}`,
            component: ActivityOutletComponent,
            data: {[ACTIVITY_CAPABILITY_ROUTE_DATA_KEY]: activityCapability},
          };
        }),
    ]);

    // Register auxiliary routes for all primary routes.
    this._routesRegistrator.registerActivityAuxiliaryRoutes();
  }

  private registerActivities(activityCapabilities: ActivityCapability[]): void {
    activityCapabilities
      .filter(activityCapability => !activityCapability.metadata.proxy)
      .forEach(activityCapability => {
        const activity = this._activityPartService.createActivity();
        activity.title = activityCapability.properties.title;
        activity.cssClass = activityCapability.properties.cssClass;
        activity.itemText = activityCapability.properties.itemText;
        activity.itemCssClass = activityCapability.properties.itemCssClass;
        activity.position = activityCapability.properties.position;
        activity.target = 'activity-panel';
        activity.routerLink = [
          activityCapability.metadata.symbolicAppName,
          activityCapability.metadata.id,
        ];
        this._activityPartService.addActivity(activity);
      });
  }
}

