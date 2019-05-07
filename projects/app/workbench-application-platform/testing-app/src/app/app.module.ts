/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { WorkbenchApplicationModule } from '@scion/workbench-application.angular';
import { SciViewportModule } from '@scion/viewport';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SciParamsEnterModule } from '@scion/app/common';
import { AppRoutingModule } from './app-routing.module';


@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    WorkbenchApplicationModule.forRoot(),
    SciViewportModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    SciParamsEnterModule
  ],
  providers: [],
  bootstrap: [
    AppComponent,
  ]
})
export class AppModule {
}
