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
import {WorkbenchViewRegistry} from './workbench-view.registry';
import {ObserveCaptor} from '@scion/toolkit/testing';
import {expect} from '../testing/jasmine/matcher/custom-matchers.definition';
import {WorkbenchView} from '../view/workbench-view.model';
import {WorkbenchLayoutService} from '../layout/workbench-layout.service';
import {WorkbenchUrlObserver} from '../routing/workbench-url-observer.service';
import {WorkbenchRouter} from '../routing/workbench-router.service';
import {TestComponent} from '../testing/test.component';
import {mapArray} from '@scion/toolkit/operators';
import {ɵWorkbenchLayoutFactory} from '../layout/ɵworkbench-layout.factory';
import {provideRouter} from '@angular/router';
import {provideWorkbenchForTest} from '../testing/workbench.provider';

describe('WorkbenchViewRegistry', () => {

  it('should delay emitting views until the next layout change', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        {provide: WorkbenchUrlObserver, useValue: null}, // disable WorkbenchUrlObserver
      ],
    });

    // Register view 'view.1'.
    TestBed.inject(WorkbenchViewRegistry).register(jasmine.createSpyObj('ɵWorkbenchView', ['destroy'], {id: 'view.1'}));

    // Expect registry to emit registered views upon subscription.
    const viewsCaptor = new ObserveCaptor();
    TestBed.inject(WorkbenchViewRegistry).views$.subscribe(viewsCaptor);
    expect(viewsCaptor.getValues()).toEqual([
      [jasmine.objectContaining<WorkbenchView>({id: 'view.1'})],
    ]);

    // Register view 'view.2'.
    TestBed.inject(WorkbenchViewRegistry).register(jasmine.createSpyObj('ɵWorkbenchView', ['destroy'], {id: 'view.2'}));
    // Register view 'view.3'.
    TestBed.inject(WorkbenchViewRegistry).register(jasmine.createSpyObj('ɵWorkbenchView', ['destroy'], {id: 'view.3'}));

    // Expect registry not to emit until the next layout change.
    expect(viewsCaptor.getValues()).toEqual([
      [jasmine.objectContaining<WorkbenchView>({id: 'view.1'})],
    ]);

    // Simulate the layout to change.
    TestBed.inject(WorkbenchLayoutService).setLayout(TestBed.inject(ɵWorkbenchLayoutFactory).create());

    // Expect registry to emit registered views.
    expect(viewsCaptor.getValues()).toEqual([
      [
        jasmine.objectContaining<WorkbenchView>({id: 'view.1'}),
      ],
      [
        jasmine.objectContaining<WorkbenchView>({id: 'view.1'}),
        jasmine.objectContaining<WorkbenchView>({id: 'view.2'}),
        jasmine.objectContaining<WorkbenchView>({id: 'view.3'}),
      ],
    ]);
  });

  it('should have part associated when views are emitted', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({mainAreaInitialPartId: 'main'}),
        provideRouter([
          {path: 'test-view', component: TestComponent},
        ]),
      ],
    });

    // Subscribe for view changes (before routing).
    const captor = new ObserveCaptor<string[]>();
    TestBed.inject(WorkbenchViewRegistry).views$.pipe(mapArray(view => view.part().id)).subscribe(captor);

    // Open view in the right part.
    await TestBed.inject(WorkbenchRouter).navigate(layout => layout
      .addPart('right', {relativeTo: 'main', align: 'right'})
      .addView('view', {partId: 'right'})
      .navigateView('view', ['test-view']),
    );

    // Expect the part to be resolved when `WorkbenchViewRegistry.views$` emits.
    expect(captor.hasErrored()).toBeFalse();
    expect(captor.getLastValue()).toEqual(['right']);
  });
});
