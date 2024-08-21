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
import {WorkbenchPartRegistry} from './workbench-part.registry';
import {ObserveCaptor} from '@scion/toolkit/testing';
import {expect} from '../testing/jasmine/matcher/custom-matchers.definition';
import {WorkbenchLayoutService} from '../layout/workbench-layout.service';
import {WorkbenchUrlObserver} from '../routing/workbench-url-observer.service';
import {WorkbenchPart} from './workbench-part.model';
import {ɵWorkbenchLayoutFactory} from '../layout/ɵworkbench-layout.factory';
import {provideWorkbenchForTest} from '../testing/workbench.provider';

describe('WorkbenchPartRegistry', () => {

  it('should delay emitting parts until the next layout change', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        {provide: WorkbenchUrlObserver, useValue: null}, // disable WorkbenchUrlObserver
      ],
    });

    // Register part 'part.1'.
    TestBed.inject(WorkbenchPartRegistry).register(jasmine.createSpyObj('ɵWorkbenchPart', ['destroy'], {id: 'part.1'}));

    // Expect registry to emit registered parts upon subscription.
    const partsCaptor = new ObserveCaptor();
    TestBed.inject(WorkbenchPartRegistry).parts$.subscribe(partsCaptor);
    expect(partsCaptor.getValues()).toEqual([
      [jasmine.objectContaining<WorkbenchPart>({id: 'part.1'})],
    ]);

    // Register part 'part.2'.
    TestBed.inject(WorkbenchPartRegistry).register(jasmine.createSpyObj('ɵWorkbenchPart', ['destroy'], {id: 'part.2'}));
    // Register part 'part.3'.
    TestBed.inject(WorkbenchPartRegistry).register(jasmine.createSpyObj('ɵWorkbenchPart', ['destroy'], {id: 'part.3'}));

    // Expect registry not to emit until the next layout change.
    expect(partsCaptor.getValues()).toEqual([
      [jasmine.objectContaining<WorkbenchPart>({id: 'part.1'})],
    ]);

    // Simulate the layout to change.
    TestBed.inject(WorkbenchLayoutService).setLayout(TestBed.inject(ɵWorkbenchLayoutFactory).create());

    // Expect registry to emit registered parts.
    expect(partsCaptor.getValues()).toEqual([
      [
        jasmine.objectContaining<WorkbenchPart>({id: 'part.1'}),
      ],
      [
        jasmine.objectContaining<WorkbenchPart>({id: 'part.1'}),
        jasmine.objectContaining<WorkbenchPart>({id: 'part.2'}),
        jasmine.objectContaining<WorkbenchPart>({id: 'part.3'}),
      ],
    ]);
  });
});
