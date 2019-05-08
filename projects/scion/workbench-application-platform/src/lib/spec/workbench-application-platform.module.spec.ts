/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { fakeAsync, inject, TestBed, tick } from '@angular/core/testing';
import { NgModule, NgModuleFactoryLoader } from '@angular/core';
import { WorkbenchApplicationPlatformModule } from '../workbench-application-platform.module';
import { NullErrorHandler } from '../core/null-error-handler.service';
import { WorkbenchModule } from '@scion/workbench';
import { RouterTestingModule, SpyNgModuleFactoryLoader } from '@angular/router/testing';
import { Router } from '@angular/router';

describe('WorkbenchApplicationPlatform', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchModule.forRoot(),
        WorkbenchApplicationPlatformModule.forRoot({errorHandler: NullErrorHandler, applicationConfig: []}),
        RouterTestingModule.withRoutes([{path: 'lazy-module', loadChildren: './lazy.module#LazyModule'}]),
      ],
    });
  });

  it('throws an error when forRoot() is used in a lazy context', fakeAsync(inject([Router, NgModuleFactoryLoader], async (router: Router, loader: SpyNgModuleFactoryLoader) => {
    // Use forRoot() in a lazy context
    @NgModule({
      imports: [
        WorkbenchApplicationPlatformModule.forRoot({errorHandler: NullErrorHandler, applicationConfig: []}),
      ],
    })
    class LazyModule {
    }

    loader.stubbedModules = {'./lazy.module#LazyModule': LazyModule};

    // Navigate to the lazy module
    expect(() => {
      router.navigate(['lazy-module']).then();
      tick();
    }).toThrowError(/ModuleForRootError/);
  })));
});
