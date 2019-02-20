/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { APP_INITIALIZER, Inject, InjectionToken, ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { WorkbenchViewOpenActivityActionDirective } from './workbench-view-open-activity-action.directive';
import { WorkbenchUrlOpenActivityActionDirective } from './workbench-url-open-activity-action.directive';
import { WorkbenchRouterLinkDirective, WorkbenchRouterLinkWithHrefDirective } from './workbench-router-link.directive';
import { WorkbenchApplicationConfig } from './workbench-application.config';
import { ActivatorService } from './activator.service';
import { DefaultMessageBus, IntentService, ManifestRegistryService, MessageBoxService, MessageBus, NotificationService, Platform, PopupService } from '@scion/workbench-application.core';
import { ForRootGuardService } from './for-root-guard.service';
import { WorkbenchPopupOpenActivityActionDirective } from './workbench-popup-open-activity-action.directive';

/**
 * DI injection token to ensure `WorkbenchApplicationModule.forRoot()` is not used in a lazy context.
 */
export const FORROOT_GUARD = new InjectionToken<void>('WORKBENCH_APPLICATION_FORROOT_GUARD');

@NgModule({
  declarations: [
    WorkbenchViewOpenActivityActionDirective,
    WorkbenchPopupOpenActivityActionDirective,
    WorkbenchUrlOpenActivityActionDirective,
    WorkbenchRouterLinkDirective,
    WorkbenchRouterLinkWithHrefDirective,
  ],
  exports: [
    WorkbenchViewOpenActivityActionDirective,
    WorkbenchPopupOpenActivityActionDirective,
    WorkbenchUrlOpenActivityActionDirective,
    WorkbenchRouterLinkDirective,
    WorkbenchRouterLinkWithHrefDirective,
  ]
})
export class WorkbenchApplicationModule {

  constructor(@Inject(FORROOT_GUARD) guard: any, activator: ActivatorService) {
    // focus the first focusable element in module constructor to also work in lazily loaded modules
    activator.autofocusIfConfigured();
  }

  /**
   * To manifest a dependency to the 'workbench-application-platform.module' from application module, AppModule.
   *
   * Call `forRoot` only in the root application module. Calling it in any other module, particularly in a lazy-loaded module, will produce a runtime error.
   */
  public static forRoot(config: WorkbenchApplicationConfig = {}): ModuleWithProviders {
    return {
      ngModule: WorkbenchApplicationModule,
      providers: [
        ForRootGuardService,
        ActivatorService,
        {provide: WorkbenchApplicationConfig, useValue: config},
        {provide: MessageBus, useClass: config.messageBus || DefaultMessageBus},
        // make core services of `workbench-application.core` available to dependency injection
        {
          provide: MessageBoxService,
          useFactory: provideMessageBoxService
        },
        {
          provide: NotificationService,
          useFactory: provideNotificationService
        },
        {
          provide: IntentService,
          useFactory: provideIntentService
        },
        {
          provide: ManifestRegistryService,
          useFactory: provideManifestRegistryService
        },
        {
          provide: PopupService,
          useFactory: providePopupService
        },
        // prevent usage of this module in a lazy context
        {
          provide: FORROOT_GUARD,
          useFactory: provideForRootGuard,
          deps: [[ForRootGuardService, new Optional(), new SkipSelf()]]
        },
        // start the platform
        {
          provide: APP_INITIALIZER,
          multi: true,
          useFactory: provideModuleInitializerFn,
          deps: [ActivatorService]
        }
      ]
    };
  }

  /**
   * To manifest a dependency to the 'workbench-application-platform.module' from within a feature module.
   */
  public static forChild(): ModuleWithProviders {
    return {
      ngModule: WorkbenchApplicationModule,
      providers: [] // do not register any providers in 'forChild' but in 'forRoot' instead
    };
  }
}

export function provideForRootGuard(guard: ForRootGuardService): any {
  if (guard) {
    throw new Error('[ModuleForRootError] WorkbenchApplicationModule is not supported in a lazy context.');
  }
  return 'guarded';
}

export function provideNotificationService(): NotificationService {
  return Platform.getService(NotificationService);
}

export function provideMessageBoxService(): MessageBoxService {
  return Platform.getService(MessageBoxService);
}

export function provideIntentService(): IntentService {
  return Platform.getService(IntentService);
}

export function provideManifestRegistryService(): ManifestRegistryService {
  return Platform.getService(ManifestRegistryService);
}

export function providePopupService(): PopupService {
  return Platform.getService(PopupService);
}

export function provideModuleInitializerFn(activatorService: ActivatorService): () => void {
  // use injector because Angular Router cannot be injected in `APP_INITIALIZER` function
  // do not return the function directly to not break the AOT build (add redundant assignment)
  const fn = (): void => activatorService.init();
  return fn;
}
