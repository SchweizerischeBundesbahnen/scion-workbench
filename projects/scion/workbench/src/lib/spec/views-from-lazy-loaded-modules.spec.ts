/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { discardPeriodicTasks, fakeAsync, inject, TestBed, waitForAsync } from '@angular/core/testing';
import { Component, NgModule, NgModuleFactoryLoader } from '@angular/core';
import { expect, jasmineCustomMatchers } from './util/jasmine-custom-matchers.spec';
import { RouterTestingModule, SpyNgModuleFactoryLoader } from '@angular/router/testing';
import { Router, RouterModule } from '@angular/router';
import { WorkbenchRouter } from '../routing/workbench-router.service';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { advance } from './util/util.spec';
import { WorkbenchTestingModule } from './workbench-testing.module';

/**
 *
 * Testsetup:
 *
 *                                    +--------------+
 *                                    | Test Module  |
 *                                    +--------------+
 *                                          |
 *                   +----------------------+----------------------+
 *                   |                                             |
 *              feature-a (route)                               feature-b (route)
 *                   |                                             |
 *                   v                                             v
 * +------------------------------------------+     +--------------------------------------+
 * | Feature Module A                         |     | Feature Module B                     |
 * |------------------------------------------|     |--------------------------------------|
 * | routes:                                  |     | routes:                              |
 * |                                          |     |                                      |
 * | 'view-1' => FeatureA_Activity1_Component |     | 'view-1' => FeatureB_View1_Component |
 * | 'view-2' => FeatureA_View2_Component     |     | 'view-2' => FeatureB_View2_Component |
 * +------------------------------------------+     +--------------------------------------+
 *
 */
// tslint:disable class-name
describe('Views', () => {

  beforeEach(waitForAsync(() => {
    jasmine.addMatchers(jasmineCustomMatchers);

    TestBed.configureTestingModule({
      imports: [AppTestModule],
    });

    TestBed.inject(Router).initialNavigation();
  }));

  // TODO [Angular 9]:
  // As of Angular 8.0 there is no workaround to configure lazily loaded routes without using `NgModuleFactoryLoader`.
  // See Angular internal tests in `integration.spec.ts` file.
  // tslint:disable-next-line:deprecation
  it('can be loaded from lazy feature modules', fakeAsync(inject([WorkbenchRouter, NgModuleFactoryLoader], (wbRouter: WorkbenchRouter, loader: SpyNgModuleFactoryLoader) => {
    loader.stubbedModules = {
      './feature-a/feature-a.module': FeatureAModule,
      './feature-b/feature-b.module': FeatureBModule,
    };

    const fixture = TestBed.createComponent(AppComponent);
    advance(fixture);

    // Navigate to view 'feature-a/view-1'
    wbRouter.navigate(['feature-a', 'view-1']).then();
    advance(fixture);
    expect(fixture).toShow(FeatureA_View1_Component, '(1)');

    // Navigate to view 'feature-a/view-2'
    wbRouter.navigate(['feature-a', 'view-2']).then();
    advance(fixture);
    expect(fixture).toShow(FeatureA_View2_Component, '(2)');

    // Navigate to view 'feature-b/view-1'
    wbRouter.navigate(['feature-b', 'view-1']).then();
    advance(fixture);
    expect(fixture).toShow(FeatureB_View1_Component, '(3)');

    // Navigate to view 'feature-b/view-2'
    wbRouter.navigate(['feature-b', 'view-2']).then();
    advance(fixture);
    expect(fixture).toShow(FeatureB_View2_Component, '(4)');

    discardPeriodicTasks();
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
    WorkbenchTestingModule.forRoot({startup: {launcher: 'APP_INITIALIZER'}}),
    NoopAnimationsModule,
    RouterTestingModule.withRoutes([
      {path: 'feature-a', loadChildren: './feature-a/feature-a.module'},
      {path: 'feature-b', loadChildren: './feature-b/feature-b.module'},
    ]),
  ],
  declarations: [AppComponent],
})
class AppTestModule {
}

/****************************************************************************************************
 * Definition of Feature Module A                                                                   *
 ****************************************************************************************************/
@Component({template: 'Feature Module A - View 1'})
class FeatureA_View1_Component {
}

@Component({template: 'Feature Module A - View 1'})
class FeatureA_View2_Component {
}

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {path: 'view-1', component: FeatureA_View1_Component},
      {path: 'view-2', component: FeatureA_View2_Component},
    ]),
  ],
  declarations: [FeatureA_View1_Component, FeatureA_View2_Component],
})
export class FeatureAModule {
}

/****************************************************************************************************
 * Definition of Feature Module b                                                                   *
 ****************************************************************************************************/
@Component({template: 'Feature Module B - View 1'})
class FeatureB_View1_Component {
}

@Component({template: 'Feature Module B - View 1'})
class FeatureB_View2_Component {
}

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {path: 'view-1', component: FeatureB_View1_Component},
      {path: 'view-2', component: FeatureB_View2_Component},
    ]),
  ],
  declarations: [FeatureB_View1_Component, FeatureB_View2_Component],
})
export class FeatureBModule {
}
