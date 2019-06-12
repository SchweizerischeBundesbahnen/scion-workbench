/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { async, fakeAsync, inject, TestBed } from '@angular/core/testing';
import { NgModule } from '@angular/core';
import { WorkbenchApplicationPlatformModule } from '../workbench-application-platform.module';
import { NullErrorHandler } from '../core/null-error-handler.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { WorkbenchModule } from '@scion/workbench';
import { RouterTestingModule } from '@angular/router/testing';
import { ApplicationRegistry } from '../core/application-registry.service';
import { ApplicationManifest } from '../core/metadata';

describe('ManifestCollector', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AppTestModule],
    });
  }));

  it('should collect and register applications', fakeAsync(inject([ApplicationRegistry, HttpTestingController], (appRegistry: ApplicationRegistry, httpMock: HttpTestingController) => {
    httpMock
      .expectOne('http://www.app-1/manifest')
      .flush(createApplicationManifest({appName: 'application-1'}));
    httpMock
      .expectOne('http://www.app-2/manifest')
      .flush(createApplicationManifest({appName: 'application-2'}));
    httpMock
      .expectOne('http://www.app-3/manifest')
      .flush(createApplicationManifest({appName: 'application-3'}));
    httpMock.verify();

    const app1 = appRegistry.getApplications().find(application => application.symbolicName === 'app-1');
    const app2 = appRegistry.getApplications().find(application => application.symbolicName === 'app-2');
    const app3 = appRegistry.getApplications().find(application => application.symbolicName === 'app-3');

    expect(app1).toBeTruthy();
    expect(app2).toBeTruthy();
    expect(app3).toBeTruthy();
  })));

  it('should skip applications which are not available (e.g. overloaded, down for maintenance, network failure or for other reasons)', fakeAsync(inject([ApplicationRegistry, HttpTestingController], (appRegistry: ApplicationRegistry, httpMock: HttpTestingController) => {
    httpMock
      .expectOne('http://www.app-1/manifest')
      .flush(createApplicationManifest({appName: 'application-1'}));
    httpMock
      .expectOne('http://www.app-2/manifest')
      .error(new ErrorEvent('APPLICATION_NOT_AVAILABLE'));
    httpMock
      .expectOne('http://www.app-3/manifest')
      .flush(createApplicationManifest({appName: 'application-3'}));
    httpMock.verify();

    const app1 = appRegistry.getApplications().find(application => application.symbolicName === 'app-1');
    const app2 = appRegistry.getApplications().find(application => application.symbolicName === 'app-2');
    const app3 = appRegistry.getApplications().find(application => application.symbolicName === 'app-3');

    expect(app1).toBeTruthy();
    expect(app2).toBeFalsy();
    expect(app3).toBeTruthy();
  })));
});

function createApplicationManifest(app: { appName: string }): ApplicationManifest {
  return {
    name: app.appName,
    intents: [],
    capabilities: [],
  };
}

/****************************************************************************************************
 * Definition of App Test Module                                                                    *
 ****************************************************************************************************/

@NgModule({
  imports: [
    HttpClientTestingModule,
    RouterTestingModule.withRoutes([]),
    WorkbenchModule.forRoot(),
    WorkbenchApplicationPlatformModule.forRoot({
      errorHandler: NullErrorHandler,
      applicationConfig: [
        {symbolicName: 'app-1', manifestUrl: 'http://www.app-1/manifest'},
        {symbolicName: 'app-2', manifestUrl: 'http://www.app-2/manifest'},
        {symbolicName: 'app-3', manifestUrl: 'http://www.app-3/manifest'},
      ],
    }),
  ],
})
class AppTestModule {
}
