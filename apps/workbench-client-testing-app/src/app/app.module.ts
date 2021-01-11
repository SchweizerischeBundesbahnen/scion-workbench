/*
 * Copyright (c) 2018-2020 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { BrowserModule } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideWorkbenchClientInitializer } from './workbench-client/workbench-microfrontend-support';
import { SciViewportModule } from '@scion/toolkit/viewport';
import { provideAppInstanceId } from './app-instance-id';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from '../environments/environment';
import { A11yModule } from '@angular/cdk/a11y';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    A11yModule,
    AppRoutingModule,
    SciViewportModule,
    animationModuleIfEnabled(),
  ],
  providers: [
    provideWorkbenchClientInitializer(),
    provideAppInstanceId(),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent],
})
export class AppModule {
}

function animationModuleIfEnabled(): Type<NoopAnimationsModule | BrowserAnimationsModule> {
  return environment.animationEnabled ? BrowserAnimationsModule : NoopAnimationsModule; // animations should be disabled during e2e test execution
}
