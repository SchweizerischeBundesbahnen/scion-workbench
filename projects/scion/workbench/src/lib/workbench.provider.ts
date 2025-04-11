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
import {provideWorkbenchLauncher} from './startup/workbench-launcher.service';
import {provideLogging} from './logging';
import {provideWorkbenchInitializer, WorkbenchStartupPhase} from './startup/workbench-initializer';
import {WorkbenchPerspectiveService} from './perspective/workbench-perspective.service';
import {DefaultWorkbenchStorage, WorkbenchStorage} from './storage/workbench-storage';
import {provideLocationPatch} from './routing/ɵlocation';
import {WorkbenchThemeSwitcher} from './theme/workbench-theme-switcher.service';
import {ViewTabDragImageRenderer} from './view-dnd/view-tab-drag-image-renderer.service';
import {provideTextProviders} from './text/text-providers';

/**
 * Enables and configures the SCION Workbench in an application, returning a set of dependency-injection providers to be registered in Angular.
 *
 * SCION Workbench enables the creation of Angular web applications that require a flexible layout to arrange content side-by-side
 * or stacked, all personalizable by the user via drag & drop. This type of layout is ideal for applications with non-linear workflows,
 * enabling users to work on content in parallel.
 *
 * The workbench layout is a grid of parts. Parts are aligned relative to each other. Each part is a stack of views. Content is displayed in views or parts.
 *
 * The layout can be divided into a main and a peripheral area, with the main area as the primary place for opening views.
 * The peripheral area arranges parts around the main area to provide navigation or context-sensitive assistance to support
 * the user's workflow. Defining a main area is optional and recommended for applications requiring a dedicated and maximizable
 * area for user interaction.
 *
 * Multiple layouts, called perspectives, are supported. Perspectives can be switched. Only one perspective is active at a time.
 * Perspectives share the same main area, if any.
 *
 * ---
 * Usage:
 *
 * ```ts
 * import {bootstrapApplication} from '@angular/platform-browser';
 * import {provideRouter} from '@angular/router';
 * import {provideAnimations} from '@angular/platform-browser/animations';
 * import {provideWorkbench} from '@scion/workbench';
 *
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideWorkbench(),
 *     provideRouter([]), // required by the SCION Workbench
 *     provideAnimations(), // required by the SCION Workbench
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
    provideWorkbenchLauncher(config),
    provideTextProviders(config),
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
