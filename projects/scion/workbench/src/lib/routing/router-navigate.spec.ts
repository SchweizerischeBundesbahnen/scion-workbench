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
import {RouterModule} from '@angular/router';
import {WorkbenchRouter} from './workbench-router.service';
import {CommonModule} from '@angular/common';
import {expect} from '../testing/jasmine/matcher/custom-matchers.definition';
import {toShowCustomMatcher} from '../testing/jasmine/matcher/to-show.matcher';
import {advance, clickElement, styleFixture} from '../testing/testing.util';
import {WorkbenchTestingModule} from '../testing/workbench-testing.module';
import {WorkbenchComponent} from '../workbench.component';
import {RouterTestingModule} from '@angular/router/testing';
import {WorkbenchRouterLinkDirective} from '../routing/workbench-router-link.directive';

/**
 * Test setup:
 *
 *
 *           +--------------+
 *           | Test Module  |
 *           +--------------+
 *                  |
 *               feature-a (route)
 *                  |
 *                  v
 * +-------------------------------------+
 * | Feature Module A                    |
 * |-------------------------------------|
 * | routes:                             |
 * |                                     |
 * | ''       => FeatureA_EntryComponent |
 * | 'view-1' => FeatureA_View1Component |
 * | 'view-2' => FeatureA_View2Component |
 * +-------------------------------------+
 *                  |
 *               feature-b (route)
 *                  |
 *                  v
 * +-------------------------------------+
 * | Feature Module B                    |
 * |-------------------------------------|
 * | routes:                             |
 * |                                     |
 * | ''       => FeatureB_EntryComponent |
 * | 'view-1' => FeatureB_View1Component |
 * | 'view-2' => FeatureB_View2Component |
 * +-------------------------------------+
 *
 */
describe('Router', () => {

  beforeEach(() => {
    jasmine.addMatchers(toShowCustomMatcher);
  });

  it('allows for relative and absolute navigation', fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest(),
        RouterTestingModule.withRoutes([
          {path: 'feature-a', loadChildren: () => FeatureAModule},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    const workbenchRouter = TestBed.inject(WorkbenchRouter);

    // Navigate to entry component of feature module A
    workbenchRouter.navigate(['feature-a']).then();
    advance(fixture);
    expect(fixture).toShow(FeatureA_EntryComponent, '1');

    // Open '/feature-a/view-1' (relative navigation)
    clickElement(fixture, FeatureA_EntryComponent, 'a[wbRouterLink="view-1"]', '2a');
    expect(fixture).toShow(FeatureA_View1Component, '2b');

    // Go back one level '/feature-a' (relative navigation)
    clickElement(fixture, FeatureA_View1Component, 'a[wbRouterLink=".."]', '3a');
    expect(fixture).toShow(FeatureA_EntryComponent, '3b');

    // Open '/feature-a/view-2' (relative navigation)
    clickElement(fixture, FeatureA_EntryComponent, 'a[wbRouterLink="./view-2"]', '4a');
    expect(fixture).toShow(FeatureA_View2Component, '4b');

    // Go back one level to '/feature-a' (relative navigation)
    clickElement(fixture, FeatureA_View2Component, 'a[wbRouterLink=".."]', '5a');
    expect(fixture).toShow(FeatureA_EntryComponent, '5b');

    // Open '/feature-a/view-1' (absolute navigation)
    clickElement(fixture, FeatureA_EntryComponent, 'a[wbRouterLink="/feature-a/view-1"]', '6a');
    expect(fixture).toShow(FeatureA_View1Component, '6b');

    // Go back one level to '/feature-a' (relative navigation)
    clickElement(fixture, FeatureA_View1Component, 'a[wbRouterLink=".."]', '7a');
    expect(fixture).toShow(FeatureA_EntryComponent, '7b');

    // Open '/feature-a/view-2' (absolute navigation)
    clickElement(fixture, FeatureA_EntryComponent, 'a[wbRouterLink="/feature-a/view-2"]', '8a');
    expect(fixture).toShow(FeatureA_View2Component, '8b');

    // Go back one level to '/feature-a' (relative navigation)
    clickElement(fixture, FeatureA_View2Component, 'a[wbRouterLink=".."]', '9a');
    expect(fixture).toShow(FeatureA_EntryComponent, '9b');

    // Open '/feature-a/feature-b' (relative navigation)
    clickElement(fixture, FeatureA_EntryComponent, 'a[wbRouterLink="feature-b"]', '10a');
    expect(fixture).toShow(FeatureB_EntryComponent, '10b');

    // Go back one level to '/feature-a' (relative navigation)
    clickElement(fixture, FeatureB_EntryComponent, 'a[wbRouterLink=".."]', '11a');
    expect(fixture).toShow(FeatureA_EntryComponent, '11b');

    // Open '/feature-a/feature-b/view-1' (relative navigation)
    clickElement(fixture, FeatureA_EntryComponent, 'a[wbRouterLink="feature-b/view-1"]', '12a');
    expect(fixture).toShow(FeatureB_View1Component, '12b');

    // Go back two levels to '/feature-a' (relative navigation)
    clickElement(fixture, FeatureB_View1Component, 'a[wbRouterLink="../.."]', '13a');
    expect(fixture).toShow(FeatureA_EntryComponent, '13b');

    // Open '/feature-a/feature-b/view-2' (relative navigation)
    clickElement(fixture, FeatureA_EntryComponent, 'a[wbRouterLink="./feature-b/view-2"]', '14a');
    expect(fixture).toShow(FeatureB_View2Component, '14b');

    // Go back two levels to '/feature-a' (relative navigation)
    clickElement(fixture, FeatureB_View2Component, 'a[wbRouterLink="../.."]', '15a');
    expect(fixture).toShow(FeatureA_EntryComponent, '15b');

    // Open '/feature-a/feature-b' (absolute navigation)
    clickElement(fixture, FeatureA_EntryComponent, 'a[wbRouterLink="/feature-a/feature-b"]', '16a');
    expect(fixture).toShow(FeatureB_EntryComponent, '16b');

    // Go back one level to '/feature-a' (relative navigation)
    clickElement(fixture, FeatureB_EntryComponent, 'a[wbRouterLink=".."]', '17a');
    expect(fixture).toShow(FeatureA_EntryComponent, '17b');

    // Open '/feature-a/feature-b/view-1' (absolute navigation)
    clickElement(fixture, FeatureA_EntryComponent, 'a[wbRouterLink="/feature-a/feature-b/view-1"]', '18a');
    expect(fixture).toShow(FeatureB_View1Component, '18b');

    // Go back two levels to '/feature-a' (relative navigation)
    clickElement(fixture, FeatureB_View1Component, 'a[wbRouterLink="../.."]', '19a');
    expect(fixture).toShow(FeatureA_EntryComponent, '19b');

    // Open '/feature-a/feature-b/view-2' (absolute navigation)
    clickElement(fixture, FeatureA_EntryComponent, 'a[wbRouterLink="/feature-a/feature-b/view-2"]', '20a');
    expect(fixture).toShow(FeatureB_View2Component, '20b');

    // Go back two levels to '/feature-a' (relative navigation)
    clickElement(fixture, FeatureB_View2Component, 'a[wbRouterLink="../.."]', '21a');
    expect(fixture).toShow(FeatureA_EntryComponent, '21b');

    // Open '/feature-a/view-1' (relative navigation)
    clickElement(fixture, FeatureA_EntryComponent, 'a[wbRouterLink="view-1"]', '21a');
    expect(fixture).toShow(FeatureA_View1Component, '21b');

    // Open '/feature-a/view-2' (relative navigation)
    clickElement(fixture, FeatureA_View1Component, 'a[wbRouterLink="../view-2"]', '22a');
    expect(fixture).toShow(FeatureA_View2Component, '22b');

    // Open '/feature-a/view-1' (relative navigation)
    clickElement(fixture, FeatureA_View2Component, 'a[wbRouterLink="../view-1"]', '23a');
    expect(fixture).toShow(FeatureA_View1Component, '23b');

    // Open '/feature-a/feature-b' (relative navigation)
    clickElement(fixture, FeatureA_View1Component, 'a[wbRouterLink="../feature-b"]', '24a');
    expect(fixture).toShow(FeatureB_EntryComponent, '24b');

    // Open '/feature-a/view-1' (relative navigation)
    clickElement(fixture, FeatureB_EntryComponent, 'a[wbRouterLink="../view-1"]', '25a');
    expect(fixture).toShow(FeatureA_View1Component, '25b');

    // Open '/feature-a/feature-b/view-1' (relative navigation)
    clickElement(fixture, FeatureA_View1Component, 'a[wbRouterLink="../feature-b/view-1"]', '26a');
    expect(fixture).toShow(FeatureB_View1Component, '26b');

    // Open '/feature-a/view-1' (relative navigation)
    clickElement(fixture, FeatureB_View1Component, 'a[wbRouterLink="../../view-1"]', '27a');
    expect(fixture).toShow(FeatureA_View1Component, '27b');

    // Open '/feature-a/feature-b/view-2' (relative navigation)
    clickElement(fixture, FeatureA_View1Component, 'a[wbRouterLink="../feature-b/view-2"]', '28a');
    expect(fixture).toShow(FeatureB_View2Component, '28b');

    // Open '/feature-a/view-1' (relative navigation)
    clickElement(fixture, FeatureB_View2Component, 'a[wbRouterLink="../../view-1"]', '29a');
    expect(fixture).toShow(FeatureA_View1Component, '29b');

    // Open '/feature-a/feature-b' (absolute navigation)
    clickElement(fixture, FeatureA_View1Component, 'a[wbRouterLink="/feature-a/feature-b"]', '30a');
    expect(fixture).toShow(FeatureB_EntryComponent, '30b');

    // Open '/feature-a/feature-b/view-1' (relative navigation)
    clickElement(fixture, FeatureB_EntryComponent, 'a[wbRouterLink="view-1"]', '31a');
    expect(fixture).toShow(FeatureB_View1Component, '31b');

    // Go back one level to '/feature-a/feature-b' (relative navigation)
    clickElement(fixture, FeatureB_View1Component, 'a[wbRouterLink=".."]', '32a');
    expect(fixture).toShow(FeatureB_EntryComponent, '32b');

    // Open '/feature-a/feature-b/view-2' (relative navigation)
    clickElement(fixture, FeatureB_EntryComponent, 'a[wbRouterLink="./view-2"]', '33a');
    expect(fixture).toShow(FeatureB_View2Component, '33b');

    // Go back one level to '/feature-a/feature-b' (relative navigation)
    clickElement(fixture, FeatureB_View2Component, 'a[wbRouterLink=".."]', '34a');
    expect(fixture).toShow(FeatureB_EntryComponent, '34b');

    // Open '/feature-a/feature-b/view-1' (absolute navigation)
    clickElement(fixture, FeatureB_EntryComponent, 'a[wbRouterLink="/feature-a/feature-b/view-1"]', '35a');
    expect(fixture).toShow(FeatureB_View1Component, '35b');

    // Go back one level to '/feature-a/feature-b' (relative navigation)
    clickElement(fixture, FeatureB_View1Component, 'a[wbRouterLink=".."]', '36a');
    expect(fixture).toShow(FeatureB_EntryComponent, '36b');

    // Open '/feature-a/feature-b/view-2' (absolute navigation)
    clickElement(fixture, FeatureB_EntryComponent, 'a[wbRouterLink="/feature-a/feature-b/view-2"]', '37a');
    expect(fixture).toShow(FeatureB_View2Component, '37b');

    // Go back one level to '/feature-a/feature-b' (relative navigation)
    clickElement(fixture, FeatureB_View2Component, 'a[wbRouterLink=".."]', '38a');
    expect(fixture).toShow(FeatureB_EntryComponent, '38b');

    // Open '/feature-a/view-1' (absolute navigation)
    clickElement(fixture, FeatureB_EntryComponent, 'a[wbRouterLink="/feature-a/view-1"]', '39a');
    expect(fixture).toShow(FeatureA_View1Component, '39b');

    // Go back to '/feature-a/feature-b' (relative navigation)
    clickElement(fixture, FeatureA_View1Component, 'a[wbRouterLink="../feature-b"]', '40a');
    expect(fixture).toShow(FeatureB_EntryComponent, '40b');

    discardPeriodicTasks();
  }));

  it('allows to close views', fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest(),
        RouterTestingModule.withRoutes([
          {path: 'feature-a', loadChildren: () => FeatureAModule},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    const workbenchRouter = TestBed.inject(WorkbenchRouter);

    // Open /feature-a/view-1
    workbenchRouter.navigate(['feature-a']).then();
    advance(fixture);
    expect(fixture).toShow(FeatureA_EntryComponent, '1a');

    // Close /feature-a/view-1
    workbenchRouter.navigate(['feature-a'], {close: true}).then();
    advance(fixture);
    expect(fixture).not.toShow(FeatureA_View1Component, '1b');

    // Open /feature-a/view-1
    workbenchRouter.navigate(['feature-a/view-1']).then();
    advance(fixture);
    expect(fixture).toShow(FeatureA_View1Component, '2a');

    // Close /feature-a/view-1
    workbenchRouter.navigate(['feature-a/view-1'], {close: true}).then();
    advance(fixture);
    expect(fixture).not.toShow(FeatureA_View1Component, '2b');

    // Open /feature-a/feature-b/view-1
    workbenchRouter.navigate(['feature-a/feature-b/view-1']).then();
    advance(fixture);
    expect(fixture).toShow(FeatureB_View1Component, '3a');

    // Close /feature-a/feature-b/view-1
    workbenchRouter.navigate(['feature-a/feature-b/view-1'], {close: true}).then();
    advance(fixture);
    expect(fixture).not.toShow(FeatureB_View1Component, '3b');

    // Close not present view
    workbenchRouter.navigate(['a/b/c'], {close: true}).then();

    discardPeriodicTasks();
  }));
});

/****************************************************************************************************
 * Definition of Feature Module A                                                                   *
 ****************************************************************************************************/
@Component({
  template: `
    <h1>Feature Module A - Entry</h1>
    <ul>
      <li><a wbRouterLink="view-1">view-1</a></li>
      <li><a wbRouterLink="./view-2">./view-2</a></li>

      <li><a wbRouterLink="/feature-a/view-1">view-1</a></li>
      <li><a wbRouterLink="/feature-a/view-2">view-2</a></li>

      <li><a wbRouterLink="feature-b">feature-b</a></li>
      <li><a wbRouterLink="feature-b/view-1">feature-b/view-1</a></li>
      <li><a wbRouterLink="./feature-b/view-2">feature-b/view-1</a></li>

      <li><a wbRouterLink="/feature-a/feature-b">feature-b</a></li>
      <li><a wbRouterLink="/feature-a/feature-b/view-1">feature-b/view-1</a></li>
      <li><a wbRouterLink="/feature-a/feature-b/view-2">feature-b/view-2</a></li>
    </ul>
  `,
  standalone: true,
  imports: [WorkbenchRouterLinkDirective],
})
class FeatureA_EntryComponent {
}

@Component({
  template: `
    <h1>Feature Module A - View 1</h1>
    <ul>
      <li><a wbRouterLink="..">go back 1 level</a></li>
      <li><a wbRouterLink="../view-2">view-2</a></li>

      <li><a wbRouterLink="../feature-b">feature-b</a></li>
      <li><a wbRouterLink="../feature-b/view-1">feature-b/view-1</a></li>
      <li><a wbRouterLink="../feature-b/view-2">feature-b/view-2</a></li>

      <li><a wbRouterLink="/feature-a/feature-b">/feature-a/feature-b</a></li>
    </ul>
  `,
  standalone: true,
  imports: [WorkbenchRouterLinkDirective],
})
class FeatureA_View1Component {
}

@Component({
  template: `
    <h1>Feature Module A - View 2</h1>
    <ul>
      <li><a wbRouterLink="..">go back 1 level</a></li>
      <li><a wbRouterLink="../view-1">view-1</a></li>
    </ul>
  `,
  standalone: true,
  imports: [WorkbenchRouterLinkDirective,
  ],
})
class FeatureA_View2Component {
}

@NgModule({
  imports: [
    CommonModule,
    WorkbenchTestingModule,
    RouterModule.forChild([
      {path: '', component: FeatureA_EntryComponent},
      {path: 'view-1', component: FeatureA_View1Component},
      {path: 'view-2', component: FeatureA_View2Component},
      {path: 'feature-b', loadChildren: () => FeatureBModule},
    ]),
  ],
})
export class FeatureAModule {
}

/****************************************************************************************************
 * Definition of Feature Module B                                                                   *
 ****************************************************************************************************/
@Component({
  template: `
    <h1>Feature Module B - Entry</h1>
    <ul>
      <li><a wbRouterLink="..">go back 1 level</a></li>
      <li><a wbRouterLink="../..">go back 2 levels</a></li>
      <li><a wbRouterLink="../view-1">../view-1</a></li>

      <li><a wbRouterLink="view-1">view-1</a></li>
      <li><a wbRouterLink="./view-2">./view-2</a></li>

      <li><a wbRouterLink="/feature-a/feature-b/view-1">/feature-a/feature-b/view-1</a></li>
      <li><a wbRouterLink="/feature-a/feature-b/view-2">/feature-a/feature-b/view-2</a></li>

      <li><a wbRouterLink="/feature-a/view-1">/feature-a/view-1</a></li>
    </ul>
  `,
  standalone: true,
  imports: [WorkbenchRouterLinkDirective],
})
class FeatureB_EntryComponent {
}

@Component({
  template: `
    <h1>Feature Module B - View 1</h1>
    <ul>
      <li><a wbRouterLink="..">go back 1 level</a></li>
      <li><a wbRouterLink="../..">go back 2 levels</a></li>
      <li><a wbRouterLink="../../view-1">../../view-1</a></li>
    </ul>
  `,
  standalone: true,
  imports: [WorkbenchRouterLinkDirective],
})
class FeatureB_View1Component {
}

@Component({
  template: `
    <h1>Feature Module B - View 2</h1>
    <ul>
      <li><a wbRouterLink="..">go back 1 level</a></li>
      <li><a wbRouterLink="../..">go back 2 levels</a></li>
      <li><a wbRouterLink="../../view-1">../../view-1</a></li>
    </ul>
  `,
  standalone: true,
  imports: [WorkbenchRouterLinkDirective],
})
class FeatureB_View2Component {
}

@NgModule({
  imports: [
    CommonModule,
    WorkbenchTestingModule,
    RouterModule.forChild([
      {path: '', component: FeatureB_EntryComponent},
      {path: 'view-1', component: FeatureB_View1Component},
      {path: 'view-2', component: FeatureB_View2Component},
    ]),
  ],
})
export class FeatureBModule {
}

