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
import {toEqualWorkbenchLayoutCustomMatcher} from '../testing/jasmine/matcher/to-equal-workbench-layout.matcher';
import {MAIN_AREA} from '../layout/workbench-layout';
import {WorkbenchGridMerger} from './workbench-grid-merger.service';
import {MPart, MTreeNode} from '../layout/workbench-layout.model';
import {expect} from '../testing/jasmine/matcher/custom-matchers.definition';
import {ɵWorkbenchLayoutFactory} from '../layout/ɵworkbench-layout.factory';
import {segments} from '../testing/testing.util';
import {provideRouter} from '@angular/router';
import {provideWorkbenchForTest} from '../testing/workbench.provider';

describe('WorkbenchGridMerger', () => {

  beforeEach(() => {
    jasmine.addMatchers(toEqualWorkbenchLayoutCustomMatcher);
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest(),
        provideRouter([]),
      ],
    });
  });

  it('should preserve local changes when no diff between base and remote', () => {
    const base = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('topLeft', {relativeTo: MAIN_AREA, align: 'left', ratio: .25})
      .addPart('bottomLeft', {relativeTo: 'topLeft', align: 'bottom', ratio: .5})
      .addView('view.1', {partId: 'topLeft'})
      .addView('view.2', {partId: 'topLeft'})
      .addView('view.3', {partId: 'bottomLeft'})
      .navigateView('view.1', ['path/to/view/1'])
      .navigateView('view.2', ['path/to/view/2'])
      .navigateView('view.3', [], {hint: 'hint-3'});

    const mergedLayout = TestBed.inject(WorkbenchGridMerger).merge({
      local: base
        .removeView('view.2')
        .addView('view.100', {partId: 'topLeft'})
        .navigateView('view.100', ['path/to/view/100'])
        .navigateView('view.1', ['PATH/TO/VIEW/1']),
      base,
      remote: base,
    });

    // Expect local changes not to be discarded.
    expect(mergedLayout).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          direction: 'row',
          ratio: .25,
          child1: new MTreeNode({
            direction: 'column',
            ratio: .5,
            child1: new MPart({
              id: 'topLeft',
              views: [
                {id: 'view.1', navigation: {}}, // additional assertion below to assert the hint not to be present
                {id: 'view.100', navigation: {}}, // additional assertion below to assert the hint not to be present
              ],
            }),
            child2: new MPart({
              id: 'bottomLeft',
              views: [
                {id: 'view.3', navigation: {hint: 'hint-3'}},
              ],
            }),
          }),
          child2: new MPart({id: MAIN_AREA}),
        }),
      },
    });

    // Expect hint not to be present.
    expect(mergedLayout.view({viewId: 'view.1'}).navigation).toEqual({});
    expect(mergedLayout.view({viewId: 'view.3'}).navigation).toEqual({hint: 'hint-3'});
    expect(mergedLayout.view({viewId: 'view.100'}).navigation).toEqual({});

    expect(mergedLayout.viewOutlets()).toEqual({
      'view.1': segments(['PATH/TO/VIEW/1']),
      'view.3': [],
      'view.100': segments(['path/to/view/100']),
    });
  });

  /**
   * TODO [#452] The current implementation of 'WorkbenchGridMerger' discards local changes when a new layout is available.
   */
  it('should discard local changes when diff between base and remote grids', () => {
    const base = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('topLeft', {relativeTo: MAIN_AREA, align: 'left', ratio: .25})
      .addPart('bottomLeft', {relativeTo: 'topLeft', align: 'bottom', ratio: .5})
      .addView('view.1', {partId: 'topLeft'})
      .addView('view.2', {partId: 'topLeft'})
      .addView('view.3', {partId: 'bottomLeft'})
      .navigateView('view.1', ['path/to/view/1'])
      .navigateView('view.2', ['path/to/view/2'])
      .navigateView('view.3', [], {hint: 'hint-3'});

    const mergedLayout = TestBed.inject(WorkbenchGridMerger).merge({
      local: base
        .removeView('view.2')
        .addView('view.100', {partId: 'topLeft'})
        .navigateView('view.100', ['path/to/view/100'])
        .navigateView('view.3', ['path/to/view/3']),
      base,
      remote: base
        .removeView('view.1')
        .addView('view.100', {partId: 'bottomLeft'})
        .navigateView('view.100', ['PATH/TO/VIEW/100']),
    });

    // Expect local changes to be discarded.
    expect(mergedLayout).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          direction: 'row',
          ratio: .25,
          child1: new MTreeNode({
            direction: 'column',
            ratio: .5,
            child1: new MPart({
              id: 'topLeft',
              views: [
                {id: 'view.2', navigation: {}}, // additional assertion below to assert the hint not to be present
              ],
            }),
            child2: new MPart({
              id: 'bottomLeft',
              views: [
                {id: 'view.3', navigation: {hint: 'hint-3'}},
                {id: 'view.100', navigation: {}}, // additional assertion below to assert the hint not to be present
              ],
            }),
          }),
          child2: new MPart({id: MAIN_AREA}),
        }),
      },
    });

    // Expect hint not to be present.
    expect(mergedLayout.view({viewId: 'view.2'}).navigation).toEqual({});
    expect(mergedLayout.view({viewId: 'view.3'}).navigation).toEqual({hint: 'hint-3'});
    expect(mergedLayout.view({viewId: 'view.100'}).navigation).toEqual({});

    expect(mergedLayout.viewOutlets()).toEqual({
      'view.2': segments(['path/to/view/2']),
      'view.3': [],
      'view.100': segments(['PATH/TO/VIEW/100']),
    });
  });

  /**
   * TODO [#452] The current implementation of 'WorkbenchGridMerger' discards local changes when a new layout is available.
   */
  it('should discard local changes when diff between base and remote paths', () => {
    const base = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('topLeft', {relativeTo: MAIN_AREA, align: 'left', ratio: .25})
      .addPart('bottomLeft', {relativeTo: 'topLeft', align: 'bottom', ratio: .5})
      .addView('view.1', {partId: 'topLeft'})
      .addView('view.2', {partId: 'bottomLeft'})
      .navigateView('view.1', ['path/to/view/1'])
      .navigateView('view.2', ['path/to/view/2']);

    const mergedLayout = TestBed.inject(WorkbenchGridMerger).merge({
      local: base.navigateView('view.2', ['path/to/view/2a']),
      base,
      remote: base.navigateView('view.2', ['path/to/view/2b']),
    });

    // Expect local changes to be discarded.
    expect(mergedLayout).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          direction: 'row',
          ratio: .25,
          child1: new MTreeNode({
            direction: 'column',
            ratio: .5,
            child1: new MPart({
              id: 'topLeft',
              views: [
                {id: 'view.1', navigation: {}}, // additional assertion below to assert the hint not to be present
              ],
            }),
            child2: new MPart({
              id: 'bottomLeft',
              views: [
                {id: 'view.2', navigation: {}}, // additional assertion below to assert the hint not to be present
              ],
            }),
          }),
          child2: new MPart({id: MAIN_AREA}),
        }),
      },
    });

    // Expect hint not to be present.
    expect(mergedLayout.view({viewId: 'view.1'}).navigation).toEqual({});
    expect(mergedLayout.view({viewId: 'view.2'}).navigation).toEqual({});

    expect(mergedLayout.viewOutlets()).toEqual({
      'view.1': segments(['path/to/view/1']),
      'view.2': segments(['path/to/view/2b']),
    });
  });

  /**
   * TODO [#452] The current implementation of 'WorkbenchGridMerger' discards local changes when a new layout is available.
   */
  it('should discard local changes when diff between base and remote hints', () => {
    const base = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('topLeft', {relativeTo: MAIN_AREA, align: 'left', ratio: .25})
      .addPart('bottomLeft', {relativeTo: 'topLeft', align: 'bottom', ratio: .5})
      .addView('view.1', {partId: 'topLeft'})
      .addView('view.2', {partId: 'bottomLeft'})
      .navigateView('view.1', ['path/to/view/1'])
      .navigateView('view.2', [], {hint: 'hint-2'});

    const mergedLayout = TestBed.inject(WorkbenchGridMerger).merge({
      local: base.navigateView('view.2', [], {hint: 'hint-2a'}),
      base,
      remote: base.navigateView('view.2', [], {hint: 'hint-2b'}),
    });

    // Expect local changes to be discarded.
    expect(mergedLayout).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          direction: 'row',
          ratio: .25,
          child1: new MTreeNode({
            direction: 'column',
            ratio: .5,
            child1: new MPart({
              id: 'topLeft',
              views: [
                {id: 'view.1', navigation: {}}, // additional assertion below to assert the hint not to be present
              ],
            }),
            child2: new MPart({
              id: 'bottomLeft',
              views: [
                {id: 'view.2', navigation: {hint: 'hint-2b'}},
              ],
            }),
          }),
          child2: new MPart({id: MAIN_AREA}),
        }),
      },
    });

    // Expect hint not to be present.
    expect(mergedLayout.view({viewId: 'view.1'}).navigation).toEqual({});
    expect(mergedLayout.view({viewId: 'view.2'}).navigation).toEqual({hint: 'hint-2b'});

    expect(mergedLayout.viewOutlets()).toEqual({
      'view.1': segments(['path/to/view/1']),
      'view.2': [],
    });
  });
});
