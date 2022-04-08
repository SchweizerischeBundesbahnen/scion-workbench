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
import {Component, Injectable, NgModule} from '@angular/core';
import {RouterTestingModule} from '@angular/router/testing';
import {ActivatedRouteSnapshot, CanActivate, Router, RouteReuseStrategy, RouterStateSnapshot} from '@angular/router';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {advance, clickElement} from './util/util.spec';
import {expect, jasmineCustomMatchers} from './util/jasmine-custom-matchers.spec';
import {ActivityPartComponent} from '../activity-part/activity-part.component';
import {By} from '@angular/platform-browser';
import {CommonModule} from '@angular/common';
import {Observable} from 'rxjs';
import {WorkbenchTestingModule} from './workbench-testing.module';

/**
 *
 * Test setup:
 *
 * +--------------------------------------------+
 * | Test Module                                |
 * |--------------------------------------------|
 * | routes:                                    |
 * |                                            |
 * | 'activity-1' => Activity1Component         |
 * | 'activity-2' => Activity2Component (guard) |
 * | 'activity-3' => Activity3Component         |
 * +--------------------------------------------+
 *
 */
describe('Activity part', () => {

  beforeEach(waitForAsync(() => {
    jasmine.addMatchers(jasmineCustomMatchers);

    TestBed.configureTestingModule({
      imports: [AppTestModule, CommonModule],
    });

    TestBed.inject(Router).initialNavigation();
  }));

  it('does not activate activity if prevented by routing guard', fakeAsync(inject([Router, RouteReuseStrategy], (router: Router, routeReuseStrategy: RouteReuseStrategy) => {
    // Setup: set workbench reuse strategy
    router.routeReuseStrategy = routeReuseStrategy;

    const fixture = TestBed.createComponent(AppComponent);
    advance(fixture);

    // Open 'activity-1'
    clickElement(fixture, ActivityPartComponent, 'a.activity-1', '(1a)');
    expect(fixture).toShow(Activity1Component, '(1b)');
    expect(fixture.debugElement.query(By.css('header > h1')).nativeElement.textContent).withContext('(1c)').toEqual('Activity 1');

    // Try open 'activity-2' (guard prevents activation)
    Activity2CanActivate.CAN_ACTIVATE = false;
    clickElement(fixture, ActivityPartComponent, 'a.activity-2', '(2a)');
    expect(fixture).toShow(Activity1Component, '(2b)'); // {Activity1Component} should still be showing
    expect(fixture.debugElement.query(By.css('header > h1')).nativeElement.textContent).withContext('(2c)').toEqual('Activity 1');

    // Open 'activity-3'
    clickElement(fixture, ActivityPartComponent, 'a.activity-3', '(3a)');
    expect(fixture).toShow(Activity3Component, '(3b)');
    expect(fixture.debugElement.query(By.css('header > h1')).nativeElement.textContent).withContext('(3c)').toEqual('Activity 3');

    // Try open 'activity-2' (guard prevents activation)
    Activity2CanActivate.CAN_ACTIVATE = false;
    clickElement(fixture, ActivityPartComponent, 'a.activity-2', '(4a)');
    expect(fixture).toShow(Activity3Component, '(4b)');  // {Activity3Component} should still be showing
    expect(fixture.debugElement.query(By.css('header > h1')).nativeElement.textContent).withContext('(4c)').toEqual('Activity 3');

    // Open 'activity-2' (guard allows activation)
    Activity2CanActivate.CAN_ACTIVATE = true;
    clickElement(fixture, ActivityPartComponent, 'a.activity-2', '(5a)');
    expect(fixture).toShow(Activity2Component, '(5b)');
    expect(fixture.debugElement.query(By.css('header>h1')).nativeElement.textContent).withContext('(5c)').toEqual('Activity 2');

    discardPeriodicTasks();
  })));
});

/****************************************************************************************************
 * Definition of App Test Module                                                                    *
 ****************************************************************************************************/
@Component({
  template: `
    <wb-workbench style="position: relative; width: 100%; height: 500px">
      <wb-activity itemCssClass="activity-1" itemText="activity-1" title="Activity 1" routerLink="activity-1"></wb-activity>
      <wb-activity itemCssClass="activity-2" itemText="activity-2" title="Activity 2" routerLink="activity-2"></wb-activity>
      <wb-activity itemCssClass="activity-3" itemText="activity-3" title="Activity 3" routerLink="activity-3"></wb-activity>
    </wb-workbench>
  `,
})
class AppComponent {
}

@Component({template: 'Activity-1'})
class Activity1Component {
}

@Component({template: 'Activity-2'})
class Activity2Component {
}

@Component({template: 'Activity-3'})
class Activity3Component {
}

@Injectable()
class Activity2CanActivate implements CanActivate {

  public static CAN_ACTIVATE = false;

  public canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return Activity2CanActivate.CAN_ACTIVATE;
  }
}

@NgModule({
  imports: [
    WorkbenchTestingModule.forRoot({startup: {launcher: 'APP_INITIALIZER'}}),
    NoopAnimationsModule,
    CommonModule,
    RouterTestingModule.withRoutes([
      {path: 'activity-1', component: Activity1Component},
      {path: 'activity-2', component: Activity2Component, canActivate: [Activity2CanActivate]},
      {path: 'activity-3', component: Activity3Component},
    ]),
  ],
  declarations: [
    AppComponent,
    Activity1Component,
    Activity2Component,
    Activity3Component,
  ],
  providers: [
    Activity2CanActivate,
  ],
})
class AppTestModule {
}

