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
import { Component, NgModule, OnDestroy } from '@angular/core';
import { WorkbenchModule } from '../workbench.module';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, ParamMap, Router, RouteReuseStrategy } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { advance, clickElement } from './util/util.spec';
import { expect, jasmineCustomMatchers } from './util/jasmine-custom-matchers.spec';
import { Subject } from 'rxjs';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { ActivityPartComponent } from '../activity-part/activity-part.component';

describe('Activity part', () => {

  beforeEach(async(() => {
    jasmine.addMatchers(jasmineCustomMatchers);

    TestBed.configureTestingModule({
      imports: [AppTestModule]
    });
  }));

  it('does not throw if a hidden activity is given in URL', fakeAsync(inject([Router], (router: Router) => {
    expect((): void => {
      const fixture = TestBed.createComponent(AppComponent);
      advance(fixture);
      router.navigateByUrl('(activity:activity-debug)');
      advance(fixture);
    }).not.toThrowError();

    tick();
  })));

  it('supports initial navigation with an activity registered conditionally based on the value of a query parameter', fakeAsync(inject([Router], (router: Router) => {
    const fixture = TestBed.createComponent(AppComponent);
    advance(fixture);
    router.navigateByUrl('(activity:activity-debug)?debug=true'); // initial navigation with the `debug` query param set to `true` to show the activity
    advance(fixture);
    expect(fixture).toShow(ActivityDebugComponent);

    tick();
  })));

  /**
   * Test for Angular issue #25313: Router outlet mounts wrong component if using a route reuse strategy and if the router outlet was not instantiated at the time the route got activated
   * @see https://github.com/angular/angular/issues/25313
   */
  it('should mount the correct activity if the router outlet was not instantiated at the time the route got activated (https://github.com/angular/angular/issues/25313)', fakeAsync(inject([Router, RouteReuseStrategy], (router: Router, routeReuseStrategy: RouteReuseStrategy) => {
    // Setup: set workbench reuse strategy
    router.routeReuseStrategy = routeReuseStrategy;

    const fixture = TestBed.createComponent(AppComponent);
    advance(fixture);

    // Open 'activity-1'
    clickElement(fixture, ActivityPartComponent, 'a.activity-1', '(1a)');
    expect(fixture).toShow(Activity1Component, '(1b)');

    // Close 'activity-1'
    clickElement(fixture, ActivityPartComponent, 'a.activity-1', '(2a)');
    expect(fixture).not.toShow(Activity1Component, '(2b)');

    // Open 'activity-1'
    clickElement(fixture, ActivityPartComponent, 'a.activity-1', '(3a)');
    expect(fixture).toShow(Activity1Component, '(3b)');

    // Close 'activity-1'
    clickElement(fixture, ActivityPartComponent, 'a.activity-1', '(4a)');
    expect(fixture).not.toShow(Activity1Component, '(4b)');

    // Open 'activity-2'
    clickElement(fixture, ActivityPartComponent, 'a.activity-2', '(5a)');
    expect(fixture).toShow(Activity2Component, '(5b)');

    tick();
  })));
});

/****************************************************************************************************
 * Definition of App Test Module                                                                    *
 ****************************************************************************************************/
@Component({
  template: `
    <wb-workbench style="position: relative; width: 100%; height: 500px">
      <wb-activity cssClass="activity-debug"
                   label="activity-debug"
                   [visible]="debug"
                   routerLink="activity-debug">
      </wb-activity>
      <wb-activity cssClass="activity-1"
                   label="activity-1"
                   routerLink="activity-1">
      </wb-activity>
      <wb-activity cssClass="activity-2"
                   label="activity-2"
                   routerLink="activity-2">
      </wb-activity>
    </wb-workbench>
  `
})
class AppComponent implements OnDestroy {

  private _destroy$ = new Subject<void>();

  public debug: boolean;

  constructor(route: ActivatedRoute) {
    route.queryParamMap
      .pipe(
        map((paramMap: ParamMap) => coerceBooleanProperty(paramMap.get('debug'))),
        distinctUntilChanged(),
        takeUntil(this._destroy$)
      )
      .subscribe((debug: boolean) => {
        this.debug = debug;
      });
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}

@Component({template: 'Activity-Debug'})
class ActivityDebugComponent {
}

@Component({template: 'Activity-1'})
class Activity1Component {
}

@Component({template: 'Activity-2'})
class Activity2Component {
}

@NgModule({
  imports: [
    WorkbenchModule.forRoot(),
    NoopAnimationsModule,
    RouterTestingModule.withRoutes([
      {path: 'activity-debug', component: ActivityDebugComponent},
      {path: 'activity-1', component: Activity1Component},
      {path: 'activity-2', component: Activity2Component},
    ]),
  ],
  declarations: [AppComponent, ActivityDebugComponent, Activity1Component, Activity2Component]
})
class AppTestModule {
}
