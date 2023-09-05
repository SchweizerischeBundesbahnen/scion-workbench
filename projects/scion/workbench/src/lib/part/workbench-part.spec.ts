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
import {WorkbenchTestingModule} from '../testing/workbench-testing.module';
import {RouterTestingModule} from '@angular/router/testing';
import {TestComponent} from '../testing/test.component';
import {styleFixture, waitForInitialWorkbenchLayout} from '../testing/testing.util';
import {WorkbenchComponent} from '../workbench.component';
import {WorkbenchViewRegistry} from '../view/workbench-view.registry';
import {expect} from '../testing/jasmine/matcher/custom-matchers.definition';
import {WorkbenchPartRegistry} from './workbench-part.registry';

describe('WorkbenchPart', () => {

  it('should activate part even if view is already active', async () => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest({
          layout: factory => factory
            .addPart('left-top')
            .addPart('left-bottom', {relativeTo: 'left-top', align: 'bottom'})
            .addView('view-1', {partId: 'left-top', activateView: true})
            .addView('view-2', {partId: 'left-bottom', activateView: true})
            .activatePart('left-top'),
        }),
        RouterTestingModule.withRoutes([
          {path: '', outlet: 'view-1', component: TestComponent},
          {path: '', outlet: 'view-2', component: TestComponent},
        ]),
      ],
    });
    styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();

    // Expect part 'left-top' to be active.
    expect(TestBed.inject(WorkbenchPartRegistry).get('left-top').active).toBeTrue();
    expect(TestBed.inject(WorkbenchPartRegistry).get('left-bottom').active).toBeFalse();

    // WHEN activating already active view
    await TestBed.inject(WorkbenchViewRegistry).get('view-2').activate();

    // THEN expect part to be activated.
    expect(TestBed.inject(WorkbenchPartRegistry).get('left-top').active).toBeFalse();
    expect(TestBed.inject(WorkbenchPartRegistry).get('left-bottom').active).toBeTrue();
  });
});
