/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { async, fakeAsync, inject, TestBed, tick } from '@angular/core/testing';
import { Component, NgModule } from '@angular/core';
import { PartsLayoutComponent } from '../layout/parts-layout.component';
import { expect, jasmineCustomMatchers } from './util/jasmine-custom-matchers.spec';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { WorkbenchRouter } from '../routing/workbench-router.service';
import { advance } from './util/util.spec';
import { WorkbenchView } from '../workbench.model';
import { WorkbenchTestingModule } from './workbench-testing.module';
import { ViewOutletNavigator } from '../routing/view-outlet-navigator.service';

describe('ViewOutletNavigator', () => {

  beforeEach(async(() => {
    jasmine.addMatchers(jasmineCustomMatchers);

    TestBed.configureTestingModule({
      imports: [AppTestModule],
    });

    TestBed.inject(Router).initialNavigation();
  }));

  it('resolves present views by path', fakeAsync(inject([WorkbenchRouter, ViewOutletNavigator], (wbRouter: WorkbenchRouter, viewOutletNavigator: ViewOutletNavigator) => {
    const fixture = TestBed.createComponent(PartsLayoutComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    advance(fixture);

    // Add View 1
    wbRouter.navigate(['path', 'to', 'view-1']).then();
    advance(fixture);

    // Add View 1 again
    wbRouter.navigate(['path', 'to', 'view-1'], {activateIfPresent: false}).then();
    advance(fixture);

    // Add View 2
    wbRouter.navigate(['path', 'to', 'view-2']).then();
    advance(fixture);

    // Add View 2 again (activate)
    wbRouter.navigate(['path', 'to', 'view-2'], {activateIfPresent: true}).then();
    advance(fixture);

    // Add View 3
    wbRouter.navigate(['path', 'to', 'view-3'], {activateIfPresent: true}).then();
    advance(fixture);

    expect(viewOutletNavigator.resolvePresentViewIds(['path', 'to', 'view-1']).sort()).toEqual(['view.1', 'view.2'].sort());
    expect(viewOutletNavigator.resolvePresentViewIds(['path', 'to', 'view-2'])).toEqual(['view.3']);
    expect(viewOutletNavigator.resolvePresentViewIds(['path', 'to', 'view-3'])).toEqual(['view.4']);

    tick();
  })));

  it('resolves present views by path and matrix params', fakeAsync(inject([WorkbenchRouter, ViewOutletNavigator], (wbRouter: WorkbenchRouter, viewOutletNavigator: ViewOutletNavigator) => {
    const fixture = TestBed.createComponent(PartsLayoutComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    advance(fixture);

    // Add View 1
    wbRouter.navigate(['path', 'to', 'view', {'matrixParam': 'A'}]).then();
    advance(fixture);

    // Add View 1 again
    wbRouter.navigate(['path', 'to', 'view', {'matrixParam': 'A'}], {activateIfPresent: false}).then();
    advance(fixture);

    // Add View 2
    wbRouter.navigate(['path', 'to', 'view', {'matrixParam': 'B'}]).then();
    advance(fixture);

    // Add View 2 again (activate)
    wbRouter.navigate(['path', 'to', 'view', {'matrixParam': 'B'}], {activateIfPresent: true}).then();
    advance(fixture);

    // Add View 3
    wbRouter.navigate(['path', 'to', 'view', {'matrixParam': 'C'}], {activateIfPresent: true}).then();
    advance(fixture);

    expect(viewOutletNavigator.resolvePresentViewIds(['path', 'to', 'view'])).toEqual([]);
    expect(viewOutletNavigator.resolvePresentViewIds(['path', 'to', 'view', {'matrixParam': 'A'}]).sort()).toEqual(['view.1', 'view.2'].sort());
    expect(viewOutletNavigator.resolvePresentViewIds(['path', 'to', 'view', {'matrixParam': 'B'}])).toEqual(['view.3'].sort());
    expect(viewOutletNavigator.resolvePresentViewIds(['path', 'to', 'view', {'matrixParam': 'C'}])).toEqual(['view.4'].sort());

    tick();
  })));
});

/****************************************************************************************************
 * Definition of App Test Module                                                                    *
 ****************************************************************************************************/
@Component({selector: 'spec-view', template: '{{view.viewId}}'})
class ViewComponent {

  constructor(public view: WorkbenchView) {
  }
}

@NgModule({
  declarations: [ViewComponent],
  imports: [
    WorkbenchTestingModule.forRoot(),
    RouterTestingModule.withRoutes([
      {path: 'path/to/view', component: ViewComponent},
      {path: 'path/to/view-1', component: ViewComponent},
      {path: 'path/to/view-2', component: ViewComponent},
      {path: 'path/to/view-3', component: ViewComponent},
    ]),
  ],
})
class AppTestModule {
}
