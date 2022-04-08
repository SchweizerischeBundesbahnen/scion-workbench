/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {discardPeriodicTasks, fakeAsync, inject, TestBed, waitForAsync} from '@angular/core/testing';
import {Component, NgModule} from '@angular/core';
import {expect, jasmineCustomMatchers} from './util/jasmine-custom-matchers.spec';
import {RouterTestingModule} from '@angular/router/testing';
import {Router, RouteReuseStrategy, RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {advance, clickElement} from './util/util.spec';
import {ActivityPartComponent} from '../activity-part/activity-part.component';
import {WorkbenchTestingModule} from './workbench-testing.module';

/**
 *
 * Test setup:
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
 * +----------------------------------------------+     +----------------------------------------------+
 * | Feature Module A                             |     | Feature Module B                             |
 * |----------------------------------------------|     |----------------------------------------------|
 * | routes:                                      |     | routes:                                      |
 * |                                              |     |                                              |
 * | 'activity-1' => FeatureA_Activity1_Component |     | 'activity-1' => FeatureB_Activity1_Component |
 * | 'activity-2' => FeatureA_Activity2_Component |     | 'activity-2' => FeatureB_Activity2_Component |
 * +----------------------------------------------+     +----------------------------------------------+
 *
 */
describe('Activities', () => {

  beforeEach(waitForAsync(() => {
    jasmine.addMatchers(jasmineCustomMatchers);

    TestBed.configureTestingModule({
      imports: [AppTestModule],
    });

    TestBed.inject(Router).initialNavigation();
  }));

  it('can be loaded from lazy feature modules', fakeAsync(inject([Router, RouteReuseStrategy], (router: Router, routeReuseStrategy: RouteReuseStrategy) => {
    // Setup: set workbench reuse strategy
    router.routeReuseStrategy = routeReuseStrategy;

    const fixture = TestBed.createComponent(AppComponent);
    advance(fixture);

    // Open 'feature-a/activity-1'
    clickElement(fixture, ActivityPartComponent, 'a.activity-feature_module_a-1', '(1a)');
    expect(fixture).toShow(FeatureA_Activity1_Component, '(1b)');

    // Open 'feature-a/activity-2'
    clickElement(fixture, ActivityPartComponent, 'a.activity-feature_module_a-2', '(2a)');
    expect(fixture).toShow(FeatureA_Activity2_Component, '(2b)');

    // Open 'feature-b/activity-1'
    clickElement(fixture, ActivityPartComponent, 'a.activity-feature_module_b-1', '(3a)');
    expect(fixture).toShow(FeatureB_Activity1_Component, '(3b)');

    // Open 'feature-a/activity-2'
    clickElement(fixture, ActivityPartComponent, 'a.activity-feature_module_b-2', '(4a)');
    expect(fixture).toShow(FeatureB_Activity2_Component, '(4b)');

    // Reproducer for bug  'Cannot reattach ActivatedRouteSnapshot created from a different route' in combination with custom reuse strategy:
    // Open first activity of feature module A
    clickElement(fixture, ActivityPartComponent, 'a.activity-feature_module_a-1', '(5a)');
    expect(fixture).toShow(FeatureA_Activity1_Component, '(5b)');

    discardPeriodicTasks();
  })));
});

/****************************************************************************************************
 * Definition of App Test Module                                                                    *
 ****************************************************************************************************/
@Component({
  template: `
    <wb-workbench style="position: relative; width: 100%; height: 500px">
      <!-- Activities from feature module A -->
      <wb-activity itemCssClass="activity-feature_module_a-1" itemText="feature_module_a-1" routerLink="feature-a/activity-1"></wb-activity>
      <wb-activity itemCssClass="activity-feature_module_a-2" itemText="feature_module_a-2" routerLink="feature-a/activity-2"></wb-activity>

      <!-- Activities from feature module B -->
      <wb-activity itemCssClass="activity-feature_module_b-1" itemText="feature_module_b-1" routerLink="feature-b/activity-1"></wb-activity>
      <wb-activity itemCssClass="activity-feature_module_b-2" itemText="feature_module_b-2" routerLink="feature-b/activity-2"></wb-activity>
    </wb-workbench>
  `,
})
class AppComponent {
}

@NgModule({
  imports: [
    WorkbenchTestingModule.forRoot({startup: {launcher: 'APP_INITIALIZER'}}),
    NoopAnimationsModule,
    RouterTestingModule.withRoutes([
      {path: 'feature-a', loadChildren: () => FeatureAModule},
      {path: 'feature-b', loadChildren: () => FeatureBModule},
    ]),
  ],
  declarations: [AppComponent],
})
class AppTestModule {
}

/****************************************************************************************************
 * Definition of Feature Module A                                                                   *
 ****************************************************************************************************/
@Component({template: 'Feature Module A - Activity 1'})
class FeatureA_Activity1_Component {
}

@Component({template: 'Feature Module A - Activity 2'})
class FeatureA_Activity2_Component {
}

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {path: 'activity-1', component: FeatureA_Activity1_Component},
      {path: 'activity-2', component: FeatureA_Activity2_Component},
    ]),
  ],
  declarations: [FeatureA_Activity1_Component, FeatureA_Activity2_Component],
})
export class FeatureAModule {
}

/****************************************************************************************************
 * Definition of Feature Module B                                                                   *
 ****************************************************************************************************/
@Component({template: 'Feature Module B - Activity 1'})
class FeatureB_Activity1_Component {
}

@Component({template: 'Feature Module B - Activity 2'})
class FeatureB_Activity2_Component {
}

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {path: 'activity-1', component: FeatureB_Activity1_Component},
      {path: 'activity-2', component: FeatureB_Activity2_Component},
    ]),
  ],
  declarations: [FeatureB_Activity1_Component, FeatureB_Activity2_Component],
})
export class FeatureBModule {
}
