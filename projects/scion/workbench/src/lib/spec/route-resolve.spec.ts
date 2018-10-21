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
import { ViewPartGridComponent } from '../view-part-grid/view-part-grid.component';
import { WorkbenchModule } from '../workbench.module';
import { expect, jasmineCustomMatchers } from './util/jasmine-custom-matchers.spec';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { WB_VIEW_TITLE_PARAM } from '../routing/routing-params.constants';
import { InternalWorkbenchRouter, WorkbenchRouter } from '../routing/workbench-router.service';
import { advance } from './util/util.spec';
import { WorkbenchViewRegistry } from '../workbench-view-registry.service';

describe('WbRouter', () => {

  beforeEach(async(() => {
    jasmine.addMatchers(jasmineCustomMatchers);

    TestBed.configureTestingModule({
      imports: [AppTestModule]
    });

    TestBed.get(Router).initialNavigation();
  }));

  it('resolves present views by path', fakeAsync(inject([WorkbenchRouter, WorkbenchViewRegistry], (wbRouter: InternalWorkbenchRouter, viewRegistry: WorkbenchViewRegistry) => {
    const fixture = TestBed.createComponent(ViewPartGridComponent);
    fixture.debugElement.nativeElement.style.height = '500px';
    advance(fixture);

    // Add View 1
    wbRouter.navigate(['path', 'to', 'view-1', {[WB_VIEW_TITLE_PARAM]: 'view-1 (A)'}], {blankViewPartRef: 'viewpart.1'}).then();
    advance(fixture);

    // Add View 1 again
    wbRouter.navigate(['path', 'to', 'view-1', {[WB_VIEW_TITLE_PARAM]: 'view-1 (B)'}], {blankViewPartRef: 'viewpart.1', activateIfPresent: false}).then();
    advance(fixture);

    // Add View 2
    wbRouter.navigate(['path', 'to', 'view-2', {[WB_VIEW_TITLE_PARAM]: 'view-2 (A)'}], {blankViewPartRef: 'viewpart.1'}).then();
    advance(fixture);

    // Add View 2 again (activate)
    wbRouter.navigate(['path', 'to', 'view-2', {[WB_VIEW_TITLE_PARAM]: 'view-1 (B)'}], {blankViewPartRef: 'viewpart.1', activateIfPresent: true}).then();
    advance(fixture);

    // Add View 3
    wbRouter.navigate(['path', 'to', 'view-3', {[WB_VIEW_TITLE_PARAM]: 'view-3'}], {blankViewPartRef: 'viewpart.1', activateIfPresent: true}).then();
    advance(fixture);

    expect(wbRouter.resolvePresentViewRefs(['path', 'to', 'view-1']).map(viewRef => viewRegistry.getElseThrow(viewRef).title).sort()).toEqual(['view-1 (A)', 'view-1 (B)'].sort());
    expect(wbRouter.resolvePresentViewRefs(['path', 'to', 'view-2']).map(viewRef => viewRegistry.getElseThrow(viewRef).title)).toEqual(['view-2 (A)']);
    expect(wbRouter.resolvePresentViewRefs(['path', 'to', 'view-3']).map(viewRef => viewRegistry.getElseThrow(viewRef).title)).toEqual(['view-3']);

    tick();
  })));
});

/****************************************************************************************************
 * Definition of App Test Module                                                                    *
 ****************************************************************************************************/
@Component({selector: 'spec-view1', template: 'View 1'})
class View1Component {
}

@Component({selector: 'spec-view2', template: 'View 2'})
class View2Component {
}

@Component({selector: 'spec-view3', template: 'View 3'})
class View3Component {
}

@NgModule({
  declarations: [View1Component, View2Component, View3Component],
  imports: [
    WorkbenchModule.forRoot(),
    RouterTestingModule.withRoutes([
      {path: 'path/to/view-1', component: View1Component},
      {path: 'path/to/view-2', component: View2Component},
      {path: 'path/to/view-3', component: View3Component},
    ])
  ]
})
class AppTestModule {
}
