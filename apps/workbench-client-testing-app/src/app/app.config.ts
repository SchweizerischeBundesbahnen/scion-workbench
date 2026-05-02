/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ApplicationConfig, EnvironmentProviders, makeEnvironmentProviders, provideZoneChangeDetection} from '@angular/core';
import {provideRouter, withComponentInputBinding, withHashLocation} from '@angular/router';
import {routes} from './app.routes';
import {environment} from '../environments/environment';
import {provideAnimations, provideNoopAnimations} from '@angular/platform-browser/animations';
import {provideWorkbenchClientAngular} from '@scion/workbench-client-angular';
import {provideValueFromStorage, storageTextProvider} from './text/storage-text-provider';
import {provideTextProvider} from '@scion/components/text';

/**
 * Central place to configure the workbench-client-testing-app.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideWorkbenchClientAngular(determineAppSymbolicName()),
    provideRouter(routes, withHashLocation(), withComponentInputBinding()),
    provideAnimationsIfEnabled(),
    provideZoneChangeDetection(),
    provideTextProvider(storageTextProvider),
    provideValueFromStorage(),
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

/**
 * Identifies the currently running app based on the configured apps in the environment and the current URL.
 */
function determineAppSymbolicName(): string {
  const application = Object.values(environment.apps).find(app => new URL(app.url).host === window.location.host);
  if (!application) {
    throw Error(`[AppError] Application served on wrong URL. Supported URLs are: ${Object.values(environment.apps).map(app => app.url)}`);
  }
  return application.symbolicName;
}
