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
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { advance } from './util/util.spec';
import { expect, jasmineCustomMatchers } from './util/jasmine-custom-matchers.spec';
import { Subject } from 'rxjs/index';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { distinctUntilChanged, map, takeUntil } from 'rxjs/operators';

describe('Activity part', () => {

  beforeEach(async(() => {
    jasmine.addMatchers(jasmineCustomMatchers);

    TestBed.configureTestingModule({
      imports: [AppTestModule]
    });

    TestBed.get(Router).initialNavigation();
  }));

  it('does not throw if an unknown activity is given in URL', fakeAsync(inject([Router], (router: Router) => {
    router.navigateByUrl('(activity:activity-debug)');

    expect((): void => {
      const fixture = TestBed.createComponent(AppComponent);
      advance(fixture);
    }).not.toThrowError();

    tick();
  })));

  it('supports initial navigation with an activity registered conditionally based on the value of a query parameter', fakeAsync(inject([Router], (router: Router) => {
    router.navigateByUrl('(activity:activity-debug)?debug=true'); // initial navigation with the `debug` query param set to `true` to register the activity

    const fixture = TestBed.createComponent(AppComponent);
    advance(fixture);

    expect(fixture).toShow(ActivityDebugComponent);

    tick();
  })));
});

/****************************************************************************************************
 * Definition of App Test Module                                                                    *
 ****************************************************************************************************/
@Component({
  template: `
    <wb-workbench style="position: relative; width: 100%; height: 500px">
      <wb-activity *ngIf="debug"
                   cssClass="activity-debug"
                   label="activity-debug"
                   routerLink="activity-debug">
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

@NgModule({
  imports: [
    WorkbenchModule.forRoot(),
    NoopAnimationsModule,
    RouterTestingModule.withRoutes([
      {path: 'activity-debug', component: ActivityDebugComponent},
    ]),
  ],
  declarations: [AppComponent, ActivityDebugComponent]
})
class AppTestModule {
}
