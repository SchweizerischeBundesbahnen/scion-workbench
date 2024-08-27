/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {TestBed} from '@angular/core/testing';
import {TestComponent} from '../testing/test.component';
import {styleFixture, waitForInitialWorkbenchLayout, waitUntilStable} from '../testing/testing.util';
import {WorkbenchComponent} from '../workbench.component';
import {WORKBENCH_VIEW_REGISTRY} from '../view/workbench-view.registry';
import {expect} from '../testing/jasmine/matcher/custom-matchers.definition';
import {WORKBENCH_PART_REGISTRY} from './workbench-part.registry';
import {provideRouter} from '@angular/router';
import {provideWorkbenchForTest} from '../testing/workbench.provider';
import {DestroyRef} from '@angular/core';
import {WorkbenchRouter} from '../routing/workbench-router.service';

describe('WorkbenchPart', () => {

  it('should destroy handle\'s injector when removing the part', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
      ],
    });
    styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();

    // Add part to the right.
    await TestBed.inject(WorkbenchRouter).navigate(layout => layout.addPart('right', {align: 'right'}));
    await waitUntilStable();

    // Get reference to the part injector.
    const part = TestBed.inject(WORKBENCH_PART_REGISTRY).get('right');
    let injectorDestroyed = false;
    part.injector.get(DestroyRef).onDestroy(() => injectorDestroyed = true);

    // Remove the part.
    await TestBed.inject(WorkbenchRouter).navigate(layout => layout.removePart('right'));
    await waitUntilStable();

    // Expect the injector to be destroyed.
    expect(injectorDestroyed).toBeTrue();
  });

  it('should activate part even if view is already active', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          layout: factory => factory
            .addPart('left-top')
            .addPart('left-bottom', {relativeTo: 'left-top', align: 'bottom'})
            .addView('view.101', {partId: 'left-top'})
            .addView('view.102', {partId: 'left-bottom'})
            .navigateView('view.101', ['test-page'])
            .navigateView('view.102', ['test-page'])
            .activatePart('left-top'),
        }),
        provideRouter([
          {path: 'test-page', component: TestComponent},
        ]),
      ],
    });
    styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();

    // Expect part 'left-top' to be active.
    expect(TestBed.inject(WORKBENCH_PART_REGISTRY).get('left-top').active()).toBeTrue();
    expect(TestBed.inject(WORKBENCH_PART_REGISTRY).get('left-bottom').active()).toBeFalse();

    // WHEN activating already active view
    await TestBed.inject(WORKBENCH_VIEW_REGISTRY).get('view.102').activate();

    // THEN expect part to be activated.
    expect(TestBed.inject(WORKBENCH_PART_REGISTRY).get('left-top').active()).toBeFalse();
    expect(TestBed.inject(WORKBENCH_PART_REGISTRY).get('left-bottom').active()).toBeTrue();
  });
});
