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
import {toEqualWorkbenchLayoutCustomMatcher} from '../testing/jasmine/matcher/to-equal-workbench-layout.matcher';
import {ɵWorkbenchLayout} from '../layout/ɵworkbench-layout';
import {MAIN_AREA} from '../layout/workbench-layout';
import {WorkbenchGridMerger} from './workbench-grid-merger.service';
import {MPart, MTreeNode} from '../layout/workbench-layout.model';
import {expect} from '../testing/jasmine/matcher/custom-matchers.definition';
import {ɵWorkbenchLayoutFactory} from '../layout/ɵworkbench-layout.factory';

describe('WorkbenchGridMerger', () => {

  let workbenchGridMerger: WorkbenchGridMerger;

  let local: ɵWorkbenchLayout;
  let base: ɵWorkbenchLayout;
  let remote: ɵWorkbenchLayout;

  beforeEach(() => {
    jasmine.addMatchers(toEqualWorkbenchLayoutCustomMatcher);
    TestBed.configureTestingModule({
      imports: [
        WorkbenchTestingModule.forTest(),
        RouterTestingModule.withRoutes([]),
      ],
    });

    workbenchGridMerger = TestBed.inject(WorkbenchGridMerger);

    local = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('topLeft', {relativeTo: MAIN_AREA, align: 'left', ratio: .25})
      .addPart('bottomLeft', {relativeTo: 'topLeft', align: 'bottom', ratio: .5})
      .addView('view.1', {partId: 'topLeft'})
      .addView('view.2', {partId: 'topLeft'})
      .addView('view.3', {partId: 'topLeft'})
      .addView('view.4', {partId: 'bottomLeft'})
      .addView('view.5', {partId: 'bottomLeft'})
      .addView('view.6', {partId: 'bottomLeft'});
    base = local;
    remote = local;
  });

  it('should do nothing if no diff between remote and base', () => {
    const mergedGrid = TestBed.inject(ɵWorkbenchLayoutFactory).create({
      workbenchGrid: workbenchGridMerger.merge({
        local: local.workbenchGrid,
        base: base.workbenchGrid,
        remote: remote.workbenchGrid,
      }),
    });
    expect(mergedGrid).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          direction: 'row',
          ratio: .25,
          child1: new MTreeNode({
            direction: 'column',
            ratio: .5,
            child1: new MPart({id: 'topLeft', views: [{id: 'view.1'}, {id: 'view.2'}, {id: 'view.3'}]}),
            child2: new MPart({id: 'bottomLeft', views: [{id: 'view.4'}, {id: 'view.5'}, {id: 'view.6'}]}),
          }),
          child2: new MPart({id: MAIN_AREA}),
        }),
      },
    });
  });

  it('should add views that are added to the remote', () => {
    const mergedGrid = TestBed.inject(ɵWorkbenchLayoutFactory).create({
      workbenchGrid: workbenchGridMerger.merge({
        local: local.workbenchGrid,
        base: base.workbenchGrid,
        remote: remote.addView('view.7', {partId: 'topLeft'}).workbenchGrid,
      }),
    });
    expect(mergedGrid).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          direction: 'row',
          ratio: .25,
          child1: new MTreeNode({
            direction: 'column',
            ratio: .5,
            child1: new MPart({id: 'topLeft', views: [{id: 'view.1'}, {id: 'view.2'}, {id: 'view.3'}, {id: 'view.7'}]}),
            child2: new MPart({id: 'bottomLeft', views: [{id: 'view.4'}, {id: 'view.5'}, {id: 'view.6'}]}),
          }),
          child2: new MPart({id: MAIN_AREA}),
        }),
      },
    });
  });

  it('should remove views that are removed from the remote', () => {
    const mergedGrid = TestBed.inject(ɵWorkbenchLayoutFactory).create({
      workbenchGrid: workbenchGridMerger.merge({
        local: local.workbenchGrid,
        base: base.workbenchGrid,
        remote: remote.removeView('view.4').workbenchGrid,
      }),
    });
    expect(mergedGrid).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          direction: 'row',
          ratio: .25,
          child1: new MTreeNode({
            direction: 'column',
            ratio: .5,
            child1: new MPart({id: 'topLeft', views: [{id: 'view.1'}, {id: 'view.2'}, {id: 'view.3'}]}),
            child2: new MPart({id: 'bottomLeft', views: [{id: 'view.5'}, {id: 'view.6'}]}),
          }),
          child2: new MPart({id: MAIN_AREA}),
        }),
      },
    });
  });

  it('should not remove views that are added to the local', () => {
    const mergedGrid = TestBed.inject(ɵWorkbenchLayoutFactory).create({
      workbenchGrid: workbenchGridMerger.merge({
        local: local.addView('view.7', {partId: 'topLeft'}).workbenchGrid,
        base: base.workbenchGrid,
        remote: remote.workbenchGrid,
      }),
    });
    expect(mergedGrid).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          direction: 'row',
          ratio: .25,
          child1: new MTreeNode({
            direction: 'column',
            ratio: .5,
            child1: new MPart({id: 'topLeft', views: [{id: 'view.1'}, {id: 'view.2'}, {id: 'view.3'}, {id: 'view.7'}]}),
            child2: new MPart({id: 'bottomLeft', views: [{id: 'view.4'}, {id: 'view.5'}, {id: 'view.6'}]}),
          }),
          child2: new MPart({id: MAIN_AREA}),
        }),
      },
    });
  });

  it('should not re-add views that are removed from the local (1)', () => {
    const mergedGrid = TestBed.inject(ɵWorkbenchLayoutFactory).create({
      workbenchGrid: workbenchGridMerger.merge({
        local: local.removeView('view.1').workbenchGrid,
        base: base.workbenchGrid,
        remote: remote.workbenchGrid,
      }),
    });
    expect(mergedGrid).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          direction: 'row',
          ratio: .25,
          child1: new MTreeNode({
            direction: 'column',
            ratio: .5,
            child1: new MPart({id: 'topLeft', views: [{id: 'view.2'}, {id: 'view.3'}]}),
            child2: new MPart({id: 'bottomLeft', views: [{id: 'view.4'}, {id: 'view.5'}, {id: 'view.6'}]}),
          }),
          child2: new MPart({id: MAIN_AREA}),
        }),
      },
    });
  });

  it('should not re-add views that are removed from the local (2)', () => {
    const mergedGrid = TestBed.inject(ɵWorkbenchLayoutFactory).create({
      workbenchGrid: workbenchGridMerger.merge({
        local: {root: new MPart({id: MAIN_AREA}), activePartId: MAIN_AREA},
        base: remote.workbenchGrid,
        remote: remote.workbenchGrid,
      }),
    });
    expect(mergedGrid).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MPart({id: MAIN_AREA}),
      },
    });
  });

  it('should not re-add views that are moved in the local', () => {
    const mergedGrid = TestBed.inject(ɵWorkbenchLayoutFactory).create({
      workbenchGrid: workbenchGridMerger.merge({
        local: local.moveView('view.1', 'bottomLeft').workbenchGrid,
        base: base.workbenchGrid,
        remote: remote.workbenchGrid,
      }),
    });
    expect(mergedGrid).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          direction: 'row',
          ratio: .25,
          child1: new MTreeNode({
            direction: 'column',
            ratio: .5,
            child1: new MPart({id: 'topLeft', views: [{id: 'view.2'}, {id: 'view.3'}]}),
            child2: new MPart({id: 'bottomLeft', views: [{id: 'view.4'}, {id: 'view.5'}, {id: 'view.6'}, {id: 'view.1'}]}),
          }),
          child2: new MPart({id: MAIN_AREA}),
        }),
      },
    });
  });

  it('should add views of new remote parts to "any" local part (1)', () => {
    // This test is not very useful and should be removed when implemented issue #452.
    // TODO [#452]: Support for merging newly added or moved parts into the user's layout)
    const mergedGrid = TestBed.inject(ɵWorkbenchLayoutFactory).create({
      workbenchGrid: workbenchGridMerger.merge({
        local: local.workbenchGrid,
        base: base.workbenchGrid,
        remote: remote.addPart('right', {relativeTo: MAIN_AREA, align: 'right', ratio: .25}).addView('view.7', {partId: 'right'}).workbenchGrid,
      }),
    });
    expect(mergedGrid).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          direction: 'row',
          ratio: .25,
          child1: new MTreeNode({
            direction: 'column',
            ratio: .5,
            child1: new MPart({id: 'topLeft', views: [{id: 'view.1'}, {id: 'view.2'}, {id: 'view.3'}, {id: 'view.7'}]}),
            child2: new MPart({id: 'bottomLeft', views: [{id: 'view.4'}, {id: 'view.5'}, {id: 'view.6'}]}),
          }),
          child2: new MPart({id: MAIN_AREA}),
        }),
      },
    });
  });

  it('should add views of new remote parts to "any" local part (2)', () => {
    // This test is not very useful and should be removed when implemented issue #452.
    // TODO [#452]: Support for merging newly added or moved parts into the user's layout)
    const mergedGrid = TestBed.inject(ɵWorkbenchLayoutFactory).create({
      workbenchGrid: workbenchGridMerger.merge({
        local: {root: new MPart({id: MAIN_AREA}), activePartId: MAIN_AREA},
        base: {root: new MPart({id: MAIN_AREA}), activePartId: MAIN_AREA},
        remote: remote.workbenchGrid,
      }),
    });
    expect(mergedGrid).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          direction: 'row',
          ratio: .5,
          child1: new MPart({id: 'topLeft', views: [{id: 'view.1'}, {id: 'view.2'}, {id: 'view.3'}, {id: 'view.4'}, {id: 'view.5'}, {id: 'view.6'}]}),
          child2: new MPart({id: MAIN_AREA}),
        }),
      },
    });
  });
});
