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
import {expect, partialMPart, partialMTreeNode} from '../testing/jasmine/matcher/custom-matchers.definition';
import {toEqualWorkbenchLayoutCustomMatcher} from '../testing/jasmine/matcher/to-equal-workbench-layout.matcher';
import {ɵWorkbenchLayout} from '../layout/ɵworkbench-layout';
import {WorkbenchLayoutFactory} from '../layout/workbench-layout-factory.service';
import {MAIN_AREA_PART_ID} from '../layout/workbench-layout';
import {WorkbenchPeripheralGridMerger} from './workbench-peripheral-grid-merger.service';
import {MPartGrid} from '../layout/workbench-layout.model';

describe('WorkbenchPeripheralGridMerger', () => {

  let peripheralGridMerger: WorkbenchPeripheralGridMerger;

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

    peripheralGridMerger = TestBed.inject(WorkbenchPeripheralGridMerger);

    local = TestBed.inject(WorkbenchLayoutFactory).create()
      .addPart('topLeft', {relativeTo: MAIN_AREA_PART_ID, align: 'left', ratio: .25})
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
    const mergedLayout = createPeripheralLayout(peripheralGridMerger.merge({
      local: local.peripheralGrid,
      base: base.peripheralGrid,
      remote: remote.peripheralGrid,
    }));
    expect(mergedLayout).toEqualWorkbenchLayout({
      peripheralGrid: {
        root: partialMTreeNode({
          direction: 'row',
          ratio: .25,
          child1: partialMTreeNode({
            direction: 'column',
            ratio: .5,
            child1: partialMPart({id: 'topLeft', views: [{id: 'view.1'}, {id: 'view.2'}, {id: 'view.3'}]}),
            child2: partialMPart({id: 'bottomLeft', views: [{id: 'view.4'}, {id: 'view.5'}, {id: 'view.6'}]}),
          }),
          child2: partialMPart({id: MAIN_AREA_PART_ID}),
        }),
      },
    });
  });

  it('should add views that are added to the remote', () => {
    const mergedGrid = createPeripheralLayout(peripheralGridMerger.merge({
      local: local.peripheralGrid,
      base: base.peripheralGrid,
      remote: remote.addView('view.7', {partId: 'topLeft'}).peripheralGrid,
    }));
    expect(mergedGrid).toEqualWorkbenchLayout({
      peripheralGrid: {
        root: partialMTreeNode({
          direction: 'row',
          ratio: .25,
          child1: partialMTreeNode({
            direction: 'column',
            ratio: .5,
            child1: partialMPart({id: 'topLeft', views: [{id: 'view.1'}, {id: 'view.2'}, {id: 'view.3'}, {id: 'view.7'}]}),
            child2: partialMPart({id: 'bottomLeft', views: [{id: 'view.4'}, {id: 'view.5'}, {id: 'view.6'}]}),
          }),
          child2: partialMPart({id: MAIN_AREA_PART_ID}),
        }),
      },
    });
  });

  it('should remove views that are removed from the remote', () => {
    const mergedGrid = createPeripheralLayout(peripheralGridMerger.merge({
      local: local.peripheralGrid,
      base: base.peripheralGrid,
      remote: remote.removeView('view.4').peripheralGrid,
    }));
    expect(mergedGrid).toEqualWorkbenchLayout({
      peripheralGrid: {
        root: partialMTreeNode({
          direction: 'row',
          ratio: .25,
          child1: partialMTreeNode({
            direction: 'column',
            ratio: .5,
            child1: partialMPart({id: 'topLeft', views: [{id: 'view.1'}, {id: 'view.2'}, {id: 'view.3'}]}),
            child2: partialMPart({id: 'bottomLeft', views: [{id: 'view.5'}, {id: 'view.6'}]}),
          }),
          child2: partialMPart({id: MAIN_AREA_PART_ID}),
        }),
      },
    });
  });

  it('should not remove views that are added to the local', () => {
    const mergedGrid = createPeripheralLayout(peripheralGridMerger.merge({
      local: local.addView('view.7', {partId: 'topLeft'}).peripheralGrid,
      base: base.peripheralGrid,
      remote: remote.peripheralGrid,
    }));
    expect(mergedGrid).toEqualWorkbenchLayout({
      peripheralGrid: {
        root: partialMTreeNode({
          direction: 'row',
          ratio: .25,
          child1: partialMTreeNode({
            direction: 'column',
            ratio: .5,
            child1: partialMPart({id: 'topLeft', views: [{id: 'view.1'}, {id: 'view.2'}, {id: 'view.3'}, {id: 'view.7'}]}),
            child2: partialMPart({id: 'bottomLeft', views: [{id: 'view.4'}, {id: 'view.5'}, {id: 'view.6'}]}),
          }),
          child2: partialMPart({id: MAIN_AREA_PART_ID}),
        }),
      },
    });
  });

  it('should not re-add views that are removed from the local (1)', () => {
    const mergedGrid = createPeripheralLayout(peripheralGridMerger.merge({
      local: local.removeView('view.1').peripheralGrid,
      base: base.peripheralGrid,
      remote: remote.peripheralGrid,
    }));
    expect(mergedGrid).toEqualWorkbenchLayout({
      peripheralGrid: {
        root: partialMTreeNode({
          direction: 'row',
          ratio: .25,
          child1: partialMTreeNode({
            direction: 'column',
            ratio: .5,
            child1: partialMPart({id: 'topLeft', views: [{id: 'view.2'}, {id: 'view.3'}]}),
            child2: partialMPart({id: 'bottomLeft', views: [{id: 'view.4'}, {id: 'view.5'}, {id: 'view.6'}]}),
          }),
          child2: partialMPart({id: MAIN_AREA_PART_ID}),
        }),
      },
    });
  });

  it('should not re-add views that are removed from the local (2)', () => {
    const mergedGrid = createPeripheralLayout(peripheralGridMerger.merge({
      local: null,
      base: remote.peripheralGrid,
      remote: remote.peripheralGrid,
    }));
    expect(mergedGrid).toEqualWorkbenchLayout({
      peripheralGrid: {
        root: partialMPart({id: MAIN_AREA_PART_ID}),
      },
    });
  });

  it('should not re-add views that are moved in the local', () => {
    const mergedGrid = createPeripheralLayout(peripheralGridMerger.merge({
      local: local.moveView('view.1', 'bottomLeft').peripheralGrid,
      base: base.peripheralGrid,
      remote: remote.peripheralGrid,
    }));
    expect(mergedGrid).toEqualWorkbenchLayout({
      peripheralGrid: {
        root: partialMTreeNode({
          direction: 'row',
          ratio: .25,
          child1: partialMTreeNode({
            direction: 'column',
            ratio: .5,
            child1: partialMPart({id: 'topLeft', views: [{id: 'view.2'}, {id: 'view.3'}]}),
            child2: partialMPart({id: 'bottomLeft', views: [{id: 'view.4'}, {id: 'view.5'}, {id: 'view.6'}, {id: 'view.1'}]}),
          }),
          child2: partialMPart({id: MAIN_AREA_PART_ID}),
        }),
      },
    });
  });

  it('should add views to any part if added to unkown part in the remote', () => {
    const mergedGrid = createPeripheralLayout(peripheralGridMerger.merge({
      local: local.peripheralGrid,
      base: base.peripheralGrid,
      remote: remote.addPart('right', {relativeTo: MAIN_AREA_PART_ID, align: 'right', ratio: .25}).addView('view.7', {partId: 'right'}).peripheralGrid,
    }));
    expect(mergedGrid).toEqualWorkbenchLayout({
      peripheralGrid: {
        root: partialMTreeNode({
          direction: 'row',
          ratio: .25,
          child1: partialMTreeNode({
            direction: 'column',
            ratio: .5,
            child1: partialMPart({id: 'topLeft', views: [{id: 'view.1'}, {id: 'view.2'}, {id: 'view.3'}, {id: 'view.7'}]}),
            child2: partialMPart({id: 'bottomLeft', views: [{id: 'view.4'}, {id: 'view.5'}, {id: 'view.6'}]}),
          }),
          child2: partialMPart({id: MAIN_AREA_PART_ID}),
        }),
      },
    });
  });

  it('should add views to new part in the left if local grid is empty', () => {
    const mergedGrid = createPeripheralLayout(peripheralGridMerger.merge({
      local: null,
      base: null,
      remote: remote.peripheralGrid,
    }));
    expect(mergedGrid).toEqualWorkbenchLayout({
      peripheralGrid: {
        root: partialMTreeNode({
          direction: 'row',
          ratio: .5,
          child1: partialMPart({id: 'topLeft', views: [{id: 'view.1'}, {id: 'view.2'}, {id: 'view.3'}, {id: 'view.4'}, {id: 'view.5'}, {id: 'view.6'}]}),
          child2: partialMPart({id: MAIN_AREA_PART_ID}),
        }),
      },
    });
  });
});

function createPeripheralLayout(peripheralGrid: MPartGrid): ɵWorkbenchLayout {
  return TestBed.inject(WorkbenchLayoutFactory).create({peripheralGrid});
}
