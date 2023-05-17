/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {MicrofrontendPlatformConfigLoader} from './microfrontend-platform-config-loader';
import {Injectable, Provider} from '@angular/core';
import {MicrofrontendPlatformInitializer} from './initialization/microfrontend-platform-initializer.service';
import {APP_IDENTITY, IntentClient, ManifestService, MessageClient, MicrofrontendPlatformConfig, OutletRouter, PlatformPropertyService} from '@scion/microfrontend-platform';
import {MICROFRONTEND_PLATFORM_POST_STARTUP, WORKBENCH_STARTUP} from '../startup/workbench-initializer';
import {Beans} from '@scion/toolkit/bean-manager';
import {WorkbenchMessageBoxService, WorkbenchNotificationService, WorkbenchPopupService, WorkbenchRouter, ɵMicrofrontendRouteParams} from '@scion/workbench-client';
import {NgZoneObservableDecorator} from './initialization/ng-zone-observable-decorator';
import {WorkbenchModuleConfig} from '../workbench-module-config';
import {MicrofrontendViewCommandHandler} from './microfrontend-view/microfrontend-view-command-handler.service';
import {MicrofrontendMessageBoxIntentHandler} from './microfrontend-message-box/microfrontend-message-box-intent-handler.service';
import {MicrofrontendNotificationIntentHandler} from './microfrontend-notification/microfrontend-notification-intent-handler.service';
import {MicrofrontendViewIntentInterceptor} from './routing/microfrontend-view-intent-interceptor.service';
import {MicrofrontendPopupIntentInterceptor} from './microfrontend-popup/microfrontend-popup-intent-interceptor.service';
import {WorkbenchHostManifestInterceptor} from './initialization/workbench-host-manifest-interceptor.service';
import {Route, ROUTES} from '@angular/router';
import {MicrofrontendViewComponent} from './microfrontend-view/microfrontend-view.component';
import {MicrofrontendViewRoutes} from './routing/microfrontend-routes';
import {MicrofrontendViewCapabilityInterceptor} from './routing/microfrontend-view-capability-interceptor.service';
import {MicrofrontendPopupCapabilityInterceptor} from './microfrontend-popup/microfrontend-popup-capability-interceptor.service';

/**
 * Registers a set of DI providers to set up microfrontend support in the workbench.
 */
export function provideWorkbenchMicrofrontendSupport(workbenchModuleConfig: WorkbenchModuleConfig): Provider[] {
  // Angular is very strict when compiling module definitions ahead-of-time (if enabled the AOT compilation).
  // - use ES5 function instead of arrow function to specify the factory
  // - export functions referenced in module metadata definition
  // - use ternary check to conditionally provide a provider
  return [
    workbenchModuleConfig.microfrontendPlatform ? [
      {
        provide: WORKBENCH_STARTUP,
        useClass: MicrofrontendPlatformInitializer,
        multi: true,
      },
      {
        provide: MicrofrontendPlatformConfigLoader,
        useClass: typeof workbenchModuleConfig.microfrontendPlatform === 'function' ? workbenchModuleConfig.microfrontendPlatform : StaticMicrofrontendPlatformConfigLoader,
      },
      {
        provide: MICROFRONTEND_PLATFORM_POST_STARTUP,
        useClass: MicrofrontendViewCommandHandler,
        multi: true,
      },
      {
        provide: MICROFRONTEND_PLATFORM_POST_STARTUP,
        useClass: MicrofrontendMessageBoxIntentHandler,
        multi: true,
      },
      {
        provide: MICROFRONTEND_PLATFORM_POST_STARTUP,
        useClass: MicrofrontendNotificationIntentHandler,
        multi: true,
      },
      MicrofrontendViewIntentInterceptor,
      MicrofrontendPopupIntentInterceptor,
      MicrofrontendViewCapabilityInterceptor,
      MicrofrontendPopupCapabilityInterceptor,
      WorkbenchRouter,
      WorkbenchPopupService,
      WorkbenchMessageBoxService,
      WorkbenchNotificationService,
      NgZoneObservableDecorator,
      WorkbenchHostManifestInterceptor,
      provideMicrofrontendRoutes(),
      provideMicrofrontendPlatformBeans(),
    ] : [],
  ];
}

/**
 * Provides {@link WorkbenchModuleConfig.microfrontendPlatform} config as passed to {@link WorkbenchModule.forRoot}.
 */
@Injectable()
class StaticMicrofrontendPlatformConfigLoader implements MicrofrontendPlatformConfigLoader {

  constructor(private _workbenchModuleConfig: WorkbenchModuleConfig) {
  }

  public async load(): Promise<MicrofrontendPlatformConfig> {
    return this._workbenchModuleConfig.microfrontendPlatform! as MicrofrontendPlatformConfig;
  }
}

/**
 * Provides beans of SCION Microfrontend Platform for DI.
 */
function provideMicrofrontendPlatformBeans(): Provider[] {
  return [
    {provide: APP_IDENTITY, useFactory: () => Beans.get(APP_IDENTITY)},
    {provide: MessageClient, useFactory: () => Beans.get(MessageClient)},
    {provide: IntentClient, useFactory: () => Beans.get(IntentClient)},
    {provide: OutletRouter, useFactory: () => Beans.get(OutletRouter)},
    {provide: ManifestService, useFactory: () => Beans.get(ManifestService)},
    {provide: PlatformPropertyService, useFactory: () => Beans.get(PlatformPropertyService)},
  ];
}

/**
 * Provides routes of the microfrontend integration.
 */
function provideMicrofrontendRoutes(): Provider[] {
  /**
   * Route for embedding the microfrontend of a view capability.
   */
  const viewMicrofrontendRoute: Route = {
    /**
     * Format: '~;{qualifier}/<viewCapabilityId>;{params}'
     *  - '{qualifier}' as matrix params of the first URL segment (~)
     *  - '{params}' as matrix params of the second URL segment (viewCapabilityId)
     */
    path: `${MicrofrontendViewRoutes.ROUTE_PREFIX}/:${ɵMicrofrontendRouteParams.ɵVIEW_CAPABILITY_ID}`,
    component: MicrofrontendViewComponent,
    /**
     * In the microfrontend view integration, parameters can be marked as 'transient'. Transient parameters are not added as matrix
     * parameters to the URL but passed via navigational state to the component by {@link NavigationStateResolver}. The component can
     * access transient params as resolved data via `ActivatedRoute.data[WorkbenchRouteData.state][MicrofrontendNavigationalStates.transientParams]`.
     *
     * However, by default, the Angular router only runs resolvers when the route's path or matrix parameters change. For this reason, we configure
     * the microfrontend route to always run resolvers, allowing the update of transient parameters without URL change.
     */
    runGuardsAndResolvers: 'always',
  };

  return [
    {provide: ROUTES, multi: true, useValue: viewMicrofrontendRoute},
  ];
}
