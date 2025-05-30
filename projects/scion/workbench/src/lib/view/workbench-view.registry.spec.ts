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
import {WORKBENCH_VIEW_REGISTRY} from './workbench-view.registry';
import {expect} from '../testing/jasmine/matcher/custom-matchers.definition';
import {WorkbenchRouter} from '../routing/workbench-router.service';
import {TestComponent} from '../testing/test.component';
import {provideRouter} from '@angular/router';
import {provideWorkbenchForTest} from '../testing/workbench.provider';
import {effect} from '@angular/core';

describe('WorkbenchViewRegistry', () => {

  it('should have part associated when views are emitted', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({mainAreaInitialPartId: 'part.initial'}),
        provideRouter([
          {path: 'test-view', component: TestComponent},
        ]),
      ],
    });

    // Listen to view changes (before routing).
    const captor = new Array<string[]>();
    TestBed.runInInjectionContext(() => effect(() => {
      captor.push(TestBed.inject(WORKBENCH_VIEW_REGISTRY).objects().map(view => view.part().id));
    }));
    TestBed.tick(); // flush effects
    expect(captor).toEqual([[]]);

    // Open view in the right part.
    await TestBed.inject(WorkbenchRouter).navigate(layout => layout
      .addPart('part.right', {relativeTo: 'part.initial', align: 'right'})
      .addView('view', {partId: 'part.right'})
      .navigateView('view', ['test-view']),
    );

    // Expect the part to be resolved.
    expect(captor).toEqual([[], ['part.right']]);
  });
});
