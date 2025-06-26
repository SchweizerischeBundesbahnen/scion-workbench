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
 * Provides the config for an application with a redirect.
 *
 * Options:
 * - providers: workbench-before-router|workbench-after-router
 *   Controls in which order to provide the `Workbench` and `Router`.
 * - routes: flat|nested
 *   Controls whether to have a flat or nested routes config.
 */
export const AppWithRedirect = {
  appConfig: (options: Record<string, string>): ApplicationConfig => {
    switch (options['providers']) {
      case 'workbench-before-router':
        return {
          providers: [
            provideWorkbench(workbenchConfig),
            provideRouter(routes(options), withHashLocation()),
            provideAnimations(),
          ],
        };
      case 'workbench-after-router':
        return {
          providers: [
            provideRouter(routes(options), withHashLocation()),
            provideWorkbench(workbenchConfig),
            provideAnimations(),
          ],
        };
      default: {
        throw Error(`[AppWithRedirectError] Unsupported 'providers' option: ${options['providers']}`);
      }
    }
  },
};
