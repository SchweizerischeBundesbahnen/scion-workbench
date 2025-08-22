/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ApplicationConfig, EnvironmentProviders, inject, makeEnvironmentProviders} from '@angular/core';
import {PreloadAllModules, provideRouter, withHashLocation, withPreloading} from '@angular/router';
import {routes} from './app.routes';
import {workbenchConfig} from './workbench.config';
import {provideConfirmWorkbenchStartup} from './workbench/confirm-workbench-startup';
import {provideThrottleCapabilityLookupInterceptor} from './workbench/throttle-capability-lookup';
import {provideWorkbenchLifecycleHookLoggers} from './workbench/workbench-lifecycle-hook-loggers';
import {provideDevToolsInterceptor} from './devtools/devtools-capability-interceptor';
import {provideCustomNotificationIntentHandler} from './notification-page/notification-page-intent-handler';
import {environment} from '../environments/environment';
import {provideAnimations, provideNoopAnimations} from '@angular/platform-browser/animations';
import {provideWorkbench, provideWorkbenchInitializer} from '@scion/workbench';
import {provideMainAreaInitialPartId} from './workbench/main-area-initial-part-id.provider';
import {provideDesignTokens} from './workbench/provide-design-tokens';
import {ActiveWorkbenchElementCollector} from './active-workbench-element-log-page/active-workbench-element-collector.service';
import {provideValueFromStorage} from './text/storage-text-provider';

/**
 * Central place to configure the workbench-testing-app.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withHashLocation(), withPreloading(PreloadAllModules)),
    provideWorkbench(workbenchConfig),
    provideConfirmWorkbenchStartup(),
    provideDesignTokens(),
    provideThrottleCapabilityLookupInterceptor(),
    provideMainAreaInitialPartId(),
    provideWorkbenchLifecycleHookLoggers(),
    provideDevToolsInterceptor(),
    provideCustomNotificationIntentHandler(),
    provideWorkbenchInitializer(() => void inject(ActiveWorkbenchElementCollector)),
    provideAnimationsIfEnabled(),
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
