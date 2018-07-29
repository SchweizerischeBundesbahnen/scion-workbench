/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { async, fakeAsync, inject, TestBed, tick } from '@angular/core/testing';
import { Component, NgModule } from '@angular/core';
import { WorkbenchModule } from '../workbench.module';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, RouteReuseStrategy } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { advance, clickElement } from './util/util.spec';
import { expect, jasmineCustomMatchers } from './util/jasmine-custom-matchers.spec';
import { ActivityPartComponent } from '../activity-part/activity-part.component';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

/**
 *
 * Testsetup:
 *
 * +------------------------------------+
 * | Test Module                        |
 * |------------------------------------|
 * | routes:                            |
 * |                                    |
 * | 'activity-1' => Activity1Component |
 * | 'activity-2' => Activity2Component |
 * | 'activity-3' => Activity3Component |
 * +------------------------------------+
 *
 */
describe('Activity part', () => {

  beforeEach(async(() => {
    jasmine.addMatchers(jasmineCustomMatchers);

    TestBed.configureTestingModule({
      imports: [AppTestModule, CommonModule]
    });

    TestBed.get(Router).initialNavigation();
  }));

  it('renders the correct actions in the activity part header', fakeAsync(inject([Router, RouteReuseStrategy], (router: Router, routeReuseStrategy: RouteReuseStrategy) => {
    // Setup: set workbench reuse strategy
    router.routeReuseStrategy = routeReuseStrategy;

    const fixture = TestBed.createComponent(AppComponent);
    advance(fixture);

    // Open 'activity-1'
    clickElement(fixture, ActivityPartComponent, 'a.activity-1', '(1a)');
    advance(fixture);
    expect(fixture).toShow(Activity1Component, '(1b)');
    expect(fixture.debugElement.queryAll(By.css('span.action')).length).toBe(2, '(1c)');
    expect(fixture.debugElement.query(By.css('.activity-1.action-a'))).toBeTruthy('(1d)');
    expect(fixture.debugElement.query(By.css('.activity-1.action-b'))).toBeTruthy('(1e)');

    // Open 'activity-2'
    clickElement(fixture, ActivityPartComponent, 'a.activity-2', '(2a)');
    advance(fixture);
    expect(fixture).toShow(Activity2Component, '(2b)');
    expect(fixture.debugElement.queryAll(By.css('span.action')).length).toBe(3, '(2c)');
    expect(fixture.debugElement.query(By.css('.activity-2.action-a'))).toBeTruthy('(2d)');
    expect(fixture.debugElement.query(By.css('.activity-2.action-b'))).toBeTruthy('(2e)');
    expect(fixture.debugElement.query(By.css('.activity-2.action-c'))).toBeTruthy('(2f)');

    // Open 'activity-3'
    clickElement(fixture, ActivityPartComponent, 'a.activity-3', '(3a)');
    advance(fixture);
    expect(fixture).toShow(Activity3Component, '(3b)');
    expect(fixture.debugElement.queryAll(By.css('span.action')).length).toBe(0, '(3c)');

    tick();
  })));
});

/****************************************************************************************************
 * Definition of App Test Module                                                                    *
 ****************************************************************************************************/
@Component({
  template: `
    <wb-workbench style="position: relative; width: 100%; height: 500px">
      <wb-activity cssClass="activity-1" label="activity-1" routerLink="activity-1"></wb-activity>
      <wb-activity cssClass="activity-2" label="activity-2" routerLink="activity-2"></wb-activity>
      <wb-activity cssClass="activity-3" label="activity-3" routerLink="activity-3"></wb-activity>
    </wb-workbench>
  `
})
class AppComponent {
}

@Component({
  template: `
    <h1>Activity-1</h1>

    <ng-template wbActivityAction>
      <span class="action activity-1 action-a">activity-1/action-a</span>
      <span class="action activity-1 action-b">activity-1/action-b</span>
    </ng-template>
  `
})
class Activity1Component {
}

@Component({
  template: `
    <h1>Activity-2</h1>

    <ng-template wbActivityAction>
      <span class="action activity-2 action-a">activity-2/action-a</span>
      <span class="action activity-2 action-b">activity-2/action-b</span>
      <span class="action activity-2 action-c">activity-2/action-c</span>
    </ng-template>
  `
})
class Activity2Component {
}

@Component({template: '<h1>Activity-3</h1>'})
class Activity3Component {
}

@NgModule({
  imports: [
    WorkbenchModule.forRoot(),
    NoopAnimationsModule,
    CommonModule,
    RouterTestingModule.withRoutes([
      {path: 'activity-1', component: Activity1Component},
      {path: 'activity-2', component: Activity2Component},
      {path: 'activity-3', component: Activity3Component},
    ]),
  ],
  declarations: [
    AppComponent,
    Activity1Component,
    Activity2Component,
    Activity3Component
  ]
})
class AppTestModule {
}

