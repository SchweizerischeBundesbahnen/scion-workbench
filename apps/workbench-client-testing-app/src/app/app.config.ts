/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ApplicationConfig, EnvironmentProviders, makeEnvironmentProviders} from '@angular/core';
import {provideRouter, withHashLocation} from '@angular/router';
import {routes} from './app.routes';
import {environment} from '../environments/environment';
import {provideAnimations, provideNoopAnimations} from '@angular/platform-browser/animations';
import {provideWorkbenchClient} from './workbench-client/workbench-client.provider';
import {provideWorkbenchTheme} from './theme/workbench-theme-switcher';

/**
 * Central place to configure the workbench-client-testing-app.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withHashLocation()),
    provideWorkbenchClient(),
    provideWorkbenchTheme(),
    provideAnimationsIfEnabled(),
  ],
};

/**
 * Provides a set of DI providers to enable/disable Angular animations based on the environment.
 *
 * Animations should be disabled end-to-end tests.
 */
function provideAnimationsIfEnabled(): EnvironmentProviders {
  return makeEnvironmentProviders([
    environment.animationEnabled ? provideAnimations() : provideNoopAnimations(),
  ]);
}
