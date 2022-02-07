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
import {Component, NgModule, NgModuleFactoryLoader} from '@angular/core';
import {expect, jasmineCustomMatchers} from './util/jasmine-custom-matchers.spec';
import {RouterTestingModule, SpyNgModuleFactoryLoader} from '@angular/router/testing';
import {Router, RouteReuseStrategy, RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {advance, clickElement} from './util/util.spec';
import {ActivityPartComponent} from '../activity-part/activity-part.component';
import {By} from '@angular/platform-browser';
import {WorkbenchTestingModule} from './workbench-testing.module';

/**
 *
 * Testsetup:
 *
 *                        +----------------------------------+
 *                        | App Module                       |
 *                        |----------------------------------|
 *                        | routes:                          |
 *                        |                                  |
 *                        | 'app/activity-1' => AppActivity1 |
 *                        | 'app/activity-2' => AppActivity2 |
 *                        +----------------------------------+
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
describe('WbRouteReuseStrategy', () => {

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
  it('reuses activity routes', fakeAsync(inject([Router, NgModuleFactoryLoader, RouteReuseStrategy], (router: Router, loader: SpyNgModuleFactoryLoader, routeReuseStrategy: RouteReuseStrategy) => {
    loader.stubbedModules = {
      './feature-a/feature-a.module': FeatureAModule,
      './feature-b/feature-b.module': FeatureBModule,
    };

    // Configure to use reuse strategy
    router.routeReuseStrategy = routeReuseStrategy;

    const fixture = TestBed.createComponent(AppComponent);
    advance(fixture);

    // Open 'app/activity-1'
    clickElement(fixture, ActivityPartComponent, 'a.app_activity-1', '(1a)');
    expect(fixture).toShow(App_Activity1_Component, '(1b)');
    const appActivity1Component = fixture.debugElement.query(By.directive(App_Activity1_Component)).componentInstance;

    // Open 'app/activity-2'
    clickElement(fixture, ActivityPartComponent, 'a.app_activity-2', '(2a)');
    expect(fixture).toShow(App_Activity2_Component, '(2b)');
    const appActivity2Component = fixture.debugElement.query(By.directive(App_Activity2_Component)).componentInstance;

    // Open 'feature-a/activity-1'
    clickElement(fixture, ActivityPartComponent, 'a.feature-a_activity-1', '(3a)');
    expect(fixture).toShow(FeatureA_Activity1_Component, '(3b)');
    const featureAActivity1 = fixture.debugElement.query(By.directive(FeatureA_Activity1_Component)).componentInstance;

    // Open 'feature-a/activity-2'
    clickElement(fixture, ActivityPartComponent, 'a.feature-a_activity-2', '(4a)');
    expect(fixture).toShow(FeatureA_Activity2_Component, '(4b)');
    const featureAActivity2 = fixture.debugElement.query(By.directive(FeatureA_Activity2_Component)).componentInstance;

    // Open 'feature-b/activity-1'
    clickElement(fixture, ActivityPartComponent, 'a.feature-b_activity-1', '(5a)');
    expect(fixture).toShow(FeatureB_Activity1_Component, '(5b)');
    const featureBActivity1 = fixture.debugElement.query(By.directive(FeatureB_Activity1_Component)).componentInstance;

    // Open 'feature-b/activity-2'
    clickElement(fixture, ActivityPartComponent, 'a.feature-b_activity-2', '(6a)');
    expect(fixture).toShow(FeatureB_Activity2_Component, '(6b)');
    const featureBActivity2 = fixture.debugElement.query(By.directive(FeatureB_Activity2_Component)).componentInstance;

    // Goto 'app/activity-1'
    clickElement(fixture, ActivityPartComponent, 'a.app_activity-1', '(7a)');
    expect(fixture).toShow(App_Activity1_Component, '(7b)');
    expect(fixture.debugElement.query(By.directive(App_Activity1_Component)).componentInstance).toBe(appActivity1Component, '(7c)');

    // Goto 'app/activity-2'
    clickElement(fixture, ActivityPartComponent, 'a.app_activity-2', '(8a)');
    expect(fixture).toShow(App_Activity2_Component, '(8b)');
    expect(fixture.debugElement.query(By.directive(App_Activity2_Component)).componentInstance).toBe(appActivity2Component, '(8c)');

    // Goto 'feature-a/activity-1'
    clickElement(fixture, ActivityPartComponent, 'a.feature-a_activity-1', '(9a)');
    expect(fixture).toShow(FeatureA_Activity1_Component, '(9b)');
    expect(fixture.debugElement.query(By.directive(FeatureA_Activity1_Component)).componentInstance).toBe(featureAActivity1, '(9c)');

    // Goto 'feature-a/activity-2'
    clickElement(fixture, ActivityPartComponent, 'a.feature-a_activity-2', '(10a)');
    expect(fixture).toShow(FeatureA_Activity2_Component, '(10b)');
    expect(fixture.debugElement.query(By.directive(FeatureA_Activity2_Component)).componentInstance).toBe(featureAActivity2, '(10c)');

    // Goto 'feature-b/activity-1'
    clickElement(fixture, ActivityPartComponent, 'a.feature-b_activity-1', '(11a)');
    expect(fixture).toShow(FeatureB_Activity1_Component, '(11b)');
    expect(fixture.debugElement.query(By.directive(FeatureB_Activity1_Component)).componentInstance).toBe(featureBActivity1, '(11c)');

    // Goto 'feature-b/activity-2'
    clickElement(fixture, ActivityPartComponent, 'a.feature-b_activity-2', '(12a)');
    expect(fixture).toShow(FeatureB_Activity2_Component, '(12b)');
    expect(fixture.debugElement.query(By.directive(FeatureB_Activity2_Component)).componentInstance).toBe(featureBActivity2, '(12c)');

    discardPeriodicTasks();
  })));
});

/****************************************************************************************************
 * Definition of App Test Module                                                                    *
 ****************************************************************************************************/
@Component({
  template: `
    <wb-workbench style="position: relative; width: 100%; height: 500px">
      <!-- Activities from app module -->
      <wb-activity itemCssClass="app_activity-1" itemText="app/activity-1" routerLink="app/activity-1"></wb-activity>
      <wb-activity itemCssClass="app_activity-2" itemText="app/activity-2" routerLink="app/activity-2"></wb-activity>

      <!-- Activities from feature module A -->
      <wb-activity itemCssClass="feature-a_activity-1" itemText="feature-a/activity-1" routerLink="feature-a/activity-1"></wb-activity>
      <wb-activity itemCssClass="feature-a_activity-2" itemText="feature-a/activity-2" routerLink="feature-a/activity-2"></wb-activity>

      <!-- Activities from feature module B -->
      <wb-activity itemCssClass="feature-b_activity-1" itemText="feature-b/activity-1" routerLink="feature-b/activity-1"></wb-activity>
      <wb-activity itemCssClass="feature-b_activity-2" itemText="feature-b/activity-2" routerLink="feature-b/activity-2"></wb-activity>
    </wb-workbench>
  `,
})
class AppComponent {
}

@Component({template: 'App Module - Activity 1'})
class App_Activity1_Component {
}

@Component({template: 'App Module - Activity 2'})
class App_Activity2_Component {
}

@NgModule({
  imports: [
    WorkbenchTestingModule.forRoot({startup: {launcher: 'APP_INITIALIZER'}}),
    NoopAnimationsModule,
    RouterTestingModule.withRoutes([
      {path: 'app/activity-1', component: App_Activity1_Component},
      {path: 'app/activity-2', component: App_Activity2_Component},
      {path: 'feature-a', loadChildren: './feature-a/feature-a.module'},
      {path: 'feature-b', loadChildren: './feature-b/feature-b.module'},
    ]),
  ],
  declarations: [AppComponent, App_Activity1_Component, App_Activity2_Component],
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
