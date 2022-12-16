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
import {PartsLayoutComponent} from '../layout/parts-layout.component';
import {expect, jasmineCustomMatchers} from './util/jasmine-custom-matchers.spec';
import {RouterTestingModule} from '@angular/router/testing';
import {Router} from '@angular/router';
import {WorkbenchRouter} from '../routing/workbench-router.service';
import {advance} from './util/util.spec';
import {WorkbenchTestingModule} from './workbench-testing.module';
import {WorkbenchView} from '../view/workbench-view.model';

describe('WorkbenchRouter', () => {

  beforeEach(waitForAsync(() => {
    jasmine.addMatchers(jasmineCustomMatchers);

    TestBed.configureTestingModule({
      imports: [AppTestModule],
    });

    TestBed.inject(Router).initialNavigation();
  }));

  it('resolves present views by path', fakeAsync(inject([WorkbenchRouter], (workbenchRouter: WorkbenchRouter) => {
    const fixture = TestBed.createComponent(PartsLayoutComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    advance(fixture);

    // Add View 1
    workbenchRouter.navigate(['path', 'to', 'view-1']).then();
    advance(fixture);

    // Add View 1 again
    workbenchRouter.navigate(['path', 'to', 'view-1'], {target: 'blank'}).then();
    advance(fixture);

    // Add View 2
    workbenchRouter.navigate(['path', 'to', 'view-2']).then();
    advance(fixture);

    // Add View 2 again (activate)
    workbenchRouter.navigate(['path', 'to', 'view-2']).then();
    advance(fixture);

    // Add View 3
    workbenchRouter.navigate(['path', 'to', 'view-3']).then();
    advance(fixture);

    expect(workbenchRouter.resolvePresentViewIds(['path', 'to', 'view-1']).sort()).toEqual(['view.1', 'view.2'].sort());
    expect(workbenchRouter.resolvePresentViewIds(['path', 'to', 'view-2'])).toEqual(['view.3']);
    expect(workbenchRouter.resolvePresentViewIds(['path', 'to', 'view-3'])).toEqual(['view.4']);

    expect(workbenchRouter.resolvePresentViewIds(['path', 'to', 'view-1'], {ignoreMatrixParams: true}).sort()).toEqual(['view.1', 'view.2'].sort());
    expect(workbenchRouter.resolvePresentViewIds(['path', 'to', 'view-2'], {ignoreMatrixParams: true})).toEqual(['view.3']);
    expect(workbenchRouter.resolvePresentViewIds(['path', 'to', 'view-3'], {ignoreMatrixParams: true})).toEqual(['view.4']);

    discardPeriodicTasks();
  })));

  it('resolves present views by path and ignores matrix params', fakeAsync(inject([WorkbenchRouter], (workbenchRouter: WorkbenchRouter) => {
    const fixture = TestBed.createComponent(PartsLayoutComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    advance(fixture);

    // Add View 1
    workbenchRouter.navigate(['path', 'to', 'view', {'matrixParam': 'A'}], {target: 'blank'}).then();
    advance(fixture);

    // Add View 1 again (existing view is activated)
    workbenchRouter.navigate(['path', 'to', 'view', {'matrixParam': 'A'}]).then();
    advance(fixture);

    // Add View 2 (new view is created, because target is 'blank')
    workbenchRouter.navigate(['path', 'to', 'view', {'matrixParam': 'B'}], {target: 'blank'}).then();
    advance(fixture);

    // Update matrix param (both views are updated)
    workbenchRouter.navigate(['path', 'to', 'view', {'matrixParam': 'B'}]).then();
    advance(fixture);

    // Update matrix param (both views are updated)
    workbenchRouter.navigate(['path', 'to', 'view', {'matrixParam': 'C'}]).then();
    advance(fixture);

    expect(workbenchRouter.resolvePresentViewIds(['path', 'to', 'view'])).toEqual([]);
    expect(workbenchRouter.resolvePresentViewIds(['path', 'to', 'view', {'matrixParam': 'A'}])).toEqual([]);
    expect(workbenchRouter.resolvePresentViewIds(['path', 'to', 'view', {'matrixParam': 'B'}])).toEqual([]);
    expect(workbenchRouter.resolvePresentViewIds(['path', 'to', 'view', {'matrixParam': 'C'}]).sort()).toEqual(['view.1', 'view.2'].sort());

    expect(workbenchRouter.resolvePresentViewIds(['path', 'to', 'view'], {ignoreMatrixParams: true}).sort()).toEqual(['view.1', 'view.2'].sort());
    expect(workbenchRouter.resolvePresentViewIds(['path', 'to', 'view', {'matrixParam': 'A'}], {ignoreMatrixParams: true}).sort()).toEqual(['view.1', 'view.2'].sort());
    expect(workbenchRouter.resolvePresentViewIds(['path', 'to', 'view', {'matrixParam': 'B'}], {ignoreMatrixParams: true}).sort()).toEqual(['view.1', 'view.2'].sort());
    expect(workbenchRouter.resolvePresentViewIds(['path', 'to', 'view', {'matrixParam': 'C'}], {ignoreMatrixParams: true}).sort()).toEqual(['view.1', 'view.2'].sort());

    discardPeriodicTasks();
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
    WorkbenchTestingModule.forRoot({startup: {launcher: 'APP_INITIALIZER'}}),
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
