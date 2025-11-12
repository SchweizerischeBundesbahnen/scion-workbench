/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ApplicationConfig, provideZoneChangeDetection} from '@angular/core';
import {MAIN_AREA, provideWorkbench, WorkbenchLayoutFactory} from '@scion/workbench';
import {provideRouter, withComponentInputBinding, withHashLocation} from '@angular/router';
import {provideAnimations} from '@angular/platform-browser/animations';

/**
 * Central place to configure the workbench-getting-started-app.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideWorkbench({
      layout: (factory: WorkbenchLayoutFactory) => factory
        .addPart(MAIN_AREA)
        .navigatePart(MAIN_AREA, ['overview'])
        .addPart('todos', {dockTo: 'left-top'}, {label: 'Todos', icon: 'checklist'})
        .navigatePart('todos', ['todos'])
        .activatePart('todos'),
    }),
    provideRouter([
      {path: 'overview', loadComponent: () => import('./overview/overview.component')},
      {path: 'todos', loadComponent: () => import('./todos/todos.component')},
      {path: 'todos/:id', loadComponent: () => import('./todo/todo.component')},
    ], withComponentInputBinding(), withHashLocation()),
    provideAnimations(),
    provideZoneChangeDetection(),
  ],
};
