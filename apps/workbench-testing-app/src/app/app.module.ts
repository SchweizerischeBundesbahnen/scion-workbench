/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { BrowserModule } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, Type } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WorkbenchModule } from '@scion/workbench';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { StartPageComponent } from './start-page/start-page.component';
import { SciFilterFieldModule, SciTabbarModule } from '@scion/toolkit.internal/widgets';
import { SciViewportModule } from '@scion/toolkit/viewport';
import { WorkbenchStartupQueryParams } from './workbench/workbench-startup-query-params';
import { WorkbenchComponent } from './workbench/workbench.component';
import { environment } from '../environments/environment';
import { provideConfirmWorkbenchStartupInitializer } from './workbench/confirm-workbench-startup-initializer.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { InspectMessageBoxModule } from './inspect-message-box-provider/inspect-message-box.module';
import { provideInspectMessageBoxProvider } from './inspect-message-box-provider/inspect-message-box-provider.service';

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
    WorkbenchModule.forRoot({
      startup: {
        launcher: WorkbenchStartupQueryParams.launcher(),
      },
      microfrontends: WorkbenchStartupQueryParams.standalone() ? undefined : environment.microfrontendConfig,
    }),
    ReactiveFormsModule,
    SciViewportModule,
    SciTabbarModule,
    SciFilterFieldModule,
    InspectMessageBoxModule,
    animationModuleIfEnabled(),
  ],
  bootstrap: [
    AppComponent,
  ],
  providers: [
    provideConfirmWorkbenchStartupInitializer(),
    provideInspectMessageBoxProvider(),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})

export class AppModule {
}

function animationModuleIfEnabled(): Type<NoopAnimationsModule | BrowserAnimationsModule> {
  return environment.animationEnabled ? BrowserAnimationsModule : NoopAnimationsModule; // animations should be disabled during e2e test execution
}
