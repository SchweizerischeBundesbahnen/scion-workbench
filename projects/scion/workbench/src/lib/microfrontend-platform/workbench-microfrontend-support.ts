/*
 * Copyright (c) 2018-2020 Swiss Federal Railways
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
import {WorkbenchMessageBoxService, WorkbenchPopupService, WorkbenchRouter} from '@scion/workbench-client';
import {NgZoneIntentClientDecorator, NgZoneMessageClientDecorator} from './initialization/ng-zone-decorators';
import {WorkbenchModuleConfig} from '../workbench-module-config';
import {LogDelegate} from './initialization/log-delegate.service';
import {MicrofrontendViewCommandHandler} from './microfrontend-view/microfrontend-view-command-handler.service';
import {MicrofrontendMessageBoxIntentHandler} from './microfrontend-message-box/microfrontend-message-box-intent-handler.service';
import {MicrofrontendNotificationIntentHandler} from './microfrontend-notification/microfrontend-notification-intent-handler.service';
import {MicrofrontendViewIntentInterceptor} from './routing/microfrontend-view-intent-interceptor.service';
import {MicrofrontendPopupIntentInterceptor} from './microfrontend-popup/microfrontend-popup-intent-interceptor.service';
import {WorkbenchHostManifestInterceptor} from './initialization/workbench-host-manifest-interceptor.service';

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
      LogDelegate,
      MicrofrontendViewIntentInterceptor,
      MicrofrontendPopupIntentInterceptor,
      WorkbenchRouter,
      WorkbenchPopupService,
      WorkbenchMessageBoxService,
      NgZoneMessageClientDecorator,
      NgZoneIntentClientDecorator,
      WorkbenchHostManifestInterceptor,
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
