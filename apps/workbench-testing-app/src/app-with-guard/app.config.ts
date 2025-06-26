/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ApplicationConfig} from '@angular/core';
import {provideRouter, withHashLocation} from '@angular/router';
import {routes} from './app.routes';
import {provideAnimations} from '@angular/platform-browser/animations';
import {provideWorkbench} from '@scion/workbench';
import {workbenchConfig} from './workbench.config';

/**
 * Provides the config for an application that has a protected empty-path top-level route.
 *
 * Options:
 * - forbidden: true|false
 *   Controls if to forbid access
 */
export const AppWithGuard = {
  appConfig: (options: Record<string, string>): ApplicationConfig => {
    return {
      providers: [
        provideWorkbench(workbenchConfig),
        provideRouter(routes(options), withHashLocation()),
        provideAnimations(),
      ],
    };
  },
};
