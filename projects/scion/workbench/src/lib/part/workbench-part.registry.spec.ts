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
import {PartComponent} from './part.component';
import {ɵWorkbenchPart} from './ɵworkbench-part.model';
import {WorkbenchLayoutFactory} from '../layout/workbench-layout-factory.service';
import {WorkbenchUrlObserver} from '../routing/workbench-url-observer.service';
import {WorkbenchTestingModule} from '../testing/workbench-testing.module';
import {WorkbenchPart} from './workbench-part.model';

describe('WorkbenchPartRegistry', () => {

  it('should delay emitting parts until the next layout change', async () => {
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest(),
      ],
      providers: [
        {provide: WorkbenchUrlObserver, useValue: null}, // disable WorkbenchUrlObserver
      ],
    });

    // Register part 'part.1'.
    TestBed.inject(WorkbenchPartRegistry).register(TestBed.runInInjectionContext(() => new ɵWorkbenchPart('part.1', {component: PartComponent, isInMainArea: false})));

    // Expect registry to emit registered parts upon subscription.
    const partsCaptor = new ObserveCaptor();
    TestBed.inject(WorkbenchPartRegistry).parts$.subscribe(partsCaptor);
    expect(partsCaptor.getValues()).toEqual([
      [jasmine.objectContaining<WorkbenchPart>({id: 'part.1'})],
    ]);

    // Register part 'part.2'.
    TestBed.inject(WorkbenchPartRegistry).register(TestBed.runInInjectionContext(() => new ɵWorkbenchPart('part.2', {component: PartComponent, isInMainArea: false})));
    // Register part 'part.3'.
    TestBed.inject(WorkbenchPartRegistry).register(TestBed.runInInjectionContext(() => new ɵWorkbenchPart('part.3', {component: PartComponent, isInMainArea: false})));

    // Expect registry not to emit until the next layout change.
    expect(partsCaptor.getValues()).toEqual([
      [jasmine.objectContaining<WorkbenchPart>({id: 'part.1'})],
    ]);

    // Simulate the layout to change.
    TestBed.inject(WorkbenchLayoutService).setLayout(TestBed.inject(WorkbenchLayoutFactory).create());

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
