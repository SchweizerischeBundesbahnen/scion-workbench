/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {MAIN_AREA_INITIAL_PART_ID, PartActivationInstantProvider, ViewActivationInstantProvider, ɵWorkbenchLayout} from './ɵworkbench-layout';
import {MAIN_AREA, WorkbenchLayout} from './workbench-layout';
import {any, MPart, MTreeNode, toEqualWorkbenchLayoutCustomMatcher} from '../testing/jasmine/matcher/to-equal-workbench-layout.matcher';
import {expect} from '../testing/jasmine/matcher/custom-matchers.definition';
import {TestBed} from '@angular/core/testing';
import {WorkbenchLayoutFactory} from './workbench-layout.factory';
import {ɵWorkbenchLayoutFactory} from './ɵworkbench-layout.factory';
import {UrlSegmentMatcher} from '../routing/url-segment-matcher';
import {anything, segments, styleFixture, waitUntilStable, waitUntilWorkbenchStarted} from '../testing/testing.util';
import {MPart as _MPart, MTreeNode as _MTreeNode, MView, WorkbenchGrids} from './workbench-grid.model';
import {WorkbenchRouter} from '../routing/workbench-router.service';
import {provideRouter} from '@angular/router';
import {TestComponent} from '../testing/test.component';
import {ɵWorkbenchService} from '../ɵworkbench.service';
import {WorkbenchComponent} from '../workbench.component';
import {provideWorkbenchForTest} from '../testing/workbench.provider';
import {WorkbenchService} from '../workbench.service';
import {PartId} from '../part/workbench-part.model';
import {ACTIVITY_PANEL_HEIGHT, ACTIVITY_PANEL_RATIO, ACTIVITY_PANEL_WIDTH, MActivityLayout} from '../activity/workbench-activity.model';
import {ɵWorkbenchRouter} from '../routing/ɵworkbench-router.service';

describe('WorkbenchLayout', () => {

  beforeEach(() => jasmine.addMatchers(toEqualWorkbenchLayoutCustomMatcher));

  it('should allow adding views', () => {
    const layout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart('part.A')
      .addView('view.1', {partId: 'part.A'})
      .addView('view.2', {partId: 'part.A', activateView: true})
      .addView('view.3', {partId: 'part.A'});

    // add view without specifying position
    expect(layout
      .addView('view.4', {partId: 'part.A'})
      .part({partId: 'part.A'})
      .views.map(view => view.id),
    ).toEqual(['view.1', 'view.2', 'view.3', 'view.4']);

    // add view at the start
    expect(layout
      .addView('view.4', {partId: 'part.A', position: 'start'})
      .part({partId: 'part.A'})
      .views.map(view => view.id),
    ).toEqual(['view.4', 'view.1', 'view.2', 'view.3']);

    // add view at the end
    expect(layout
      .addView('view.4', {partId: 'part.A', position: 'end'})
      .part({partId: 'part.A'})
      .views.map(view => view.id),
    ).toEqual(['view.1', 'view.2', 'view.3', 'view.4']);

    // add view before the active view
    expect(layout
      .addView('view.4', {partId: 'part.A', position: 'before-active-view'})
      .part({partId: 'part.A'})
      .views.map(view => view.id),
    ).toEqual(['view.1', 'view.4', 'view.2', 'view.3']);

    // add view after the active view
    expect(layout
      .addView('view.4', {partId: 'part.A', position: 'after-active-view'})
      .part({partId: 'part.A'})
      .views.map(view => view.id),
    ).toEqual(['view.1', 'view.2', 'view.4', 'view.3']);
  });

  /**
   * +----+---+
   * | B  |   |
   * +----+ A |
   * | C  |   |
   * +----+---+
   */
  it('should allow adding parts relative to other parts', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.A'});

    const workbenchLayout = TestBed.inject(WorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.B', {relativeTo: 'part.A', align: 'left', ratio: .25})
      .addPart('part.C', {relativeTo: 'part.B', align: 'bottom', ratio: .5});

    expect(workbenchLayout).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .25,
            child1: new MTreeNode({
              direction: 'column',
              ratio: .5,
              child2: new MPart({id: 'part.C'}),
              child1: new MPart({id: 'part.B'}),
            }),
            child2: new MPart({id: 'part.A'}),
          }),
        },
      },
    });
  });

  /**
   * Main Grid:
   * +---------------+
   * |       A       |
   * +---------------+
   * |   MAIN_AREA   |
   * +---------------+
   * |       B       |
   * +---------------+
   */
  it('should allow creating layout with main area as initial part', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.initial'});

    const workbenchLayout = TestBed.inject(WorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.A', {relativeTo: MAIN_AREA, align: 'top', ratio: .25})
      .addPart('part.B', {relativeTo: MAIN_AREA, align: 'bottom', ratio: .5});

    expect(workbenchLayout).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            direction: 'column',
            ratio: .25,
            child1: new MPart({id: 'part.A'}),
            child2: new MTreeNode({
              direction: 'column',
              ratio: .5,
              child1: new MPart({id: MAIN_AREA}),
              child2: new MPart({id: 'part.B'}),
            }),
          }),
        },
        mainArea: {
          root: new MPart({id: 'part.initial'}),
        },
      },
    });
  });

  /**
   * Main Grid:
   * +---------------+
   * |       A       |
   * +---------------+
   * |   MAIN_AREA   |
   * +---------------+
   * |       B       |
   * +---------------+
   */
  it('should allow creating layout with main area NOT as initial part', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.initial'});

    const workbenchLayout = TestBed.inject(WorkbenchLayoutFactory)
      .addPart('part.A')
      .addPart(MAIN_AREA, {relativeTo: 'part.A', align: 'bottom', ratio: .75})
      .addPart('part.B', {relativeTo: MAIN_AREA, align: 'bottom', ratio: .5});

    expect(workbenchLayout).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            direction: 'column',
            ratio: .25,
            child1: new MPart({id: 'part.A'}),
            child2: new MTreeNode({
              direction: 'column',
              ratio: .5,
              child1: new MPart({id: MAIN_AREA}),
              child2: new MPart({id: 'part.B'}),
            }),
          }),
        },
        mainArea: {
          root: new MPart({id: 'part.initial'}),
        },
      },
    });
  });

  /**
   * Main Grid:
   * +-------+
   * |   A   |
   * +-------+
   * |   B   |
   * +-------+
   * |   C   |
   * +-------+
   */
  it('should allow creating layout without a main area', () => {
    const workbenchLayout = TestBed.inject(WorkbenchLayoutFactory)
      .addPart('part.A')
      .addPart('part.B', {relativeTo: 'part.A', align: 'bottom', ratio: .75})
      .addPart('part.C', {relativeTo: 'part.B', align: 'bottom', ratio: .5});

    expect(workbenchLayout).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            direction: 'column',
            ratio: .25,
            child1: new MPart({id: 'part.A'}),
            child2: new MTreeNode({
              direction: 'column',
              ratio: .5,
              child1: new MPart({id: 'part.B'}),
              child2: new MPart({id: 'part.C'}),
            }),
          }),
        },
      },
    });

    expect((workbenchLayout as ɵWorkbenchLayout).grids.mainArea).toBeUndefined();
  });

  /**
   * +----+---+
   * | B  |   |
   * +----+ A |
   * | C  |   |
   * +----+---+
   */
  it('should not remove the last part', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.A'});

    const workbenchLayout = TestBed.inject(WorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.B', {relativeTo: 'part.A', align: 'left'})
      .addPart('part.C', {relativeTo: 'part.B', align: 'bottom'})
      .removePart('part.B')
      .removePart('part.A')
      .removePart('part.C');

    expect(workbenchLayout).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MPart({id: 'part.C'}),
        },
      },
    });
  });

  /**
   * +---+---+
   * | A | B |
   * +---+---+
   */
  it('should unset parent node of last part when removing last tree node', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.A'});

    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.B', {relativeTo: 'part.A', align: 'right'})
      .removePart('part.A');

    expect(workbenchLayout).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MPart({id: 'part.B'}),
        },
      },
    });
    expect(workbenchLayout.part({partId: 'part.B'}).parent).toBeUndefined();
  });

  /**
   * +-------+------+---+
   * | A     |      | E |
   * |---+---| main |   |
   * | B | C |      +---+
   * |   |   +------+ F |
   * |   |   |   G  |   |
   * |   |   +------+---+
   * |   |   |     D    |
   * +---+---+----------+
   */
  it('should support creating a complex layout', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.initial'});

    const workbenchLayout = createComplexMainAreaLayout();

    expect(workbenchLayout).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            direction: 'row',
            child1: new MTreeNode({
              direction: 'column',
              child1: new MPart({id: 'part.A'}),
              child2: new MTreeNode({
                direction: 'row',
                child1: new MPart({id: 'part.B'}),
                child2: new MPart({id: 'part.C'}),
              }),
            }),
            child2: new MTreeNode({
              direction: 'column',
              child1: new MTreeNode({
                direction: 'row',
                child1: new MTreeNode({
                  direction: 'column',
                  child1: new MPart({id: 'part.initial'}),
                  child2: new MPart({id: 'part.G'}),
                }),
                child2: new MTreeNode({
                  direction: 'column',
                  child1: new MPart({id: 'part.E'}),
                  child2: new MPart({id: 'part.F'}),
                }),
              }),
              child2: new MPart({id: 'part.D'}),
            }),
          }),
        },
      },
    });
  });

  /**
   * Initial layout:
   *
   * +-------+------+---+
   * | A     | main | E |
   * |---+---|      |   |
   * | B | C |      +---+
   * |   |   +------+ F |
   * |   |   |   G  |   |
   * |   |   +------+---+
   * |   |   |     D    |
   * +---+---+----------+
   *
   * Expected layout after removing parts A and F:
   *
   * +-------+------+---+
   * |   |   | main | E |
   * |   |   |      |   |
   * | B | C |      +   +
   * |   |   +------+   |
   * |   |   |   G  |   |
   * |   |   +------+---+
   * |   |   |     D    |
   * +---+---+----------+
   */
  it('should allow removing parts \'A\' and \'F\'', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.initial'});

    const workbenchLayout = createComplexMainAreaLayout()
      .removePart('part.A')
      .removePart('part.F');

    expect(workbenchLayout).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            direction: 'row',
            child1: new MTreeNode({
              direction: 'row',
              child1: new MPart({id: 'part.B'}),
              child2: new MPart({id: 'part.C'}),
            }),
            child2: new MTreeNode({
              direction: 'column',
              child1: new MTreeNode({
                direction: 'row',
                child1: new MTreeNode({
                  direction: 'column',
                  child1: new MPart({id: 'part.initial'}),
                  child2: new MPart({id: 'part.G'}),
                }),
                child2: new MPart({id: 'part.E'}),
              }),
              child2: new MPart({id: 'part.D'}),
            }),
          }),
        },
      },
    });
  });

  /**
   * Initial layout:
   *
   * +-------+------+---+
   * | A     | main | E |
   * |---+---|      |   |
   * | B | C |      +---+
   * |   |   +------+ F |
   * |   |   |   G  |   |
   * |   |   +------+---+
   * |   |   |     D    |
   * +---+---+----------+
   *
   * Expected layout after removing parts A and F:
   *
   * +-------+------+---+
   * |   |   | main | E |
   * |   |   |      |   |
   * | B | C |      +   +
   * |   |   +------+   |
   * |   |   |   G  |   |
   * |   |   +------+---+
   * |   |   |     D    |
   * +---+---+----------+
   */
  it('should allow removing parts \'A\' and \'F\'', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.initial'});

    const workbenchLayout = createComplexMainAreaLayout()
      .removePart('part.A')
      .removePart('part.F');

    expect(workbenchLayout).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            direction: 'row',
            child1: new MTreeNode({
              direction: 'row',
              child1: new MPart({id: 'part.B'}),
              child2: new MPart({id: 'part.C'}),
            }),
            child2: new MTreeNode({
              direction: 'column',
              child1: new MTreeNode({
                direction: 'row',
                child1: new MTreeNode({
                  direction: 'column',
                  child1: new MPart({id: 'part.initial'}),
                  child2: new MPart({id: 'part.G'}),
                }),
                child2: new MPart({id: 'part.E'}),
              }),
              child2: new MPart({id: 'part.D'}),
            }),
          }),
        },
      },
    });
  });

  /**
   * The test operates on the following layout:
   *
   * +---+---+---+
   * | B | A | X |
   * |   |   +---+
   * |   |   | Y |
   * +---+   +---+
   * | C |   | Z |
   * +---+---+---+
   */
  it('should allow removing a part in the middle (Y)', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.A'});

    const workbenchLayout = TestBed.inject(WorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.B', {relativeTo: 'part.A', align: 'left', ratio: .25})
      .addPart('part.C', {relativeTo: 'part.B', align: 'bottom', ratio: .5})
      .addPart('part.X', {relativeTo: 'part.A', align: 'right', ratio: .5})
      .addPart('part.Y', {relativeTo: 'part.X', align: 'bottom', ratio: .25})
      .addPart('part.Z', {relativeTo: 'part.Y', align: 'bottom', ratio: .25});

    expect(workbenchLayout).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            direction: 'row',
            child1: new MTreeNode({
              direction: 'column',
              child1: new MPart({id: 'part.B'}),
              child2: new MPart({id: 'part.C'}),
            }),
            child2: new MTreeNode({
              direction: 'row',
              ratio: .5,
              child1: new MPart({id: 'part.A'}),
              child2: new MTreeNode({
                direction: 'column',
                ratio: .75,
                child1: new MPart({id: 'part.X'}),
                child2: new MTreeNode({
                  direction: 'column',
                  ratio: .75,
                  child1: new MPart({id: 'part.Y'}),
                  child2: new MPart({id: 'part.Z'}),
                }),
              }),
            }),
          }),
        },
      },
    });

    const modifiedLayout = workbenchLayout.removePart('part.Y');
    expect(modifiedLayout).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            direction: 'row',
            child1: new MTreeNode({
              direction: 'column',
              child1: new MPart({id: 'part.B'}),
              child2: new MPart({id: 'part.C'}),
            }),
            child2: new MTreeNode({
              direction: 'row',
              child1: new MPart({id: 'part.A'}),
              child2: new MTreeNode({
                direction: 'column',
                ratio: .75,
                child1: new MPart({id: 'part.X'}),
                child2: new MPart({id: 'part.Z'}),
              }),
            }),
          }),
        },
      },
    });
  });

  /**
   * Initial layout:
   *
   * +-------+------+---+
   * | A     | main | E |
   * |---+---|      |   |
   * | B | C |      +---+
   * |   |   +------+ F |
   * |   |   |   G  |   |
   * |   |   +------+---+
   * |   |   |     D    |
   * +---+---+----------+
   *
   * Expected layout after removing parts A and F:
   *
   * +---------------------------------+
   * |          TOP                    |
   * +------+-------+------+---+-------+
   * |      | A     | main | E |       |
   * |      |---+---|      |   |       |
   * |      | B | C |      +---+       |
   * | LEFT |   |   +------+ F | RIGHT |
   * |      |   |   |   G  |   |       |
   * |      |   |   +------+---+       |
   * |      |   |   |     D    |       |
   * +------+---+---+----------+       |
   * |         BOTTOM          |       |
   * +-------------------------+-------+
   */
  it('should allow adding a new parts to the main grid', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.initial'});

    const workbenchLayout = createComplexMainAreaLayout()
      .addPart('part.LEFT', {align: 'left'})
      .addPart('part.BOTTOM', {align: 'bottom'})
      .addPart('part.RIGHT', {align: 'right'})
      .addPart('part.TOP', {align: 'top'});

    expect(workbenchLayout).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            direction: 'row',
            child1: new MTreeNode({
              direction: 'column',
              child1: new MPart({id: 'part.A'}),
              child2: new MTreeNode({
                direction: 'row',
                child1: new MPart({id: 'part.B'}),
                child2: new MPart({id: 'part.C'}),
              }),
            }),
            child2: new MTreeNode({
              direction: 'column',
              child1: new MTreeNode({
                direction: 'row',
                child1: new MTreeNode({
                  direction: 'column',
                  child1: new MPart({id: 'part.initial'}),
                  child2: new MPart({id: 'part.G'}),
                }),
                child2: new MTreeNode({
                  direction: 'column',
                  child1: new MPart({id: 'part.E'}),
                  child2: new MPart({id: 'part.F'}),
                }),
              }),
              child2: new MPart({id: 'part.D'}),
            }),
          }),
        },
        main: {
          root: new MTreeNode({
            direction: 'column',
            child1: new MPart({id: 'part.TOP'}),
            child2: new MTreeNode({
              direction: 'row',
              child1: new MTreeNode({
                direction: 'column',
                child1: new MTreeNode({
                  direction: 'row',
                  child1: new MPart({id: 'part.LEFT'}),
                  child2: new MPart({id: MAIN_AREA}),
                }),
                child2: new MPart({id: 'part.BOTTOM'}),
              }),
              child2: new MPart({id: 'part.RIGHT'}),
            }),
          }),
        },
      },
    });
  });

  /**
   * Initial layout:
   *
   * +-------+------+---+
   * | A     | main | E |
   * |---+---|      |   |
   * | B | C |      +---+
   * |   |   +------+ F |
   * |   |   |   G  |   |
   * |   |   +------+---+
   * |   |   |     D    |
   * +---+---+----------+
   *
   * Expected layout after removing parts A and F:
   *
   * +-------+------+---+
   * | A     | main |   |
   * |---+---|      |   |
   * |       |      | F |
   * |       +------+   |
   * |   C   |   G  |   |
   * +-------+------+---+
   */
  it('should allow removing parts \'B\' \'D\' and \'E\'', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.initial'});

    const workbenchLayout = createComplexMainAreaLayout()
      .removePart('part.B')
      .removePart('part.D')
      .removePart('part.E');

    expect(workbenchLayout).toEqualWorkbenchLayout({
      grids: {
        mainArea: {
          root: new MTreeNode({
            direction: 'row',
            child1: new MTreeNode({
              direction: 'column',
              child1: new MPart({id: 'part.A'}),
              child2: new MPart({id: 'part.C'}),
            }),
            child2: new MTreeNode({
              direction: 'row',
              child1: new MTreeNode({
                direction: 'column',
                child1: new MPart({id: 'part.initial'}),
                child2: new MPart({id: 'part.G'}),
              }),
              child2: new MPart({id: 'part.F'}),
            }),
          }),
        },
      },
    });
  });

  it('should throw an error when referencing an unknown part', () => {
    expect(() => TestBed.inject(WorkbenchLayoutFactory)
      .addPart('part.A')
      .addPart('part.B', {relativeTo: 'unknown-part-id', align: 'left'}),
    ).toThrowError(/NullElementError/);
  });

  it('should allow removing the main area part', () => {
    const workbenchLayout = TestBed.inject(WorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.other', {relativeTo: MAIN_AREA, align: 'right', ratio: .5})
      .removePart(MAIN_AREA);
    expect(workbenchLayout).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MPart({id: 'part.other'}),
        },
      },
    });
  });

  /**
   * The test operates on the following layout:
   *
   * +----+---+
   * | B  |   |
   * +----+ A |
   * | C  |   |
   * +----+---+
   */
  it('should parse a serialized layout into tree node objects and links nodes with their parent node, if any', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.A'});

    const serializedLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.B', {relativeTo: 'part.A', align: 'left'})
      .addPart('part.C', {relativeTo: 'part.B', align: 'bottom'})
      .serialize();
    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory).create({grids: serializedLayout.grids});

    // verify the main area root node.
    const rootNode = workbenchLayout.grids.mainArea!.root as _MTreeNode;
    expect(rootNode).toBeInstanceOf(_MTreeNode);
    expect(rootNode.parent).toBeUndefined();

    // verify the left sashbox
    const bcNode = rootNode.child1 as _MTreeNode;
    expect(bcNode).toBeInstanceOf(_MTreeNode);
    expect(bcNode.parent).toBe(rootNode);

    // verify the 'B' part
    const topLeftPart = bcNode.child1 as _MPart;
    expect(topLeftPart).toBeInstanceOf(_MPart);
    expect(topLeftPart.parent).toBe(bcNode);
    expect(topLeftPart.id).toEqual('part.B');

    // verify the 'C' part
    const bottomLeftPart = bcNode.child2 as _MPart;
    expect(bottomLeftPart).toBeInstanceOf(_MPart);
    expect(bottomLeftPart.parent).toBe(bcNode);
    expect(bottomLeftPart.id).toEqual('part.C');

    // verify the initial part
    const initialPart = rootNode.child2 as _MPart;
    expect(initialPart).toBeInstanceOf(_MPart);
    expect(initialPart.parent).toBe(rootNode);
    expect(initialPart.id).toEqual('part.A');
  });

  /**
   * The test operates on the following layout:
   *
   * +----+---+
   * | B  |   |
   * +----+ A |
   * | C  |   |
   * +----+---+
   */
  it('should be immutable', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.A'});

    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.B', {relativeTo: 'part.A', align: 'left'})
      .addPart('part.C', {relativeTo: 'part.B', align: 'bottom'})
      .addView('view.101', {partId: 'part.C'})
      .navigatePart('part.A', ['path/to/part/a'])
      .navigatePart('part.B', ['path/to/part/b'])
      .navigatePart('part.C', ['path/to/part/c'])
      .navigateView('view.101', ['path/to/view/1']);

    const serializedWorkbenchLayout = workbenchLayout.serialize();

    // modify the layout; should not modify `workbenchLayout` instance
    workbenchLayout
      .addPart('part.X', {relativeTo: 'part.A', align: 'right'})
      .addPart('part.Y', {relativeTo: 'part.X', align: 'bottom'})
      .addPart('part.Z', {relativeTo: 'part.Y', align: 'bottom'})
      .addView('view.102', {partId: 'part.C'})
      .navigatePart('part.X', ['path/to/part/x'])
      .navigatePart('part.Y', ['path/to/part/y'])
      .navigatePart('part.Z', ['path/to/part/z'])
      .navigateView('view.102', ['path/to/view/2'])
      .removePart('part.Z');

    expect(workbenchLayout.serialize().grids).toEqual(serializedWorkbenchLayout.grids);
    expect(workbenchLayout.serialize().activityLayout).toEqual(serializedWorkbenchLayout.activityLayout);
    expect(workbenchLayout.serialize().outlets({mainGrid: true, mainAreaGrid: true, activityGrids: true})).toEqual(serializedWorkbenchLayout.outlets({mainGrid: true, mainAreaGrid: true, activityGrids: true}));
  });

  /**
   * The test operates on the following layout:
   *
   * +----+---+
   * | B  |   |
   * +----+ A |
   * | C  |   |
   * +----+---+
   */
  it('should allow adding views to a part', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.A'});

    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.B', {relativeTo: 'part.A', align: 'left'})
      .addPart('part.C', {relativeTo: 'part.B', align: 'bottom'})
      .addView('view.1', {partId: 'part.B'})
      .addView('view.2', {partId: 'part.B'})
      .addView('view.3', {partId: 'part.A'})
      .addView('view.4', {partId: 'part.C'});

    expect(workbenchLayout.part({partId: 'part.B'}).views.map(view => view.id)).toEqual(['view.1', 'view.2']);
    expect(workbenchLayout.part({partId: 'part.A'}).views.map(view => view.id)).toEqual(['view.3']);
    expect(workbenchLayout.part({partId: 'part.C'}).views.map(view => view.id)).toEqual(['view.4']);
  });

  it('should remove non-structural part when removing its last view', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.initial'});

    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.left', {relativeTo: 'part.initial', align: 'left'}, {structural: false})
      .addView('view.1', {partId: 'part.left'})
      .addView('view.2', {partId: 'part.left'})
      .removeView('view.1', {force: true})
      .removeView('view.2', {force: true});

    expect(() => workbenchLayout.part({partId: 'part.left'})).toThrowError(/NullPartError/);
    expect(workbenchLayout.hasPart('part.left')).toBeFalse();
  });

  it('should not remove structural part when removing its last view', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.initial'});

    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.left', {relativeTo: 'part.initial', align: 'left'}) // structural by default if not set
      .addView('view.1', {partId: 'part.left'})
      .addView('view.2', {partId: 'part.left'})
      .removeView('view.1')
      .removeView('view.2');

    expect(workbenchLayout.part({partId: 'part.left'})).toEqual(jasmine.objectContaining({id: 'part.left'}));
  });

  /**
   * The test operates on the following layout:
   *
   * +----+---+
   * | B  |   |
   * +----+ A |
   * | C  |   |
   * +----+---+
   */
  it('should allow changing the view tab order', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.A'});

    // move 'view.1' to position 2
    expect(TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.B', {relativeTo: 'part.A', align: 'left'})
      .addPart('part.C', {relativeTo: 'part.B', align: 'bottom'})
      .addView('view.1', {partId: 'part.A'})
      .addView('view.2', {partId: 'part.A'})
      .addView('view.3', {partId: 'part.A'})
      .addView('view.4', {partId: 'part.A'})
      .moveView('view.1', 'part.A', {position: 2})
      .part({partId: 'part.A'})
      .views.map(view => view.id),
    ).toEqual(['view.2', 'view.1', 'view.3', 'view.4']);

    // move 'view.4' to position 2
    expect(TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.B', {relativeTo: 'part.A', align: 'left'})
      .addPart('part.C', {relativeTo: 'part.B', align: 'bottom'})
      .addView('view.1', {partId: 'part.A'})
      .addView('view.2', {partId: 'part.A'})
      .addView('view.3', {partId: 'part.A'})
      .addView('view.4', {partId: 'part.A'})
      .moveView('view.4', 'part.A', {position: 2})
      .part({partId: 'part.A'})
      .views.map(view => view.id),
    ).toEqual(['view.1', 'view.2', 'view.4', 'view.3']);

    // move 'view.2' to the end
    expect(TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.B', {relativeTo: 'part.A', align: 'left'})
      .addPart('part.C', {relativeTo: 'part.B', align: 'bottom'})
      .addView('view.1', {partId: 'part.A'})
      .addView('view.2', {partId: 'part.A'})
      .addView('view.3', {partId: 'part.A'})
      .addView('view.4', {partId: 'part.A'})
      .moveView('view.2', 'part.A', {position: 'end'})
      .part({partId: 'part.A'})
      .views.map(view => view.id),
    ).toEqual(['view.1', 'view.3', 'view.4', 'view.2']);

    // move 'view.3' to the start
    expect(TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.B', {relativeTo: 'part.A', align: 'left'})
      .addPart('part.C', {relativeTo: 'part.B', align: 'bottom'})
      .addView('view.1', {partId: 'part.A'})
      .addView('view.2', {partId: 'part.A'})
      .addView('view.3', {partId: 'part.A'})
      .addView('view.4', {partId: 'part.A'})
      .moveView('view.3', 'part.A', {position: 'start'})
      .part({partId: 'part.A'})
      .views.map(view => view.id),
    ).toEqual(['view.3', 'view.1', 'view.2', 'view.4']);

    // move 'view.1' before the active view
    expect(TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.B', {relativeTo: 'part.A', align: 'left'})
      .addPart('part.C', {relativeTo: 'part.B', align: 'bottom'})
      .addView('view.1', {partId: 'part.A'})
      .addView('view.2', {partId: 'part.A'})
      .addView('view.3', {partId: 'part.A', activateView: true})
      .addView('view.4', {partId: 'part.A'})
      .moveView('view.1', 'part.A', {position: 'before-active-view'})
      .part({partId: 'part.A'})
      .views.map(view => view.id),
    ).toEqual(['view.2', 'view.1', 'view.3', 'view.4']);

    // move 'view.2' to a different part before the active view
    expect(TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.B', {relativeTo: 'part.A', align: 'left'})
      .addPart('part.C', {relativeTo: 'part.B', align: 'bottom'})
      .addView('view.1', {partId: 'part.A', activateView: true})
      .addView('view.2', {partId: 'part.A'})
      .addView('view.3', {partId: 'part.A'})
      .addView('view.4', {partId: 'part.C'})
      .addView('view.5', {partId: 'part.C', activateView: true})
      .addView('view.6', {partId: 'part.C'})
      .moveView('view.2', 'part.C', {position: 'before-active-view'})
      .part({partId: 'part.C'})
      .views.map(view => view.id),
    ).toEqual(['view.4', 'view.2', 'view.5', 'view.6']);

    // move 'view.1' after the active view
    expect(TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.B', {relativeTo: 'part.A', align: 'left'})
      .addPart('part.C', {relativeTo: 'part.B', align: 'bottom'})
      .addView('view.1', {partId: 'part.A'})
      .addView('view.2', {partId: 'part.A'})
      .addView('view.3', {partId: 'part.A', activateView: true})
      .addView('view.4', {partId: 'part.A'})
      .moveView('view.1', 'part.A', {position: 'after-active-view'})
      .part({partId: 'part.A'})
      .views.map(view => view.id),
    ).toEqual(['view.2', 'view.3', 'view.1', 'view.4']);

    // move 'view.2' to a different part after the active view
    expect(TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.B', {relativeTo: 'part.A', align: 'left'})
      .addPart('part.C', {relativeTo: 'part.B', align: 'bottom'})
      .addView('view.1', {partId: 'part.A', activateView: true})
      .addView('view.2', {partId: 'part.A'})
      .addView('view.3', {partId: 'part.A'})
      .addView('view.4', {partId: 'part.C'})
      .addView('view.5', {partId: 'part.C', activateView: true})
      .addView('view.6', {partId: 'part.C'})
      .moveView('view.2', 'part.C', {position: 'after-active-view'})
      .part({partId: 'part.C'})
      .views.map(view => view.id),
    ).toEqual(['view.4', 'view.5', 'view.2', 'view.6']);

    // move 'view.2' without specifying a position
    expect(TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.B', {relativeTo: 'part.A', align: 'left'})
      .addPart('part.C', {relativeTo: 'part.B', align: 'bottom'})
      .addView('view.1', {partId: 'part.A'})
      .addView('view.2', {partId: 'part.A'})
      .addView('view.3', {partId: 'part.A'})
      .addView('view.4', {partId: 'part.A'})
      .moveView('view.2', 'part.A')
      .part({partId: 'part.A'})
      .views.map(view => view.id),
    ).toEqual(['view.1', 'view.2', 'view.3', 'view.4']);

    // move 'view.2' to a different part without specifying a position
    expect(TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.B', {relativeTo: 'part.A', align: 'left'})
      .addPart('part.C', {relativeTo: 'part.B', align: 'bottom'})
      .addView('view.1', {partId: 'part.A', activateView: true})
      .addView('view.2', {partId: 'part.A'})
      .addView('view.3', {partId: 'part.A'})
      .addView('view.4', {partId: 'part.C'})
      .addView('view.5', {partId: 'part.C', activateView: true})
      .addView('view.6', {partId: 'part.C'})
      .moveView('view.2', 'part.C')
      .part({partId: 'part.C'})
      .views.map(view => view.id),
    ).toEqual(['view.4', 'view.5', 'view.6', 'view.2']);
  });

  /**
   * The test operates on the following layout:
   *
   * +----+---+
   * | B  |   |
   * +----+ A |
   * | C  |   |
   * +----+---+
   */
  it('should allow moving views to other parts', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.A'});

    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.B', {relativeTo: 'part.A', align: 'left'})
      .addPart('part.C', {relativeTo: 'part.B', align: 'bottom'})
      .addView('view.1', {partId: 'part.A'})
      .addView('view.2', {partId: 'part.A'})
      .addView('view.3', {partId: 'part.A'})
      .addView('view.4', {partId: 'part.A'})
      .moveView('view.1', 'part.B')
      .moveView('view.2', 'part.C')
      .moveView('view.3', 'part.C');

    expect(workbenchLayout.part({partId: 'part.B'}).views.map(view => view.id)).toEqual(['view.1']);
    expect(workbenchLayout.part({partId: 'part.C'}).views.map(view => view.id)).toEqual(['view.2', 'view.3']);
    expect(workbenchLayout.part({partId: 'part.A'}).views.map(view => view.id)).toEqual(['view.4']);
  });

  it('should retain view navigation when moving view to another part', () => {
    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart('part.left')
      .addPart('part.right', {relativeTo: 'part.left', align: 'right'})
      .addView('view.1', {partId: 'part.left', cssClass: 'class-view'})
      .addView('view.2', {partId: 'part.left'})
      .addView('view.3', {partId: 'part.left'})
      .navigateView('view.1', ['path/to/view'], {cssClass: 'class-navigation'})
      .navigateView('view.2', [], {hint: 'some-hint'})
      .navigateView('view.3', ['path/to/view'], {data: {some: 'data'}})
      .moveView('view.1', 'part.right')
      .moveView('view.2', 'part.right')
      .moveView('view.3', 'part.right');

    expect(workbenchLayout.part({partId: 'part.right'}).views).toEqual(jasmine.arrayWithExactContents([
      {id: 'view.1', navigation: {id: anything(), cssClass: ['class-navigation']}, cssClass: ['class-view']} satisfies MView,
      {id: 'view.2', navigation: {id: anything(), hint: 'some-hint'}} satisfies MView,
      {id: 'view.3', navigation: {id: anything(), data: {some: 'data'}}} satisfies MView,
    ]));
    expect(workbenchLayout.urlSegments({outlet: 'view.1'})).toEqual(segments(['path/to/view']));
    expect(workbenchLayout.urlSegments({outlet: 'view.2'})).toEqual([]);
    expect(workbenchLayout.urlSegments({outlet: 'view.3'})).toEqual(segments(['path/to/view']));
  });

  it('should add view navigation data to the layout', () => {
    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart('part.part')
      .addView('view.1', {partId: 'part.part'})
      .navigateView('view.1', ['path/to/view'], {data: {some: 'data'}});

    expect(workbenchLayout.part({partId: 'part.part'}).views).toEqual(jasmine.arrayWithExactContents([
      {id: 'view.1', navigation: {id: anything(), data: {some: 'data'}}} satisfies MView,
    ]));
  });

  it('should add part navigation data to the layout', () => {
    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart('part.part')
      .navigatePart('part.part', ['path/to/part'], {data: {some: 'data'}});

    expect(workbenchLayout.part({partId: 'part.part'}).navigation).toEqual({id: anything(), data: {some: 'data'}} satisfies MPart['navigation']);
  });

  it('should add view navigation state to the layout', () => {
    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart('part.part')
      .addView('view.1', {partId: 'part.part'})
      .navigateView('view.1', ['path/to/view'], {state: {some: 'state'}});

    expect(workbenchLayout.view({viewId: 'view.1'}).navigation).toEqual({id: anything()} satisfies MView['navigation']);
    expect(workbenchLayout.navigationState({outlet: 'view.1'})).toEqual({some: 'state'});
  });

  it('should add part navigation state to the layout', () => {
    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart('part.part')
      .navigatePart('part.part', ['path/to/part'], {state: {some: 'state'}});

    expect(workbenchLayout.part({partId: 'part.part'}).navigation).toEqual({id: anything()} satisfies MPart['navigation']);
    expect(workbenchLayout.navigationState({outlet: 'part.part'})).toEqual({some: 'state'});
  });

  it('should error when navigating non-existent view', () => {
    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart('part.part')
      .addView('view.1', {partId: 'part.part'});
    expect(() => workbenchLayout.navigateView('view.2', ['path/to/view'])).toThrowError(/NullViewError/);
  });

  it('should error when navigating non-existent part', () => {
    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory).addPart('part.part');
    expect(() => workbenchLayout.navigatePart('part.does-not-exist', ['path/to/part'])).toThrowError(/NullPartError/);
  });

  it('should retain view navigation state when moving view to another part', () => {
    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart('part.left')
      .addPart('part.right', {relativeTo: 'part.left', align: 'right'})
      .addView('view.1', {partId: 'part.left'})
      .navigateView('view.1', ['path/to/view'], {state: {some: 'state'}})
      .moveView('view.1', 'part.right');

    expect(workbenchLayout.part({partId: 'part.right'}).views).toEqual([{id: 'view.1', navigation: {id: anything()}} satisfies MView]);
    expect(workbenchLayout.navigationState({outlet: 'view.1'})).toEqual({some: 'state'});
  });

  it('should clear hint of previous view navigation when navigating without hint', () => {
    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart('part.part')
      .addView('view.1', {partId: 'part.part'})
      .navigateView('view.1', [], {hint: 'some-hint'})
      .navigateView('view.1', ['path/to/view']);

    expect(workbenchLayout.view({viewId: 'view.1'})).toEqual({id: 'view.1', navigation: {id: anything()}} satisfies MView);
    expect(workbenchLayout.urlSegments({outlet: 'view.1'})).toEqual(segments(['path/to/view']));
  });

  it('should clear hint of previous part navigation when navigating without hint', () => {
    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart('part.part')
      .navigatePart('part.part', [], {hint: 'some-hint'})
      .navigatePart('part.part', ['path/to/part']);

    expect(workbenchLayout.part({partId: 'part.part'}).navigation).toEqual({id: anything()} satisfies MPart['navigation']);
    expect(workbenchLayout.urlSegments({outlet: 'part.part'})).toEqual(segments(['path/to/part']));
  });

  it('should clear URL of previous view navigation when navigating without URL', () => {
    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart('part.part')
      .addView('view.1', {partId: 'part.part'})
      .navigateView('view.1', ['path/to/view'])
      .navigateView('view.1', [], {hint: 'some-hint'});

    expect(workbenchLayout.view({viewId: 'view.1'})).toEqual({id: 'view.1', navigation: {id: anything(), hint: 'some-hint'}} satisfies MView);
    expect(workbenchLayout.urlSegments({outlet: 'view.1'})).toEqual([]);
  });

  it('should clear URL of previous part navigation when navigating without URL', () => {
    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart('part.part')
      .navigatePart('part.part', ['path/to/part'])
      .navigatePart('part.part', [], {hint: 'some-hint'});

    expect(workbenchLayout.part({partId: 'part.part'}).navigation).toEqual({id: anything(), hint: 'some-hint'} satisfies MPart['navigation']);
    expect(workbenchLayout.urlSegments({outlet: 'part.part'})).toEqual([]);
  });

  it('should clear navigation state of previous view navigation when navigating without state', () => {
    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart('part.part')
      .addView('view.1', {partId: 'part.part'})
      .navigateView('view.1', ['path/to/view'], {state: {some: 'state'}})
      .navigateView('view.1', ['path/to/view']);

    expect(workbenchLayout.view({viewId: 'view.1'})).toEqual({id: 'view.1', navigation: {id: anything()}} satisfies MView);
    expect(workbenchLayout.navigationState({outlet: 'view.1'})).toEqual({});
    expect(workbenchLayout.urlSegments({outlet: 'view.1'})).toEqual(segments(['path/to/view']));
  });

  it('should clear navigation state of previous part navigation when navigating without state', () => {
    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart('part.part')
      .navigatePart('part.part', ['path/to/part'], {state: {some: 'state'}})
      .navigatePart('part.part', ['path/to/part']);

    expect(workbenchLayout.part({partId: 'part.part'}).navigation).toEqual({id: anything()} satisfies MPart['navigation']);
    expect(workbenchLayout.navigationState({outlet: 'part.part'})).toEqual({});
    expect(workbenchLayout.urlSegments({outlet: 'part.part'})).toEqual(segments(['path/to/part']));
  });

  it('should remove views of a part when removing a part', () => {
    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.part', {align: 'right'})
      .addView('view.1', {partId: 'part.part'})
      .navigateView('view.1', ['path/to/view'], {state: {some: 'state'}})
      .removePart('part.part');

    expect(workbenchLayout.view({viewId: 'view.1'}, {orElse: null})).toBeNull();
    expect(workbenchLayout.navigationState({outlet: 'view.1'})).toEqual({});
    expect(workbenchLayout.urlSegments({outlet: 'view.1'})).toEqual([]);
  });

  it('should remove associated data when removing view', () => {
    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart('part.part')
      .addView('view.1', {partId: 'part.part'})
      .navigateView('view.1', ['path/to/view'], {state: {some: 'state'}})
      .removeView('view.1', {force: true});

    expect(workbenchLayout.view({viewId: 'view.1'}, {orElse: null})).toBeNull();
    expect(workbenchLayout.navigationState({outlet: 'view.1'})).toEqual({});
    expect(workbenchLayout.urlSegments({outlet: 'view.1'})).toEqual([]);
    expect(workbenchLayout.outlets({mainGrid: true})['view.1']).toBeUndefined();
  });

  it('should rename view', () => {
    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart('part.part')
      .addView('view.1', {partId: 'part.part'})
      .navigateView('view.1', ['path/to/view'], {state: {some: 'state'}})
      .renameView('view.1', 'view.2');

    expect(workbenchLayout.navigationState({outlet: 'view.1'})).toEqual({});
    expect(workbenchLayout.urlSegments({outlet: 'view.1'})).toEqual([]);
    expect(workbenchLayout.outlets({mainGrid: true})['view.1']).toBeUndefined();

    expect(workbenchLayout.navigationState({outlet: 'view.2'})).toEqual({some: 'state'});
    expect(workbenchLayout.urlSegments({outlet: 'view.2'})).toEqual(segments(['path/to/view']));
    expect(workbenchLayout.outlets({mainGrid: true})['view.2']).toEqual(segments(['path/to/view']));
  });

  it('should rename part', () => {
    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart('part.1')
      .navigatePart('part.1', ['path/to/part'], {state: {some: 'state'}})
      .renamePart('part.1', 'part.2');

    expect(workbenchLayout.navigationState({outlet: 'part.1'})).toEqual({});
    expect(workbenchLayout.urlSegments({outlet: 'part.1'})).toEqual([]);
    expect(workbenchLayout.outlets({mainGrid: true, mainAreaGrid: true, activityGrids: true})['part.1']).toBeUndefined();

    expect(workbenchLayout.navigationState({outlet: 'part.2'})).toEqual({some: 'state'});
    expect(workbenchLayout.urlSegments({outlet: 'part.2'})).toEqual(segments(['path/to/part']));
    expect(workbenchLayout.outlets({mainGrid: true, mainAreaGrid: true, activityGrids: true})['part.2']).toEqual(segments(['path/to/part']));
  });

  it('should remove associated data when removing part', () => {
    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart('part.left')
      .addPart('part.right', {align: 'right'})
      .navigatePart('part.right', ['path/to/part'], {state: {some: 'state'}})
      .removePart('part.right');

    expect(workbenchLayout.part({partId: 'part.right'}, {orElse: null})).toBeNull();
    expect(workbenchLayout.navigationState({outlet: 'part.right'})).toEqual({});
    expect(workbenchLayout.urlSegments({outlet: 'part.right'})).toEqual([]);
    expect(workbenchLayout.outlets({mainGrid: true})['part.right']).toBeUndefined();
  });

  it('should activate part and view when moving view to another part', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.initial'});

    let workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.left', {relativeTo: 'part.initial', align: 'left'})
      .addPart('part.right', {relativeTo: 'part.left', align: 'right'})
      .addView('view.1', {partId: 'part.left'})
      .addView('view.2', {partId: 'part.left'})
      .addView('view.3', {partId: 'part.right'})
      .activatePart('part.left')
      .activateView('view.1')
      .activateView('view.3');

    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part.left');
    expect(workbenchLayout.part({partId: 'part.left'}).activeViewId).toEqual('view.1');
    expect(workbenchLayout.part({partId: 'part.right'}).activeViewId).toEqual('view.3');

    // Move view.1 to part right
    workbenchLayout = workbenchLayout.moveView('view.1', 'part.right', {activatePart: true, activateView: true});

    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part.right');
    expect(workbenchLayout.part({partId: 'part.left'}).activeViewId).toEqual('view.2');
    expect(workbenchLayout.part({partId: 'part.right'}).activeViewId).toEqual('view.1');
  });

  it('should not activate part and view when moving view to another part', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.initial'});

    let workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.left', {relativeTo: 'part.initial', align: 'left'})
      .addPart('part.right', {relativeTo: 'part.left', align: 'right'})
      .addView('view.1', {partId: 'part.left'})
      .addView('view.2', {partId: 'part.left'})
      .addView('view.3', {partId: 'part.right'})
      .activatePart('part.left')
      .activateView('view.1')
      .activateView('view.3');

    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part.left');
    expect(workbenchLayout.part({partId: 'part.left'}).activeViewId).toEqual('view.1');
    expect(workbenchLayout.part({partId: 'part.right'}).activeViewId).toEqual('view.3');

    // Move view.1 to part right
    workbenchLayout = workbenchLayout.moveView('view.1', 'part.right');

    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part.left');
    expect(workbenchLayout.part({partId: 'part.left'}).activeViewId).toEqual('view.2');
    expect(workbenchLayout.part({partId: 'part.right'}).activeViewId).toEqual('view.3');
  });

  it('should activate part and view when moving view inside the part', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.initial'});

    let workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.left', {relativeTo: 'part.initial', align: 'left'})
      .addPart('part.right', {relativeTo: 'part.left', align: 'right'})
      .addView('view.1', {partId: 'part.left'})
      .addView('view.2', {partId: 'part.left'})
      .addView('view.3', {partId: 'part.right'})
      .activatePart('part.right')
      .activateView('view.1')
      .activateView('view.3');

    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part.right');
    expect(workbenchLayout.part({partId: 'part.left'}).activeViewId).toEqual('view.1');
    expect(workbenchLayout.part({partId: 'part.right'}).activeViewId).toEqual('view.3');

    // Move view.1 to part right
    workbenchLayout = workbenchLayout.moveView('view.2', 'part.left', {position: 0, activatePart: true, activateView: true});

    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part.left');
    expect(workbenchLayout.part({partId: 'part.left'}).activeViewId).toEqual('view.2');
    expect(workbenchLayout.part({partId: 'part.right'}).activeViewId).toEqual('view.3');
  });

  it('should not activate part and view when moving view inside the part', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.initial'});

    let workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.left', {relativeTo: 'part.initial', align: 'left'})
      .addPart('part.right', {relativeTo: 'part.left', align: 'right'})
      .addView('view.1', {partId: 'part.left'})
      .addView('view.2', {partId: 'part.left'})
      .addView('view.3', {partId: 'part.right'})
      .activatePart('part.right')
      .activateView('view.1')
      .activateView('view.3');

    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part.right');
    expect(workbenchLayout.part({partId: 'part.left'}).activeViewId).toEqual('view.1');
    expect(workbenchLayout.part({partId: 'part.right'}).activeViewId).toEqual('view.3');

    // Move view.1 to part right
    workbenchLayout = workbenchLayout.moveView('view.2', 'part.left', {position: 0});

    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part.right');
    expect(workbenchLayout.part({partId: 'part.left'}).activeViewId).toEqual('view.1');
    expect(workbenchLayout.part({partId: 'part.right'}).activeViewId).toEqual('view.3');
  });

  /**
   * The test operates on the following layout:
   *
   * +----+---+
   * | B  |   |
   * +----+ A |
   * | C  |   |
   * +----+---+
   */
  it('should remove non-structural part when moving its last view to another part', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.A'});

    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.B', {relativeTo: 'part.A', align: 'left'}, {structural: false})
      .addPart('part.C', {relativeTo: 'part.B', align: 'bottom'})
      .addView('view.1', {partId: 'part.B'})
      .addView('view.2', {partId: 'part.B'})
      .addView('view.3', {partId: 'part.B'})
      .moveView('view.1', 'part.A')
      .moveView('view.2', 'part.A')
      .moveView('view.3', 'part.C');

    expect(workbenchLayout.hasPart('part.B')).toBeFalse();
    expect(workbenchLayout.part({partId: 'part.A'}).views.map(view => view.id)).toEqual(['view.1', 'view.2']);
    expect(workbenchLayout.part({partId: 'part.C'}).views.map(view => view.id)).toEqual(['view.3']);
  });

  /**
   * The test operates on the following layout:
   *
   * +----+---+
   * | B  |   |
   * +----+ A |
   * | C  |   |
   * +----+---+
   */
  it('should not remove structural part when moving its last view to another part', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.A'});

    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.B', {relativeTo: 'part.A', align: 'left'}) // structural by default if not set
      .addPart('part.C', {relativeTo: 'part.B', align: 'bottom'})
      .addView('view.1', {partId: 'part.B'})
      .addView('view.2', {partId: 'part.B'})
      .addView('view.3', {partId: 'part.B'})
      .moveView('view.1', 'part.A')
      .moveView('view.2', 'part.A')
      .moveView('view.3', 'part.C');

    expect(workbenchLayout.part({partId: 'part.B'}).id).toEqual('part.B');
    expect(workbenchLayout.part({partId: 'part.A'}).views.map(view => view.id)).toEqual(['view.1', 'view.2']);
    expect(workbenchLayout.part({partId: 'part.C'}).views.map(view => view.id)).toEqual(['view.3']);
  });

  it('should activate the most recently activated view when removing a view', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.initial'});

    const viewActivationInstantProviderSpyObj = installViewActivationInstantProviderSpyObj();
    let workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addView('view.1', {partId: 'part.initial'})
      .addView('view.5', {partId: 'part.initial'})
      .addView('view.2', {partId: 'part.initial'})
      .addView('view.3', {partId: 'part.initial'})
      .addView('view.4', {partId: 'part.initial'});

    // prepare the activation history
    viewActivationInstantProviderSpyObj.getActivationInstant
      .withArgs('view.1').and.returnValue(5)
      .withArgs('view.2').and.returnValue(3)
      .withArgs('view.3').and.returnValue(1)
      .withArgs('view.4').and.returnValue(4)
      .withArgs('view.5').and.returnValue(2);

    workbenchLayout = workbenchLayout
      .activateView('view.1')
      .removeView('view.1', {force: true});
    expect(workbenchLayout.part({partId: 'part.initial'}).activeViewId).toEqual('view.4');

    workbenchLayout = workbenchLayout.removeView('view.4', {force: true});
    expect(workbenchLayout.part({partId: 'part.initial'}).activeViewId).toEqual('view.2');

    workbenchLayout = workbenchLayout.removeView('view.2', {force: true});
    expect(workbenchLayout.part({partId: 'part.initial'}).activeViewId).toEqual('view.5');

    workbenchLayout = workbenchLayout.removeView('view.5', {force: true});
    expect(workbenchLayout.part({partId: 'part.initial'}).activeViewId).toEqual('view.3');
  });

  /**
   * The test operates on the following layout:
   *
   * +---+---+---+---+---+
   * | A | B | C | D | E |
   * *---+---+---+---+---+
   */
  it('should activate the most recently activated part when removing a part', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.A'});

    const partActivationInstantProviderSpyObj = installPartActivationInstantProviderSpyObj();
    let workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.B', {relativeTo: 'part.A', align: 'right'})
      .addPart('part.C', {relativeTo: 'part.B', align: 'right'})
      .addPart('part.D', {relativeTo: 'part.C', align: 'right'})
      .addPart('part.E', {relativeTo: 'part.D', align: 'right'}, {activate: true});

    // prepare the activation history
    partActivationInstantProviderSpyObj.getActivationInstant
      .withArgs('part.A').and.returnValue(3)
      .withArgs('part.B').and.returnValue(1)
      .withArgs('part.C').and.returnValue(4)
      .withArgs('part.D').and.returnValue(2)
      .withArgs('part.E').and.returnValue(5);

    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part.E');

    workbenchLayout = workbenchLayout.removePart('part.E');
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part.C');

    workbenchLayout = workbenchLayout.removePart('part.C');
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part.A');

    workbenchLayout = workbenchLayout.removePart('part.A');
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part.D');

    workbenchLayout = workbenchLayout.removePart('part.D');
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part.B');
  });

  /**
   * The test operates on the following layout:
   *
   * +----+---+
   * | B  |   |
   * +----+ A |
   * | C  |   |
   * +----+---+
   */
  it('should (not) activate the part when adding a view to it', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.A'});

    let workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.B', {relativeTo: 'part.A', align: 'left'})
      .addPart('part.C', {relativeTo: 'part.B', align: 'bottom'});

    // make part 'B' the active part
    workbenchLayout = workbenchLayout.activatePart('part.B');
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part.B');

    // add view to the part 'A'
    workbenchLayout = workbenchLayout.addView('view.1', {partId: 'part.A'});
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part.B');

    // add view to the part 'A'
    workbenchLayout = workbenchLayout.addView('view.2', {partId: 'part.A', activatePart: false});
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part.B');

    // add view to the part 'A'
    workbenchLayout = workbenchLayout.addView('view.3', {partId: 'part.A', activatePart: true});
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part.A');

    // add view to the part 'C'
    workbenchLayout = workbenchLayout.addView('view.4', {partId: 'part.C'});
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part.A');
  });

  /**
   * The test operates on the following layout:
   *
   * +----+---+
   * | B  |   |
   * +----+ A |
   * | C  |   |
   * +----+---+
   */
  it('should (not) activate the part when activating one of its views', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.A'});

    let workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.B', {relativeTo: 'part.A', align: 'left'})
      .addPart('part.C', {relativeTo: 'part.B', align: 'bottom'})
      .addView('view.1', {partId: 'part.A'})
      .addView('view.2', {partId: 'part.A'})
      .addView('view.3', {partId: 'part.B'})
      .addView('view.4', {partId: 'part.C'});

    // make part 'B' the active part
    workbenchLayout = workbenchLayout.activatePart('part.B');
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part.B');

    // activate view.1
    workbenchLayout = workbenchLayout.activateView('view.1');
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part.B');

    // activate view.2
    workbenchLayout = workbenchLayout.activateView('view.2', {activatePart: true});
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part.A');

    // activate view.3
    workbenchLayout = workbenchLayout.activateView('view.3', {activatePart: false});
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part.A');

    // activate view.4
    workbenchLayout = workbenchLayout.activateView('view.4');
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part.A');
  });

  /**
   * The test operates on the following layout:
   *
   * +---+---+---+---+
   * | A | B | C | D |
   * *---+---+---+---+
   */
  it('should (not) activate the part when adding a new part to the layout', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.A'});

    let workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory).addPart(MAIN_AREA);
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part.A');

    // add part to the right of part 'A'
    workbenchLayout = workbenchLayout.addPart('part.B', {relativeTo: 'part.A', align: 'right'});
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part.A');

    // add part to the right of part 'B'
    workbenchLayout = workbenchLayout.addPart('part.C', {relativeTo: 'part.B', align: 'right'}, {activate: false});
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part.A');

    // add part to the right of part 'C'
    workbenchLayout = workbenchLayout.addPart('part.D', {relativeTo: 'part.C', align: 'right'}, {activate: true});
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part.D');
  });

  /**
   * The test operates on the following layout:
   *
   * +----+---+
   * | B  |   |
   * +----+ A |
   * | C  |   |
   * +----+---+
   */
  it('should not activate the part when removing a view from it', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.A'});

    let workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.B', {relativeTo: 'part.A', align: 'left'})
      .addView('view.1', {partId: 'part.A'})
      .addView('view.2', {partId: 'part.A'})
      .addView('view.3', {partId: 'part.B'})
      .addView('view.4', {partId: 'part.B'})
      .addPart('part.C', {relativeTo: 'part.B', align: 'bottom'})
      .addView('view.5', {partId: 'part.C'})
      .addView('view.6', {partId: 'part.C'})
      .activatePart('part.B');

    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part.B');

    // remove view from the part 'A'
    workbenchLayout = workbenchLayout.removeView('view.1');
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part.B');

    // remove view from the part 'C'
    workbenchLayout = workbenchLayout.removeView('view.5');
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part.B');
  });

  /**
   * The test operates on the following layout:
   *
   * +----+---+
   * | B  |   |
   * +----+ A |
   * | C  |   |
   * +----+---+
   */
  it('activates the part when activating a view of it', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.A'});

    let workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.B', {relativeTo: 'part.A', align: 'left'})
      .addView('view.1', {partId: 'part.A'})
      .addView('view.2', {partId: 'part.A'})
      .addView('view.3', {partId: 'part.B'})
      .addView('view.4', {partId: 'part.B'})
      .addPart('part.C', {relativeTo: 'part.B', align: 'bottom'})
      .addView('view.5', {partId: 'part.C'})
      .addView('view.6', {partId: 'part.C'});

    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part.A');

    // activate view of the part 'A'
    workbenchLayout = workbenchLayout.activateView('view.1', {activatePart: true});
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part.A');

    // activate view of the part 'C'
    workbenchLayout = workbenchLayout.activateView('view.5', {activatePart: false});
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part.A');

    // activate view of the part 'B'
    workbenchLayout = workbenchLayout.activateView('view.3');
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part.A');
  });

  /**
   * The test operates on the following layout:
   *
   * +----+---+
   * | B  |   |
   * +----+ A |
   * | C  |   |
   * +----+---+
   */
  it('should (not) activate the part when moving a view to it', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.A'});

    let workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.B', {relativeTo: 'part.A', align: 'left'})
      .addView('view.1', {partId: 'part.A'})
      .addView('view.2', {partId: 'part.A'})
      .addView('view.3', {partId: 'part.B'})
      .addView('view.4', {partId: 'part.B'})
      .addPart('part.C', {relativeTo: 'part.B', align: 'bottom'})
      .addView('view.5', {partId: 'part.C'})
      .addView('view.6', {partId: 'part.C'});

    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part.A');

    // move view from part 'A' to part 'C'
    workbenchLayout = workbenchLayout.moveView('view.1', 'part.C', {activateView: true});
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part.A');

    // move view from part 'C' to part 'B'
    workbenchLayout = workbenchLayout.moveView('view.1', 'part.B', {activateView: true, activatePart: true});
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part.B');

    // move view from part 'C' to part 'A'
    workbenchLayout = workbenchLayout.moveView('view.1', 'part.A', {activateView: true, activatePart: false});
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part.B');
  });

  it('should remove view', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.initial'});

    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addView('view.1', {partId: 'part.initial'})
      .addView('view.2', {partId: 'part.initial'})
      .addView('view.3', {partId: 'part.initial'})
      .removeView('view.2', {force: true});

    expect(workbenchLayout.view({viewId: 'view.1'}, {orElse: null})).toBeDefined();
    expect(workbenchLayout.view({viewId: 'view.2'}, {orElse: null})).toBeNull();
    expect(workbenchLayout.view({viewId: 'view.3'}, {orElse: null})).toBeDefined();
  });

  it('should unset `activeViewId` when removing the last view', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.initial'});

    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addView('view.1', {partId: 'part.initial'})
      .removeView('view.1', {force: true});

    expect(workbenchLayout.view({viewId: 'view.1'}, {orElse: null})).toBeDefined();
    expect(workbenchLayout.part({partId: 'part.initial'}).activeViewId).toBeUndefined();
  });

  it('should mark view for removal', async () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.initial'});

    let workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addView('view.1', {partId: 'part.initial'})
      .addView('view.2', {partId: 'part.initial'})
      .addView('view.3', {partId: 'part.initial'});

    // Mark views for removal.
    workbenchLayout = workbenchLayout.removeView('view.1');
    workbenchLayout = workbenchLayout.removeView('view.2');

    // Expect views not to be removed, but marked for removal.
    const view1 = workbenchLayout.view({viewId: 'view.1'});
    const view2 = workbenchLayout.view({viewId: 'view.2'});
    const view3 = workbenchLayout.view({viewId: 'view.3'});

    expect(workbenchLayout.views({markedForRemoval: true}).map(view => view.id)).toEqual(['view.1', 'view.2']);
    expect(view1.markedForRemoval).toBeTrue();
    expect(view2.markedForRemoval).toBeTrue();
    expect(view3.markedForRemoval).toBeUndefined();

    // Remove view 2.
    workbenchLayout = workbenchLayout.removeView('view.2', {force: true});

    // Expect views to be removed.
    expect(workbenchLayout.views({markedForRemoval: true}).map(view => view.id)).toEqual(['view.1']);
    expect(workbenchLayout.view({viewId: 'view.1'}, {orElse: null})).toEqual(view1);
    expect(workbenchLayout.view({viewId: 'view.2'}, {orElse: null})).toBeNull();
    expect(workbenchLayout.view({viewId: 'view.3'}, {orElse: null})).toEqual(view3);

    // Remove views marked for removal.
    workbenchLayout = workbenchLayout.removeView('view.1', {force: true});

    // Expect views to be removed.
    expect(workbenchLayout.view({viewId: 'view.1'}, {orElse: null})).toBeNull();
    expect(workbenchLayout.view({viewId: 'view.2'}, {orElse: null})).toBeNull();
    expect(workbenchLayout.view({viewId: 'view.3'}, {orElse: null})).toEqual(view3);
  });

  it('should find parts by criteria', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.initial'});

    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.innerLeft', {relativeTo: 'part.initial', align: 'left'})
      .addPart('part.innerRight', {relativeTo: 'part.initial', align: 'right'})
      .addPart('part.outerLeft', {relativeTo: MAIN_AREA, align: 'left'})
      .addPart('part.outerRight', {relativeTo: MAIN_AREA, align: 'right'})
      .addView('view.1', {partId: 'part.innerLeft'})
      .addView('view.2', {partId: 'part.outerLeft'});

    // Find without criteria.
    expect(workbenchLayout.parts().map(part => part.id)).toEqual(jasmine.arrayWithExactContents([
      MAIN_AREA,
      'part.outerLeft',
      'part.innerLeft',
      'part.initial',
      'part.innerRight',
      'part.outerRight',
    ]));

    // Find by part id.
    expect(workbenchLayout.parts({id: undefined}).map(part => part.id)).toEqual(jasmine.arrayWithExactContents([MAIN_AREA, 'part.outerLeft', 'part.innerLeft', 'part.initial', 'part.innerRight', 'part.outerRight']));
    expect(workbenchLayout.parts({id: 'part.innerLeft'}).map(part => part.id)).toEqual(['part.innerLeft']);

    // Find by view id.
    expect(workbenchLayout.parts({viewId: undefined}).map(part => part.id)).toEqual(jasmine.arrayWithExactContents([MAIN_AREA, 'part.outerLeft', 'part.innerLeft', 'part.initial', 'part.innerRight', 'part.outerRight']));
    expect(workbenchLayout.parts({viewId: 'view.1'}).map(part => part.id)).toEqual(['part.innerLeft']);
    expect(workbenchLayout.parts({viewId: 'view.2'}).map(part => part.id)).toEqual(['part.outerLeft']);

    // Find by peripheral.
    expect(workbenchLayout.parts({peripheral: undefined}).map(part => part.id)).toEqual(jasmine.arrayWithExactContents([MAIN_AREA, 'part.outerLeft', 'part.innerLeft', 'part.initial', 'part.innerRight', 'part.outerRight']));
    expect(workbenchLayout.parts({peripheral: true}).map(part => part.id)).toEqual(jasmine.arrayWithExactContents(['part.outerLeft', 'part.outerRight']));
    expect(workbenchLayout.parts({peripheral: false}).map(part => part.id)).toEqual(jasmine.arrayWithExactContents(['part.innerLeft', 'part.innerRight', 'part.initial', MAIN_AREA]));

    // Find by grid.
    expect(workbenchLayout.parts({grid: undefined}).map(part => part.id)).toEqual(jasmine.arrayWithExactContents([MAIN_AREA, 'part.outerLeft', 'part.innerLeft', 'part.initial', 'part.innerRight', 'part.outerRight']));
    expect(workbenchLayout.parts({grid: 'main'}).map(part => part.id)).toEqual(jasmine.arrayWithExactContents(['part.outerLeft', MAIN_AREA, 'part.outerRight']));
    expect(workbenchLayout.parts({grid: 'mainArea'}).map(part => part.id)).toEqual(jasmine.arrayWithExactContents(['part.innerLeft', 'part.initial', 'part.innerRight']));

    // Expect to throw if finding multiple parts.
    expect(() => workbenchLayout.parts({}, {throwIfMulti: true})).toThrowError(/MultiPartError/);
    // Expect to throw if finding no part.
    expect(() => workbenchLayout.parts({id: 'part.99'}, {throwIfEmpty: true})).toThrowError(/NullPartError/);
    // Expect empty array if finding no part.
    expect(workbenchLayout.parts({id: 'part.99'})).toEqual([]);
  });

  it('should find part by criteria', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.initial'});

    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.innerLeft', {relativeTo: 'part.initial', align: 'left'})
      .addPart('part.innerRight', {relativeTo: 'part.initial', align: 'right'})
      .addPart('part.outerLeft', {relativeTo: MAIN_AREA, align: 'left'})
      .addPart('part.outerRight', {relativeTo: MAIN_AREA, align: 'right'})
      .addView('view.1', {partId: 'part.innerLeft'})
      .addView('view.2', {partId: 'part.innerRight'})
      .addView('view.3', {partId: 'part.outerLeft'})
      .addView('view.4', {partId: 'part.outerRight'});

    // Find by part id.
    expect(workbenchLayout.part({partId: 'part.outerLeft'}).id).toEqual('part.outerLeft');
    expect(workbenchLayout.part({partId: 'part.innerLeft'}).id).toEqual('part.innerLeft');
    expect(workbenchLayout.part({partId: 'part.innerRight'}).id).toEqual('part.innerRight');
    expect(workbenchLayout.part({partId: 'part.outerRight'}).id).toEqual('part.outerRight');

    // Find by grid and part id.
    expect(workbenchLayout.part({grid: 'main', partId: 'part.outerLeft'}).id).toEqual('part.outerLeft');
    expect(workbenchLayout.part({grid: 'mainArea', partId: 'part.innerLeft'}).id).toEqual('part.innerLeft');
    expect(workbenchLayout.part({grid: 'mainArea', partId: 'part.innerRight'}).id).toEqual('part.innerRight');
    expect(workbenchLayout.part({grid: 'main', partId: 'part.outerRight'}).id).toEqual('part.outerRight');

    // Find by view id.
    expect(workbenchLayout.part({viewId: 'view.1'}).id).toEqual('part.innerLeft');
    expect(workbenchLayout.part({viewId: 'view.2'}).id).toEqual('part.innerRight');
    expect(workbenchLayout.part({viewId: 'view.3'}).id).toEqual('part.outerLeft');
    expect(workbenchLayout.part({viewId: 'view.4'}).id).toEqual('part.outerRight');

    // Find by grid and view id.
    expect(workbenchLayout.part({grid: 'mainArea', viewId: 'view.1'}).id).toEqual('part.innerLeft');
    expect(workbenchLayout.part({grid: 'mainArea', viewId: 'view.2'}).id).toEqual('part.innerRight');
    expect(workbenchLayout.part({grid: 'main', viewId: 'view.3'}).id).toEqual('part.outerLeft');
    expect(workbenchLayout.part({grid: 'main', viewId: 'view.4'}).id).toEqual('part.outerRight');

    // Find by part id and view id.
    expect(workbenchLayout.part({partId: 'part.innerLeft', viewId: 'view.1'}).id).toEqual('part.innerLeft');
    expect(workbenchLayout.part({partId: 'part.innerRight', viewId: 'view.2'}).id).toEqual('part.innerRight');
    expect(workbenchLayout.part({partId: 'part.outerLeft', viewId: 'view.3'}).id).toEqual('part.outerLeft');
    expect(workbenchLayout.part({partId: 'part.outerRight', viewId: 'view.4'}).id).toEqual('part.outerRight');

    // Find by grid, part id and view id.
    expect(workbenchLayout.part({grid: 'mainArea', partId: 'part.innerLeft', viewId: 'view.1'}).id).toEqual('part.innerLeft');
    expect(workbenchLayout.part({grid: 'mainArea', partId: 'part.innerRight', viewId: 'view.2'}).id).toEqual('part.innerRight');
    expect(workbenchLayout.part({grid: 'main', partId: 'part.outerLeft', viewId: 'view.3'}).id).toEqual('part.outerLeft');
    expect(workbenchLayout.part({grid: 'main', partId: 'part.outerRight', viewId: 'view.4'}).id).toEqual('part.outerRight');

    // Expect to throw if finding no part.
    expect(() => workbenchLayout.part({partId: 'part.99'})).toThrowError(/NullPartError/);
    // Expect to return null if finding no part.
    expect(workbenchLayout.part({partId: 'part.99'}, {orElse: null})).toBeNull();
  });

  it('should find grid by criteria', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.initial'});

    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.innerLeft', {relativeTo: 'part.initial', align: 'left'})
      .addPart('part.innerRight', {relativeTo: 'part.initial', align: 'right'})
      .addPart('part.outerLeft', {relativeTo: MAIN_AREA, align: 'left'})
      .addPart('part.outerRight', {relativeTo: MAIN_AREA, align: 'right'})
      .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
      .addPart('part.activity-2-top', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 2', ɵactivityId: 'activity.2'})
      .addPart('part.activity-2-bottom', {relativeTo: 'part.activity-2-top', align: 'bottom'})
      .addView('view.1', {partId: 'part.innerLeft'})
      .addView('view.2', {partId: 'part.innerRight'})
      .addView('view.3', {partId: 'part.outerLeft'})
      .addView('view.4', {partId: 'part.outerRight'})
      .addView('view.5', {partId: 'part.activity-1'})
      .addView('view.6', {partId: 'part.activity-2-top'})
      .addView('view.7', {partId: 'part.activity-2-bottom'});

    // Find by part id.
    expect(workbenchLayout.grid({partId: 'part.innerLeft'})).toEqual({gridName: 'mainArea', grid: workbenchLayout.grids.mainArea});
    expect(workbenchLayout.grid({partId: 'part.innerRight'})).toEqual({gridName: 'mainArea', grid: workbenchLayout.grids.mainArea});
    expect(workbenchLayout.grid({partId: 'part.outerLeft'})).toEqual({gridName: 'main', grid: workbenchLayout.grids.main});
    expect(workbenchLayout.grid({partId: 'part.outerRight'})).toEqual({gridName: 'main', grid: workbenchLayout.grids.main});
    expect(workbenchLayout.grid({partId: 'part.activity-1'})).toEqual({gridName: 'activity.1', grid: workbenchLayout.grids['activity.1']});
    expect(workbenchLayout.grid({partId: 'part.activity-2-top'})).toEqual({gridName: 'activity.2', grid: workbenchLayout.grids['activity.2']});
    expect(workbenchLayout.grid({partId: 'part.activity-2-bottom'})).toEqual({gridName: 'activity.2', grid: workbenchLayout.grids['activity.2']});

    // Find by node id.
    const rootNode = workbenchLayout.grids['activity.2']!.root;
    expect(workbenchLayout.grid({nodeId: rootNode.id})).toEqual({gridName: 'activity.2', grid: workbenchLayout.grids['activity.2']});

    // Find by view id.
    expect(workbenchLayout.grid({viewId: 'view.1'})).toEqual({gridName: 'mainArea', grid: workbenchLayout.grids.mainArea});
    expect(workbenchLayout.grid({viewId: 'view.2'})).toEqual({gridName: 'mainArea', grid: workbenchLayout.grids.mainArea});
    expect(workbenchLayout.grid({viewId: 'view.3'})).toEqual({gridName: 'main', grid: workbenchLayout.grids.main});
    expect(workbenchLayout.grid({viewId: 'view.4'})).toEqual({gridName: 'main', grid: workbenchLayout.grids.main});
    expect(workbenchLayout.grid({viewId: 'view.5'})).toEqual({gridName: 'activity.1', grid: workbenchLayout.grids['activity.1']});
    expect(workbenchLayout.grid({viewId: 'view.6'})).toEqual({gridName: 'activity.2', grid: workbenchLayout.grids['activity.2']});
    expect(workbenchLayout.grid({viewId: 'view.7'})).toEqual({gridName: 'activity.2', grid: workbenchLayout.grids['activity.2']});

    // Find by grid.
    expect(workbenchLayout.grid({grid: workbenchLayout.grids.main})).toEqual({gridName: 'main', grid: workbenchLayout.grids.main});
    expect(workbenchLayout.grid({grid: workbenchLayout.grids.mainArea!})).toEqual({gridName: 'mainArea', grid: workbenchLayout.grids.mainArea});
    expect(workbenchLayout.grid({grid: workbenchLayout.grids['activity.1']!})).toEqual({gridName: 'activity.1', grid: workbenchLayout.grids['activity.1']});
    expect(workbenchLayout.grid({grid: workbenchLayout.grids['activity.2']!})).toEqual({gridName: 'activity.2', grid: workbenchLayout.grids['activity.2']});

    // Expect to throw if finding no grid.
    expect(() => workbenchLayout.grid({partId: 'part.99'})).toThrowError(/NullGridError/);
    // Expect to return null if finding no grid.
    expect(workbenchLayout.grid({partId: 'part.99'}, {orElse: null})).toBeNull();
  });

  /**
   * The test operates on the following layout:
   *
   *           MTreeNode (root)
   *                |
   *    +-----------+-----------+
   *    |                       |
   * part.left                MTreeNode (child)
   *                      +-----+-----+
   *                      |           |
   *                   part.right  part.bottom
   */
  it('should find tree node by criteria', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.initial'});

    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart('part.left')
      .addPart('part.right', {align: 'right', relativeTo: 'part.left'})
      .addPart('part.bottom', {align: 'bottom', relativeTo: 'part.right'});

    const rootTreeNode = workbenchLayout.part({partId: 'part.left'}).parent!;
    const childTreeNode = workbenchLayout.part({partId: 'part.right'}).parent!;

    // Find by node id.
    expect(workbenchLayout.treeNode({nodeId: childTreeNode.id})).toBe(childTreeNode);
    expect(workbenchLayout.treeNode({nodeId: childTreeNode.id})).toBe(workbenchLayout.part({partId: 'part.right'}).parent);
    expect(workbenchLayout.treeNode({nodeId: childTreeNode.id})).toBe(workbenchLayout.part({partId: 'part.bottom'}).parent);
    expect(workbenchLayout.treeNode({nodeId: rootTreeNode.id})).toBe(rootTreeNode);
    expect(workbenchLayout.treeNode({nodeId: rootTreeNode.id})).toBe(childTreeNode.parent);
  });

  it('should return whether a part is contained in the layout', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.initial'});

    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.inner', {relativeTo: 'part.initial', align: 'left'})
      .addPart('part.outer', {relativeTo: MAIN_AREA, align: 'left'})
      .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
      .addPart('part.activity-2-top', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 2', ɵactivityId: 'activity.2'})
      .addPart('part.activity-2-bottom', {relativeTo: 'part.activity-2-top', align: 'bottom'});

    expect(workbenchLayout.hasPart('part.initial', {grid: 'mainArea'})).toBeTrue();
    expect(workbenchLayout.hasPart('part.inner', {grid: 'mainArea'})).toBeTrue();
    expect(workbenchLayout.hasPart('part.outer', {grid: 'mainArea'})).toBeFalse();
    expect(workbenchLayout.hasPart(MAIN_AREA, {grid: 'mainArea'})).toBeFalse();

    expect(workbenchLayout.hasPart('part.activity-1', {grid: 'activity.1'})).toBeTrue();
    expect(workbenchLayout.hasPart('part.activity-1', {grid: 'activity.2'})).toBeFalse();
    expect(workbenchLayout.hasPart('part.activity-1', {grid: 'mainArea'})).toBeFalse();

    expect(workbenchLayout.hasPart('part.activity-2-top', {grid: 'activity.2'})).toBeTrue();
    expect(workbenchLayout.hasPart('part.activity-2-top', {grid: 'activity.1'})).toBeFalse();
    expect(workbenchLayout.hasPart('part.activity-2-top', {grid: 'mainArea'})).toBeFalse();

    expect(workbenchLayout.hasPart('part.activity-2-bottom', {grid: 'activity.2'})).toBeTrue();
    expect(workbenchLayout.hasPart('part.activity-2-bottom', {grid: 'activity.1'})).toBeFalse();
    expect(workbenchLayout.hasPart('part.activity-2-bottom', {grid: 'mainArea'})).toBeFalse();
  });

  it('should return whether a view is contained in the layout', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.initial'});

    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.inner', {relativeTo: 'part.initial', align: 'left'})
      .addPart('part.outer', {relativeTo: MAIN_AREA, align: 'left'})
      .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
      .addPart('part.activity-2-top', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 2', ɵactivityId: 'activity.2'})
      .addPart('part.activity-2-bottom', {relativeTo: 'part.activity-2-top', align: 'bottom'})
      .addView('view.1', {partId: 'part.inner'})
      .addView('view.2', {partId: 'part.outer'})
      .addView('view.3', {partId: 'part.activity-1'})
      .addView('view.4', {partId: 'part.activity-2-top'});

    expect(workbenchLayout.hasView('view.1')).toBeTrue();
    expect(workbenchLayout.hasView('view.1', {grid: 'mainArea'})).toBeTrue();
    expect(workbenchLayout.hasView('view.1', {grid: 'main'})).toBeFalse();

    expect(workbenchLayout.hasView('view.2')).toBeTrue();
    expect(workbenchLayout.hasView('view.2', {grid: 'mainArea'})).toBeFalse();
    expect(workbenchLayout.hasView('view.2', {grid: 'main'})).toBeTrue();

    expect(workbenchLayout.hasView('view.3')).toBeTrue();
    expect(workbenchLayout.hasView('view.3', {grid: 'mainArea'})).toBeFalse();
    expect(workbenchLayout.hasView('view.3', {grid: 'main'})).toBeFalse();
    expect(workbenchLayout.hasView('view.3', {grid: 'activity.1'})).toBeTrue();
    expect(workbenchLayout.hasView('view.3', {grid: 'activity.2'})).toBeFalse();

    expect(workbenchLayout.hasView('view.4')).toBeTrue();
    expect(workbenchLayout.hasView('view.4', {grid: 'mainArea'})).toBeFalse();
    expect(workbenchLayout.hasView('view.4', {grid: 'main'})).toBeFalse();
    expect(workbenchLayout.hasView('view.4', {grid: 'activity.1'})).toBeFalse();
    expect(workbenchLayout.hasView('view.4', {grid: 'activity.2'})).toBeTrue();

    expect(workbenchLayout.hasView('view.99')).toBeFalse();
    expect(workbenchLayout.hasView('view.99', {grid: 'mainArea'})).toBeFalse();
    expect(workbenchLayout.hasView('view.99', {grid: 'main'})).toBeFalse();
    expect(workbenchLayout.hasView('view.99', {grid: 'activity.1'})).toBeFalse();
    expect(workbenchLayout.hasView('view.99', {grid: 'activity.2'})).toBeFalse();
  });

  it('should find views by criteria', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.initial'});

    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.inner', {relativeTo: 'part.initial', align: 'left'})
      .addPart('part.outer', {relativeTo: MAIN_AREA, align: 'left'})
      .addView('view.1', {partId: 'part.initial'})
      .addView('view.2', {partId: 'part.inner'})
      .addView('view.3', {partId: 'part.outer'})
      .navigateView('view.1', ['path/to/view'], {hint: 'hint1'})
      .navigateView('view.2', ['path/to/view'], {hint: 'hint2'})
      .navigateView('view.3', ['path/to/view']);

    // Find without criteria.
    expect(workbenchLayout.views().map(view => view.id)).toEqual(jasmine.arrayWithExactContents(['view.1', 'view.2', 'view.3']));

    // Find by view id.
    expect(workbenchLayout.views({id: undefined}).map(view => view.id)).toEqual(jasmine.arrayWithExactContents(['view.1', 'view.2', 'view.3']));
    expect(workbenchLayout.views({id: 'view.1'}).map(view => view.id)).toEqual(['view.1']);

    // Find by part id.
    expect(workbenchLayout.views({partId: undefined}).map(view => view.id)).toEqual(jasmine.arrayWithExactContents(['view.1', 'view.2', 'view.3']));
    expect(workbenchLayout.views({partId: 'part.initial'}).map(view => view.id)).toEqual(['view.1']);
    expect(workbenchLayout.views({partId: 'part.inner'}).map(view => view.id)).toEqual(['view.2']);
    expect(workbenchLayout.views({partId: 'part.outer'}).map(view => view.id)).toEqual(['view.3']);

    // Find by peripheral.
    expect(workbenchLayout.views({peripheral: undefined}).map(view => view.id)).toEqual(jasmine.arrayWithExactContents(['view.1', 'view.2', 'view.3']));
    expect(workbenchLayout.views({peripheral: true}).map(view => view.id)).toEqual(jasmine.arrayWithExactContents(['view.3']));
    expect(workbenchLayout.views({peripheral: false}).map(view => view.id)).toEqual(jasmine.arrayWithExactContents(['view.1', 'view.2']));

    // Find by grid.
    expect(workbenchLayout.views({grid: undefined}).map(view => view.id)).toEqual(jasmine.arrayWithExactContents(['view.1', 'view.2', 'view.3']));
    expect(workbenchLayout.views({grid: 'main'}).map(view => view.id)).toEqual(jasmine.arrayWithExactContents(['view.3']));
    expect(workbenchLayout.views({grid: 'mainArea'}).map(view => view.id)).toEqual(jasmine.arrayWithExactContents(['view.1', 'view.2']));

    // Find by navigation hint.
    expect(workbenchLayout.views({navigationHint: undefined}).map(view => view.id)).toEqual(jasmine.arrayWithExactContents(['view.1', 'view.2', 'view.3']));
    expect(workbenchLayout.views({navigationHint: 'hint1'}).map(view => view.id)).toEqual(jasmine.arrayWithExactContents(['view.1']));
    expect(workbenchLayout.views({navigationHint: 'hint2'}).map(view => view.id)).toEqual(jasmine.arrayWithExactContents(['view.2']));
    expect(workbenchLayout.views({navigationHint: ''}).map(view => view.id)).toEqual([]);
    expect(workbenchLayout.views({navigationHint: null}).map(view => view.id)).toEqual(['view.3']);

    // Expect to throw if finding multiple views.
    expect(() => workbenchLayout.views({}, {throwIfMulti: true})).toThrowError(/MultiViewError/);
    // Expect to throw if finding no view.
    expect(() => workbenchLayout.views({id: 'view.99'}, {throwIfEmpty: true})).toThrowError(/NullViewError/);
    // Expect empty array if finding no view.
    expect(workbenchLayout.views({id: 'view.99'})).toEqual([]);
  });

  it('should find views by URL segments', () => {
    const layout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addView('view.1', {partId: MAIN_AREA})
      .addView('view.2', {partId: MAIN_AREA})
      .addView('view.3', {partId: MAIN_AREA})
      .navigateView('view.1', ['path', 'to', 'view', '1'])
      .navigateView('view.2', ['path', 'to', 'view', '2'])
      .navigateView('view.3', ['path', 'to', 'view', '2']);

    expect(layout
      .views({segments: new UrlSegmentMatcher(segments(['path']), {matchWildcardPath: false, matchMatrixParams: false})})
      .map(view => view.id),
    ).toEqual([]);

    expect(layout
      .views({segments: new UrlSegmentMatcher(segments(['path', 'to', 'view']), {matchWildcardPath: false, matchMatrixParams: false})})
      .map(view => view.id),
    ).toEqual([]);

    expect(layout
      .views({segments: new UrlSegmentMatcher(segments(['path', 'to', 'view', '1']), {matchWildcardPath: false, matchMatrixParams: false})})
      .map(view => view.id),
    ).toEqual(['view.1']);

    expect(layout
      .views({segments: new UrlSegmentMatcher(segments(['path', 'to', 'view', '2']), {matchWildcardPath: false, matchMatrixParams: false})})
      .map(view => view.id),
    ).toEqual(jasmine.arrayWithExactContents(['view.2', 'view.3']));

    expect(layout
      .views({segments: new UrlSegmentMatcher(segments(['path', 'to', 'view', '*']), {matchWildcardPath: false, matchMatrixParams: false})})
      .map(view => view.id),
    ).toEqual([]);

    expect(layout
      .views({segments: new UrlSegmentMatcher(segments(['path', 'to', 'view', '*']), {matchWildcardPath: true, matchMatrixParams: false})})
      .map(view => view.id),
    ).toEqual(jasmine.arrayWithExactContents(['view.1', 'view.2', 'view.3']));
  });

  it('should find views by URL segments (matrix params matching)', () => {
    const layout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addView('view.1', {partId: MAIN_AREA})
      .addView('view.2', {partId: MAIN_AREA})
      .addView('view.3', {partId: MAIN_AREA})
      .navigateView('view.1', ['path', 'to', 'view'])
      .navigateView('view.2', ['path', 'to', 'view', {matrixParam: 'A'}])
      .navigateView('view.3', ['path', 'to', 'view', {matrixParam: 'B'}]);

    expect(layout
      .views({segments: new UrlSegmentMatcher(segments(['path', 'to', 'view']), {matchWildcardPath: false, matchMatrixParams: false})})
      .map(view => view.id),
    ).toEqual(jasmine.arrayWithExactContents(['view.1', 'view.2', 'view.3']));

    expect(layout
      .views({segments: new UrlSegmentMatcher(segments(['path', 'to', 'view']), {matchWildcardPath: false, matchMatrixParams: true})})
      .map(view => view.id),
    ).toEqual(['view.1']);

    expect(layout
      .views({segments: new UrlSegmentMatcher(segments(['path', 'to', 'view', {matrixParam: 'A'}]), {matchWildcardPath: false, matchMatrixParams: false})})
      .map(view => view.id),
    ).toEqual(jasmine.arrayWithExactContents(['view.1', 'view.2', 'view.3']));

    expect(layout
      .views({segments: new UrlSegmentMatcher(segments(['path', 'to', 'view', {matrixParam: 'A'}]), {matchWildcardPath: false, matchMatrixParams: true})})
      .map(view => view.id),
    ).toEqual(['view.2']);
  });

  it('should find view by criteria', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.initial'});

    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addView('view.1', {partId: 'part.initial'})
      .addView('view.2', {partId: 'part.initial'});

    // Find by view id.
    expect(workbenchLayout.view({viewId: 'view.1'}).id).toEqual('view.1');

    // Expect to throw if finding no view.
    expect(() => workbenchLayout.view({viewId: 'view.99'})).toThrowError(/NullViewError/);
    // Expect to return null if finding no view.
    expect(workbenchLayout.view({viewId: 'view.99'}, {orElse: null})).toBeNull();
  });

  it('should activate adjacent view', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.initial'});

    let workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.part', {relativeTo: 'part.initial', align: 'left'})
      .addView('view.1', {partId: 'part.part'})
      .addView('view.2', {partId: 'part.part'})
      .addView('view.3', {partId: 'part.part'});

    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part.initial');
    expect(workbenchLayout.part({partId: 'part.part'}).activeViewId).toBeUndefined();

    // Activate adjacent view
    workbenchLayout = workbenchLayout.activateAdjacentView('view.2');
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part.initial');
    expect(workbenchLayout.part({partId: 'part.part'}).activeViewId).toEqual('view.1');

    // Activate adjacent view
    workbenchLayout = workbenchLayout.activateAdjacentView('view.3');
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part.initial');
    expect(workbenchLayout.part({partId: 'part.part'}).activeViewId).toEqual('view.2');

    // Activate adjacent view
    workbenchLayout = workbenchLayout.activateAdjacentView('view.1');
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part.initial');
    expect(workbenchLayout.part({partId: 'part.part'}).activeViewId).toEqual('view.2');

    // Activate adjacent view
    workbenchLayout = workbenchLayout.activateAdjacentView('view.2', {activatePart: true});
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part.part');
    expect(workbenchLayout.part({partId: 'part.part'}).activeViewId).toEqual('view.1');
  });

  it('should allow activating a part', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.initial'});

    let workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.innerLeft', {relativeTo: 'part.initial', align: 'left'})
      .addPart('part.innerRight', {relativeTo: 'part.initial', align: 'right'})
      .addPart('part.outerLeft', {relativeTo: MAIN_AREA, align: 'left'})
      .addPart('part.outerRight', {relativeTo: MAIN_AREA, align: 'right'});

    expect(workbenchLayout.activePart({grid: 'main'}).id).toEqual(MAIN_AREA);
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part.initial');

    // Activate part 'outerLeft'
    workbenchLayout = workbenchLayout.activatePart('part.outerLeft');
    expect(workbenchLayout.activePart({grid: 'main'}).id).toEqual('part.outerLeft');
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part.initial');

    // Activate part 'outerRight'
    workbenchLayout = workbenchLayout.activatePart('part.outerRight');
    expect(workbenchLayout.activePart({grid: 'main'}).id).toEqual('part.outerRight');
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part.initial');

    // Activate part 'innerLeft'
    workbenchLayout = workbenchLayout.activatePart('part.innerLeft');
    expect(workbenchLayout.activePart({grid: 'main'}).id).toEqual('part.outerRight');
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part.innerLeft');

    // Activate part 'innerRight'
    workbenchLayout = workbenchLayout.activatePart('part.innerRight');
    expect(workbenchLayout.activePart({grid: 'main'}).id).toEqual('part.outerRight');
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part.innerRight');
  });

  it('should allow renaming a view', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.initial'});

    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.inner', {relativeTo: 'part.initial', align: 'left'})
      .addPart('part.outer', {relativeTo: MAIN_AREA, align: 'left'})
      .addView('view.1', {partId: 'part.inner'})
      .addView('view.2', {partId: 'part.inner'})
      .addView('view.3', {partId: 'part.outer'})
      .addView('view.4', {partId: 'part.outer'})
      .activateView('view.1')
      .activateView('view.3');

    // Rename 'view.1' to 'view.10'
    let changedLayout = workbenchLayout.renameView('view.1', 'view.10');
    expect(changedLayout.views().map(view => view.id)).toEqual(jasmine.arrayWithExactContents(['view.10', 'view.2', 'view.3', 'view.4']));

    // Rename 'view.1' to 'view.10' [grid=mainArea]
    changedLayout = workbenchLayout.renameView('view.1', 'view.10');
    expect(changedLayout.views().map(view => view.id)).toEqual(jasmine.arrayWithExactContents(['view.10', 'view.2', 'view.3', 'view.4']));

    // Rename 'view.3' to 'view.30'
    changedLayout = workbenchLayout.renameView('view.3', 'view.30');
    expect(changedLayout.views().map(view => view.id)).toEqual(jasmine.arrayWithExactContents(['view.1', 'view.2', 'view.30', 'view.4']));

    // Rename 'view.3' to 'view.30' [grid=workbench]
    changedLayout = workbenchLayout.renameView('view.3', 'view.30');
    expect(changedLayout.views().map(view => view.id)).toEqual(jasmine.arrayWithExactContents(['view.1', 'view.2', 'view.30', 'view.4']));

    // Rename 'view.99' (does not exist)
    expect(() => workbenchLayout.renameView('view.99', 'view.999')).toThrowError(/NullViewError/);

    // Rename 'view.1' to 'view.2'
    expect(() => workbenchLayout.renameView('view.1', 'view.2')).toThrowError(/\[ViewRenameError] View id must be unique/);

    // Rename 'view.2' to 'view.3'
    expect(() => workbenchLayout.renameView('view.2', 'view.3')).toThrowError(/\[ViewRenameError] View id must be unique/);

    // Rename 'view.3' to 'view.4'
    expect(() => workbenchLayout.renameView('view.3', 'view.4')).toThrowError(/\[ViewRenameError] View id must be unique/);

    // Rename 'view.1' to 'view.10' and expect activated view to be changed.
    changedLayout = workbenchLayout.renameView('view.1', 'view.10');
    expect(changedLayout.views().map(view => view.id)).toEqual(jasmine.arrayWithExactContents(['view.10', 'view.2', 'view.3', 'view.4']));
    expect(changedLayout.part({viewId: 'view.10'}).activeViewId).toEqual('view.10');

    // Rename 'view.2' to 'view.20' and expect activated view not to be changed.
    changedLayout = workbenchLayout.renameView('view.2', 'view.20');
    expect(changedLayout.views().map(view => view.id)).toEqual(jasmine.arrayWithExactContents(['view.1', 'view.20', 'view.3', 'view.4']));
    expect(changedLayout.part({viewId: 'view.20'}).activeViewId).toEqual('view.1');

    // Rename 'view.3' to 'view.30' and expect activated view to be changed.
    changedLayout = workbenchLayout.renameView('view.3', 'view.30');
    expect(changedLayout.views().map(view => view.id)).toEqual(jasmine.arrayWithExactContents(['view.1', 'view.2', 'view.30', 'view.4']));
    expect(changedLayout.part({viewId: 'view.30'}).activeViewId).toEqual('view.30');

    // Rename 'view.4' to 'view.40' and expect activated view not to be changed.
    changedLayout = workbenchLayout.renameView('view.4', 'view.40');
    expect(changedLayout.views().map(view => view.id)).toEqual(jasmine.arrayWithExactContents(['view.1', 'view.2', 'view.3', 'view.40']));
    expect(changedLayout.part({viewId: 'view.40'}).activeViewId).toEqual('view.3');
  });

  it('should allow setting split ratio', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.left'});

    let workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.right', {relativeTo: 'part.left', align: 'right'});

    // Expect default ratio to be 0.5.
    expect(findParentNode('part.left').ratio).toEqual(.5);

    // Set ratio to 0.3.
    workbenchLayout = workbenchLayout.setTreeNodeSplitRatio(findParentNode('part.left').id, .3);
    expect(findParentNode('part.left').ratio).toEqual(.3);

    // Expect to error if setting the ratio on a node not contained in the layout.
    expect(() => workbenchLayout.setTreeNodeSplitRatio('does-not-exist', .3)).toThrowError(/NullTreeNodeError/);

    // Expect to error if setting an illegal ratio.
    expect(() => workbenchLayout.setTreeNodeSplitRatio(findParentNode('part.left').id, -.1)).toThrowError(/LayoutModifyError/);
    expect(() => workbenchLayout.setTreeNodeSplitRatio(findParentNode('part.left').id, 0)).not.toThrowError(/LayoutModifyError/);
    expect(() => workbenchLayout.setTreeNodeSplitRatio(findParentNode('part.left').id, .5)).not.toThrowError(/LayoutModifyError/);
    expect(() => workbenchLayout.setTreeNodeSplitRatio(findParentNode('part.left').id, 1)).not.toThrowError(/LayoutModifyError/);
    expect(() => workbenchLayout.setTreeNodeSplitRatio(findParentNode('part.left').id, 1.1)).toThrowError(/LayoutModifyError/);

    function findParentNode(partId: PartId): MTreeNode {
      const parent = workbenchLayout.part({partId}).parent;
      if (!parent) {
        throw Error(`[MTreeNodeNotFoundError] Parent MTreeNode not found [partId=${partId}].`);
      }
      return parent;
    }
  });

  it('should reference parts and views by alternative id', () => {
    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart('left-part')
      .addPart('right-part', {relativeTo: 'left-part', align: 'right'})
      .addView('view', {partId: 'right-part'})
      .navigatePart('left-part', ['path/to/part'])
      .navigateView('view', ['path/to/view']);

    const [leftPart] = workbenchLayout.parts({id: 'left-part'}, {throwIfEmpty: true, throwIfMulti: true});
    expect(leftPart.id).toMatch(/part\./);
    expect(leftPart.alternativeId).toEqual('left-part');

    const [rightPart] = workbenchLayout.parts({id: 'left-part'}, {throwIfEmpty: true, throwIfMulti: true});
    expect(rightPart.id).toMatch(/part\./);
    expect(rightPart.alternativeId).toEqual('left-part');

    const [view] = workbenchLayout.views({id: 'view'}, {throwIfEmpty: true, throwIfMulti: true});
    expect(view.id).toMatch(/view\./);
    expect(view.alternativeId).toEqual('view');
  });

  /**
   * This test verifies that identifiers are not re-generated when deserializing the layout.
   *
   * The following identifiers should be stable:
   * - {@link MTreeNode.id}
   * - {@link MPart.id}
   * - {@link MView.id}
   * - {@link MView.navigation.id}
   * - {@link MPart.navigation.id}
   * - {@link MActivity.id}
   */
  it('should have stable identifiers', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          mainAreaInitialPartId: 'part.initial',
          layout: {
            perspectives: [
              {
                id: 'perspective-1',
                layout: factory => factory
                  .addPart(MAIN_AREA)
                  .addPart('part.activity', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
                  .navigatePart('part.activity', ['test-part'])
                  .activatePart('part.activity')
                  .addPart('part.left', {align: 'left'})
                  .addPart('part.right', {align: 'right'})
                  .addView('view.100', {partId: 'part.left'})
                  .navigateView('view.100', ['test-view'])
                  .navigatePart('part.right', ['test-part']),
              },
              {
                id: 'perspective-2',
                layout: factory => factory.addPart(MAIN_AREA),
              },
            ],
          },
        }),
        provideRouter([
          {path: 'test-view', component: TestComponent},
          {path: 'test-part', component: TestComponent},
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Prepare main area to have to parts split vertically.
    await TestBed.inject(WorkbenchRouter).navigate(layout => layout
      .addPart('part.top', {relativeTo: 'part.initial', align: 'top'})
      .addPart('part.bottom', {relativeTo: 'part.top', align: 'bottom'})
      .removePart('part.initial')
      .addView('view.101', {partId: 'part.top'})
      .addView('view.102', {partId: 'part.bottom'})
      .navigateView('view.101', ['test-view'])
      .navigateView('view.102', ['test-view'])
      .activateView('view.101')
      .activateView('view.102'),
    );
    await waitUntilStable();

    // Capture model objects. The ids should not change when serializing and deserializing the layout.
    const workbenchLayoutRoot = TestBed.inject(ɵWorkbenchService).layout().grids.main.root;
    const mainAreaLayoutRoot = TestBed.inject(ɵWorkbenchService).layout().grids.mainArea!.root;
    const activityPart = TestBed.inject(ɵWorkbenchService).layout().part({partId: 'part.activity'});
    const view100 = TestBed.inject(ɵWorkbenchService).layout().view({viewId: 'view.100'});
    const view101 = TestBed.inject(ɵWorkbenchService).layout().view({viewId: 'view.101'});
    const view102 = TestBed.inject(ɵWorkbenchService).layout().view({viewId: 'view.102'});
    const partRight = TestBed.inject(ɵWorkbenchService).layout().part({partId: 'part.right'});
    const mainAreaParentNode = (workbenchLayoutRoot as MTreeNode).child1;

    // Expect initial layout.
    expect(fixture).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [{id: 'activity.1'}],
            activeActivityId: 'activity.1',
          },
        },
      },
      grids: {
        main: {
          root: new MTreeNode({
            id: workbenchLayoutRoot.id,
            direction: 'row',
            ratio: .5,
            child1: new MTreeNode({
              id: mainAreaParentNode.id,
              direction: 'row',
              ratio: .5,
              child1: new MPart({
                id: 'part.left',
                views: [{id: 'view.100', navigation: {id: view100.navigation!.id}}],
                activeViewId: 'view.100',
              }),
              child2: new MPart({
                id: MAIN_AREA,
              }),
            }),
            child2: new MPart({
              id: 'part.right',
              navigation: {id: partRight.navigation!.id},
              views: [],
            }),
          }),
        },
        mainArea: {
          root: new MTreeNode({
            id: mainAreaLayoutRoot.id,
            direction: 'column',
            ratio: .5,
            child1: new MPart({
              id: 'part.top',
              views: [{id: 'view.101', navigation: {id: view101.navigation!.id}}],
              activeViewId: 'view.101',
            }),
            child2: new MPart({
              id: 'part.bottom',
              views: [{id: 'view.102', navigation: {id: view102.navigation!.id}}],
              activeViewId: 'view.102',
            }),
          }),
        },
        'activity.1': {
          root: new MPart({id: 'part.activity', navigation: {id: activityPart.navigation!.id}}),
        },
      },
    });

    // Modify the main area layout, causing the layout to be serialized and deserialized.
    await TestBed.inject(WorkbenchRouter).navigate(layout => layout
      .addView('view.103', {partId: 'part.bottom'})
      .navigateView('view.103', ['test-view']),
    );
    await waitUntilStable();

    // Expect ids not to have changed.
    expect(fixture).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [{id: 'activity.1'}],
            activeActivityId: 'activity.1',
          },
        },
      },
      grids: {
        main: {
          root: new MTreeNode({
            id: workbenchLayoutRoot.id,
            direction: 'row',
            ratio: .5,
            child1: new MTreeNode({
              id: mainAreaParentNode.id,
              direction: 'row',
              ratio: .5,
              child1: new MPart({
                id: 'part.left',
                views: [{id: 'view.100', navigation: {id: view100.navigation!.id}}],
                activeViewId: 'view.100',
              }),
              child2: new MPart({
                id: MAIN_AREA,
              }),
            }),
            child2: new MPart({
              id: 'part.right',
              navigation: {id: partRight.navigation!.id},
              views: [],
            }),
          }),
        },
        mainArea: {
          root: new MTreeNode({
            id: mainAreaLayoutRoot.id,
            direction: 'column',
            ratio: .5,
            child1: new MPart({
              id: 'part.top',
              views: [{id: 'view.101', navigation: {id: view101.navigation!.id}}],
              activeViewId: 'view.101',
            }),
            child2: new MPart({
              id: 'part.bottom',
              views: [
                {id: 'view.102', navigation: {id: view102.navigation!.id}},
                {id: 'view.103', navigation: {id: any()}},
              ],
              activeViewId: 'view.102',
            }),
          }),
        },
        'activity.1': {
          root: new MPart({id: 'part.activity', navigation: {id: activityPart.navigation!.id}}),
        },
      },
    });

    // Switch perspective, causing the layout to be serialized and deserialized.
    await TestBed.inject(WorkbenchService).switchPerspective('perspective-2');
    await TestBed.inject(WorkbenchService).switchPerspective('perspective-1');
    await waitUntilStable();

    // Expect ids not to have changed.
    expect(fixture).toEqualWorkbenchLayout({
      activityLayout: {
        toolbars: {
          leftTop: {
            activities: [{id: 'activity.1'}],
            activeActivityId: 'activity.1',
          },
        },
      },
      grids: {
        main: {
          root: new MTreeNode({
            id: workbenchLayoutRoot.id,
            direction: 'row',
            ratio: .5,
            child1: new MTreeNode({
              id: mainAreaParentNode.id,
              direction: 'row',
              ratio: .5,
              child1: new MPart({
                id: 'part.left',
                views: [{id: 'view.100', navigation: {id: view100.navigation!.id}}],
                activeViewId: 'view.100',
              }),
              child2: new MPart({
                id: MAIN_AREA,
              }),
            }),
            child2: new MPart({
              id: 'part.right',
              navigation: {id: partRight.navigation!.id},
              views: [],
            }),
          }),
        },
        mainArea: {
          root: new MTreeNode({
            id: mainAreaLayoutRoot.id,
            direction: 'column',
            ratio: .5,
            child1: new MPart({
              id: 'part.top',
              views: [{id: 'view.101', navigation: {id: view101.navigation!.id}}],
              activeViewId: 'view.101',
            }),
            child2: new MPart({
              id: 'part.bottom',
              views: [
                {id: 'view.102', navigation: {id: view102.navigation!.id}},
                {id: 'view.103', navigation: {id: any()}},
              ],
              activeViewId: 'view.102',
            }),
          }),
        },
        'activity.1': {
          root: new MPart({id: 'part.activity', navigation: {id: activityPart.navigation!.id}}),
        },
      },
    });
  });

  it('should compare part identifiers based on their order in the layout', async () => {
    const workbenchLayout1 = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('right-top', {align: 'right', relativeTo: MAIN_AREA})
      .addPart('right-bottom', {align: 'bottom', relativeTo: 'right-top'});

    const workbenchLayout2 = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('right-top', {align: 'right', relativeTo: MAIN_AREA})
      .addPart('right-bottom', {align: 'bottom', relativeTo: 'right-top'});

    // Expect layout not to be equal if not using stable part identifiers.
    expect(workbenchLayout1.equals(workbenchLayout2, {excludeTreeNodeId: true})).toBeFalse();

    // Expect layout to be equal if using stable part identifiers.
    expect(workbenchLayout1.equals(workbenchLayout2, {excludeTreeNodeId: true, assignStablePartIdentifier: true})).toBeTrue();
  });

  it('should compare view identifiers based on their order in the layout', async () => {
    const workbenchLayout1 = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart('part.left')
      .addPart('part.right', {align: 'right'})
      .addView('view-1', {partId: 'part.left', cssClass: 'view-1'}) // alternative id
      .addView('view.2', {partId: 'part.left', cssClass: 'view-2'})
      .addView('view-3', {partId: 'part.right', cssClass: 'view-3'}) // alternative id
      .addView('view.4', {partId: 'part.right', cssClass: 'view-4'});

    const workbenchLayout2 = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart('part.left')
      .addPart('part.right', {align: 'right'})
      .addView('view-1', {partId: 'part.left', cssClass: 'view-1'}) // alternative id
      .addView('view.2', {partId: 'part.left', cssClass: 'view-2'})
      .addView('view-3', {partId: 'part.right', cssClass: 'view-3'}) // alternative id
      .addView('view.4', {partId: 'part.right', cssClass: 'view-4'});

    // Expect layout not to be equal if not using stable view identifiers.
    expect(workbenchLayout1.equals(workbenchLayout2, {excludeTreeNodeId: true})).toBeFalse();

    // Expect layout to be equal if using stable view identifiers.
    expect(workbenchLayout1.equals(workbenchLayout2, {excludeTreeNodeId: true, assignStableViewIdentifier: true})).toBeTrue();
  });

  it('should add view referencing an alternative part id', async () => {
    const layout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part', {align: 'left'})
      .addView('view.100', {partId: 'part'});

    expect(layout.part({viewId: 'view.100'}).alternativeId).toEqual('part');
  });

  it('should throw when adding view that references non-existent part', async () => {
    expect(() => TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addView('testee', {partId: '999'})).toThrowError(/ViewAddError/);
  });

  it('should throw when adding view that references ambiguous parts', async () => {
    const layout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part', {align: 'right'})
      .addPart('part', {align: 'left'});
    expect(() => layout.addView('testee', {partId: 'part'})).toThrowError(/ViewAddError/);
  });

  it('should remove multiple parts by alternative id', async () => {
    // Add two parts with alternative id "part".
    let layout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part', {align: 'right'})
      .addPart('part', {align: 'left'});
    expect(layout.parts({id: 'part'})).toHaveSize(2);

    // Remove parts with alternative id "part".
    layout = layout.removePart('part');
    expect(layout.parts({id: 'part'})).toHaveSize(0);
  });

  it('should navigate multiple parts by alternative id', () => {
    // Add two parts with alternative id "part".
    let layout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part', {align: 'right', relativeTo: MAIN_AREA})
      .addPart('part', {align: 'left', relativeTo: MAIN_AREA});
    expect(layout.parts({id: 'part'})).toHaveSize(2);

    // Navigate parts with alternative id "part".
    layout = layout.navigatePart('part', ['test-part']);

    expect(layout).toEqualWorkbenchLayout({
      grids: {
        main: {
          root: new MTreeNode({
            direction: 'row',
            ratio: .5,
            child1: new MTreeNode({
              direction: 'row',
              ratio: .5,
              child1: new MPart({
                alternativeId: 'part',
                navigation: {id: any()},
              }),
              child2: new MPart({
                id: MAIN_AREA,
              }),
            }),
            child2: new MPart({
              alternativeId: 'part',
              navigation: {id: any()},
            }),
          }),
        },
      },
    });
  });

  it('should modify the layout using a modification function', async () => {
    const layout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart('part')
      .modify(layout => layout.addView('view.1', {partId: 'part'}))
      .modify(layout => layout)
      .modify(layout => layout.addView('view.2', {partId: 'part'}));
    expect(layout.views({partId: 'part'}).map(view => view.id)).toEqual(['view.1', 'view.2']);
  });

  it('should compute if part is located in the peripheral area (layout with activities and main area)', async () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.left'});

    const layout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.activity-1-top', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity'})
      .addPart('part.activity-1-bottom', {align: 'bottom', relativeTo: 'part.activity-1-top'})
      .addPart('part.right', {align: 'right', relativeTo: 'part.left'});

    expect(layout.isPeripheralPart('part.activity-1-top')).toBeTrue();
    expect(layout.isPeripheralPart('part.activity-1-bottom')).toBeTrue();
    expect(layout.isPeripheralPart(MAIN_AREA)).toBeFalse();
    expect(layout.isPeripheralPart('part.left')).toBeFalse();
    expect(layout.isPeripheralPart('part.right')).toBeFalse();
  });

  it('should compute if part is located in the peripheral area (layout with activities and no main area)', async () => {
    const layout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart('part.left')
      .addPart('part.right', {align: 'right', relativeTo: 'part.left'})
      .addPart('part.activity-1-top', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity'})
      .addPart('part.activity-1-bottom', {align: 'bottom', relativeTo: 'part.activity-1-top'});

    expect(layout.isPeripheralPart('part.activity-1-top')).toBeTrue();
    expect(layout.isPeripheralPart('part.activity-1-bottom')).toBeTrue();
    expect(layout.isPeripheralPart('part.left')).toBeFalse();
    expect(layout.isPeripheralPart('part.right')).toBeFalse();
  });

  it('should compute if part is located in the peripheral area (layout with activities and parts in main grid and main area)', async () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.left'});

    const layout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.right', {align: 'right', relativeTo: 'part.left'})
      .addPart('part.bottom', {align: 'bottom'})
      .addPart('part.activity-1-top', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity'})
      .addPart('part.activity-1-bottom', {align: 'bottom', relativeTo: 'part.activity-1-top'});

    expect(layout.isPeripheralPart('part.activity-1-top')).toBeTrue();
    expect(layout.isPeripheralPart('part.activity-1-bottom')).toBeTrue();
    expect(layout.isPeripheralPart('part.bottom')).toBeFalse();
    expect(layout.isPeripheralPart(MAIN_AREA)).toBeFalse();
    expect(layout.isPeripheralPart('part.left')).toBeFalse();
    expect(layout.isPeripheralPart('part.right')).toBeFalse();
  });

  it('should compute if part is located in the peripheral area (layout with parts in main grid and main area)', async () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.top'});

    const layout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.bottom', {align: 'bottom', relativeTo: 'part.top'})
      .addPart('part.left', {align: 'left'})
      .addPart('part.right', {align: 'right'});

    expect(layout.isPeripheralPart('part.left')).toBeTrue();
    expect(layout.isPeripheralPart('part.right')).toBeTrue();
    expect(layout.isPeripheralPart(MAIN_AREA)).toBeFalse();
    expect(layout.isPeripheralPart('part.top')).toBeFalse();
    expect(layout.isPeripheralPart('part.bottom')).toBeFalse();
  });

  it('should compute if part is located in the peripheral area (layout with parts in main grid and no main area)', async () => {
    const layout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart('part.left')
      .addPart('part.right', {align: 'right'});

    expect(layout.isPeripheralPart('part.left')).toBeFalse();
    expect(layout.isPeripheralPart('part.right')).toBeFalse();
  });

  it('should find active part by criteria', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.initial'});

    let layout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.innerLeft', {relativeTo: 'part.initial', align: 'left'})
      .addPart('part.innerRight', {relativeTo: 'part.initial', align: 'right'})
      .addPart('part.outerLeft', {relativeTo: MAIN_AREA, align: 'left'})
      .addPart('part.outerRight', {relativeTo: MAIN_AREA, align: 'right'})
      .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
      .addPart('part.activity-2-top', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 2', ɵactivityId: 'activity.2'})
      .addPart('part.activity-2-bottom', {relativeTo: 'part.activity-2-top', align: 'bottom'});

    // Assert active parts after layout creation.
    expect(layout.activePart({grid: 'main'}).id).toEqual('part.main-area');
    expect(layout.activePart({grid: 'mainArea'})!.id).toEqual('part.initial');
    expect(layout.activePart({grid: 'activity.1'})!.id).toEqual('part.activity-1');
    expect(layout.activePart({grid: 'activity.2'})!.id).toEqual('part.activity-2-top');

    // Change active part in main grid.
    layout = layout.activatePart('part.outerLeft');
    expect(layout.activePart({grid: 'main'}).id).toEqual('part.outerLeft');
    expect(layout.activePart({grid: 'mainArea'})!.id).toEqual('part.initial');
    expect(layout.activePart({grid: 'activity.1'})!.id).toEqual('part.activity-1');
    expect(layout.activePart({grid: 'activity.2'})!.id).toEqual('part.activity-2-top');

    // Change active part in main area grid.
    layout = layout.activatePart('part.innerRight');
    expect(layout.activePart({grid: 'main'}).id).toEqual('part.outerLeft');
    expect(layout.activePart({grid: 'mainArea'})!.id).toEqual('part.innerRight');
    expect(layout.activePart({grid: 'activity.1'})!.id).toEqual('part.activity-1');
    expect(layout.activePart({grid: 'activity.2'})!.id).toEqual('part.activity-2-top');

    // Change active part in activity.2 grid.
    layout = layout.activatePart('part.activity-2-bottom');
    expect(layout.activePart({grid: 'main'}).id).toEqual('part.outerLeft');
    expect(layout.activePart({grid: 'mainArea'})!.id).toEqual('part.innerRight');
    expect(layout.activePart({grid: 'activity.1'})!.id).toEqual('part.activity-1');
    expect(layout.activePart({grid: 'activity.2'})!.id).toEqual('part.activity-2-bottom');

    // Change active part in activity.2 grid.
    layout = layout.activatePart('part.activity-2-top');
    expect(layout.activePart({grid: 'main'}).id).toEqual('part.outerLeft');
    expect(layout.activePart({grid: 'mainArea'})!.id).toEqual('part.innerRight');
    expect(layout.activePart({grid: 'activity.1'})!.id).toEqual('part.activity-1');
    expect(layout.activePart({grid: 'activity.2'})!.id).toEqual('part.activity-2-top');
  });

  it('should return view outlets by criteria', async () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.initial'});

    const layout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.innerLeft', {relativeTo: 'part.initial', align: 'left'})
      .addPart('part.innerRight', {relativeTo: 'part.initial', align: 'right'})
      .addPart('part.outerLeft', {relativeTo: MAIN_AREA, align: 'left'})
      .addPart('part.outerRight', {relativeTo: MAIN_AREA, align: 'right'})
      .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
      .addPart('part.activity-2-top', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 2', ɵactivityId: 'activity.2'})
      .addPart('part.activity-2-bottom', {relativeTo: 'part.activity-2-top', align: 'bottom'})
      .addView('view.1', {partId: 'part.innerLeft'})
      .addView('view.2', {partId: 'part.innerLeft'})
      .addView('view.3', {partId: 'part.outerLeft'})
      .addView('view.4', {partId: 'part.outerLeft'})
      .addView('view.5', {partId: 'part.activity-1'})
      .addView('view.6', {partId: 'part.activity-1'})
      .addView('view.7', {partId: 'part.activity-2-top'})
      .addView('view.8', {partId: 'part.activity-2-top'})
      .navigateView('view.1', ['path/to/view/1'])
      .navigateView('view.3', ['path/to/view/3'])
      .navigateView('view.5', ['path/to/view/5'])
      .navigateView('view.7', ['path/to/view/7']);

    // Find in all grids.
    expect(layout.outlets({mainGrid: true, mainAreaGrid: true, activityGrids: true})).toEqual({
      'view.1': segments(['path/to/view/1']),
      'view.3': segments(['path/to/view/3']),
      'view.5': segments(['path/to/view/5']),
      'view.7': segments(['path/to/view/7']),
    });

    // Find in main area grid.
    expect(layout.outlets({mainAreaGrid: true})).toEqual({
      'view.1': segments(['path/to/view/1']),
    });

    // Find in main grid.
    expect(layout.outlets({mainGrid: true})).toEqual({
      'view.3': segments(['path/to/view/3']),
    });

    // Find in activity grids.
    expect(layout.outlets({activityGrids: true})).toEqual({
      'view.5': segments(['path/to/view/5']),
      'view.7': segments(['path/to/view/7']),
    });
  });

  it('should return part outlets by criteria', async () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.initial'});

    const layout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.innerLeft', {relativeTo: 'part.initial', align: 'left'})
      .addPart('part.innerRight', {relativeTo: 'part.initial', align: 'right'})
      .addPart('part.outerLeft', {relativeTo: MAIN_AREA, align: 'left'})
      .addPart('part.outerRight', {relativeTo: MAIN_AREA, align: 'right'})
      .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
      .addPart('part.activity-2-top', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 2', ɵactivityId: 'activity.2'})
      .addPart('part.activity-2-bottom', {relativeTo: 'part.activity-2-top', align: 'bottom'})
      .navigatePart('part.innerLeft', ['path/to/part/inner-left'])
      .navigatePart('part.outerLeft', ['path/to/part/outer-left'])
      .navigatePart('part.activity-1', ['path/to/part/activity-1'])
      .navigatePart('part.activity-2-bottom', ['path/to/part/activity-2-bottom']);

    // Find in all grids.
    expect(layout.outlets({mainGrid: true, mainAreaGrid: true, activityGrids: true})).toEqual({
      'part.innerLeft': segments(['path/to/part/inner-left']),
      'part.outerLeft': segments(['path/to/part/outer-left']),
      'part.activity-1': segments(['path/to/part/activity-1']),
      'part.activity-2-bottom': segments(['path/to/part/activity-2-bottom']),
    });

    // Find in main area grid.
    expect(layout.outlets({mainAreaGrid: true})).toEqual({
      'part.innerLeft': segments(['path/to/part/inner-left']),
    });

    // Find in main grid.
    expect(layout.outlets({mainGrid: true})).toEqual({
      'part.outerLeft': segments(['path/to/part/outer-left']),
    });

    // Find in activity grids.
    expect(layout.outlets({activityGrids: true})).toEqual({
      'part.activity-1': segments(['path/to/part/activity-1']),
      'part.activity-2-bottom': segments(['path/to/part/activity-2-bottom']),
    });
  });

  describe('Activity (Docked Parts)', () => {

    it('should activate activities', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideWorkbenchForTest({
            layout: factory => factory
              .addPart(MAIN_AREA)
              // left-top
              .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
              .navigatePart('part.activity-1', ['test-part'])
              .addPart('part.activity-2', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 2', ɵactivityId: 'activity.2'})
              .navigatePart('part.activity-2', ['test-part'])
              // left-bottom
              .addPart('part.activity-3', {dockTo: 'left-bottom'}, {icon: 'folder', label: 'Activity 3', ɵactivityId: 'activity.3'})
              .navigatePart('part.activity-3', ['test-part'])
              .addPart('part.activity-4', {dockTo: 'left-bottom'}, {icon: 'folder', label: 'Activity 4', ɵactivityId: 'activity.4'})
              .navigatePart('part.activity-4', ['test-part'])
              // right-top
              .addPart('part.activity-5', {dockTo: 'right-top'}, {icon: 'folder', label: 'Activity 5', ɵactivityId: 'activity.5'})
              .navigatePart('part.activity-5', ['test-part'])
              .addPart('part.activity-6', {dockTo: 'right-top'}, {icon: 'folder', label: 'Activity 6', ɵactivityId: 'activity.6'})
              .navigatePart('part.activity-6', ['test-part'])
              // right-bottom
              .addPart('part.activity-7', {dockTo: 'right-bottom'}, {icon: 'folder', label: 'Activity 7', ɵactivityId: 'activity.7'})
              .navigatePart('part.activity-7', ['test-part'])
              .addPart('part.activity-8', {dockTo: 'right-bottom'}, {icon: 'folder', label: 'testee-8', ɵactivityId: 'activity.8'})
              .navigatePart('part.activity-8', ['test-part'])
              // bottom-left
              .addPart('part.activity-9', {dockTo: 'bottom-left'}, {icon: 'folder', label: 'Activity 9', ɵactivityId: 'activity.9'})
              .navigatePart('part.activity-9', ['test-part'])
              .addPart('part.activity-10', {dockTo: 'bottom-left'}, {icon: 'folder', label: 'Activity 10', ɵactivityId: 'activity.10'})
              .navigatePart('part.activity-10', ['test-part'])
              // bottom-right
              .addPart('part.activity-11', {dockTo: 'bottom-right'}, {icon: 'folder', label: 'Activity 11', ɵactivityId: 'activity.11'})
              .navigatePart('part.activity-11', ['test-part'])
              .addPart('part.activity-12', {dockTo: 'bottom-right'}, {icon: 'folder', label: 'Activity 12', ɵactivityId: 'activity.12'})
              .navigatePart('part.activity-12', ['test-part']),
            startup: {launcher: 'APP_INITIALIZER'},
          }),
          provideRouter([
            {path: 'test-part', component: TestComponent},
          ]),
        ],
      });
      const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
      await waitUntilWorkbenchStarted();
      expect(fixture).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
                {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
              ],
              activeActivityId: 'none',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
                {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
              ],
              activeActivityId: 'none',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
                {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
              ],
              activeActivityId: 'none',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
                {id: 'activity.8', icon: 'folder', label: 'testee-8'},
              ],
              activeActivityId: 'none',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'none',
            },
          },
        },
      });

      // Toggle activity.1.
      await TestBed.inject(ɵWorkbenchRouter).navigate(layout => layout.toggleActivity('activity.1'));
      expect(fixture).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
                {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
              ],
              activeActivityId: 'activity.1',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
                {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
              ],
              activeActivityId: 'none',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
                {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
              ],
              activeActivityId: 'none',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
                {id: 'activity.8', icon: 'folder', label: 'testee-8'},
              ],
              activeActivityId: 'none',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'none',
            },
          },
          panels: {left: {width: ACTIVITY_PANEL_WIDTH}},
        },
      });

      // Toggle activity.2.
      await TestBed.inject(ɵWorkbenchRouter).navigate(layout => layout.toggleActivity('activity.2'));
      expect(fixture).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
                {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
              ],
              activeActivityId: 'activity.2',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
                {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
              ],
              activeActivityId: 'none',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
                {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
              ],
              activeActivityId: 'none',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
                {id: 'activity.8', icon: 'folder', label: 'testee-8'},
              ],
              activeActivityId: 'none',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'none',
            },
          },
          panels: {left: {width: ACTIVITY_PANEL_WIDTH}},
        },
      });

      // Toggle activity.3.
      await TestBed.inject(ɵWorkbenchRouter).navigate(layout => layout.toggleActivity('activity.3'));
      expect(fixture).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
                {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
              ],
              activeActivityId: 'activity.2',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
                {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
              ],
              activeActivityId: 'activity.3',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
                {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
              ],
              activeActivityId: 'none',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
                {id: 'activity.8', icon: 'folder', label: 'testee-8'},
              ],
              activeActivityId: 'none',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'none',
            },
          },
          panels: {left: {width: ACTIVITY_PANEL_WIDTH, ratio: ACTIVITY_PANEL_RATIO}},
        },
      });

      // Toggle activity.4
      await TestBed.inject(ɵWorkbenchRouter).navigate(layout => layout.toggleActivity('activity.4'));
      expect(fixture).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
                {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
              ],
              activeActivityId: 'activity.2',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
                {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
              ],
              activeActivityId: 'activity.4',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
                {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
              ],
              activeActivityId: 'none',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
                {id: 'activity.8', icon: 'folder', label: 'testee-8'},
              ],
              activeActivityId: 'none',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'none',
            },
          },
          panels: {left: {width: ACTIVITY_PANEL_WIDTH, ratio: ACTIVITY_PANEL_RATIO}},
        },
      });

      // Toggle activity.5.
      await TestBed.inject(ɵWorkbenchRouter).navigate(layout => layout.toggleActivity('activity.5'));
      expect(fixture).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
                {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
              ],
              activeActivityId: 'activity.2',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
                {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
              ],
              activeActivityId: 'activity.4',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
                {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
              ],
              activeActivityId: 'activity.5',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
                {id: 'activity.8', icon: 'folder', label: 'testee-8'},
              ],
              activeActivityId: 'none',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'none',
            },
          },
          panels: {
            left: {width: ACTIVITY_PANEL_WIDTH, ratio: ACTIVITY_PANEL_RATIO},
            right: {width: ACTIVITY_PANEL_WIDTH},
          },
        },
      });

      // Toggle activity.6.
      await TestBed.inject(ɵWorkbenchRouter).navigate(layout => layout.toggleActivity('activity.6'));
      expect(fixture).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
                {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
              ],
              activeActivityId: 'activity.2',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
                {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
              ],
              activeActivityId: 'activity.4',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
                {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
              ],
              activeActivityId: 'activity.6',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
                {id: 'activity.8', icon: 'folder', label: 'testee-8'},
              ],
              activeActivityId: 'none',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'none',
            },
          },
          panels: {
            left: {width: ACTIVITY_PANEL_WIDTH, ratio: ACTIVITY_PANEL_RATIO},
            right: {width: ACTIVITY_PANEL_WIDTH},
          },
        },
      });

      // Toggle activity.7.
      await TestBed.inject(ɵWorkbenchRouter).navigate(layout => layout.toggleActivity('activity.7'));
      expect(fixture).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
                {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
              ],
              activeActivityId: 'activity.2',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
                {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
              ],
              activeActivityId: 'activity.4',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
                {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
              ],
              activeActivityId: 'activity.6',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
                {id: 'activity.8', icon: 'folder', label: 'testee-8'},
              ],
              activeActivityId: 'activity.7',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'none',
            },
          },
          panels: {
            left: {width: ACTIVITY_PANEL_WIDTH, ratio: ACTIVITY_PANEL_RATIO},
            right: {width: ACTIVITY_PANEL_WIDTH, ratio: ACTIVITY_PANEL_RATIO},
          },
        },
      });

      // Toggle activity.8.
      await TestBed.inject(ɵWorkbenchRouter).navigate(layout => layout.toggleActivity('activity.8'));
      expect(fixture).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
                {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
              ],
              activeActivityId: 'activity.2',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
                {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
              ],
              activeActivityId: 'activity.4',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
                {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
              ],
              activeActivityId: 'activity.6',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
                {id: 'activity.8', icon: 'folder', label: 'testee-8'},
              ],
              activeActivityId: 'activity.8',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'none',
            },
            bottomRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'none',
            },
          },
          panels: {
            left: {width: ACTIVITY_PANEL_WIDTH, ratio: ACTIVITY_PANEL_RATIO},
            right: {width: ACTIVITY_PANEL_WIDTH, ratio: ACTIVITY_PANEL_RATIO},
          },
        },
      });

      // Toggle activity.9.
      await TestBed.inject(ɵWorkbenchRouter).navigate(layout => layout.toggleActivity('activity.9'));
      expect(fixture).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
                {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
              ],
              activeActivityId: 'activity.2',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
                {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
              ],
              activeActivityId: 'activity.4',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
                {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
              ],
              activeActivityId: 'activity.6',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
                {id: 'activity.8', icon: 'folder', label: 'testee-8'},
              ],
              activeActivityId: 'activity.8',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'activity.9',
            },
            bottomRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'none',
            },
          },
          panels: {
            left: {width: ACTIVITY_PANEL_WIDTH, ratio: ACTIVITY_PANEL_RATIO},
            right: {width: ACTIVITY_PANEL_WIDTH, ratio: ACTIVITY_PANEL_RATIO},
            bottom: {height: ACTIVITY_PANEL_HEIGHT},
          },
        },
      });

      // Toggle activity.10.
      await TestBed.inject(ɵWorkbenchRouter).navigate(layout => layout.toggleActivity('activity.10'));
      expect(fixture).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
                {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
              ],
              activeActivityId: 'activity.2',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
                {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
              ],
              activeActivityId: 'activity.4',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
                {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
              ],
              activeActivityId: 'activity.6',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
                {id: 'activity.8', icon: 'folder', label: 'testee-8'},
              ],
              activeActivityId: 'activity.8',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'activity.10',
            },
            bottomRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'none',
            },
          },
          panels: {
            left: {width: ACTIVITY_PANEL_WIDTH, ratio: ACTIVITY_PANEL_RATIO},
            right: {width: ACTIVITY_PANEL_WIDTH, ratio: ACTIVITY_PANEL_RATIO},
            bottom: {height: ACTIVITY_PANEL_HEIGHT},
          },
        },
      });

      // Toggle activity.11.
      await TestBed.inject(ɵWorkbenchRouter).navigate(layout => layout.toggleActivity('activity.11'));
      expect(fixture).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
                {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
              ],
              activeActivityId: 'activity.2',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
                {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
              ],
              activeActivityId: 'activity.4',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
                {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
              ],
              activeActivityId: 'activity.6',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
                {id: 'activity.8', icon: 'folder', label: 'testee-8'},
              ],
              activeActivityId: 'activity.8',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'activity.10',
            },
            bottomRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'activity.11',
            },
          },
          panels: {
            left: {width: ACTIVITY_PANEL_WIDTH, ratio: ACTIVITY_PANEL_RATIO},
            right: {width: ACTIVITY_PANEL_WIDTH, ratio: ACTIVITY_PANEL_RATIO},
            bottom: {height: ACTIVITY_PANEL_HEIGHT, ratio: ACTIVITY_PANEL_RATIO},
          },
        },
      });

      // Toggle activity.12.
      await TestBed.inject(ɵWorkbenchRouter).navigate(layout => layout.toggleActivity('activity.12'));
      expect(fixture).toEqualWorkbenchLayout({
        activityLayout: {
          toolbars: {
            leftTop: {
              activities: [
                {id: 'activity.1', icon: 'folder', label: 'Activity 1'},
                {id: 'activity.2', icon: 'folder', label: 'Activity 2'},
              ],
              activeActivityId: 'activity.2',
            },
            leftBottom: {
              activities: [
                {id: 'activity.3', icon: 'folder', label: 'Activity 3'},
                {id: 'activity.4', icon: 'folder', label: 'Activity 4'},
              ],
              activeActivityId: 'activity.4',
            },
            rightTop: {
              activities: [
                {id: 'activity.5', icon: 'folder', label: 'Activity 5'},
                {id: 'activity.6', icon: 'folder', label: 'Activity 6'},
              ],
              activeActivityId: 'activity.6',
            },
            rightBottom: {
              activities: [
                {id: 'activity.7', icon: 'folder', label: 'Activity 7'},
                {id: 'activity.8', icon: 'folder', label: 'testee-8'},
              ],
              activeActivityId: 'activity.8',
            },
            bottomLeft: {
              activities: [
                {id: 'activity.9', icon: 'folder', label: 'Activity 9'},
                {id: 'activity.10', icon: 'folder', label: 'Activity 10'},
              ],
              activeActivityId: 'activity.10',
            },
            bottomRight: {
              activities: [
                {id: 'activity.11', icon: 'folder', label: 'Activity 11'},
                {id: 'activity.12', icon: 'folder', label: 'Activity 12'},
              ],
              activeActivityId: 'activity.12',
            },
          },
          panels: {
            left: {width: ACTIVITY_PANEL_WIDTH, ratio: ACTIVITY_PANEL_RATIO},
            right: {width: ACTIVITY_PANEL_WIDTH, ratio: ACTIVITY_PANEL_RATIO},
            bottom: {height: ACTIVITY_PANEL_HEIGHT, ratio: ACTIVITY_PANEL_RATIO},
          },
        },
      });
    });

    it('should return whether layout contains activities', async () => {
      const layout1 = TestBed.inject(ɵWorkbenchLayoutFactory)
        .addPart('part.main');
      expect(layout1.hasActivities()).toBeFalse();

      const layout2 = TestBed.inject(ɵWorkbenchLayoutFactory)
        .addPart('part.main')
        .addPart('part.activity', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity'});
      expect(layout2.hasActivities()).toBeTrue();
    });

    it('should return whether layout contains a specific activity', async () => {
      const layout = TestBed.inject(ɵWorkbenchLayoutFactory)
        .addPart('part.main')
        .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
        .addPart('part.activity-2', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 2', ɵactivityId: 'activity.2'});
      expect(layout.hasActivity('activity.1')).toBeTrue();
      expect(layout.hasActivity('activity.2')).toBeTrue();
      expect(layout.hasActivity('activity.99')).toBeFalse();
    });

    it('should find activities by criteria', () => {
      const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
        .addPart(MAIN_AREA)
        .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
        .addPart('part.activity-2', {dockTo: 'left-bottom'}, {icon: 'folder', label: 'Activity 2', ɵactivityId: 'activity.2'})
        .addPart('part.activity-3-top', {dockTo: 'right-top'}, {icon: 'folder', label: 'Activity 3', ɵactivityId: 'activity.3'})
        .addPart('part.activity-3-bottom', {relativeTo: 'part.activity-3-top', align: 'bottom'})
        .addView('view.101', {partId: 'part.activity-2'})
        .addView('view.102', {partId: 'part.activity-3-bottom'})
        .activatePart('part.activity-1')
        .activatePart('part.activity-3-bottom');

      // Find without criteria.
      expect(workbenchLayout.activities().map(activity => activity.id)).toEqual(jasmine.arrayWithExactContents(['activity.1', 'activity.2', 'activity.3']));

      // Find by id.
      expect(workbenchLayout.activities({id: undefined}).map(activity => activity.id)).toEqual(jasmine.arrayWithExactContents(['activity.1', 'activity.2', 'activity.3']));
      expect(workbenchLayout.activities({id: 'activity.1'}).map(activity => activity.id)).toEqual(['activity.1']);
      expect(workbenchLayout.activities({id: 'activity.2'}).map(activity => activity.id)).toEqual(['activity.2']);
      expect(workbenchLayout.activities({id: 'activity.3'}).map(activity => activity.id)).toEqual(['activity.3']);

      // Find by active state.
      expect(workbenchLayout.activities({active: undefined}).map(activity => activity.id)).toEqual(jasmine.arrayWithExactContents(['activity.1', 'activity.2', 'activity.3']));
      expect(workbenchLayout.activities({active: true}).map(activity => activity.id)).toEqual(jasmine.arrayWithExactContents(['activity.1', 'activity.3']));
      expect(workbenchLayout.activities({active: false}).map(activity => activity.id)).toEqual(['activity.2']);

      // Find by part id.
      expect(workbenchLayout.activities({partId: undefined}).map(activity => activity.id)).toEqual(jasmine.arrayWithExactContents(['activity.1', 'activity.2', 'activity.3']));
      expect(workbenchLayout.activities({partId: 'part.activity-1'}).map(activity => activity.id)).toEqual(['activity.1']);
      expect(workbenchLayout.activities({partId: 'part.activity-2'}).map(activity => activity.id)).toEqual(['activity.2']);
      expect(workbenchLayout.activities({partId: 'part.activity-3-top'}).map(activity => activity.id)).toEqual(['activity.3']);
      expect(workbenchLayout.activities({partId: 'part.activity-3-bottom'}).map(activity => activity.id)).toEqual(['activity.3']);

      // Find by view id.
      expect(workbenchLayout.activities({viewId: undefined}).map(activity => activity.id)).toEqual(jasmine.arrayWithExactContents(['activity.1', 'activity.2', 'activity.3']));
      expect(workbenchLayout.activities({viewId: 'view.101'}).map(activity => activity.id)).toEqual(['activity.2']);
      expect(workbenchLayout.activities({viewId: 'view.102'}).map(activity => activity.id)).toEqual(['activity.3']);

      // Expect to throw if finding multiple activities.
      expect(() => workbenchLayout.activities({}, {throwIfMulti: true})).toThrowError(/MultiActivityError/);
      // Expect to throw if finding no activity.
      expect(() => workbenchLayout.activities({id: 'activity.99'}, {throwIfEmpty: true})).toThrowError(/NullActivityError/);
      // Expect empty array if finding no activity.
      expect(workbenchLayout.activities({id: 'activity.99'})).toEqual([]);
    });

    it('should find activity by criteria', () => {
      const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
        .addPart(MAIN_AREA)
        .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
        .addPart('part.activity-2', {dockTo: 'left-bottom'}, {icon: 'folder', label: 'Activity 2', ɵactivityId: 'activity.2'})
        .addPart('part.activity-3-top', {dockTo: 'right-top'}, {icon: 'folder', label: 'Activity 3', ɵactivityId: 'activity.3'})
        .addPart('part.activity-3-bottom', {relativeTo: 'part.activity-3-top', align: 'bottom'})
        .addView('view.101', {partId: 'part.activity-2'})
        .addView('view.102', {partId: 'part.activity-3-bottom'})
        .activatePart('part.activity-3-bottom');

      // Find by activity id.
      expect(workbenchLayout.activity({id: 'activity.1'}).id).toEqual('activity.1');

      // Find by active state.
      expect(workbenchLayout.activity({active: true}).id).toEqual('activity.3');

      // Find by part id.
      expect(workbenchLayout.activity({partId: 'part.activity-1'}).id).toEqual('activity.1');
      expect(workbenchLayout.activity({partId: 'part.activity-2'}).id).toEqual('activity.2');
      expect(workbenchLayout.activity({partId: 'part.activity-3-top'}).id).toEqual('activity.3');
      expect(workbenchLayout.activity({partId: 'part.activity-3-bottom'}).id).toEqual('activity.3');

      // Find by view id.
      expect(workbenchLayout.activity({viewId: 'view.101'}).id).toEqual('activity.2');
      expect(workbenchLayout.activity({viewId: 'view.102'}).id).toEqual('activity.3');

      // Expect to throw if finding multiple activities.
      expect(() => workbenchLayout.activity({active: false})).toThrowError(/MultiActivityError/);
      // Expect to throw if finding no activity.
      expect(() => workbenchLayout.activity({id: 'activity.99'})).toThrowError(/NullActivityError/);
      // Expect null if finding no activity.
      expect(workbenchLayout.activity({id: 'activity.99'}, {orElse: null})).toBeNull();
    });

    it('should find activity stacks by criteria', () => {
      const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
        .addPart(MAIN_AREA)
        .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
        .addPart('part.activity-2', {dockTo: 'left-bottom'}, {icon: 'folder', label: 'Activity 2', ɵactivityId: 'activity.2'})
        .addPart('part.activity-3-top', {dockTo: 'right-top'}, {icon: 'folder', label: 'Activity 3', ɵactivityId: 'activity.3'})
        .addPart('part.activity-3-bottom', {relativeTo: 'part.activity-3-top', align: 'bottom'});

      const leftTopStack = workbenchLayout.activityLayout.toolbars.leftTop;
      const leftBottomStack = workbenchLayout.activityLayout.toolbars.leftBottom;
      const rightTopStack = workbenchLayout.activityLayout.toolbars.rightTop;
      const rightBottomStack = workbenchLayout.activityLayout.toolbars.rightBottom;
      const bottomLeftStack = workbenchLayout.activityLayout.toolbars.bottomLeft;
      const bottomRightStack = workbenchLayout.activityLayout.toolbars.bottomRight;

      // Find without criteria.
      expect(workbenchLayout.activityStacks()).toEqual(jasmine.arrayWithExactContents([leftTopStack, leftBottomStack, rightTopStack, rightBottomStack, bottomLeftStack, bottomRightStack]));

      // Find by activityId id.
      expect(workbenchLayout.activityStacks({activityId: undefined})).toEqual(jasmine.arrayWithExactContents([leftTopStack, leftBottomStack, rightTopStack, rightBottomStack, bottomLeftStack, bottomRightStack]));
      expect(workbenchLayout.activityStacks({activityId: 'activity.1'})).toEqual([leftTopStack]);
      expect(workbenchLayout.activityStacks({activityId: 'activity.2'})).toEqual([leftBottomStack]);
      expect(workbenchLayout.activityStacks({activityId: 'activity.3'})).toEqual([rightTopStack]);

      // Find by docking area.
      expect(workbenchLayout.activityStacks({dockTo: undefined})).toEqual(jasmine.arrayWithExactContents([leftTopStack, leftBottomStack, rightTopStack, rightBottomStack, bottomLeftStack, bottomRightStack]));
      expect(workbenchLayout.activityStacks({dockTo: {dockTo: 'left-top'}})).toEqual([leftTopStack]);
      expect(workbenchLayout.activityStacks({dockTo: {dockTo: 'left-bottom'}})).toEqual([leftBottomStack]);
      expect(workbenchLayout.activityStacks({dockTo: {dockTo: 'right-top'}})).toEqual([rightTopStack]);
      expect(workbenchLayout.activityStacks({dockTo: {dockTo: 'right-bottom'}})).toEqual([rightBottomStack]);
      expect(workbenchLayout.activityStacks({dockTo: {dockTo: 'bottom-left'}})).toEqual([bottomLeftStack]);
      expect(workbenchLayout.activityStacks({dockTo: {dockTo: 'bottom-right'}})).toEqual([bottomRightStack]);

      // Find by part id.
      expect(workbenchLayout.activityStacks({partId: undefined})).toEqual(jasmine.arrayWithExactContents([leftTopStack, leftBottomStack, rightTopStack, rightBottomStack, bottomLeftStack, bottomRightStack]));
      expect(workbenchLayout.activityStacks({partId: 'part.activity-1'})).toEqual([leftTopStack]);
      expect(workbenchLayout.activityStacks({partId: 'part.activity-2'})).toEqual([leftBottomStack]);
      expect(workbenchLayout.activityStacks({partId: 'part.activity-3-top'})).toEqual([rightTopStack]);
      expect(workbenchLayout.activityStacks({partId: 'part.activity-3-bottom'})).toEqual([rightTopStack]);

      // Expect to throw if finding multiple activity stacks.
      expect(() => workbenchLayout.activityStacks({}, {throwIfMulti: true})).toThrowError(/MultiActivityStackError/);
      // Expect to throw if finding no activity stack.
      expect(() => workbenchLayout.activityStacks({activityId: 'activity.99'}, {throwIfEmpty: true})).toThrowError(/NullActivityStackError/);
      // Expect empty array if finding no activity stack.
      expect(workbenchLayout.activityStacks({activityId: 'activity.99'})).toEqual([]);
    });

    it('should find activity stack by criteria', () => {
      const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
        .addPart(MAIN_AREA)
        .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
        .addPart('part.activity-2', {dockTo: 'left-bottom'}, {icon: 'folder', label: 'Activity 2', ɵactivityId: 'activity.2'})
        .addPart('part.activity-3-top', {dockTo: 'right-top'}, {icon: 'folder', label: 'Activity 3', ɵactivityId: 'activity.3'})
        .addPart('part.activity-3-bottom', {relativeTo: 'part.activity-3-top', align: 'bottom'});

      const leftTopStack = workbenchLayout.activityLayout.toolbars.leftTop;
      const leftBottomStack = workbenchLayout.activityLayout.toolbars.leftBottom;
      const rightTopStack = workbenchLayout.activityLayout.toolbars.rightTop;
      const rightBottomStack = workbenchLayout.activityLayout.toolbars.rightBottom;
      const bottomLeftStack = workbenchLayout.activityLayout.toolbars.bottomLeft;
      const bottomRightStack = workbenchLayout.activityLayout.toolbars.bottomRight;

      // Find by activityId id.
      expect(workbenchLayout.activityStack({activityId: 'activity.1'})).toEqual(leftTopStack);
      expect(workbenchLayout.activityStack({activityId: 'activity.2'})).toEqual(leftBottomStack);
      expect(workbenchLayout.activityStack({activityId: 'activity.3'})).toEqual(rightTopStack);

      // Find by docking area.
      expect(workbenchLayout.activityStack({dockTo: {dockTo: 'left-top'}})).toEqual(leftTopStack);
      expect(workbenchLayout.activityStack({dockTo: {dockTo: 'left-bottom'}})).toEqual(leftBottomStack);
      expect(workbenchLayout.activityStack({dockTo: {dockTo: 'right-top'}})).toEqual(rightTopStack);
      expect(workbenchLayout.activityStack({dockTo: {dockTo: 'right-bottom'}})).toEqual(rightBottomStack);
      expect(workbenchLayout.activityStack({dockTo: {dockTo: 'bottom-left'}})).toEqual(bottomLeftStack);
      expect(workbenchLayout.activityStack({dockTo: {dockTo: 'bottom-right'}})).toEqual(bottomRightStack);

      // Find by part id.
      expect(workbenchLayout.activityStack({partId: 'part.activity-1'})).toEqual(leftTopStack);
      expect(workbenchLayout.activityStack({partId: 'part.activity-2'})).toEqual(leftBottomStack);
      expect(workbenchLayout.activityStack({partId: 'part.activity-3-top'})).toEqual(rightTopStack);
      expect(workbenchLayout.activityStack({partId: 'part.activity-3-bottom'})).toEqual(rightTopStack);

      // Expect to throw if finding no activity stack.
      expect(() => workbenchLayout.activityStack({activityId: 'activity.99'})).toThrowError(/NullActivityStackError/);
      // Expect null if finding no activity stack.
      expect(workbenchLayout.activityStack({activityId: 'activity.99'}, {orElse: null})).toBeNull();
    });

    it('should toggle activity', () => {
      let workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
        .addPart(MAIN_AREA)
        .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
        .addPart('part.activity-2', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 2', ɵactivityId: 'activity.2'})
        .addPart('part.activity-3', {dockTo: 'left-bottom'}, {icon: 'folder', label: 'Activity 3', ɵactivityId: 'activity.3'});

      // Expect activities to be minimized.
      expect(workbenchLayout.activityLayout.toolbars.leftTop.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.leftBottom.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.rightTop.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.rightBottom.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.bottomLeft.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.bottomRight.activeActivityId).toBeUndefined();

      // Toggle activity.1.
      workbenchLayout = workbenchLayout.toggleActivity('activity.1');
      expect(workbenchLayout.activityLayout.toolbars.leftTop.activeActivityId).toEqual('activity.1');
      expect(workbenchLayout.activityLayout.toolbars.leftBottom.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.rightTop.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.rightBottom.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.bottomLeft.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.bottomRight.activeActivityId).toBeUndefined();

      // Toggle activity.2.
      workbenchLayout = workbenchLayout.toggleActivity('activity.2');
      expect(workbenchLayout.activityLayout.toolbars.leftTop.activeActivityId).toEqual('activity.2');
      expect(workbenchLayout.activityLayout.toolbars.leftBottom.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.rightTop.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.rightBottom.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.bottomLeft.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.bottomRight.activeActivityId).toBeUndefined();

      // Toggle activity.3.
      workbenchLayout = workbenchLayout.toggleActivity('activity.3');
      expect(workbenchLayout.activityLayout.toolbars.leftTop.activeActivityId).toEqual('activity.2');
      expect(workbenchLayout.activityLayout.toolbars.leftBottom.activeActivityId).toEqual('activity.3');
      expect(workbenchLayout.activityLayout.toolbars.rightTop.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.rightBottom.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.bottomLeft.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.bottomRight.activeActivityId).toBeUndefined();

      // Toggle activity.3.
      workbenchLayout = workbenchLayout.toggleActivity('activity.3');
      expect(workbenchLayout.activityLayout.toolbars.leftTop.activeActivityId).toEqual('activity.2');
      expect(workbenchLayout.activityLayout.toolbars.leftBottom.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.rightTop.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.rightBottom.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.bottomLeft.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.bottomRight.activeActivityId).toBeUndefined();

      // Toggle activity.2.
      workbenchLayout = workbenchLayout.toggleActivity('activity.2');
      expect(workbenchLayout.activityLayout.toolbars.leftTop.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.leftBottom.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.rightTop.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.rightBottom.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.bottomLeft.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.bottomRight.activeActivityId).toBeUndefined();

      // Toggle activity.1.
      workbenchLayout = workbenchLayout.toggleActivity('activity.1');
      expect(workbenchLayout.activityLayout.toolbars.leftTop.activeActivityId).toEqual('activity.1');
      expect(workbenchLayout.activityLayout.toolbars.leftBottom.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.rightTop.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.rightBottom.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.bottomLeft.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.bottomRight.activeActivityId).toBeUndefined();
    });

    it('should toggle maximized layout state', () => {
      let workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
        .addPart(MAIN_AREA)
        .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
        .addPart('part.activity-2', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 2', ɵactivityId: 'activity.2'})
        .addPart('part.activity-3', {dockTo: 'left-bottom'}, {icon: 'folder', label: 'Activity 3', ɵactivityId: 'activity.3'})
        .addPart('part.activity-4', {dockTo: 'right-top'}, {icon: 'folder', label: 'Activity 4', ɵactivityId: 'activity.4'})
        .addPart('part.activity-5', {dockTo: 'right-bottom'}, {icon: 'folder', label: 'Activity 5', ɵactivityId: 'activity.5'});

      // Expect activities to be minimized.
      expect(workbenchLayout.activityLayout.toolbars.leftTop.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.leftTop.minimizedActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.leftBottom.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.leftBottom.minimizedActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.rightTop.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.rightTop.minimizedActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.rightBottom.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.rightBottom.minimizedActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.bottomLeft.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.bottomRight.minimizedActivityId).toBeUndefined();

      // Toggle activities.
      workbenchLayout = workbenchLayout
        .toggleActivity('activity.1')
        .toggleActivity('activity.3')
        .toggleActivity('activity.5');

      expect(workbenchLayout.activityLayout.toolbars.leftTop.activeActivityId).toEqual('activity.1');
      expect(workbenchLayout.activityLayout.toolbars.leftTop.minimizedActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.leftBottom.activeActivityId).toEqual('activity.3');
      expect(workbenchLayout.activityLayout.toolbars.leftBottom.minimizedActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.rightTop.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.rightTop.minimizedActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.rightBottom.activeActivityId).toEqual('activity.5');
      expect(workbenchLayout.activityLayout.toolbars.rightBottom.minimizedActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.bottomLeft.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.bottomRight.minimizedActivityId).toBeUndefined();

      // Toggle maximize => minimize activities.
      workbenchLayout = workbenchLayout.toggleMaximized();
      expect(workbenchLayout.activityLayout.toolbars.leftTop.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.leftTop.minimizedActivityId).toEqual('activity.1');
      expect(workbenchLayout.activityLayout.toolbars.leftBottom.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.leftBottom.minimizedActivityId).toEqual('activity.3');
      expect(workbenchLayout.activityLayout.toolbars.rightTop.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.rightTop.minimizedActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.rightBottom.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.rightBottom.minimizedActivityId).toEqual('activity.5');
      expect(workbenchLayout.activityLayout.toolbars.bottomLeft.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.bottomRight.minimizedActivityId).toBeUndefined();

      // Toggle maximize => restore activities.
      workbenchLayout = workbenchLayout.toggleMaximized();
      expect(workbenchLayout.activityLayout.toolbars.leftTop.activeActivityId).toEqual('activity.1');
      expect(workbenchLayout.activityLayout.toolbars.leftTop.minimizedActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.leftBottom.activeActivityId).toEqual('activity.3');
      expect(workbenchLayout.activityLayout.toolbars.leftBottom.minimizedActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.rightTop.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.rightTop.minimizedActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.rightBottom.activeActivityId).toEqual('activity.5');
      expect(workbenchLayout.activityLayout.toolbars.rightBottom.minimizedActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.bottomLeft.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.bottomRight.minimizedActivityId).toBeUndefined();

      // Toggle maximize => minimize activities.
      workbenchLayout = workbenchLayout.toggleMaximized();
      expect(workbenchLayout.activityLayout.toolbars.leftTop.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.leftTop.minimizedActivityId).toEqual('activity.1');
      expect(workbenchLayout.activityLayout.toolbars.leftBottom.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.leftBottom.minimizedActivityId).toEqual('activity.3');
      expect(workbenchLayout.activityLayout.toolbars.rightTop.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.rightTop.minimizedActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.rightBottom.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.rightBottom.minimizedActivityId).toEqual('activity.5');
      expect(workbenchLayout.activityLayout.toolbars.bottomLeft.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.bottomRight.minimizedActivityId).toBeUndefined();

      // Open activity 2 and activity 4.
      workbenchLayout = workbenchLayout
        .toggleActivity('activity.2')
        .toggleActivity('activity.4');
      expect(workbenchLayout.activityLayout.toolbars.leftTop.activeActivityId).toEqual('activity.2');
      expect(workbenchLayout.activityLayout.toolbars.leftTop.minimizedActivityId).toEqual('activity.1');
      expect(workbenchLayout.activityLayout.toolbars.leftBottom.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.leftBottom.minimizedActivityId).toEqual('activity.3');
      expect(workbenchLayout.activityLayout.toolbars.rightTop.activeActivityId).toEqual('activity.4');
      expect(workbenchLayout.activityLayout.toolbars.rightTop.minimizedActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.rightBottom.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.rightBottom.minimizedActivityId).toEqual('activity.5');
      expect(workbenchLayout.activityLayout.toolbars.bottomLeft.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.bottomRight.minimizedActivityId).toBeUndefined();

      // Toggle maximize => minimize activities.
      workbenchLayout = workbenchLayout.toggleMaximized();
      expect(workbenchLayout.activityLayout.toolbars.leftTop.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.leftTop.minimizedActivityId).toEqual('activity.2');
      expect(workbenchLayout.activityLayout.toolbars.leftBottom.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.leftBottom.minimizedActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.rightTop.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.rightTop.minimizedActivityId).toEqual('activity.4');
      expect(workbenchLayout.activityLayout.toolbars.rightBottom.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.rightBottom.minimizedActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.bottomLeft.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.bottomRight.minimizedActivityId).toBeUndefined();

      // Toggle maximize => restore activities.
      workbenchLayout = workbenchLayout.toggleMaximized();
      expect(workbenchLayout.activityLayout.toolbars.leftTop.activeActivityId).toEqual('activity.2');
      expect(workbenchLayout.activityLayout.toolbars.leftTop.minimizedActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.leftBottom.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.leftBottom.minimizedActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.rightTop.activeActivityId).toEqual('activity.4');
      expect(workbenchLayout.activityLayout.toolbars.rightTop.minimizedActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.rightBottom.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.rightBottom.minimizedActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.bottomLeft.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.bottomRight.minimizedActivityId).toBeUndefined();
    });

    it('should open activity when activating contained part', () => {
      let workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
        .addPart(MAIN_AREA)
        .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
        .addPart('part.activity-2-top', {dockTo: 'right-top'}, {icon: 'folder', label: 'Activity 2', ɵactivityId: 'activity.2'})
        .addPart('part.activity-2-bottom', {relativeTo: 'part.activity-2-top', align: 'bottom'});

      // Expect activities to be minimized.
      expect(workbenchLayout.activityLayout.toolbars.leftTop.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.rightTop.activeActivityId).toBeUndefined();

      // Activate part in activity 1.
      workbenchLayout = workbenchLayout.activatePart('part.activity-1');
      expect(workbenchLayout.activityLayout.toolbars.leftTop.activeActivityId).toEqual('activity.1');
      expect(workbenchLayout.activityLayout.toolbars.rightTop.activeActivityId).toBeUndefined();

      // Close activity 1.
      workbenchLayout = workbenchLayout.toggleActivity('activity.1');

      // Activate part in activity 2.
      workbenchLayout = workbenchLayout.activatePart('part.activity-2-top');
      expect(workbenchLayout.activityLayout.toolbars.leftTop.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.rightTop.activeActivityId).toEqual('activity.2');

      // Close activity 2.
      workbenchLayout = workbenchLayout.toggleActivity('activity.2');

      // Activate part in activity 2.
      workbenchLayout = workbenchLayout.activatePart('part.activity-2-bottom');
      expect(workbenchLayout.activityLayout.toolbars.leftTop.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.rightTop.activeActivityId).toEqual('activity.2');
    });

    it('should have single activity active per activity stack', () => {
      let workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
        .addPart(MAIN_AREA)
        .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
        .addPart('part.activity-2', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.2'})
        .addPart('part.activity-3', {dockTo: 'left-bottom'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.3'})
        .addPart('part.activity-4', {dockTo: 'left-bottom'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.4'});

      // Expect activities to be minimized.
      expect(workbenchLayout.activityLayout.toolbars.leftTop.activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityLayout.toolbars.leftBottom.activeActivityId).toBeUndefined();

      // Activate part in activity 1.
      workbenchLayout = workbenchLayout.activatePart('part.activity-1');
      expect(workbenchLayout.activityLayout.toolbars.leftTop.activeActivityId).toEqual('activity.1');
      expect(workbenchLayout.activityLayout.toolbars.leftBottom.activeActivityId).toBeUndefined();

      // Activate part in activity 2.
      workbenchLayout = workbenchLayout.activatePart('part.activity-2');
      expect(workbenchLayout.activityLayout.toolbars.leftTop.activeActivityId).toEqual('activity.2');
      expect(workbenchLayout.activityLayout.toolbars.leftBottom.activeActivityId).toBeUndefined();

      // Toggle activity 3.
      workbenchLayout = workbenchLayout.toggleActivity('activity.3');
      expect(workbenchLayout.activityLayout.toolbars.leftTop.activeActivityId).toEqual('activity.2');
      expect(workbenchLayout.activityLayout.toolbars.leftBottom.activeActivityId).toEqual('activity.3');

      // Toggle activity 4.
      workbenchLayout = workbenchLayout.toggleActivity('activity.4');
      expect(workbenchLayout.activityLayout.toolbars.leftTop.activeActivityId).toEqual('activity.2');
      expect(workbenchLayout.activityLayout.toolbars.leftBottom.activeActivityId).toEqual('activity.4');
    });

    it('should have reference part', () => {
      const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
        .addPart(MAIN_AREA)
        .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
        .addPart('part.activity-2-top', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 2', ɵactivityId: 'activity.2'})
        .addPart('part.activity-2-bottom', {relativeTo: 'part.activity-2-top', align: 'bottom'});

      expect(workbenchLayout.activity({id: 'activity.1'}).referencePartId).toEqual('part.activity-1');
      expect(workbenchLayout.activity({id: 'activity.2'}).referencePartId).toEqual('part.activity-2-top');

      // Expect reference part to be structural.
      expect(workbenchLayout.part({partId: 'part.activity-1'}).structural).toBeTrue();
      expect(workbenchLayout.part({partId: 'part.activity-2-top'}).structural).toBeTrue();
    });

    it('should not remove reference part when removing its last view', () => {
      const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
        .addPart(MAIN_AREA)
        .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
        .addView('view.1', {partId: 'part.activity-1'})
        .removeView('view.1', {force: true});

      expect(workbenchLayout.activity({id: 'activity.1'}).referencePartId).toEqual('part.activity-1');
      expect(workbenchLayout.part({partId: 'part.activity-1'})).toBeDefined();
    });

    it('should not remove structural non-reference part when removing its last view', () => {
      const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
        .addPart(MAIN_AREA)
        .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
        .addPart('part.activity-2-top', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 2', ɵactivityId: 'activity.2'})
        .addPart('part.activity-2-bottom', {relativeTo: 'part.activity-2-top', align: 'bottom'})
        .addView('view.1', {partId: 'part.activity-2-bottom'})
        .removeView('view.1', {force: true});

      expect(workbenchLayout.part({partId: 'part.activity-2-bottom'})).toBeDefined();
    });

    it('should remove non-structural non-reference part when removing its last view', () => {
      const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
        .addPart(MAIN_AREA)
        .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 1', ɵactivityId: 'activity.1'})
        .addPart('part.activity-2-top', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity 2', ɵactivityId: 'activity.2'})
        .addPart('part.activity-2-bottom', {relativeTo: 'part.activity-2-top', align: 'bottom'}, {structural: false})
        .addView('view.1', {partId: 'part.activity-2-bottom'})
        .removeView('view.1', {force: true});

      expect(workbenchLayout.part({partId: 'part.activity-2-bottom'}, {orElse: null})).toBeNull();
    });

    it('should have metadata as configured', () => {
      const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
        .addPart(MAIN_AREA)
        .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'icon', label: 'Label', title: 'Title', tooltip: 'Tooltip', cssClass: 'class-1', ɵactivityId: 'activity.1'});

      expect(workbenchLayout.activity({id: 'activity.1'}).icon).toEqual('icon');
      expect(workbenchLayout.activity({id: 'activity.1'}).label).toEqual('Label');
      expect(workbenchLayout.activity({id: 'activity.1'}).tooltip).toEqual('Tooltip');
      expect(workbenchLayout.activity({id: 'activity.1'}).cssClass).toEqual('class-1');
      expect(workbenchLayout.activity({id: 'activity.1'}).referencePartId).toEqual('part.activity-1');
      expect(workbenchLayout.part({partId: 'part.activity-1'}).title).toEqual('Title');
      expect(workbenchLayout.part({partId: 'part.activity-1'}).cssClass).toEqual(['class-1']);
      expect(workbenchLayout.part({partId: 'part.activity-1'}).structural).toBeTrue();
    });

    it('should change activity panel size', () => {
      let workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory).addPart(MAIN_AREA);

      // Expect initial panel size.
      expect(workbenchLayout.activityLayout.panels.left.width).toEqual(ACTIVITY_PANEL_WIDTH);
      expect(workbenchLayout.activityLayout.panels.right.width).toEqual(ACTIVITY_PANEL_WIDTH);
      expect(workbenchLayout.activityLayout.panels.bottom.height).toEqual(ACTIVITY_PANEL_HEIGHT);

      // Change size of left panel.
      workbenchLayout = workbenchLayout.setActivityPanelSize('left', 500);
      expect(workbenchLayout.activityLayout.panels.left.width).toEqual(500);
      expect(workbenchLayout.activityLayout.panels.right.width).toEqual(ACTIVITY_PANEL_WIDTH);
      expect(workbenchLayout.activityLayout.panels.bottom.height).toEqual(ACTIVITY_PANEL_HEIGHT);

      // Change size of right panel.
      workbenchLayout = workbenchLayout.setActivityPanelSize('right', 600);
      expect(workbenchLayout.activityLayout.panels.left.width).toEqual(500);
      expect(workbenchLayout.activityLayout.panels.right.width).toEqual(600);
      expect(workbenchLayout.activityLayout.panels.bottom.height).toEqual(ACTIVITY_PANEL_HEIGHT);

      // Change size of bottom panel.
      workbenchLayout = workbenchLayout.setActivityPanelSize('bottom', 700);
      expect(workbenchLayout.activityLayout.panels.left.width).toEqual(500);
      expect(workbenchLayout.activityLayout.panels.right.width).toEqual(600);
      expect(workbenchLayout.activityLayout.panels.bottom.height).toEqual(700);
    });

    it('should change activity panel split ratio', () => {
      let workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory).addPart(MAIN_AREA);

      // Expect initial split ratio size.
      expect(workbenchLayout.activityLayout.panels.left.ratio).toEqual(.5);
      expect(workbenchLayout.activityLayout.panels.right.ratio).toEqual(.5);
      expect(workbenchLayout.activityLayout.panels.bottom.ratio).toEqual(.5);

      // Change split ratio of left panel.
      workbenchLayout = workbenchLayout.setActivityPanelSplitRatio('left', .2);
      expect(workbenchLayout.activityLayout.panels.left.ratio).toEqual(.2);
      expect(workbenchLayout.activityLayout.panels.right.ratio).toEqual(.5);
      expect(workbenchLayout.activityLayout.panels.bottom.ratio).toEqual(.5);

      // Change split ratio of right panel.
      workbenchLayout = workbenchLayout.setActivityPanelSplitRatio('right', .4);
      expect(workbenchLayout.activityLayout.panels.left.ratio).toEqual(.2);
      expect(workbenchLayout.activityLayout.panels.right.ratio).toEqual(.4);
      expect(workbenchLayout.activityLayout.panels.bottom.ratio).toEqual(.5);

      // Change split ratio of bottom panel.
      workbenchLayout = workbenchLayout.setActivityPanelSplitRatio('bottom', .6);
      expect(workbenchLayout.activityLayout.panels.left.ratio).toEqual(.2);
      expect(workbenchLayout.activityLayout.panels.right.ratio).toEqual(.4);
      expect(workbenchLayout.activityLayout.panels.bottom.ratio).toEqual(.6);
    });

    it('should remove activity (plus contained parts, views, outlets, states, ...) when removing reference part', () => {
      const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
        .addPart(MAIN_AREA)
        .addPart('part.activity-top', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity', ɵactivityId: 'activity.1'})
        .addPart('part.activity-bottom-left', {relativeTo: 'part.activity-top', align: 'bottom'})
        .addPart('part.activity-bottom-right', {relativeTo: 'part.activity-bottom-left', align: 'right'})
        .addView('view.1', {partId: 'part.activity-bottom-right'})
        .navigatePart('part.activity-top', ['path/to/part'], {state: {some: 'state'}})
        .navigatePart('part.activity-bottom-left', ['path/to/part'], {state: {some: 'state'}})
        .navigateView('view.1', ['path/to/view'], {state: {some: 'state'}})
        .activatePart('part.activity-top')
        .toggleMaximized()
        .activatePart('part.activity-top')
        // Remove reference part (part.activity-top)
        .removePart('part.activity-top');

      // Expect activity to be removed.
      expect(workbenchLayout.activityLayout.toolbars.leftTop.activities).toEqual([]);

      // Expect grid to be removed.
      expect(workbenchLayout.grids['activity.1']).toBeUndefined();

      // Expect parts to be removed.
      expect(workbenchLayout.part({partId: 'part.activity-top'}, {orElse: null})).toBeNull();
      expect(workbenchLayout.part({partId: 'part.activity-bottom-left'}, {orElse: null})).toBeNull();
      expect(workbenchLayout.part({partId: 'part.activity-bottom-right'}, {orElse: null})).toBeNull();

      // Expect views to be removed.
      expect(workbenchLayout.view({viewId: 'view.1'}, {orElse: null})).toBeNull();

      // Expect outlets to be removed.
      expect(workbenchLayout.outlets({mainGrid: true, mainAreaGrid: true, activityGrids: true})).toEqual({});

      // Expect states to be removed.
      expect(workbenchLayout.navigationState({outlet: 'part.activity-top'})).toEqual({});
      expect(workbenchLayout.navigationState({outlet: 'part.activity-bottom-left'})).toEqual({});
      expect(workbenchLayout.navigationState({outlet: 'part.activity-bottom-right'})).toEqual({});
      expect(workbenchLayout.navigationState({outlet: 'view.1'})).toEqual({});

      // Expect clean up of references in activity stacks.
      expect(workbenchLayout.activityStack({dockTo: {dockTo: 'left-top'}}).activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityStack(({dockTo: {dockTo: 'left-top'}})).minimizedActivityId).toBeUndefined();
    });

    it('should not remove activity when removing non-reference part', () => {
      const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
        .addPart(MAIN_AREA)
        .addPart('part.activity-top', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity', ɵactivityId: 'activity.1'})
        .addPart('part.activity-bottom-left', {relativeTo: 'part.activity-top', align: 'bottom'})
        .addPart('part.activity-bottom-right', {relativeTo: 'part.activity-bottom-left', align: 'right'})
        .addView('view.1', {partId: 'part.activity-bottom-right'})
        .navigatePart('part.activity-top', ['path/to/part'], {state: {some: 'state'}})
        .navigatePart('part.activity-bottom-left', ['path/to/part'], {state: {some: 'state'}})
        .navigateView('view.1', ['path/to/view'], {state: {some: 'state'}})
        // Remove non-reference part (part.activity-bottom-left).
        .removePart('part.activity-bottom-left');

      // Expect activity not to be removed.
      expect(workbenchLayout.activityLayout.toolbars.leftTop.activities).toHaveSize(1);

      // Expect grid not to be removed.
      expect(workbenchLayout.grids['activity.1']).toBeDefined();

      // Expect non-reference part to be removed.
      expect(workbenchLayout.part({partId: 'part.activity-top'})).toBeDefined();
      expect(workbenchLayout.part({partId: 'part.activity-bottom-left'}, {orElse: null})).toBeNull();
      expect(workbenchLayout.part({partId: 'part.activity-bottom-right'})).toBeDefined();

      // Expect view of non-reference part to be removed.
      expect(workbenchLayout.view({viewId: 'view.1'})).toBeDefined();

      // Expect outlets of non-reference part to be removed.
      expect(workbenchLayout.outlets({mainGrid: true, mainAreaGrid: true, activityGrids: true})).toEqual({
        'part.activity-top': segments(['path/to/part']),
        'view.1': segments(['path/to/view']),
      });

      // Expect states of non-reference part to be removed.
      expect(workbenchLayout.navigationState({outlet: 'part.activity-top'})).toEqual({some: 'state'});
      expect(workbenchLayout.navigationState({outlet: 'part.activity-bottom-left'})).toEqual({});
      expect(workbenchLayout.navigationState({outlet: 'part.activity-bottom-right'})).toEqual({});
      expect(workbenchLayout.navigationState({outlet: 'view.1'})).toEqual({some: 'state'});
    });

    it('should rename reference part of activity', () => {
      const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
        .addPart(MAIN_AREA)
        .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity', ɵactivityId: 'activity.1'})
        .addView('view.1', {partId: 'part.activity-1'})
        .navigatePart('part.activity-1', ['path/to/part'], {state: {some: 'state'}})
        .navigateView('view.1', ['path/to/view'], {state: {some: 'state'}})
        .renamePart('part.activity-1', 'part.activity-2');

      expect(workbenchLayout.navigationState({outlet: 'part.activity-1'})).toEqual({});
      expect(workbenchLayout.urlSegments({outlet: 'part.activity-1'})).toEqual([]);
      expect(workbenchLayout.outlets({mainGrid: true, mainAreaGrid: true, activityGrids: true})['part.activity-1']).toBeUndefined();

      expect(workbenchLayout.navigationState({outlet: 'part.activity-2'})).toEqual({some: 'state'});
      expect(workbenchLayout.urlSegments({outlet: 'part.activity-2'})).toEqual(segments(['path/to/part']));
      expect(workbenchLayout.outlets({mainGrid: true, mainAreaGrid: true, activityGrids: true})['part.activity-2']).toEqual(segments(['path/to/part']));
      expect(workbenchLayout.activity({id: 'activity.1'}).referencePartId).toEqual('part.activity-2');
      expect(workbenchLayout.grids['activity.1']!.activePartId).toEqual('part.activity-2');
    });

    it('should rename activity (activity active)', () => {
      const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
        .addPart(MAIN_AREA)
        .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity', ɵactivityId: 'activity.1'})
        .activatePart('part.activity-1')
        .renameActivity('activity.1', 'activity.2');

      expect(workbenchLayout.grids['activity.1']).toBeUndefined();
      expect(workbenchLayout.activity({id: 'activity.1'}, {orElse: null})).toBeNull();
      expect(workbenchLayout.activityStack({activityId: 'activity.1'}, {orElse: null})).toBeNull();

      expect(workbenchLayout.grids['activity.2']).toBeDefined();
      expect(workbenchLayout.activity({id: 'activity.2'})).toBeDefined();
      expect(workbenchLayout.activityStack({activityId: 'activity.2'})).toBeDefined();
      expect(workbenchLayout.activityStack({activityId: 'activity.2'}).activeActivityId).toEqual('activity.2');
      expect(workbenchLayout.activityStack({activityId: 'activity.2'}).minimizedActivityId).toBeUndefined();
    });

    it('should rename activity (activity not active)', () => {
      const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
        .addPart(MAIN_AREA)
        .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity', ɵactivityId: 'activity.1'})
        .renameActivity('activity.1', 'activity.2');

      expect(workbenchLayout.grids['activity.1']).toBeUndefined();
      expect(workbenchLayout.activity({id: 'activity.1'}, {orElse: null})).toBeNull();
      expect(workbenchLayout.activityStack({activityId: 'activity.1'}, {orElse: null})).toBeNull();

      expect(workbenchLayout.grids['activity.2']).toBeDefined();
      expect(workbenchLayout.activity({id: 'activity.2'})).toBeDefined();
      expect(workbenchLayout.activityStack({activityId: 'activity.2'})).toBeDefined();
      expect(workbenchLayout.activityStack({activityId: 'activity.2'}).activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityStack({activityId: 'activity.2'}).minimizedActivityId).toBeUndefined();
    });

    it('should rename activity (activity minimized)', () => {
      const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
        .addPart(MAIN_AREA)
        .addPart('part.activity-1', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity', ɵactivityId: 'activity.1'})
        .activatePart('part.activity-1')
        .toggleMaximized()
        .renameActivity('activity.1', 'activity.2');

      expect(workbenchLayout.grids['activity.1']).toBeUndefined();
      expect(workbenchLayout.activity({id: 'activity.1'}, {orElse: null})).toBeNull();
      expect(workbenchLayout.activityStack({activityId: 'activity.1'}, {orElse: null})).toBeNull();

      expect(workbenchLayout.grids['activity.2']).toBeDefined();
      expect(workbenchLayout.activity({id: 'activity.2'})).toBeDefined();
      expect(workbenchLayout.activityStack({activityId: 'activity.2'})).toBeDefined();
      expect(workbenchLayout.activityStack({activityId: 'activity.2'}).activeActivityId).toBeUndefined();
      expect(workbenchLayout.activityStack({activityId: 'activity.2'}).minimizedActivityId).toEqual('activity.2');
    });

    it('should assert activity to have MPartGrid and MActivity', () => {
      // Define the grid.
      const grids: Partial<WorkbenchGrids> = {
        'activity.1': {
          root: new MPart({id: 'part.activity-1', structural: true, views: []}),
          activePartId: 'part.activity-1',
        },
      };
      // Define activity layout.
      const activityLayout1: MActivityLayout = {
        toolbars: {
          leftTop: {activities: [{id: 'activity.1', referencePartId: 'part.activity-1', label: 'Label', icon: 'icon'}]},
          leftBottom: {activities: []},
          rightTop: {activities: []},
          rightBottom: {activities: []},
          bottomLeft: {activities: []},
          bottomRight: {activities: []},
        },
        panels: {
          left: {width: ACTIVITY_PANEL_WIDTH, ratio: ACTIVITY_PANEL_RATIO},
          right: {width: ACTIVITY_PANEL_WIDTH, ratio: ACTIVITY_PANEL_RATIO},
          bottom: {height: ACTIVITY_PANEL_HEIGHT, ratio: ACTIVITY_PANEL_RATIO},
        },
      };

      // Assert no error
      expect(() => TestBed.inject(ɵWorkbenchLayoutFactory).create({grids, activityLayout: activityLayout1})).not.toThrowError();

      // Assert activity to have a MActivity.
      expect(() => TestBed.inject(ɵWorkbenchLayoutFactory).create({grids})).toThrowError(/NullActivityError/);

      // Assert activity to have a MPartGrid.
      expect(() => TestBed.inject(ɵWorkbenchLayoutFactory).create({activityLayout: activityLayout1})).toThrowError(/NullGridError/);

      // Assert activity to have reference part.
      const activityLayout2: MActivityLayout = {
        ...activityLayout1,
        toolbars: {
          ...activityLayout1.toolbars,
          leftTop: {activities: [{id: 'activity.1', referencePartId: 'part.99', label: 'Label', icon: 'icon'}]},
        },
      };
      expect(() => TestBed.inject(ɵWorkbenchLayoutFactory).create({grids, activityLayout: activityLayout2})).toThrowError(/NullReferencePartError/);
    });

    it('should close activity when removing last view', () => {
      const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
        .addPart(MAIN_AREA)
        .addPart('part.activity', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity', ɵactivityId: 'activity.1'})
        .addView('view.100', {partId: 'part.activity'})
        .activatePart('part.activity')
        .activateView('view.100');

      const changedLayout = workbenchLayout.removeView('view.100', {force: true});

      // Expect activity to be closed.
      expect(changedLayout.activityStack({activityId: 'activity.1'}).activeActivityId).toBeUndefined();
    });

    it('should not close activity when removing last view (part has navigation)', () => {
      const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
        .addPart(MAIN_AREA)
        .addPart('part.activity', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity', ɵactivityId: 'activity.1'})
        .addView('view.100', {partId: 'part.activity'})
        .navigatePart('part.activity', ['path/to/activity'])
        .activatePart('part.activity')
        .activateView('view.100');

      const changedLayout = workbenchLayout.removeView('view.100', {force: true});

      // Expect activity not to be closed.
      expect(changedLayout.activityStack({activityId: 'activity.1'}).activeActivityId).toEqual('activity.1');
      expect(changedLayout.part({partId: 'part.activity'}).views).toEqual([]);
    });

    it('should not close activity when removing last view (activity contains other views)', () => {
      const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
        .addPart(MAIN_AREA)
        .addPart('part.activity-1-top', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity', ɵactivityId: 'activity.1'})
        .addPart('part.activity-1-bottom', {relativeTo: 'part.activity-1-top', align: 'bottom'})
        .addView('view.101', {partId: 'part.activity-1-top'})
        .addView('view.102', {partId: 'part.activity-1-bottom'})
        .activateView('view.101')
        .activateView('view.102')
        .activatePart('part.activity-1-top');

      const changedLayout = workbenchLayout.removeView('view.102', {force: true});

      // Expect activity not to be closed.
      expect(changedLayout.activityStack({activityId: 'activity.1'}).activeActivityId).toEqual('activity.1');
      expect(changedLayout.part({partId: 'part.activity-1-top'}).views.map(view => view.id)).toEqual(['view.101']);
      expect(changedLayout.part({partId: 'part.activity-1-bottom'}).views.map(view => view.id)).toEqual([]);
    });

    it('should not close activity when removing last view (activity contains other navigated parts)', () => {
      const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
        .addPart(MAIN_AREA)
        .addPart('part.activity-1-top', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity', ɵactivityId: 'activity.1'})
        .addPart('part.activity-1-bottom', {relativeTo: 'part.activity-1-top', align: 'bottom'})
        .addView('view.101', {partId: 'part.activity-1-top'})
        .navigatePart('part.activity-1-bottom', ['path/to/part'])
        .activateView('view.101')
        .activatePart('part.activity-1-top');

      const changedLayout = workbenchLayout.removeView('view.101', {force: true});

      // Expect activity not to be closed.
      expect(changedLayout.activityStack({activityId: 'activity.1'}).activeActivityId).toEqual('activity.1');
      expect(changedLayout.part({partId: 'part.activity-1-top'}).views.map(view => view.id)).toEqual([]);
      expect(changedLayout.part({partId: 'part.activity-1-bottom'}).views.map(view => view.id)).toEqual([]);
    });

    it('should not open activity when removing last view', () => {
      const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
        .addPart(MAIN_AREA)
        .addPart('part.activity', {dockTo: 'left-top'}, {icon: 'folder', label: 'Activity', ɵactivityId: 'activity.1'})
        .addView('view.100', {partId: 'part.activity'})
        .activateView('view.100');

      // Expect activity to be closed.
      expect(workbenchLayout.activityStack({activityId: 'activity.1'}).activeActivityId).toBeUndefined();

      // Remove last view.
      const changedLayout = workbenchLayout.removeView('view.100', {force: true});

      // Expect activity to be closed.
      expect(changedLayout.activityStack({activityId: 'activity.1'}).activeActivityId).toBeUndefined();
    });
  });
});

/**
 * Creates the following layout:
 *
 * +-------+---------------------------+---+
 * | A     | MAIN_AREA_INITIAL_PART_ID | E |
 * |---+---|                           |   |
 * | B | C |                           +---+
 * |   |   +---------------------------+ F |
 * |   |   |            G              |   |
 * |   |   +---------------------------+---+
 * |   |   |            D                  |
 * +---+---+-------------------------------+
 */
function createComplexMainAreaLayout(): WorkbenchLayout {
  const mainAreaInitialPartId = TestBed.inject(MAIN_AREA_INITIAL_PART_ID);
  return TestBed.inject(WorkbenchLayoutFactory)
    .addPart(MAIN_AREA)
    .addPart('part.A', {relativeTo: mainAreaInitialPartId, align: 'left'})
    .addPart('part.B', {relativeTo: 'part.A', align: 'bottom'})
    .addPart('part.C', {relativeTo: 'part.B', align: 'right'})
    .addPart('part.D', {relativeTo: mainAreaInitialPartId, align: 'bottom'})
    .addPart('part.E', {relativeTo: mainAreaInitialPartId, align: 'right'})
    .addPart('part.F', {relativeTo: 'part.E', align: 'bottom'})
    .addPart('part.G', {relativeTo: mainAreaInitialPartId, align: 'bottom'});
}

/**
 * Installs a {@link SpyObj} for {@link PartActivationInstantProvider}.
 */
function installPartActivationInstantProviderSpyObj(): jasmine.SpyObj<PartActivationInstantProvider> {
  const spyObj = jasmine.createSpyObj<PartActivationInstantProvider>('PartActivationInstantProvider', ['getActivationInstant']);
  TestBed.overrideProvider(PartActivationInstantProvider, {useValue: spyObj});
  return spyObj;
}

/**
 * Installs a {@link SpyObj} for {@link ViewActivationInstantProvider}.
 */
function installViewActivationInstantProviderSpyObj(): jasmine.SpyObj<ViewActivationInstantProvider> {
  const spyObj = jasmine.createSpyObj<ViewActivationInstantProvider>('ViewActivationInstantProvider', ['getActivationInstant']);
  TestBed.overrideProvider(ViewActivationInstantProvider, {useValue: spyObj});
  return spyObj;
}
