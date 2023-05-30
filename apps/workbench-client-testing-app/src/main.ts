/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {bootstrapApplication} from '@angular/platform-browser';
import {AppComponent} from './app/app.component';
import {provideRouter, withHashLocation} from '@angular/router';
import {provideWorkbenchClient} from './app/workbench-client/workbench-client.provider';
import {EnvironmentProviders, makeEnvironmentProviders} from '@angular/core';
import {environment} from './environments/environment';
import {provideAnimations, provideNoopAnimations} from '@angular/platform-browser/animations';
import {routes} from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes, withHashLocation()),
    provideWorkbenchClient(),
    provideAnimationsIfEnabled(),
  ],
}).catch(err => console.error(err));

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
