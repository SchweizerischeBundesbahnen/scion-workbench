/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {provideWorkbench} from './workbench.provider';
import {ApplicationConfig} from '@angular/core';
import {MAIN_AREA, WorkbenchLayoutFactory} from '@scion/workbench';
import {provideRouter, withHashLocation} from '@angular/router';
import {provideAnimations} from '@angular/platform-browser/animations';

/**
 * Central place to configure the workbench-getting-started-app.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideWorkbench({
      layout: (factory: WorkbenchLayoutFactory) => factory
        .addPart(MAIN_AREA)
        .addPart('left', {relativeTo: MAIN_AREA, align: 'left', ratio: .25})
        .addView('todos', {partId: 'left', activateView: true}),
    }),
    provideRouter([
      {path: '', loadComponent: () => import('./welcome/welcome.component')},
      {path: '', outlet: 'todos', loadComponent: () => import('./todos/todos.component')},
      {path: 'todos/:id', loadComponent: () => import('./todo/todo.component')},
    ], withHashLocation()),
    provideAnimations(),
  ],
};
