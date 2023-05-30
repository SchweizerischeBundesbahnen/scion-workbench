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
import {EnvironmentProviders, makeEnvironmentProviders} from '@angular/core';
import {environment} from './environments/environment';
import {provideAnimations, provideNoopAnimations} from '@angular/platform-browser/animations';
import {providePerspectiveRoutes} from './app/workbench.perspectives';
import {provideConfirmWorkbenchStartupInitializer} from './app/workbench/confirm-workbench-startup-initializer.service';
import {provideThrottleCapabilityLookupInterceptor} from './app/workbench/throttle-capability-lookup-initializer.service';
import {provideWorkbenchLifecycleHookLoggers} from './app/workbench/workbench-lifecycle-hook-loggers';
import {provideDevToolsInterceptor} from './app/devtools/devtools-capability-interceptor.service';
import {provideMessageBoxInspector} from './app/inspect-message-box-provider/inspect-message-box-intent-handler.service';
import {provideNotificationInspector} from './app/inspect-notification-provider/inspect-notification-intent-handler.service';
import {provideWorkbench} from './app/workbench.provider';
import {workbenchModuleConfig} from './app/workbench.config';
import {routes} from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes, withHashLocation()),
    provideWorkbench(workbenchModuleConfig),
    provideConfirmWorkbenchStartupInitializer(),
    provideThrottleCapabilityLookupInterceptor(),
    provideWorkbenchLifecycleHookLoggers(),
    provideDevToolsInterceptor(),
    provideMessageBoxInspector(),
    provideNotificationInspector(),
    provideAnimationsIfEnabled(),
    providePerspectiveRoutes(),
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
