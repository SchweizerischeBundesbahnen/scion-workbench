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
import {MAIN_AREA} from '../layout/workbench-layout';
import {WorkbenchGridMerger} from './workbench-grid-merger.service';
import {MPart, MTreeNode} from '../layout/workbench-layout.model';
import {expect} from '../testing/jasmine/matcher/custom-matchers.definition';
import {ɵWorkbenchLayoutFactory} from '../layout/ɵworkbench-layout.factory';
import {ɵWorkbenchLayout} from '../layout/ɵworkbench-layout';

describe('WorkbenchGridMerger', () => {

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
    const mergedLayout = mergeLayout({local, base, remote});

    expect(mergedLayout).toEqualWorkbenchLayout({
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
    const mergedLayout = mergeLayout({
      local,
      base,
      remote: remote.addView('view.99', {partId: 'topLeft'}),
    });

    expect(mergedLayout).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          direction: 'row',
          ratio: .25,
          child1: new MTreeNode({
            direction: 'column',
            ratio: .5,
            child1: new MPart({id: 'topLeft', views: [{id: 'view.1'}, {id: 'view.2'}, {id: 'view.3'}, {id: 'view.99'}]}),
            child2: new MPart({id: 'bottomLeft', views: [{id: 'view.4'}, {id: 'view.5'}, {id: 'view.6'}]}),
          }),
          child2: new MPart({id: MAIN_AREA}),
        }),
      },
    });
  });

  it('should remove views that are removed from the remote', () => {
    const mergedLayout = mergeLayout({
      local,
      base,
      remote: remote.removeView('view.4'),
    });

    expect(mergedLayout).toEqualWorkbenchLayout({
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
    const mergedLayout = mergeLayout({
      local: local.addView('view.7', {partId: 'topLeft'}),
      base,
      remote,
    });

    expect(mergedLayout).toEqualWorkbenchLayout({
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
    const mergedLayout = mergeLayout({
      local: local.removeView('view.1'),
      base,
      remote,
    });

    expect(mergedLayout).toEqualWorkbenchLayout({
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
    const mergedLayout = mergeLayout({
      local: TestBed.inject(ɵWorkbenchLayoutFactory).create(),
      base,
      remote,
    });

    expect(mergedLayout).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MPart({id: MAIN_AREA}),
      },
    });
  });

  it('should not re-add views that are moved in the local', () => {
    const mergedLayout = mergeLayout({
      local: local.moveView('view.1', 'bottomLeft'),
      base,
      remote,
    });

    expect(mergedLayout).toEqualWorkbenchLayout({
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

  // TODO [WB-LAYOUT] fxime
  xit('should not add views of remote if local does not contain the remote part (1)', () => {
    // This test is not very useful and should be removed when implemented issue #452.
    // TODO [#452]: Support for merging newly added or moved parts into the user's layout)
    const mergedLayout = mergeLayout({
      local,
      base,
      remote: remote
        .addPart('right', {relativeTo: MAIN_AREA, align: 'right', ratio: .25})
        .addView('view.99', {partId: 'right'}),
    });

    expect(mergedLayout).toEqualWorkbenchLayout({
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

  // TODO [WB-LAYOUT] fixme
  xit('should not add views of remote if local does not contain the remote part (2)', () => {
    // This test is not very useful and should be removed when implemented issue #452.
    // TODO [#452]: Support for merging newly added or moved parts into the user's layout)
    const mergedLayout = mergeLayout({
      local: TestBed.inject(ɵWorkbenchLayoutFactory).create(),
      base: TestBed.inject(ɵWorkbenchLayoutFactory).create(),
      remote: remote,
    });

    expect(mergedLayout).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MPart({id: MAIN_AREA}),
      },
    });
  });
});

function mergeLayout(versions: {local: ɵWorkbenchLayout; base: ɵWorkbenchLayout; remote: ɵWorkbenchLayout}): ɵWorkbenchLayout {
  const mergedLayout = TestBed.inject(WorkbenchGridMerger).merge({
    local: {
      workbenchGrid: versions.local.workbenchGrid,
      viewOutlets: versions.local.viewOutlets(),
    },
    base: {
      workbenchGrid: versions.base.workbenchGrid,
      viewOutlets: versions.base.viewOutlets(),
    },
    remote: {
      workbenchGrid: versions.remote.workbenchGrid,
      viewOutlets: versions.remote.viewOutlets(),
    },
  });

  return TestBed.inject(ɵWorkbenchLayoutFactory).create({
    workbenchGrid: mergedLayout.workbenchGrid,
    viewOutlets: mergedLayout.viewOutlets,
  });
}
