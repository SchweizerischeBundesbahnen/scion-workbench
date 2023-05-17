/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {BrowserModule} from '@angular/platform-browser';
import {CUSTOM_ELEMENTS_SCHEMA, NgModule, Type} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {MICROFRONTEND_PLATFORM_PRE_STARTUP, WorkbenchModule} from '@scion/workbench';
import {BrowserAnimationsModule, NoopAnimationsModule} from '@angular/platform-browser/animations';
import {StartPageComponent} from './start-page/start-page.component';
import {SciFilterFieldModule} from '@scion/components.internal/filter-field';
import {SciTabbarModule} from '@scion/components.internal/tabbar';
import {SciViewportModule} from '@scion/components/viewport';
import {WorkbenchStartupQueryParams} from './workbench/workbench-startup-query-params';
import {WorkbenchComponent} from './workbench/workbench.component';
import {environment} from '../environments/environment';
import {provideConfirmWorkbenchStartupInitializer} from './workbench/confirm-workbench-startup-initializer.service';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {InspectNotificationModule} from './inspect-notification-provider/inspect-notification.module';
import {InspectMessageBoxModule} from './inspect-message-box-provider/inspect-message-box.module';
import {provideThrottleCapabilityLookupInterceptor} from './workbench/throttle-capability-lookup-initializer.service';
import {UtilModule} from './util/util.module';
import {provideWorkbenchLifecycleHookLoggers} from './workbench/workbench-lifecycle-hook-loggers';
import {DevtoolsViewCapabilityInterceptor} from './devtools/devtools-capability-interceptor.service';
import {ROUTES} from '@angular/router';
import {PerspectiveDefinitions} from './perspective-definitions';

@NgModule({
  declarations: [
    AppComponent,
    WorkbenchComponent,
    StartPageComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    UtilModule,
    WorkbenchModule.forRoot({
      startup: {
        launcher: WorkbenchStartupQueryParams.launcher(),
      },
      microfrontendPlatform: WorkbenchStartupQueryParams.standalone() ? undefined : environment.microfrontendPlatformConfig,
      layout: {
        perspectives: [
          ...PerspectiveDefinitions.perspectives,
          ...PerspectiveDefinitions.perspectivesFromQueryParam,
        ],
        initialPerspective: PerspectiveDefinitions.initialPerspective,
      },
    }),
    ReactiveFormsModule,
    SciViewportModule,
    SciTabbarModule,
    SciFilterFieldModule,
    InspectMessageBoxModule.forRoot(),
    InspectNotificationModule.forRoot(),
    animationModuleIfEnabled(),
  ],
  bootstrap: [
    AppComponent,
  ],
  providers: [
    provideConfirmWorkbenchStartupInitializer(),
    provideThrottleCapabilityLookupInterceptor(),
    provideWorkbenchLifecycleHookLoggers(),
    {
      provide: MICROFRONTEND_PLATFORM_PRE_STARTUP,
      useClass: DevtoolsViewCapabilityInterceptor,
      multi: true,
    },
    {
      provide: ROUTES,
      multi: true,
      useValue: PerspectiveDefinitions.routes,
    },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})

export class AppModule {
}

function animationModuleIfEnabled(): Type<NoopAnimationsModule | BrowserAnimationsModule> {
  return environment.animationEnabled ? BrowserAnimationsModule : NoopAnimationsModule; // animations should be disabled during e2e test execution
}
