/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {NgModule} from '@angular/core';
import {WorkbenchModule} from './workbench.module';
import {Router} from '@angular/router';
import {WorkbenchTestingModule} from './testing/workbench-testing.module';
import {RouterTestingModule} from '@angular/router/testing';

describe('WorkbenchModule', () => {

  it('throws an error when forRoot() is used in a lazy context', fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest({startup: {launcher: 'APP_INITIALIZER'}}),
        RouterTestingModule.withRoutes([
          {path: 'lazy-module-forroot', loadChildren: () => LazyForRootModule},
          {path: 'lazy-module-forchild', loadChildren: () => LazyForChildModule},
        ]),
      ],
    });

    // Navigate to LazyForRootModule
    expect(() => {
      TestBed.inject(Router).navigate(['lazy-module-forroot']).then();
      tick();
    }).toThrowError(/ModuleForRootError/);

    // Navigate to LazyForChildModule
    expect(() => {
      TestBed.inject(Router).navigate(['lazy-module-forchild']).then();
      tick();
    }).not.toThrowError(/ModuleForRootError/);
  }));
});

/****************************************************************************************************
 * Definition of lazy loaded module calling `forRoot()`                                             *
 ****************************************************************************************************/
@NgModule({
  imports: [
    WorkbenchModule.forRoot(),  // Use forRoot() in a lazy context (illegal)
  ],
})
class LazyForRootModule {
}

/****************************************************************************************************
 * Definition of lazy loaded module calling `forChild()                                             *
 ****************************************************************************************************/
@NgModule({
  imports: [
    WorkbenchModule.forChild(),  // Use forChild() in a lazy context
  ],
})
class LazyForChildModule {
}
