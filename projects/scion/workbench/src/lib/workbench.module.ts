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
import {WORKBENCH_FORROOT_GUARD, WORKBENCH_LAYOUT_CONFIG} from './workbench.constants';
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
import {provideLocationPatch} from './routing/ɵlocation';
import {WorkbenchLayoutFactory} from './layout/workbench-layout.factory';
import {MAIN_AREA} from './layout/workbench-layout';
import {WorkbenchThemeSwitcher} from './theme/workbench-theme-switcher.service';

/**
 * Module of the SCION Workbench.
 *
 * SCION Workbench enables the creation of Angular web applications that require a flexible layout to arrange content side-by-side
 * or stacked, all personalizable by the user via drag & drop. This type of layout is ideal for applications with non-linear workflows,
 * enabling users to work on content in parallel.
 *
 * The workbench layout is a grid of parts. Parts are aligned relative to each other. A part is a stack of views. Content is displayed in views.
 *
 * The layout can be divided into a main and a peripheral area, with the main area as the primary place for opening views.
 * The peripheral area arranges parts around the main area to provide navigation or context-sensitive assistance to support
 * the user's workflow. Defining a main area is optional and recommended for applications requiring a dedicated and maximizable
 * area for user interaction.
 *
 * Multiple layouts, called perspectives, are supported. Perspectives can be switched. Only one perspective is active at a time.
 * Perspectives share the same main area, if any.
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
   * To manifest a dependency to the workbench module from the application module.
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
          provide: WORKBENCH_LAYOUT_CONFIG,
          useFactory: () => config.layout ?? ((factory: WorkbenchLayoutFactory) => factory.addPart(MAIN_AREA)),
        },
        {
          provide: WORKBENCH_FORROOT_GUARD,
          useFactory: provideForRootGuard,
          deps: [[WorkbenchService, new Optional(), new SkipSelf()]],
        },
        {
          provide: WORKBENCH_PRE_STARTUP,
          useExisting: WorkbenchThemeSwitcher,
          multi: true,
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
   * To manifest a dependency to the workbench module from a feature module.
   *
   * @deprecated since version 16.0.0-beta.1; Import {@link WorkbenchModule} or standalone directives directly; API will be removed in a future release.
   *
   * TODO [#312]: Remove when fixed issue https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/312
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
