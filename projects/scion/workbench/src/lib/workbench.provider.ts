/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {EnvironmentProviders, inject, makeEnvironmentProviders, provideEnvironmentInitializer} from '@angular/core';
import {WorkbenchService} from './workbench.service';
import {WorkbenchUrlObserver} from './routing/workbench-url-observer.service';
import {WorkbenchConfig} from './workbench-config';
import {ViewMenuService} from './part/view-context-menu/view-menu.service';
import {ViewMoveHandler} from './view/view-move-handler.service';
import {provideWorkbenchMicrofrontendSupport} from './microfrontend-platform/workbench-microfrontend-support';
import {provideLogging} from './logging';
import {provideWorkbenchInitializer, WorkbenchStartupPhase} from './startup/workbench-initializer';
import {WorkbenchPerspectiveService} from './perspective/workbench-perspective.service';
import {DefaultWorkbenchStorage, WorkbenchStorage} from './storage/workbench-storage';
import {provideLocationPatch} from './routing/ɵlocation';
import {WorkbenchThemeSwitcher} from './theme/workbench-theme-switcher.service';
import {ViewTabDragImageRenderer} from './view-dnd/view-tab-drag-image-renderer.service';
import {provideTextProviders} from './text/text-providers';
import {provideIconProviders} from './icon/icon-providers';

/**
 * Enables and configures the SCION Workbench, returning a set of dependency-injection providers to be registered in Angular.
 *
 * ### About
 * SCION Workbench enables the creation of Angular web applications that require a flexible layout to display content side-by-side
 * or stacked, all personalizable by the user via drag & drop. This type of layout is ideal for applications with non-linear workflows,
 * enabling users to work on content in parallel.
 *
 * An application can have multiple layouts, called perspectives. A perspective defines an arrangement of parts and views.
 * Parts can be docked to the side or positioned relative to each other. Views are stacked in parts and can be dragged to other parts.
 * Content can be displayed in both parts and views.
 *
 * Users can personalize the layout of a perspective and switch between perspectives. The workbench remembers the layout of a perspective,
 * restoring it the next time it is activated.
 *
 * A perspective typically has a main area part and parts docked to the side, providing navigation and context-sensitive assistance to support
 * the user's workflow. Initially empty or displaying a welcome page, the main area is where the workbench opens views by default. Users can split
 * the main area (or any other part) by dragging views side-by-side, vertically and horizontally, even across windows.
 *
 * Unlike any other part, the main area is shared between perspectives, and its layout is not reset when resetting perspectives. Having a main area and
 * multiple perspectives is optional.
 *
 * ### Usage
 * ```ts
 * import {MAIN_AREA, provideWorkbench, WorkbenchLayoutFactory} from '@scion/workbench';
 * import {provideRouter} from '@angular/router';
 * import {provideAnimations} from '@angular/platform-browser/animations';
 * import {bootstrapApplication} from '@angular/platform-browser';
 *
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideWorkbench({
 *       layout: (factory: WorkbenchLayoutFactory) => factory
 *         .addPart(MAIN_AREA)
 *         .addPart('todos', {dockTo: 'left-top'}, {label: 'Todos', icon: 'checklist'})
 *         .navigatePart(MAIN_AREA, ['overview'])
 *         .navigatePart('todos', ['todos'])
 *         .activatePart('todos'),
 *     }),
 *     provideRouter([
 *       {path: 'overview', loadComponent: () => import('./overview/overview.component')},
 *       {path: 'todos', loadComponent: () => import('./todos/todos.component')},
 *     ]),
 *     provideAnimations(),
 *   ],
 * });
 * ```
 *
 * ### Startup
 * The SCION Workbench starts automatically when the `<wb-workbench>` component is added to the DOM. Alternatively, the workbench can be
 * started manually using the {@link WorkbenchLauncher}, such as in an app initializer or a route guard.
 *
 * Example of starting the workbench in an app initializer:
 *
 * ```ts
 * import {provideWorkbench, WorkbenchLauncher} from '@scion/workbench';
 * import {bootstrapApplication} from '@angular/platform-browser';
 * import {inject, provideAppInitializer} from '@angular/core';
 *
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideWorkbench(),
 *     provideAppInitializer(() => inject(WorkbenchLauncher).launch())
 *   ]
 * });
 * ```
 *
 * Starting the workbench in an app initializer will block Angular's app startup until the workbench is ready.
 *
 * ### Startup Hooks
 * The application can hook into the startup process of the SCION Workbench by providing one or more initializers to the `provideWorkbenchInitializer()` function.
 * Initializers execute at defined points during startup, enabling the application's controlled initialization.
 *
 * ```ts
 * import {provideWorkbench, provideWorkbenchInitializer} from '@scion/workbench';
 * import {bootstrapApplication} from '@angular/platform-browser';
 * import {inject} from '@angular/core';
 *
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideWorkbench(),
 *     provideWorkbenchInitializer(() => inject(SomeService).init()),
 *   ],
 * });
 * ```
 */
export function provideWorkbench(config?: WorkbenchConfig): EnvironmentProviders {
  config ??= {};

  return makeEnvironmentProviders([
    {
      provide: WorkbenchConfig,
      useValue: config,
    },
    {
      provide: WorkbenchStorage,
      useClass: config.storage ?? DefaultWorkbenchStorage,
    },
    provideWorkbenchInitializer(() => void inject(WorkbenchThemeSwitcher), {phase: WorkbenchStartupPhase.PreStartup}),
    provideWorkbenchInitializer(() => void inject(ViewMenuService)),
    provideWorkbenchInitializer(() => void inject(ViewMoveHandler)),
    provideWorkbenchInitializer(() => void inject(ViewTabDragImageRenderer)),
    provideWorkbenchInitializer(() => inject(WorkbenchPerspectiveService).init(), {phase: WorkbenchStartupPhase.PostStartup}),
    provideEnvironmentInitializer(() => inject(WorkbenchUrlObserver)),
    provideEnvironmentInitializer(() => rejectIfNotRootEnvironment()),
    provideTextProviders(config),
    provideIconProviders(config),
    provideLogging(config),
    provideLocationPatch(),
    provideWorkbenchMicrofrontendSupport(config),
  ]);
}

function rejectIfNotRootEnvironment(): string {
  if (inject(WorkbenchService, {optional: true, skipSelf: true})) {
    throw Error('[ProvideWorkbenchError] SCION Workbench must be provided in root environment.');
  }
  return 'root';
}
