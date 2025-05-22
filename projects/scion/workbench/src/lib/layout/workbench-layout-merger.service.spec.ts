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
import {any, MPart, MTreeNode, toEqualWorkbenchLayoutCustomMatcher} from '../testing/jasmine/matcher/to-equal-workbench-layout.matcher';
import {MAIN_AREA} from './workbench-layout';
import {WorkbenchLayoutMerger} from './workbench-layout-merger.service';
import {expect} from '../testing/jasmine/matcher/custom-matchers.definition';
import {ɵWorkbenchLayoutFactory} from './ɵworkbench-layout.factory';
import {segments} from '../testing/testing.util';

describe('WorkbenchLayoutMerger', () => {

  beforeEach(() => {
    jasmine.addMatchers(toEqualWorkbenchLayoutCustomMatcher);
  });

  it('should preserve local changes when no diff between base and remote', () => {
    const base = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.topLeft', {relativeTo: MAIN_AREA, align: 'left', ratio: .25})
      .addPart('part.bottomLeft', {relativeTo: 'part.topLeft', align: 'bottom', ratio: .5})
      .addView('view.1', {partId: 'part.topLeft'})
      .addView('view.2', {partId: 'part.topLeft'})
      .addView('view.3', {partId: 'part.bottomLeft'})
      .addPart('part.left', {align: 'left', ratio: .25})
      .navigatePart('part.left', ['path/to/part'])
      .navigateView('view.1', ['path/to/view/1'])
      .navigateView('view.2', ['path/to/view/2'])
      .navigateView('view.3', [], {hint: 'hint-3'});

    const mergedLayout = TestBed.inject(WorkbenchLayoutMerger).merge({
      local: base
        .removeView('view.2', {force: true})
        .addView('view.100', {partId: 'part.topLeft'})
        .addPart('part.left-bottom', {relativeTo: 'part.left', align: 'bottom'})
        .navigateView('view.100', ['path/to/view/100'])
        .navigateView('view.1', ['PATH/TO/VIEW/1'])
        .navigatePart('part.left', ['PATH/TO/PART'])
        .navigatePart('part.left-bottom', ['path/to/part']),
      base,
      remote: base,
    });

    // Expect local changes not to be discarded.
    expect(mergedLayout).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .25,
            child1: new MTreeNode({
              direction: 'column',
              ratio: .5,
              child1: new MPart({
                id: 'part.left',
                navigation: {id: any()},
              }),
              child2: new MPart({
                id: 'part.left-bottom',
                navigation: {id: any()},
              }),
            }),
            child2: new MTreeNode({
              direction: 'row',
              ratio: .25,
              child1: new MTreeNode({
                direction: 'column',
                ratio: .5,
                child1: new MPart({
                  id: 'part.topLeft',
                  views: [
                    {id: 'view.1', navigation: {id: any()}}, // additional assertion below to assert the hint not to be present
                    {id: 'view.100', navigation: {id: any()}}, // additional assertion below to assert the hint not to be present
                  ],
                }),
                child2: new MPart({
                  id: 'part.bottomLeft',
                  views: [
                    {id: 'view.3', navigation: {id: any(), hint: 'hint-3'}},
                  ],
                }),
              }),
              child2: new MPart({id: MAIN_AREA}),
            }),
          }),
        },
      },
    });

    // Expect hint not to be present.
    expect(mergedLayout.view({viewId: 'view.1'}).navigation!.hint).toBeUndefined();
    expect(mergedLayout.view({viewId: 'view.100'}).navigation!.hint).toBeUndefined();

    expect(mergedLayout.outlets({mainGrid: true, mainAreaGrid: true, activityGrids: true})).toEqual({
      'view.1': segments(['PATH/TO/VIEW/1']),
      'view.100': segments(['path/to/view/100']),
      'part.left': segments(['PATH/TO/PART']),
      'part.left-bottom': segments(['path/to/part']),
    });
  });

  /**
   * TODO [#452] The current implementation of 'WorkbenchLayoutMerger' discards local changes when a new layout is available.
   */
  it('should discard local changes when diff between base and remote grids', () => {
    const base = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.topLeft', {relativeTo: MAIN_AREA, align: 'left', ratio: .25})
      .addPart('part.bottomLeft', {relativeTo: 'part.topLeft', align: 'bottom', ratio: .5})
      .addView('view.1', {partId: 'part.topLeft'})
      .addView('view.2', {partId: 'part.topLeft'})
      .addView('view.3', {partId: 'part.bottomLeft'})
      .navigateView('view.1', ['path/to/view/1'])
      .navigateView('view.2', ['path/to/view/2'])
      .navigateView('view.3', [], {hint: 'hint-3'});

    const mergedLayout = TestBed.inject(WorkbenchLayoutMerger).merge({
      local: base
        .removeView('view.2', {force: true})
        .addView('view.100', {partId: 'part.topLeft'})
        .navigateView('view.100', ['path/to/view/100'])
        .navigateView('view.3', ['path/to/view/3']),
      base,
      remote: base
        .removeView('view.1', {force: true})
        .addView('view.100', {partId: 'part.bottomLeft'})
        .navigateView('view.100', ['PATH/TO/VIEW/100']),
    });

    // Expect local changes to be discarded.
    expect(mergedLayout).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .25,
            child1: new MTreeNode({
              direction: 'column',
              ratio: .5,
              child1: new MPart({
                id: 'part.topLeft',
                views: [
                  {id: 'view.2', navigation: {id: any()}}, // additional assertion below to assert the hint not to be present
                ],
              }),
              child2: new MPart({
                id: 'part.bottomLeft',
                views: [
                  {id: 'view.3', navigation: {id: any(), hint: 'hint-3'}},
                  {id: 'view.100', navigation: {id: any()}}, // additional assertion below to assert the hint not to be present
                ],
              }),
            }),
            child2: new MPart({id: MAIN_AREA}),
          }),
        },
      },
    });

    // Expect hint not to be present.
    expect(mergedLayout.view({viewId: 'view.2'}).navigation!.hint).toBeUndefined();
    expect(mergedLayout.view({viewId: 'view.100'}).navigation!.hint).toBeUndefined();

    expect(mergedLayout.outlets({mainGrid: true, mainAreaGrid: true, activityGrids: true})).toEqual({
      'view.2': segments(['path/to/view/2']),
      'view.100': segments(['PATH/TO/VIEW/100']),
    });
  });

  /**
   * TODO [#452] The current implementation of 'WorkbenchLayoutMerger' discards local changes when a new layout is available.
   */
  it('should discard local changes when diff between base and remote paths', () => {
    const base = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.topLeft', {relativeTo: MAIN_AREA, align: 'left', ratio: .25})
      .addPart('part.bottomLeft', {relativeTo: 'part.topLeft', align: 'bottom', ratio: .5})
      .addView('view.1', {partId: 'part.topLeft'})
      .addView('view.2', {partId: 'part.bottomLeft'})
      .navigateView('view.1', ['path/to/view/1'])
      .navigateView('view.2', ['path/to/view/2']);

    const mergedLayout = TestBed.inject(WorkbenchLayoutMerger).merge({
      local: base.navigateView('view.2', ['path/to/view/2a']),
      base,
      remote: base.navigateView('view.2', ['path/to/view/2b']),
    });

    // Expect local changes to be discarded.
    expect(mergedLayout).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .25,
            child1: new MTreeNode({
              direction: 'column',
              ratio: .5,
              child1: new MPart({
                id: 'part.topLeft',
                views: [
                  {id: 'view.1', navigation: {id: any()}}, // additional assertion below to assert the hint not to be present
                ],
              }),
              child2: new MPart({
                id: 'part.bottomLeft',
                views: [
                  {id: 'view.2', navigation: {id: any()}}, // additional assertion below to assert the hint not to be present
                ],
              }),
            }),
            child2: new MPart({id: MAIN_AREA}),
          }),
        },
      },
    });

    // Expect hint not to be present.
    expect(mergedLayout.view({viewId: 'view.1'}).navigation!.hint).toBeUndefined();
    expect(mergedLayout.view({viewId: 'view.2'}).navigation!.hint).toBeUndefined();

    expect(mergedLayout.outlets({mainGrid: true, mainAreaGrid: true, activityGrids: true})).toEqual({
      'view.1': segments(['path/to/view/1']),
      'view.2': segments(['path/to/view/2b']),
    });
  });

  /**
   * TODO [#452] The current implementation of 'WorkbenchLayoutMerger' discards local changes when a new layout is available.
   */
  it('should discard local changes when diff between base and remote hints', () => {
    const base = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.topLeft', {relativeTo: MAIN_AREA, align: 'left', ratio: .25})
      .addPart('part.bottomLeft', {relativeTo: 'part.topLeft', align: 'bottom', ratio: .5})
      .addView('view.1', {partId: 'part.topLeft'})
      .addView('view.2', {partId: 'part.bottomLeft'})
      .navigateView('view.1', ['path/to/view/1'])
      .navigateView('view.2', [], {hint: 'hint-2'});

    const mergedLayout = TestBed.inject(WorkbenchLayoutMerger).merge({
      local: base.navigateView('view.2', [], {hint: 'hint-2a'}),
      base,
      remote: base.navigateView('view.2', [], {hint: 'hint-2b'}),
    });

    // Expect local changes to be discarded.
    expect(mergedLayout).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .25,
            child1: new MTreeNode({
              direction: 'column',
              ratio: .5,
              child1: new MPart({
                id: 'part.topLeft',
                views: [
                  {id: 'view.1', navigation: {id: any()}}, // additional assertion below to assert the hint not to be present
                ],
              }),
              child2: new MPart({
                id: 'part.bottomLeft',
                views: [
                  {id: 'view.2', navigation: {id: any(), hint: 'hint-2b'}},
                ],
              }),
            }),
            child2: new MPart({id: MAIN_AREA}),
          }),
        },
      },
    });

    // Expect hint not to be present.
    expect(mergedLayout.view({viewId: 'view.1'}).navigation!.hint).toBeUndefined();

    expect(mergedLayout.outlets({mainGrid: true, mainAreaGrid: true, activityGrids: true})).toEqual({
      'view.1': segments(['path/to/view/1']),
    });
  });

  /**
   * TODO [#452] The current implementation of 'WorkbenchLayoutMerger' discards local changes when a new layout is available.
   */
  it('should discard local changes when diff between base and remote parts (navigate part in remote)', () => {
    const base = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.left', {align: 'left', ratio: .25});

    const mergedLayout = TestBed.inject(WorkbenchLayoutMerger).merge({
      local: base.addPart('part.right', {align: 'right'}),
      base,
      remote: base.navigatePart('part.left', ['path/to/part']),
    });

    // Expect local changes to be discarded.
    expect(mergedLayout).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .25,
            child1: new MPart({
              id: 'part.left',
              navigation: {id: any()},
            }),
            child2: new MPart({id: MAIN_AREA}),
          }),
        },
      },
    });

    expect(mergedLayout.outlets({mainGrid: true, mainAreaGrid: true, activityGrids: true})).toEqual({
      'part.left': segments(['path/to/part']),
    });
  });

  /**
   * TODO [#452] The current implementation of 'WorkbenchLayoutMerger' discards local changes when a new layout is available.
   */
  it('should discard local changes when diff between base and remote parts (navigate main area part in remote)', () => {
    const base = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.left', {align: 'left', ratio: .25});

    const mergedLayout = TestBed.inject(WorkbenchLayoutMerger).merge({
      local: base.addPart('part.right', {align: 'right'}),
      base,
      remote: base.navigatePart(MAIN_AREA, ['path/to/desktop']),
    });

    // Expect local changes to be discarded.
    expect(mergedLayout).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .25,
            child1: new MPart({
              id: 'part.left',
            }),
            child2: new MPart({
              id: MAIN_AREA,
              navigation: {id: any()},
            }),
          }),
        },
      },
    });

    expect(mergedLayout.outlets({mainGrid: true, mainAreaGrid: true, activityGrids: true})).toEqual({
      [MAIN_AREA]: segments(['path/to/desktop']),
    });
  });
});
