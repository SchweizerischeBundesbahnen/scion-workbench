/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ComponentFixture, discardPeriodicTasks, fakeAsync, TestBed, waitForAsync} from '@angular/core/testing';
import {Component} from '@angular/core';
import {WorkbenchRouter} from './workbench-router.service';
import {WorkbenchView} from '../view/workbench-view.model';
import {advance, styleFixture} from '../testing/testing.util';
import {WorkbenchComponent} from '../workbench.component';
import {WorkbenchTestingModule} from '../testing/workbench-testing.module';
import {RouterTestingModule} from '@angular/router/testing';

describe('WorkbenchRouter', () => {

  let fixture: ComponentFixture<WorkbenchComponent>;
  let workbenchRouter: WorkbenchRouter;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest(),
        RouterTestingModule.withRoutes([
          {path: 'path/to/view', component: ViewComponent},
          {path: 'path/to/view-1', component: ViewComponent},
          {path: 'path/to/view-2', component: ViewComponent},
          {path: 'path/to/view-3', component: ViewComponent},
          {path: 'path', component: ViewComponent},
          {path: 'path/:segment1', component: ViewComponent},
          {path: 'path/:segment1/:segment2', component: ViewComponent},
        ]),
      ],
    });
    fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    workbenchRouter = TestBed.inject(WorkbenchRouter);
  }));

  it('resolves present views by path', fakeAsync(() => {
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

    expect(workbenchRouter.resolvePresentViewIds(['path', 'to', 'view-1'])).toEqual(jasmine.arrayWithExactContents(['view.1', 'view.2']));
    expect(workbenchRouter.resolvePresentViewIds(['path', 'to', 'view-2'])).toEqual(['view.3']);
    expect(workbenchRouter.resolvePresentViewIds(['path', 'to', 'view-3'])).toEqual(['view.4']);

    discardPeriodicTasks();
  }));

  it('resolves present views by path and ignores matrix params', fakeAsync(() => {
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

    expect(workbenchRouter.resolvePresentViewIds(['path', 'to', 'view'])).toEqual(jasmine.arrayWithExactContents(['view.1', 'view.2']));
    expect(workbenchRouter.resolvePresentViewIds(['path', 'to', 'view', {'matrixParam': 'A'}])).toEqual(jasmine.arrayWithExactContents(['view.1', 'view.2']));
    expect(workbenchRouter.resolvePresentViewIds(['path', 'to', 'view', {'matrixParam': 'B'}])).toEqual(jasmine.arrayWithExactContents(['view.1', 'view.2']));
    expect(workbenchRouter.resolvePresentViewIds(['path', 'to', 'view', {'matrixParam': 'C'}])).toEqual(jasmine.arrayWithExactContents(['view.1', 'view.2']));

    discardPeriodicTasks();
  }));

  it('resolves present views by path containing wildcards', fakeAsync(() => {
    // Add View 1
    workbenchRouter.navigate(['path'], {target: 'blank'}).then();
    advance(fixture);

    // Add View 2
    workbenchRouter.navigate(['path', 1], {target: 'blank'}).then();
    advance(fixture);

    // Add View 3
    workbenchRouter.navigate(['path', 2], {target: 'blank'}).then();
    advance(fixture);

    // Add View 4
    workbenchRouter.navigate(['path', 1, 1], {target: 'blank'}).then();
    advance(fixture);

    // Add View 5
    workbenchRouter.navigate(['path', 1, 2], {target: 'blank'}).then();
    advance(fixture);

    // Add View 6
    workbenchRouter.navigate(['path', 2, 1], {target: 'blank'}).then();
    advance(fixture);

    // Add View 7
    workbenchRouter.navigate(['path', 2, 2], {target: 'blank'}).then();
    advance(fixture);

    // Wildcard match is disabled by default
    expect(workbenchRouter.resolvePresentViewIds(['path'])).toEqual(['view.1']);
    expect(workbenchRouter.resolvePresentViewIds(['path', '*'])).toEqual([]);
    expect(workbenchRouter.resolvePresentViewIds(['path', 1, '*'])).toEqual([]);
    expect(workbenchRouter.resolvePresentViewIds(['path', '*', 1])).toEqual([]);
    expect(workbenchRouter.resolvePresentViewIds(['path', '*', '*'])).toEqual([]);

    // Set `matchWildcardSegments` option to `true`
    expect(workbenchRouter.resolvePresentViewIds(['path'], {matchWildcardSegments: true})).toEqual(['view.1']);
    expect(workbenchRouter.resolvePresentViewIds(['path', '*'], {matchWildcardSegments: true})).toEqual(jasmine.arrayWithExactContents(['view.2', 'view.3']));
    expect(workbenchRouter.resolvePresentViewIds(['path', 1, '*'], {matchWildcardSegments: true})).toEqual(jasmine.arrayWithExactContents(['view.4', 'view.5']));
    expect(workbenchRouter.resolvePresentViewIds(['path', '*', 1], {matchWildcardSegments: true})).toEqual(jasmine.arrayWithExactContents(['view.4', 'view.6']));
    expect(workbenchRouter.resolvePresentViewIds(['path', '*', '*'], {matchWildcardSegments: true})).toEqual(jasmine.arrayWithExactContents(['view.4', 'view.5', 'view.6', 'view.7']));

    discardPeriodicTasks();
  }));
});

/****************************************************************************************************
 * Definition of App Test Module                                                                    *
 ****************************************************************************************************/
@Component({selector: 'spec-view', template: '{{view.id}}', standalone: true})
class ViewComponent {

  constructor(public view: WorkbenchView) {
  }
}
