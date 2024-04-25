/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ModuleWithProviders, NgModule} from '@angular/core';
import {WorkbenchComponent} from './workbench.component';
import {WorkbenchRouterLinkDirective} from './routing/workbench-router-link.directive';
import {WorkbenchConfig} from './workbench-config';
import {WorkbenchPartActionDirective} from './part/part-action-bar/part-action.directive';
import {WorkbenchViewMenuItemDirective} from './part/view-context-menu/view-menu.directive';
import {provideWorkbench} from './workbench.provider';

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
 *
 * @deprecated since version 17.0.0-beta.8; Register SCION Workbench providers using `provideWorkbench` function and import standalone components and directives instead; API will be removed in a future release.
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
   *
   * @deprecated since version 17.0.0-beta.8; Register SCION Workbench providers using `provideWorkbench` function and import standalone components and directives instead; API will be removed in a future release.
   */
  public static forRoot(config: WorkbenchModuleConfig = {}): ModuleWithProviders<WorkbenchModule> {
    return {
      ngModule: WorkbenchModule,
      providers: [provideWorkbench(config)],
    };
  }

  /**
   * To manifest a dependency to the workbench module from a feature module.
   *
   * @deprecated since version 16.0.0-beta.1; use standalone workbench component and directives instead; API will be removed in a future release.
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
 * Configuration of the SCION Workbench.
 *
 * @deprecated since version 17.0.0-beta.8; Register SCION Workbench providers using `provideWorkbench` function and import standalone workbench components and directives instead; API will be removed in a future release.
 */
export interface WorkbenchModuleConfig extends WorkbenchConfig {
}
