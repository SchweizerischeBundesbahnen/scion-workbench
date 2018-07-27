/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { async, fakeAsync, inject, TestBed } from '@angular/core/testing';
import { Component, NgModule, NgModuleFactoryLoader } from '@angular/core';
import { RouterTestingModule, SpyNgModuleFactoryLoader } from '@angular/router/testing';
import { Router, RouterModule } from '@angular/router';
import { WorkbenchModule } from './workbench.module';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { advance } from './routing/testing.spec';
import { WorkbenchRouter } from './routing/workbench-router.service';

describe('Workbench', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AppTestModule]
    });

    TestBed.get(Router).initialNavigation();
  }));

  it('throws an error when forRoot() is used in a lazy context', fakeAsync(inject([WorkbenchRouter, NgModuleFactoryLoader], (wbRouter: WorkbenchRouter, loader: SpyNgModuleFactoryLoader) => {
    loader.stubbedModules = {
      './feature-a/feature-a.module#FeatureAModule': FeatureAModule,
      './feature-b/feature-b.module#FeatureBModule': FeatureBModule,
    };

    const fixture = TestBed.createComponent(AppComponent);
    advance(fixture);

    let recordedError: Error = null;

    // Load lazy module with WorkbenchModule.forRoot() import
    wbRouter.navigate(['wrong-import'], {blankViewPartRef: 'viewpart.1'}).catch(err => recordedError = err);
    advance(fixture);
    expect(recordedError.message).toEqual('WorkbenchModule.forRoot() called twice. Lazy loaded modules should use WorkbenchModule.forChild() instead.');

    // Load lazy module with WorkbenchModule.forChild() import
    recordedError = null;
    wbRouter.navigate(['correct-import'], {blankViewPartRef: 'viewpart.1'}).catch(err => recordedError = err);
    advance(fixture);
    expect(recordedError).toBeNull();
  })));
});

/****************************************************************************************************
 * Definition of App Test Module                                                                    *
 ****************************************************************************************************/
@Component({template: '<wb-workbench style="position: relative; width: 100%; height: 500px"></wb-workbench>'})
class AppComponent {
}

@NgModule({
  imports: [
    WorkbenchModule.forRoot(),
    NoopAnimationsModule,
    RouterTestingModule.withRoutes([
      {path: 'wrong-import', loadChildren: './feature-a/feature-a.module#FeatureAModule'},
      {path: 'correct-import', loadChildren: './feature-b/feature-b.module#FeatureBModule'},
    ]),
  ],
  declarations: [AppComponent]
})
class AppTestModule {
}

/****************************************************************************************************
 * Definition of Feature Module A                                                                   *
 ****************************************************************************************************/
@Component({template: 'Feature Module A'})
class ModuleAComponent {
}

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{path: '', component: ModuleAComponent}]),
    WorkbenchModule.forRoot() // simulate wrong import
  ],
  declarations: [ModuleAComponent]
})
export class FeatureAModule {
}

/****************************************************************************************************
 * Definition of Feature Module B                                                                   *
 ****************************************************************************************************/
@Component({template: 'Feature Module B'})
class ModuleBComponent {
}

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{path: '', component: ModuleBComponent}]),
    WorkbenchModule.forChild() // simulate correct import
  ],
  declarations: [ModuleBComponent]
})
export class FeatureBModule {
}
