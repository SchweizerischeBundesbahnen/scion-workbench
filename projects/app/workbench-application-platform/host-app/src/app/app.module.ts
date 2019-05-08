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
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { WorkbenchModule } from '@scion/workbench';
import { RouterModule } from '@angular/router';
import { WorkbenchApplicationPlatformModule } from '@scion/workbench-application-platform';
import { CustomExtensionModule } from './custom-extension/custom-extension.module';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    WorkbenchModule.forRoot(),
    WorkbenchApplicationPlatformModule.forRoot({
      applicationConfig: [
        {
          symbolicName: 'contact-app',
          manifestUrl: environment.contact_app_manifest_url,
        },
        {
          symbolicName: 'communication-app',
          manifestUrl: environment.communication_app_manifest_url,
        },
        {
          symbolicName: 'devtools-app',
          manifestUrl: environment.devtools_app_manifest_url,
          scopeCheckDisabled: true,
        },
        {
          symbolicName: 'testing-app',
          exclude: !environment.testing_app_manifest_url,
          manifestUrl: environment.testing_app_manifest_url,
        },
        {
          symbolicName: 'angular-io-app',
          manifestUrl: '/assets/angular-io-manifest.json',
        },
      ],
    }),
    RouterModule.forRoot([], {useHash: true}),
    BrowserAnimationsModule,
    BrowserModule,
    CustomExtensionModule,
  ],
  bootstrap: [
    AppComponent,
  ],
})
export class AppModule {
}

