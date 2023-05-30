/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ENVIRONMENT_INITIALIZER, inject, Inject, ModuleWithProviders, NgModule, Optional, SkipSelf} from '@angular/core';
import {WorkbenchComponent} from './workbench.component';
import {WorkbenchService} from './workbench.service';
import {WorkbenchRouterLinkDirective} from './routing/workbench-router-link.directive';
import {WorkbenchUrlObserver} from './routing/workbench-url-observer.service';
import {WorkbenchModuleConfig} from './workbench-module-config';
import {WORKBENCH_FORROOT_GUARD} from './workbench.constants';
import {WorkbenchPartActionDirective} from './part/part-action-bar/part-action.directive';
import {WorkbenchViewMenuItemDirective} from './part/view-context-menu/view-menu.directive';
import {ViewMenuService} from './part/view-context-menu/view-menu.service';
import {ViewMoveHandler} from './view/view-move-handler.service';
import {provideWorkbenchMicrofrontendSupport} from './microfrontend-platform/workbench-microfrontend-support';
import {provideWorkbenchLauncher} from './startup/workbench-launcher.service';
import {provideLogging} from './logging';
import {WORKBENCH_POST_STARTUP, WORKBENCH_PRE_STARTUP, WORKBENCH_STARTUP} from './startup/workbench-initializer';
import {WorkbenchPerspectiveService} from './perspective/workbench-perspective.service';
import {DefaultWorkbenchStorage, WorkbenchStorage} from './storage/workbench-storage';
import {WorkbenchStorageService} from './storage/workbench-storage.service';
import {provideLocationPatch} from './routing/ɵlocation';

/**
 * Module of the SCION Workbench.
 *
 * SCION Workbench enables the creation of Angular web applications that require a flexible layout
 * to arrange content side-by-side or stacked, all personalizable by the user via drag & drop.
 *
 * The workbench layout is ideal for applications with non-linear workflows, enabling users to work
 * on content in parallel.
 *
 * The workbench has a main area and a peripheral area for placing views. The main area is the primary
 * place for views to interact with the application. The peripheral area arranges views around the main
 * area to support the user's workflow. Multiple arrangements of peripheral views, called perspectives,
 * are supported. Different perspectives provide a different perspective on the application while sharing
 * the main area. Only one perspective can be active at a time.
 */
@NgModule({
  imports: [
    WorkbenchComponent,
    WorkbenchRouterLinkDirective,
    WorkbenchPartActionDirective,
    WorkbenchViewMenuItemDirective,
  ],
  exports: [
    WorkbenchComponent,
    WorkbenchRouterLinkDirective,
    WorkbenchPartActionDirective,
    WorkbenchViewMenuItemDirective,
  ],
})
export class WorkbenchModule {

  constructor(@Inject(WORKBENCH_FORROOT_GUARD) guard: any) { // eslint-disable-line @typescript-eslint/no-unused-vars
  }

  /**
   * To manifest a dependency to the 'workbench.module' from application module, AppModule.
   *
   * Call `forRoot` only in the root application module. Calling it in any other module, particularly in a lazy-loaded module, will produce a runtime error.
   *
   * ```
   * @NgModule({
   *   imports: [
   *     ...
   *     WorkbenchModule.forRoot()
   *   ],
   *   bootstrap: [AppComponent],
   * })
   * export class AppModule { }
   * ```
   */
  public static forRoot(config: WorkbenchModuleConfig = {}): ModuleWithProviders<WorkbenchModule> {
    return {
      ngModule: WorkbenchModule,
      providers: [
        {
          provide: WorkbenchModuleConfig,
          useValue: config,
        },
        {
          provide: WorkbenchStorage,
          useClass: config.storage ?? DefaultWorkbenchStorage,
        },
        {
          provide: WORKBENCH_FORROOT_GUARD,
          useFactory: provideForRootGuard,
          deps: [[WorkbenchService, new Optional(), new SkipSelf()]],
        },
        {
          provide: WORKBENCH_PRE_STARTUP,
          multi: true,
          useExisting: WorkbenchStorageService,
        },
        {
          provide: WORKBENCH_STARTUP,
          multi: true,
          useExisting: WorkbenchPerspectiveService,
        },
        {
          provide: WORKBENCH_POST_STARTUP,
          useExisting: ViewMenuService,
          multi: true,
        },
        {
          provide: WORKBENCH_POST_STARTUP,
          useClass: ViewMoveHandler,
          multi: true,
        },
        {
          provide: ENVIRONMENT_INITIALIZER,
          multi: true,
          useValue: () => inject(WorkbenchUrlObserver),
        },
        provideWorkbenchLauncher(config),
        provideLogging(config),
        provideLocationPatch(),
        provideWorkbenchMicrofrontendSupport(config),
      ],
    };
  }

  /**
   * To manifest a dependency to the 'workbench.module' from within a feature module.
   *
   * @deprecated since version 16.0.0-beta.1; Import {@link WorkbenchModule} or standalone directives directly; API will be removed in version 17.
   */
  public static forChild(): ModuleWithProviders<WorkbenchModule> {
    return {
      ngModule: WorkbenchModule,
      providers: [], // do not register any providers in 'forChild' but in 'forRoot' instead
    };
  }
}

/**
 * @docs-private Not public API, intended for internal use only.
 */
export function provideForRootGuard(workbenchService: WorkbenchService): any {
  if (workbenchService) {
    throw new Error('[ModuleForRootError] WorkbenchModule.forRoot() called twice. Lazy loaded modules should use WorkbenchModule.forChild() instead.');
  }
  return 'guarded';
}
