/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Inject, ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { WorkbenchModule } from '@scion/workbench';
import { WorkbenchApplicationPlatformConfig } from './workbench-application-platform.config';
import { ForRootGuardService } from './for-root-guard.service';
import { FORROOT_GUARD } from './workbench-application-platform.constants';
import { ErrorHandler, PlatformConfigLoader } from './core/metadata';
import { DefaultErrorHandler } from './core/default-error-handler.service';
import { CoreModule } from './core/core.module';
import { ViewCapabilityModule } from './view-capability/view-capability.module';
import { ActivityCapabilityModule } from './activity-capability/activity-capability.module';
import { MessageBoxCapabilityModule } from './messagebox-capability/message-box-capability.module';
import { NotificationCapabilityModule } from './notification-capability/notification-capability.module';
import { ManifestCapabilityModule } from './manifest-capability/manifest-capability.module';
import { PopupCapabilityModule } from './popup-capability/popup-capability.module';
import { ModulePlatformConfigLoader } from './core/module-platform-config-loader.service';

@NgModule({
  imports: [
    WorkbenchModule.forChild(),
    CoreModule,
    ViewCapabilityModule,
    ActivityCapabilityModule,
    MessageBoxCapabilityModule,
    NotificationCapabilityModule,
    PopupCapabilityModule,
    ManifestCapabilityModule,
  ],
})
export class WorkbenchApplicationPlatformModule {

  constructor(@Inject(FORROOT_GUARD) guard: any) {
  }

  /**
   * To manifest a dependency to the 'workbench-application-platform.module' from application module, AppModule.
   *
   * Call `forRoot` only in the root application module. Calling it in any other module, particularly in a lazy-loaded module, will produce a runtime error.
   */
  public static forRoot(config: WorkbenchApplicationPlatformConfig): ModuleWithProviders {
    return {
      ngModule: WorkbenchApplicationPlatformModule,
      providers: [
        ForRootGuardService,
        {provide: ErrorHandler, useClass: config.errorHandler || DefaultErrorHandler},
        {provide: PlatformConfigLoader, useClass: config.platformConfigLoader || ModulePlatformConfigLoader},
        {provide: WorkbenchApplicationPlatformConfig, useValue: config},
        {
          provide: FORROOT_GUARD,
          useFactory: provideForRootGuard,
          deps: [[ForRootGuardService, new Optional(), new SkipSelf()]],
        },
      ],
    };
  }
}

export function provideForRootGuard(guard: ForRootGuardService): any {
  if (guard) {
    throw new Error('[ModuleForRootError] WorkbenchApplicationPlatformModule is not supported in a lazy context.');
  }
  return 'guarded';
}

