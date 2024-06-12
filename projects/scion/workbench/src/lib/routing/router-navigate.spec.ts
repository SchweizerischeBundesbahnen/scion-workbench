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
import {Component} from '@angular/core';
import {provideRouter, Routes} from '@angular/router';
import {WorkbenchRouter} from './workbench-router.service';
import {expect} from '../testing/jasmine/matcher/custom-matchers.definition';
import {toShowCustomMatcher} from '../testing/jasmine/matcher/to-show.matcher';
import {advance, clickElement, styleFixture, waitForInitialWorkbenchLayout, waitUntilStable} from '../testing/testing.util';
import {WorkbenchComponent} from '../workbench.component';
import {WorkbenchRouterLinkDirective} from '../routing/workbench-router-link.directive';
import {provideWorkbenchForTest} from '../testing/workbench.provider';
import {firstValueFrom, noop, Subject} from 'rxjs';

/**
 * Test setup:
 *
 *
 *            +-------------+
 *            | Application |
 *            +-------------+
 *                  |
 *               feature-a (route)
 *                  |
 *                  v
 * +-------------------------------------+
 * | Feature A                           |
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
 * | Feature B                           |
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
      providers: [
        provideWorkbenchForTest(),
        provideRouter([
          {path: 'feature-a', loadChildren: () => routesFeatureA},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    const workbenchRouter = TestBed.inject(WorkbenchRouter);

    // Navigate to entry component of feature A
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
      providers: [
        provideWorkbenchForTest(),
        provideRouter([
          {path: 'feature-a', loadChildren: () => routesFeatureA},
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

  it('should allow parallel navigation to views', async () => {
    const canActivateView1 = new Subject<true>();

    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('left')
            .addPart('right', {align: 'right'})
            .addView('view.1', {partId: 'left'})
            .addView('view.2', {partId: 'right'})
            .activatePart('right'),
        }),
        provideRouter([
          {path: 'path/to/view/1', canActivate: [() => firstValueFrom(canActivateView1)], component: SpecView1Component},
          {path: 'path/to/view/2', component: SpecView2Component},
        ]),
      ],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();
    const workbenchRouter = TestBed.inject(WorkbenchRouter);

    // Start navigation in view 1.
    workbenchRouter.navigate(['path/to/view/1'], {target: 'view.1'}).then(noop);
    await waitUntilStable();

    // Start parallel navigation in view 2.
    workbenchRouter.navigate(['path/to/view/2'], {target: 'view.2'}).then(noop);
    await waitUntilStable();

    // First navigation should be blocked by the canActivate guard.
    expect(fixture).not.toShow(SpecView1Component);
    // Second navigation should be blocked by the first one.
    expect(fixture).not.toShow(SpecView2Component);

    // Unblock first navigation.
    canActivateView1.next(true);
    await waitUntilStable();

    // Both views should be visible.
    expect(fixture).toShow(SpecView1Component);
    expect(fixture).toShow(SpecView2Component);
  });
});

/****************************************************************************************************
 * Definition of Feature A                                                                          *
 ****************************************************************************************************/
@Component({
  template: `
    <h1>Feature A - Entry</h1>
    <ul>
      <li><a wbRouterLink="view-1">view-1</a></li>
      <li><a wbRouterLink="./view-2">./view-2</a></li>

      <li><a wbRouterLink="/feature-a/view-1">/feature-a/view-1</a></li>
      <li><a wbRouterLink="/feature-a/view-2">/feature-a/view-2</a></li>

      <li><a wbRouterLink="feature-b">feature-b</a></li>
      <li><a wbRouterLink="feature-b/view-1">feature-b/view-1</a></li>
      <li><a wbRouterLink="./feature-b/view-2">./feature-b/view-2</a></li>

      <li><a wbRouterLink="/feature-a/feature-b">/feature-a/feature-b</a></li>
      <li><a wbRouterLink="/feature-a/feature-b/view-1">/feature-a/feature-b/view-1</a></li>
      <li><a wbRouterLink="/feature-a/feature-b/view-2">/feature-a/feature-b/view-2</a></li>
    </ul>
  `,
  standalone: true,
  imports: [WorkbenchRouterLinkDirective],
})
class FeatureA_EntryComponent {
}

@Component({
  template: `
    <h1>Feature A - View 1</h1>
    <ul>
      <li><a wbRouterLink="..">..</a></li>
      <li><a wbRouterLink="../view-2">../view-2</a></li>

      <li><a wbRouterLink="../feature-b">../feature-b</a></li>
      <li><a wbRouterLink="../feature-b/view-1">../feature-b/view-1</a></li>
      <li><a wbRouterLink="../feature-b/view-2">../feature-b/view-2</a></li>

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
    <h1>Feature A - View 2</h1>
    <ul>
      <li><a wbRouterLink="..">..</a></li>
      <li><a wbRouterLink="../view-1">../view-1</a></li>
    </ul>
  `,
  standalone: true,
  imports: [WorkbenchRouterLinkDirective,
  ],
})
class FeatureA_View2Component {
}

const routesFeatureA: Routes = [
  {path: '', component: FeatureA_EntryComponent},
  {path: 'view-1', component: FeatureA_View1Component},
  {path: 'view-2', component: FeatureA_View2Component},
  {path: 'feature-b', loadChildren: () => routesFeatureB},
];

/****************************************************************************************************
 * Definition of Feature B                                                                          *
 ****************************************************************************************************/
@Component({
  template: `
    <h1>Feature B - Entry</h1>
    <ul>
      <li><a wbRouterLink="..">..</a></li>
      <li><a wbRouterLink="../..">../..</a></li>
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
    <h1>Feature B - View 1</h1>
    <ul>
      <li><a wbRouterLink="..">..</a></li>
      <li><a wbRouterLink="../..">..</a></li>
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
    <h1>Feature B - View 2</h1>
    <ul>
      <li><a wbRouterLink="..">..</a></li>
      <li><a wbRouterLink="../..">../..</a></li>
      <li><a wbRouterLink="../../view-1">../../view-1</a></li>
    </ul>
  `,
  standalone: true,
  imports: [WorkbenchRouterLinkDirective],
})
class FeatureB_View2Component {
}

const routesFeatureB: Routes = [
  {path: '', component: FeatureB_EntryComponent},
  {path: 'view-1', component: FeatureB_View1Component},
  {path: 'view-2', component: FeatureB_View2Component},
];

/****************************************************************************************************
 * View Spec Components                                                                             *
 ****************************************************************************************************/
@Component({
  selector: 'spec-view-1',
  template: '',
  standalone: true,
})
class SpecView1Component {
}

@Component({
  selector: 'spec-view-2',
  template: '',
  standalone: true,
})
class SpecView2Component {
}
