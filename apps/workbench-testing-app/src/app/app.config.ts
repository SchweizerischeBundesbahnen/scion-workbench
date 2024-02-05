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
import {ApplicationConfig, EnvironmentProviders, makeEnvironmentProviders} from '@angular/core';
import {provideRouter, withHashLocation} from '@angular/router';
import {routes} from './app.routes';
import {workbenchModuleConfig} from './workbench.config';
import {provideConfirmWorkbenchStartupInitializer} from './workbench/confirm-workbench-startup-initializer.service';
import {provideThrottleCapabilityLookupInterceptor} from './workbench/throttle-capability-lookup-initializer.service';
import {provideWorkbenchLifecycleHookLoggers} from './workbench/workbench-lifecycle-hook-loggers';
import {provideDevToolsInterceptor} from './devtools/devtools-capability-interceptor.service';
import {provideMessageBoxPage} from './message-box-page/message-box-page-intent-handler.service';
import {provideNotificationPage} from './notification-page/notification-page-intent-handler.service';
import {providePerspectiveRoutes} from './workbench.perspectives';
import {environment} from '../environments/environment';
import {provideAnimations, provideNoopAnimations} from '@angular/platform-browser/animations';

/**
 * Central place to configure the workbench-testing-app.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withHashLocation()),
    provideWorkbench(workbenchModuleConfig),
    provideConfirmWorkbenchStartupInitializer(),
    provideThrottleCapabilityLookupInterceptor(),
    provideWorkbenchLifecycleHookLoggers(),
    provideDevToolsInterceptor(),
    provideMessageBoxPage(),
    provideNotificationPage(),
    provideAnimationsIfEnabled(),
    providePerspectiveRoutes(),
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
