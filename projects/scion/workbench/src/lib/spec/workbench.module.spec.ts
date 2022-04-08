/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {fakeAsync, inject, TestBed, tick} from '@angular/core/testing';
import {NgModule} from '@angular/core';
import {RouterTestingModule} from '@angular/router/testing';
import {Router} from '@angular/router';
import {WorkbenchModule} from '../workbench.module';

describe('WorkbenchModule', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchModule.forRoot(),
        RouterTestingModule.withRoutes([{path: 'lazy-module-forroot', loadChildren: () => LazyForRootModule}]),
        RouterTestingModule.withRoutes([{path: 'lazy-module-forchild', loadChildren: () => LazyForChildModule}]),
      ],
    });
  });

  it('throws an error when forRoot() is used in a lazy context', fakeAsync(inject([Router], async (router: Router) => {
    // Navigate to LazyForRootModule
    expect(() => {
      router.navigate(['lazy-module-forroot']).then();
      tick();
    }).toThrowError(/ModuleForRootError/);

    // Navigate to LazyForChildModule
    expect(() => {
      router.navigate(['lazy-module-forchild']).then();
      tick();
    }).not.toThrowError(/ModuleForRootError/);
  })));
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
