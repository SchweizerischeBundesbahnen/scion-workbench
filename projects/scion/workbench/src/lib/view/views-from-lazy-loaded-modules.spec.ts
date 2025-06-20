/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {discardPeriodicTasks, fakeAsync, TestBed} from '@angular/core/testing';
import {Component, NgModule} from '@angular/core';
import {expect} from '../testing/jasmine/matcher/custom-matchers.definition';
import {provideRouter, RouterModule} from '@angular/router';
import {WorkbenchRouter} from '../routing/workbench-router.service';
import {toShowCustomMatcher} from '../testing/jasmine/matcher/to-show.matcher';
import {advance, styleFixture} from '../testing/testing.util';
import {WorkbenchComponent} from '../workbench.component';
import {provideWorkbenchForTest} from '../testing/workbench.provider';

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
 * +------------------------------------------+     +--------------------------------------+
 * | Feature Module A                         |     | Feature Module B                     |
 * |------------------------------------------|     |--------------------------------------|
 * | routes:                                  |     | routes:                              |
 * |                                          |     |                                      |
 * | 'view-1' => FeatureA_View1_Component     |     | 'view-1' => FeatureB_View1_Component |
 * | 'view-2' => FeatureA_View2_Component     |     | 'view-2' => FeatureB_View2_Component |
 * +------------------------------------------+     +--------------------------------------+
 *
 */
describe('Views', () => {

  beforeEach(() => {
    jasmine.addMatchers(toShowCustomMatcher);
  });

  it('can be loaded from lazy feature modules', fakeAsync(() => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideRouter([
          {path: 'feature-a', loadChildren: () => FeatureAModule},
          {path: 'feature-b', loadChildren: () => FeatureBModule},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));

    // Navigate to view 'feature-a/view-1'
    void TestBed.inject(WorkbenchRouter).navigate(['feature-a', 'view-1']);
    advance(fixture);
    expect(fixture).toShow(FeatureA_View1_Component, '(1)');

    // Navigate to view 'feature-a/view-2'
    void TestBed.inject(WorkbenchRouter).navigate(['feature-a', 'view-2']);
    advance(fixture);
    expect(fixture).toShow(FeatureA_View2_Component, '(2)');

    // Navigate to view 'feature-b/view-1'
    void TestBed.inject(WorkbenchRouter).navigate(['feature-b', 'view-1']);
    advance(fixture);
    expect(fixture).toShow(FeatureB_View1_Component, '(3)');

    // Navigate to view 'feature-b/view-2'
    void TestBed.inject(WorkbenchRouter).navigate(['feature-b', 'view-2']);
    advance(fixture);
    expect(fixture).toShow(FeatureB_View2_Component, '(4)');

    discardPeriodicTasks();
  }));
});

/****************************************************************************************************
 * Definition of Feature Module A                                                                   *
 ****************************************************************************************************/
@Component({selector: 'spec-feature-a-view-1', template: 'Feature Module A - View 1'})
class FeatureA_View1_Component {
}

@Component({selector: 'spec-feature-a-view-2', template: 'Feature Module A - View 2'})
class FeatureA_View2_Component {
}

@NgModule({
  imports: [
    RouterModule.forChild([
      {path: 'view-1', component: FeatureA_View1_Component},
      {path: 'view-2', component: FeatureA_View2_Component},
    ]),
  ],
})
export class FeatureAModule {
}

/****************************************************************************************************
 * Definition of Feature Module B                                                                   *
 ****************************************************************************************************/
@Component({selector: 'spec-feature-b-view-1', template: 'Feature Module B - View 1'})
class FeatureB_View1_Component {
}

@Component({selector: 'spec-feature-b-view-2', template: 'Feature Module B - View 2'})
class FeatureB_View2_Component {
}

@NgModule({
  imports: [
    RouterModule.forChild([
      {path: 'view-1', component: FeatureB_View1_Component},
      {path: 'view-2', component: FeatureB_View2_Component},
    ]),
  ],
})
export class FeatureBModule {
}
