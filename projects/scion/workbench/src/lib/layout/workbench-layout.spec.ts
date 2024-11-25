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
import {ANYTHING, MPart, MTreeNode, toEqualWorkbenchLayoutCustomMatcher} from '../testing/jasmine/matcher/to-equal-workbench-layout.matcher';
import {expect} from '../testing/jasmine/matcher/custom-matchers.definition';
import {TestBed} from '@angular/core/testing';
import {WorkbenchLayoutFactory} from './workbench-layout.factory';
import {ɵWorkbenchLayoutFactory} from './ɵworkbench-layout.factory';
import {UrlSegmentMatcher} from '../routing/url-segment-matcher';
import {anything, segments, styleFixture, waitForInitialWorkbenchLayout, waitUntilStable} from '../testing/testing.util';
import {MPart as _MPart, MTreeNode as _MTreeNode, MView} from './workbench-layout.model';
import {WorkbenchRouter} from '../routing/workbench-router.service';
import {provideRouter} from '@angular/router';
import {TestComponent} from '../testing/test.component';
import {ɵWorkbenchService} from '../ɵworkbench.service';
import {WorkbenchComponent} from '../workbench.component';
import {provideWorkbenchForTest} from '../testing/workbench.provider';
import {WorkbenchService} from '../workbench.service';

describe('WorkbenchLayout', () => {

  beforeEach(() => jasmine.addMatchers(toEqualWorkbenchLayoutCustomMatcher));

  it('should allow adding views', () => {
    const layout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart('A')
      .addView('view.1', {partId: 'A'})
      .addView('view.2', {partId: 'A', activateView: true})
      .addView('view.3', {partId: 'A'});

    // add view without specifying position
    expect(layout
      .addView('view.4', {partId: 'A'})
      .part({partId: 'A'})
      .views.map(view => view.id),
    ).toEqual(['view.1', 'view.2', 'view.3', 'view.4']);

    // add view at the start
    expect(layout
      .addView('view.4', {partId: 'A', position: 'start'})
      .part({partId: 'A'})
      .views.map(view => view.id),
    ).toEqual(['view.4', 'view.1', 'view.2', 'view.3']);

    // add view at the end
    expect(layout
      .addView('view.4', {partId: 'A', position: 'end'})
      .part({partId: 'A'})
      .views.map(view => view.id),
    ).toEqual(['view.1', 'view.2', 'view.3', 'view.4']);

    // add view before the active view
    expect(layout
      .addView('view.4', {partId: 'A', position: 'before-active-view'})
      .part({partId: 'A'})
      .views.map(view => view.id),
    ).toEqual(['view.1', 'view.4', 'view.2', 'view.3']);

    // add view after the active view
    expect(layout
      .addView('view.4', {partId: 'A', position: 'after-active-view'})
      .part({partId: 'A'})
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
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'A'});

    const workbenchLayout = TestBed.inject(WorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('B', {relativeTo: 'A', align: 'left', ratio: .25})
      .addPart('C', {relativeTo: 'B', align: 'bottom', ratio: .5});

    expect(workbenchLayout).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          direction: 'row',
          ratio: .25,
          child1: new MTreeNode({
            direction: 'column',
            ratio: .5,
            child2: new MPart({id: 'C'}),
            child1: new MPart({id: 'B'}),
          }),
          child2: new MPart({id: 'A'}),
        }),
      },
    });
  });

  /**
   * Workbench Grid:
   * +---------------+
   * |       A       |
   * +---------------+
   * |   MAIN_AREA   |
   * +---------------+
   * |       B       |
   * +---------------+
   */
  it('should allow creating layout with main area as initial part', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'main'});

    const workbenchLayout = TestBed.inject(WorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('A', {relativeTo: MAIN_AREA, align: 'top', ratio: .25})
      .addPart('B', {relativeTo: MAIN_AREA, align: 'bottom', ratio: .5});

    expect(workbenchLayout).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          direction: 'column',
          ratio: .25,
          child1: new MPart({id: 'A'}),
          child2: new MTreeNode({
            direction: 'column',
            ratio: .5,
            child1: new MPart({id: MAIN_AREA}),
            child2: new MPart({id: 'B'}),
          }),
        }),
      },
      mainAreaGrid: {
        root: new MPart({id: 'main'}),
      },
    });
  });

  /**
   * Workbench Grid:
   * +---------------+
   * |       A       |
   * +---------------+
   * |   MAIN_AREA   |
   * +---------------+
   * |       B       |
   * +---------------+
   */
  it('should allow creating layout with main area NOT as initial part', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'main'});

    const workbenchLayout = TestBed.inject(WorkbenchLayoutFactory)
      .addPart('A')
      .addPart(MAIN_AREA, {relativeTo: 'A', align: 'bottom', ratio: .75})
      .addPart('B', {relativeTo: MAIN_AREA, align: 'bottom', ratio: .5});

    expect(workbenchLayout).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          direction: 'column',
          ratio: .25,
          child1: new MPart({id: 'A'}),
          child2: new MTreeNode({
            direction: 'column',
            ratio: .5,
            child1: new MPart({id: MAIN_AREA}),
            child2: new MPart({id: 'B'}),
          }),
        }),
      },
      mainAreaGrid: {
        root: new MPart({id: 'main'}),
      },
    });
  });

  /**
   * Workbench Grid:
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
      .addPart('A')
      .addPart('B', {relativeTo: 'A', align: 'bottom', ratio: .75})
      .addPart('C', {relativeTo: 'B', align: 'bottom', ratio: .5});

    expect(workbenchLayout).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          direction: 'column',
          ratio: .25,
          child1: new MPart({id: 'A'}),
          child2: new MTreeNode({
            direction: 'column',
            ratio: .5,
            child1: new MPart({id: 'B'}),
            child2: new MPart({id: 'C'}),
          }),
        }),
      },
    });

    expect((workbenchLayout as ɵWorkbenchLayout).mainAreaGrid).toBeNull();
  });

  /**
   * +----+---+
   * | B  |   |
   * +----+ A |
   * | C  |   |
   * +----+---+
   */
  it('should not remove the last part', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'A'});

    const workbenchLayout = TestBed.inject(WorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('B', {relativeTo: 'A', align: 'left'})
      .addPart('C', {relativeTo: 'B', align: 'bottom'})
      .removePart('B')
      .removePart('A')
      .removePart('C');

    expect(workbenchLayout).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'C'}),
      },
    });
  });

  /**
   * +---+---+
   * | A | B |
   * +---+---+
   */
  it('should unset parent node of last part when removing last tree node', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'A'});

    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('B', {relativeTo: 'A', align: 'right'})
      .removePart('A');

    expect(workbenchLayout).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'B'}),
      },
    });
    expect(workbenchLayout.part({partId: 'B'}).parent).toBeUndefined();
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
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'main'});

    const workbenchLayout = createComplexMainAreaLayout();

    expect(workbenchLayout).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          direction: 'row',
          child1: new MTreeNode({
            direction: 'column',
            child1: new MPart({id: 'A'}),
            child2: new MTreeNode({
              direction: 'row',
              child1: new MPart({id: 'B'}),
              child2: new MPart({id: 'C'}),
            }),
          }),
          child2: new MTreeNode({
            direction: 'column',
            child1: new MTreeNode({
              direction: 'row',
              child1: new MTreeNode({
                direction: 'column',
                child1: new MPart({id: 'main'}),
                child2: new MPart({id: 'G'}),
              }),
              child2: new MTreeNode({
                direction: 'column',
                child1: new MPart({id: 'E'}),
                child2: new MPart({id: 'F'}),
              }),
            }),
            child2: new MPart({id: 'D'}),
          }),
        }),
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
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'main'});

    const workbenchLayout = createComplexMainAreaLayout()
      .removePart('A')
      .removePart('F');

    expect(workbenchLayout).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          direction: 'row',
          child1: new MTreeNode({
            direction: 'row',
            child1: new MPart({id: 'B'}),
            child2: new MPart({id: 'C'}),
          }),
          child2: new MTreeNode({
            direction: 'column',
            child1: new MTreeNode({
              direction: 'row',
              child1: new MTreeNode({
                direction: 'column',
                child1: new MPart({id: 'main'}),
                child2: new MPart({id: 'G'}),
              }),
              child2: new MPart({id: 'E'}),
            }),
            child2: new MPart({id: 'D'}),
          }),
        }),
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
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'main'});

    const workbenchLayout = createComplexMainAreaLayout()
      .removePart('A')
      .removePart('F');

    expect(workbenchLayout).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          direction: 'row',
          child1: new MTreeNode({
            direction: 'row',
            child1: new MPart({id: 'B'}),
            child2: new MPart({id: 'C'}),
          }),
          child2: new MTreeNode({
            direction: 'column',
            child1: new MTreeNode({
              direction: 'row',
              child1: new MTreeNode({
                direction: 'column',
                child1: new MPart({id: 'main'}),
                child2: new MPart({id: 'G'}),
              }),
              child2: new MPart({id: 'E'}),
            }),
            child2: new MPart({id: 'D'}),
          }),
        }),
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
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'A'});

    const workbenchLayout = TestBed.inject(WorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('B', {relativeTo: 'A', align: 'left', ratio: .25})
      .addPart('C', {relativeTo: 'B', align: 'bottom', ratio: .5})
      .addPart('X', {relativeTo: 'A', align: 'right', ratio: .5})
      .addPart('Y', {relativeTo: 'X', align: 'bottom', ratio: .25})
      .addPart('Z', {relativeTo: 'Y', align: 'bottom', ratio: .25});

    expect(workbenchLayout).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          direction: 'row',
          child1: new MTreeNode({
            direction: 'column',
            child1: new MPart({id: 'B'}),
            child2: new MPart({id: 'C'}),
          }),
          child2: new MTreeNode({
            direction: 'row',
            ratio: .5,
            child1: new MPart({id: 'A'}),
            child2: new MTreeNode({
              direction: 'column',
              ratio: .75,
              child1: new MPart({id: 'X'}),
              child2: new MTreeNode({
                direction: 'column',
                ratio: .75,
                child1: new MPart({id: 'Y'}),
                child2: new MPart({id: 'Z'}),
              }),
            }),
          }),
        }),
      },
    });

    const modifiedLayout = workbenchLayout.removePart('Y');
    expect(modifiedLayout).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          direction: 'row',
          child1: new MTreeNode({
            direction: 'column',
            child1: new MPart({id: 'B'}),
            child2: new MPart({id: 'C'}),
          }),
          child2: new MTreeNode({
            direction: 'row',
            child1: new MPart({id: 'A'}),
            child2: new MTreeNode({
              direction: 'column',
              ratio: .75,
              child1: new MPart({id: 'X'}),
              child2: new MPart({id: 'Z'}),
            }),
          }),
        }),
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
  it('should allow adding a new parts to the workbench grid', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'main'});

    const workbenchLayout = createComplexMainAreaLayout()
      .addPart('LEFT', {align: 'left'})
      .addPart('BOTTOM', {align: 'bottom'})
      .addPart('RIGHT', {align: 'right'})
      .addPart('TOP', {align: 'top'});

    expect(workbenchLayout).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          direction: 'row',
          child1: new MTreeNode({
            direction: 'column',
            child1: new MPart({id: 'A'}),
            child2: new MTreeNode({
              direction: 'row',
              child1: new MPart({id: 'B'}),
              child2: new MPart({id: 'C'}),
            }),
          }),
          child2: new MTreeNode({
            direction: 'column',
            child1: new MTreeNode({
              direction: 'row',
              child1: new MTreeNode({
                direction: 'column',
                child1: new MPart({id: 'main'}),
                child2: new MPart({id: 'G'}),
              }),
              child2: new MTreeNode({
                direction: 'column',
                child1: new MPart({id: 'E'}),
                child2: new MPart({id: 'F'}),
              }),
            }),
            child2: new MPart({id: 'D'}),
          }),
        }),
      },
      workbenchGrid: {
        root: new MTreeNode({
          direction: 'column',
          child1: new MPart({id: 'TOP'}),
          child2: new MTreeNode({
            direction: 'row',
            child1: new MTreeNode({
              direction: 'column',
              child1: new MTreeNode({
                direction: 'row',
                child1: new MPart({id: 'LEFT'}),
                child2: new MPart({id: MAIN_AREA}),
              }),
              child2: new MPart({id: 'BOTTOM'}),
            }),
            child2: new MPart({id: 'RIGHT'}),
          }),
        }),
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
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'main'});

    const workbenchLayout = createComplexMainAreaLayout()
      .removePart('B')
      .removePart('D')
      .removePart('E');

    expect(workbenchLayout).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MTreeNode({
          direction: 'row',
          child1: new MTreeNode({
            direction: 'column',
            child1: new MPart({id: 'A'}),
            child2: new MPart({id: 'C'}),
          }),
          child2: new MTreeNode({
            direction: 'row',
            child1: new MTreeNode({
              direction: 'column',
              child1: new MPart({id: 'main'}),
              child2: new MPart({id: 'G'}),
            }),
            child2: new MPart({id: 'F'}),
          }),
        }),
      },
    });
  });

  it('should throw an error when referencing an unknown part', () => {
    expect(() => TestBed.inject(WorkbenchLayoutFactory)
      .addPart('A')
      .addPart('B', {relativeTo: 'unknown-part-id', align: 'left'}),
    ).toThrowError(/NullElementError/);
  });

  it('should allow removing the main area part', () => {
    const workbenchLayout = TestBed.inject(WorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('other', {relativeTo: MAIN_AREA, align: 'right', ratio: .5})
      .removePart(MAIN_AREA);
    expect(workbenchLayout).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MPart({id: 'other'}),
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
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'A'});

    const serializedLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('B', {relativeTo: 'A', align: 'left'})
      .addPart('C', {relativeTo: 'B', align: 'bottom'})
      .serialize();
    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory).create({workbenchGrid: serializedLayout.workbenchGrid, mainAreaGrid: serializedLayout.mainAreaGrid});

    // verify the main area root node.
    const rootNode = workbenchLayout.mainAreaGrid!.root as _MTreeNode;
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
    expect(topLeftPart.id).toEqual('B');

    // verify the 'C' part
    const bottomLeftPart = bcNode.child2 as _MPart;
    expect(bottomLeftPart).toBeInstanceOf(_MPart);
    expect(bottomLeftPart.parent).toBe(bcNode);
    expect(bottomLeftPart.id).toEqual('C');

    // verify the initial part
    const initialPart = rootNode.child2 as _MPart;
    expect(initialPart).toBeInstanceOf(_MPart);
    expect(initialPart.parent).toBe(rootNode);
    expect(initialPart.id).toEqual('A');
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
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'A'});

    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('B', {relativeTo: 'A', align: 'left'})
      .addPart('C', {relativeTo: 'B', align: 'bottom'});

    const serializedWorkbenchLayout = workbenchLayout.serialize();

    // modify the layout; should not modify `workbenchLayout` instance
    workbenchLayout
      .addPart('X', {relativeTo: 'A', align: 'right'})
      .addPart('Y', {relativeTo: 'X', align: 'bottom'})
      .addPart('Z', {relativeTo: 'Y', align: 'bottom'})
      .removePart('Z');

    expect(workbenchLayout.serialize()).toEqual(serializedWorkbenchLayout);
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
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'A'});

    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('B', {relativeTo: 'A', align: 'left'})
      .addPart('C', {relativeTo: 'B', align: 'bottom'})
      .addView('view.1', {partId: 'B'})
      .addView('view.2', {partId: 'B'})
      .addView('view.3', {partId: 'A'})
      .addView('view.4', {partId: 'C'});

    expect(workbenchLayout.part({partId: 'B'}).views.map(view => view.id)).toEqual(['view.1', 'view.2']);
    expect(workbenchLayout.part({partId: 'A'}).views.map(view => view.id)).toEqual(['view.3']);
    expect(workbenchLayout.part({partId: 'C'}).views.map(view => view.id)).toEqual(['view.4']);
  });

  it('should remove non-structural part when removing its last view', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'main'});

    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('left', {relativeTo: 'main', align: 'left'}, {structural: false})
      .addView('view.1', {partId: 'left'})
      .addView('view.2', {partId: 'left'})
      .removeView('view.1', {force: true})
      .removeView('view.2', {force: true});

    expect(() => workbenchLayout.part({partId: 'left'})).toThrowError(/NullPartError/);
    expect(workbenchLayout.hasPart('left')).toBeFalse();
  });

  it('should not remove structural part when removing its last view', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'main'});

    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('left', {relativeTo: 'main', align: 'left'}) // structural by default if not set
      .addView('view.1', {partId: 'left'})
      .addView('view.2', {partId: 'left'})
      .removeView('view.1')
      .removeView('view.2');

    expect(workbenchLayout.part({partId: 'left'})).toEqual(jasmine.objectContaining({id: 'left'}));
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
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'A'});

    // move 'view.1' to position 2
    expect(TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('B', {relativeTo: 'A', align: 'left'})
      .addPart('C', {relativeTo: 'B', align: 'bottom'})
      .addView('view.1', {partId: 'A'})
      .addView('view.2', {partId: 'A'})
      .addView('view.3', {partId: 'A'})
      .addView('view.4', {partId: 'A'})
      .moveView('view.1', 'A', {position: 2})
      .part({partId: 'A'})
      .views.map(view => view.id),
    ).toEqual(['view.2', 'view.1', 'view.3', 'view.4']);

    // move 'view.4' to position 2
    expect(TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('B', {relativeTo: 'A', align: 'left'})
      .addPart('C', {relativeTo: 'B', align: 'bottom'})
      .addView('view.1', {partId: 'A'})
      .addView('view.2', {partId: 'A'})
      .addView('view.3', {partId: 'A'})
      .addView('view.4', {partId: 'A'})
      .moveView('view.4', 'A', {position: 2})
      .part({partId: 'A'})
      .views.map(view => view.id),
    ).toEqual(['view.1', 'view.2', 'view.4', 'view.3']);

    // move 'view.2' to the end
    expect(TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('B', {relativeTo: 'A', align: 'left'})
      .addPart('C', {relativeTo: 'B', align: 'bottom'})
      .addView('view.1', {partId: 'A'})
      .addView('view.2', {partId: 'A'})
      .addView('view.3', {partId: 'A'})
      .addView('view.4', {partId: 'A'})
      .moveView('view.2', 'A', {position: 'end'})
      .part({partId: 'A'})
      .views.map(view => view.id),
    ).toEqual(['view.1', 'view.3', 'view.4', 'view.2']);

    // move 'view.3' to the start
    expect(TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('B', {relativeTo: 'A', align: 'left'})
      .addPart('C', {relativeTo: 'B', align: 'bottom'})
      .addView('view.1', {partId: 'A'})
      .addView('view.2', {partId: 'A'})
      .addView('view.3', {partId: 'A'})
      .addView('view.4', {partId: 'A'})
      .moveView('view.3', 'A', {position: 'start'})
      .part({partId: 'A'})
      .views.map(view => view.id),
    ).toEqual(['view.3', 'view.1', 'view.2', 'view.4']);

    // move 'view.1' before the active view
    expect(TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('B', {relativeTo: 'A', align: 'left'})
      .addPart('C', {relativeTo: 'B', align: 'bottom'})
      .addView('view.1', {partId: 'A'})
      .addView('view.2', {partId: 'A'})
      .addView('view.3', {partId: 'A', activateView: true})
      .addView('view.4', {partId: 'A'})
      .moveView('view.1', 'A', {position: 'before-active-view'})
      .part({partId: 'A'})
      .views.map(view => view.id),
    ).toEqual(['view.2', 'view.1', 'view.3', 'view.4']);

    // move 'view.2' to a different part before the active view
    expect(TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('B', {relativeTo: 'A', align: 'left'})
      .addPart('C', {relativeTo: 'B', align: 'bottom'})
      .addView('view.1', {partId: 'A', activateView: true})
      .addView('view.2', {partId: 'A'})
      .addView('view.3', {partId: 'A'})
      .addView('view.4', {partId: 'C'})
      .addView('view.5', {partId: 'C', activateView: true})
      .addView('view.6', {partId: 'C'})
      .moveView('view.2', 'C', {position: 'before-active-view'})
      .part({partId: 'C'})
      .views.map(view => view.id),
    ).toEqual(['view.4', 'view.2', 'view.5', 'view.6']);

    // move 'view.1' after the active view
    expect(TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('B', {relativeTo: 'A', align: 'left'})
      .addPart('C', {relativeTo: 'B', align: 'bottom'})
      .addView('view.1', {partId: 'A'})
      .addView('view.2', {partId: 'A'})
      .addView('view.3', {partId: 'A', activateView: true})
      .addView('view.4', {partId: 'A'})
      .moveView('view.1', 'A', {position: 'after-active-view'})
      .part({partId: 'A'})
      .views.map(view => view.id),
    ).toEqual(['view.2', 'view.3', 'view.1', 'view.4']);

    // move 'view.2' to a different part after the active view
    expect(TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('B', {relativeTo: 'A', align: 'left'})
      .addPart('C', {relativeTo: 'B', align: 'bottom'})
      .addView('view.1', {partId: 'A', activateView: true})
      .addView('view.2', {partId: 'A'})
      .addView('view.3', {partId: 'A'})
      .addView('view.4', {partId: 'C'})
      .addView('view.5', {partId: 'C', activateView: true})
      .addView('view.6', {partId: 'C'})
      .moveView('view.2', 'C', {position: 'after-active-view'})
      .part({partId: 'C'})
      .views.map(view => view.id),
    ).toEqual(['view.4', 'view.5', 'view.2', 'view.6']);

    // move 'view.2' without specifying a position
    expect(TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('B', {relativeTo: 'A', align: 'left'})
      .addPart('C', {relativeTo: 'B', align: 'bottom'})
      .addView('view.1', {partId: 'A'})
      .addView('view.2', {partId: 'A'})
      .addView('view.3', {partId: 'A'})
      .addView('view.4', {partId: 'A'})
      .moveView('view.2', 'A')
      .part({partId: 'A'})
      .views.map(view => view.id),
    ).toEqual(['view.1', 'view.2', 'view.3', 'view.4']);

    // move 'view.2' to a different part without specifying a position
    expect(TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('B', {relativeTo: 'A', align: 'left'})
      .addPart('C', {relativeTo: 'B', align: 'bottom'})
      .addView('view.1', {partId: 'A', activateView: true})
      .addView('view.2', {partId: 'A'})
      .addView('view.3', {partId: 'A'})
      .addView('view.4', {partId: 'C'})
      .addView('view.5', {partId: 'C', activateView: true})
      .addView('view.6', {partId: 'C'})
      .moveView('view.2', 'C')
      .part({partId: 'C'})
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
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'A'});

    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('B', {relativeTo: 'A', align: 'left'})
      .addPart('C', {relativeTo: 'B', align: 'bottom'})
      .addView('view.1', {partId: 'A'})
      .addView('view.2', {partId: 'A'})
      .addView('view.3', {partId: 'A'})
      .addView('view.4', {partId: 'A'})
      .moveView('view.1', 'B')
      .moveView('view.2', 'C')
      .moveView('view.3', 'C');

    expect(workbenchLayout.part({partId: 'B'}).views.map(view => view.id)).toEqual(['view.1']);
    expect(workbenchLayout.part({partId: 'C'}).views.map(view => view.id)).toEqual(['view.2', 'view.3']);
    expect(workbenchLayout.part({partId: 'A'}).views.map(view => view.id)).toEqual(['view.4']);
  });

  it('should retain navigation when moving view to another part', () => {
    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart('left')
      .addPart('right', {relativeTo: 'left', align: 'right'})
      .addView('view.1', {partId: 'left', cssClass: 'class-view'})
      .addView('view.2', {partId: 'left'})
      .addView('view.3', {partId: 'left'})
      .navigateView('view.1', ['path/to/view'], {cssClass: 'class-navigation'})
      .navigateView('view.2', [], {hint: 'some-hint'})
      .navigateView('view.3', ['path/to/view'], {data: {some: 'data'}})
      .moveView('view.1', 'right')
      .moveView('view.2', 'right')
      .moveView('view.3', 'right');

    expect(workbenchLayout.part({partId: 'right'}).views).toEqual(jasmine.arrayWithExactContents([
      {id: 'view.1', navigation: {id: anything(), cssClass: ['class-navigation']}, cssClass: ['class-view'], uid: anything()} satisfies MView,
      {id: 'view.2', navigation: {id: anything(), hint: 'some-hint'}, uid: anything()} satisfies MView,
      {id: 'view.3', navigation: {id: anything(), data: {some: 'data'}}, uid: anything()} satisfies MView,
    ]));
    expect(workbenchLayout.urlSegments({viewId: 'view.1'})).toEqual(segments(['path/to/view']));
    expect(workbenchLayout.urlSegments({viewId: 'view.2'})).toEqual([]);
    expect(workbenchLayout.urlSegments({viewId: 'view.3'})).toEqual(segments(['path/to/view']));
  });

  it('should add navigation data to the layout', () => {
    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart('main')
      .addView('view.1', {partId: 'main'})
      .navigateView('view.1', ['path/to/view'], {data: {some: 'data'}});

    expect(workbenchLayout.part({partId: 'main'}).views).toEqual(jasmine.arrayWithExactContents([
      {id: 'view.1', navigation: {id: anything(), data: {some: 'data'}}, uid: anything()} satisfies MView,
    ]));
  });

  it('should retain navigation state when moving view to another part', () => {
    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart('left')
      .addPart('right', {relativeTo: 'left', align: 'right'})
      .addView('view.1', {partId: 'left'})
      .navigateView('view.1', ['path/to/view'], {state: {some: 'state'}})
      .moveView('view.1', 'right');

    expect(workbenchLayout.part({partId: 'right'}).views).toEqual([{id: 'view.1', navigation: {id: anything()}, uid: anything()} satisfies MView]);
    expect(workbenchLayout.navigationState({viewId: 'view.1'})).toEqual({some: 'state'});
  });

  it('should clear hint of previous navigation when navigating without hint', () => {
    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart('part')
      .addView('view.1', {partId: 'part'})
      .navigateView('view.1', [], {hint: 'some-hint'})
      .navigateView('view.1', ['path/to/view']);

    expect(workbenchLayout.view({viewId: 'view.1'})).toEqual({id: 'view.1', navigation: {id: anything()}, uid: anything()} satisfies MView);
    expect(workbenchLayout.urlSegments({viewId: 'view.1'})).toEqual(segments(['path/to/view']));
  });

  it('should clear URL of previous navigation when navigating without URL', () => {
    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart('part')
      .addView('view.1', {partId: 'part'})
      .navigateView('view.1', ['path/to/view'])
      .navigateView('view.1', [], {hint: 'some-hint'});

    expect(workbenchLayout.view({viewId: 'view.1'})).toEqual({id: 'view.1', navigation: {id: anything(), hint: 'some-hint'}, uid: anything()} satisfies MView);
    expect(workbenchLayout.urlSegments({viewId: 'view.1'})).toEqual([]);
  });

  it('should clear navigation state of previous navigation when navigating without state', () => {
    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart('part')
      .addView('view.1', {partId: 'part'})
      .navigateView('view.1', ['path/to/view'], {state: {some: 'state'}})
      .navigateView('view.1', ['path/to/view']);

    expect(workbenchLayout.view({viewId: 'view.1'})).toEqual({id: 'view.1', navigation: {id: anything()}, uid: anything()} satisfies MView);
    expect(workbenchLayout.navigationState({viewId: 'view.1'})).toEqual({});
    expect(workbenchLayout.urlSegments({viewId: 'view.1'})).toEqual(segments(['path/to/view']));
  });

  it('should remove views of a part when removing a part', () => {
    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part', {align: 'right'})
      .addView('view.1', {partId: 'part'})
      .navigateView('view.1', ['path/to/view'], {state: {some: 'state'}})
      .removePart('part');

    expect(workbenchLayout.view({viewId: 'view.1'}, {orElse: null})).toBeNull();
    expect(workbenchLayout.navigationState({viewId: 'view.1'})).toEqual({});
    expect(workbenchLayout.urlSegments({viewId: 'view.1'})).toEqual([]);
  });

  it('should remove associated data when removing view', () => {
    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart('part')
      .addView('view.1', {partId: 'part'})
      .navigateView('view.1', ['path/to/view'], {state: {some: 'state'}})
      .removeView('view.1', {force: true});

    expect(workbenchLayout.view({viewId: 'view.1'}, {orElse: null})).toBeNull();
    expect(workbenchLayout.navigationState({viewId: 'view.1'})).toEqual({});
    expect(workbenchLayout.urlSegments({viewId: 'view.1'})).toEqual([]);
  });

  it('should also rename associated data when renaming view', () => {
    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart('part')
      .addView('view.1', {partId: 'part'})
      .navigateView('view.1', ['path/to/view'], {state: {some: 'state'}})
      .renameView('view.1', 'view.2');

    expect(workbenchLayout.navigationState({viewId: 'view.1'})).toEqual({});
    expect(workbenchLayout.urlSegments({viewId: 'view.1'})).toEqual([]);

    expect(workbenchLayout.navigationState({viewId: 'view.2'})).toEqual({some: 'state'});
    expect(workbenchLayout.urlSegments({viewId: 'view.2'})).toEqual(segments(['path/to/view']));
  });

  it('should activate part and view when moving view to another part', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'main'});

    let workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('left', {relativeTo: 'main', align: 'left'})
      .addPart('right', {relativeTo: 'left', align: 'right'})
      .addView('view.1', {partId: 'left'})
      .addView('view.2', {partId: 'left'})
      .addView('view.3', {partId: 'right'})
      .activatePart('left')
      .activateView('view.1')
      .activateView('view.3');

    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('left');
    expect(workbenchLayout.part({partId: 'left'}).activeViewId).toEqual('view.1');
    expect(workbenchLayout.part({partId: 'right'}).activeViewId).toEqual('view.3');

    // Move view.1 to part right
    workbenchLayout = workbenchLayout.moveView('view.1', 'right', {activatePart: true, activateView: true});

    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('right');
    expect(workbenchLayout.part({partId: 'left'}).activeViewId).toEqual('view.2');
    expect(workbenchLayout.part({partId: 'right'}).activeViewId).toEqual('view.1');
  });

  it('should not activate part and view when moving view to another part', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'main'});

    let workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('left', {relativeTo: 'main', align: 'left'})
      .addPart('right', {relativeTo: 'left', align: 'right'})
      .addView('view.1', {partId: 'left'})
      .addView('view.2', {partId: 'left'})
      .addView('view.3', {partId: 'right'})
      .activatePart('left')
      .activateView('view.1')
      .activateView('view.3');

    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('left');
    expect(workbenchLayout.part({partId: 'left'}).activeViewId).toEqual('view.1');
    expect(workbenchLayout.part({partId: 'right'}).activeViewId).toEqual('view.3');

    // Move view.1 to part right
    workbenchLayout = workbenchLayout.moveView('view.1', 'right');

    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('left');
    expect(workbenchLayout.part({partId: 'left'}).activeViewId).toEqual('view.2');
    expect(workbenchLayout.part({partId: 'right'}).activeViewId).toEqual('view.3');
  });

  it('should activate part and view when moving view inside the part', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'main'});

    let workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('left', {relativeTo: 'main', align: 'left'})
      .addPart('right', {relativeTo: 'left', align: 'right'})
      .addView('view.1', {partId: 'left'})
      .addView('view.2', {partId: 'left'})
      .addView('view.3', {partId: 'right'})
      .activatePart('right')
      .activateView('view.1')
      .activateView('view.3');

    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('right');
    expect(workbenchLayout.part({partId: 'left'}).activeViewId).toEqual('view.1');
    expect(workbenchLayout.part({partId: 'right'}).activeViewId).toEqual('view.3');

    // Move view.1 to part right
    workbenchLayout = workbenchLayout.moveView('view.2', 'left', {position: 0, activatePart: true, activateView: true});

    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('left');
    expect(workbenchLayout.part({partId: 'left'}).activeViewId).toEqual('view.2');
    expect(workbenchLayout.part({partId: 'right'}).activeViewId).toEqual('view.3');
  });

  it('should not activate part and view when moving view inside the part', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'main'});

    let workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('left', {relativeTo: 'main', align: 'left'})
      .addPart('right', {relativeTo: 'left', align: 'right'})
      .addView('view.1', {partId: 'left'})
      .addView('view.2', {partId: 'left'})
      .addView('view.3', {partId: 'right'})
      .activatePart('right')
      .activateView('view.1')
      .activateView('view.3');

    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('right');
    expect(workbenchLayout.part({partId: 'left'}).activeViewId).toEqual('view.1');
    expect(workbenchLayout.part({partId: 'right'}).activeViewId).toEqual('view.3');

    // Move view.1 to part right
    workbenchLayout = workbenchLayout.moveView('view.2', 'left', {position: 0});

    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('right');
    expect(workbenchLayout.part({partId: 'left'}).activeViewId).toEqual('view.1');
    expect(workbenchLayout.part({partId: 'right'}).activeViewId).toEqual('view.3');
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
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'A'});

    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('B', {relativeTo: 'A', align: 'left'}, {structural: false})
      .addPart('C', {relativeTo: 'B', align: 'bottom'})
      .addView('view.1', {partId: 'B'})
      .addView('view.2', {partId: 'B'})
      .addView('view.3', {partId: 'B'})
      .moveView('view.1', 'A')
      .moveView('view.2', 'A')
      .moveView('view.3', 'C');

    expect(workbenchLayout.hasPart('B')).toBeFalse();
    expect(workbenchLayout.part({partId: 'A'}).views.map(view => view.id)).toEqual(['view.1', 'view.2']);
    expect(workbenchLayout.part({partId: 'C'}).views.map(view => view.id)).toEqual(['view.3']);
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
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'A'});

    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('B', {relativeTo: 'A', align: 'left'}) // structural by default if not set
      .addPart('C', {relativeTo: 'B', align: 'bottom'})
      .addView('view.1', {partId: 'B'})
      .addView('view.2', {partId: 'B'})
      .addView('view.3', {partId: 'B'})
      .moveView('view.1', 'A')
      .moveView('view.2', 'A')
      .moveView('view.3', 'C');

    expect(workbenchLayout.part({partId: 'B'}).id).toEqual('B');
    expect(workbenchLayout.part({partId: 'A'}).views.map(view => view.id)).toEqual(['view.1', 'view.2']);
    expect(workbenchLayout.part({partId: 'C'}).views.map(view => view.id)).toEqual(['view.3']);
  });

  it('should activate the most recently activated view when removing a view', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'main'});

    const viewActivationInstantProviderSpyObj = installViewActivationInstantProviderSpyObj();
    let workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addView('view.1', {partId: 'main'})
      .addView('view.5', {partId: 'main'})
      .addView('view.2', {partId: 'main'})
      .addView('view.3', {partId: 'main'})
      .addView('view.4', {partId: 'main'});

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
    expect(workbenchLayout.part({partId: 'main'}).activeViewId).toEqual('view.4');

    workbenchLayout = workbenchLayout.removeView('view.4', {force: true});
    expect(workbenchLayout.part({partId: 'main'}).activeViewId).toEqual('view.2');

    workbenchLayout = workbenchLayout.removeView('view.2', {force: true});
    expect(workbenchLayout.part({partId: 'main'}).activeViewId).toEqual('view.5');

    workbenchLayout = workbenchLayout.removeView('view.5', {force: true});
    expect(workbenchLayout.part({partId: 'main'}).activeViewId).toEqual('view.3');
  });

  /**
   * The test operates on the following layout:
   *
   * +---+---+---+---+---+
   * | A | B | C | D | E |
   * *---+---+---+---+---+
   */
  it('should activate the most recently activated part when removing a part', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'A'});

    const partActivationInstantProviderSpyObj = installPartActivationInstantProviderSpyObj();
    let workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('B', {relativeTo: 'A', align: 'right'})
      .addPart('C', {relativeTo: 'B', align: 'right'})
      .addPart('D', {relativeTo: 'C', align: 'right'})
      .addPart('E', {relativeTo: 'D', align: 'right'}, {activate: true});

    // prepare the activation history
    partActivationInstantProviderSpyObj.getActivationInstant
      .withArgs('A').and.returnValue(3)
      .withArgs('B').and.returnValue(1)
      .withArgs('C').and.returnValue(4)
      .withArgs('D').and.returnValue(2)
      .withArgs('E').and.returnValue(5);

    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('E');

    workbenchLayout = workbenchLayout.removePart('E');
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('C');

    workbenchLayout = workbenchLayout.removePart('C');
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('A');

    workbenchLayout = workbenchLayout.removePart('A');
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('D');

    workbenchLayout = workbenchLayout.removePart('D');
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('B');
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
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'A'});

    let workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('B', {relativeTo: 'A', align: 'left'})
      .addPart('C', {relativeTo: 'B', align: 'bottom'});

    // make part 'B' the active part
    workbenchLayout = workbenchLayout.activatePart('B');
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('B');

    // add view to the part 'A'
    workbenchLayout = workbenchLayout.addView('view.1', {partId: 'A'});
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('B');

    // add view to the part 'A'
    workbenchLayout = workbenchLayout.addView('view.2', {partId: 'A', activatePart: false});
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('B');

    // add view to the part 'A'
    workbenchLayout = workbenchLayout.addView('view.3', {partId: 'A', activatePart: true});
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('A');

    // add view to the part 'C'
    workbenchLayout = workbenchLayout.addView('view.4', {partId: 'C'});
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('A');
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
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'A'});

    let workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('B', {relativeTo: 'A', align: 'left'})
      .addPart('C', {relativeTo: 'B', align: 'bottom'})
      .addView('view.1', {partId: 'A'})
      .addView('view.2', {partId: 'A'})
      .addView('view.3', {partId: 'B'})
      .addView('view.4', {partId: 'C'});

    // make part 'B' the active part
    workbenchLayout = workbenchLayout.activatePart('B');
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('B');

    // activate view.1
    workbenchLayout = workbenchLayout.activateView('view.1');
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('B');

    // activate view.2
    workbenchLayout = workbenchLayout.activateView('view.2', {activatePart: true});
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('A');

    // activate view.3
    workbenchLayout = workbenchLayout.activateView('view.3', {activatePart: false});
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('A');

    // activate view.4
    workbenchLayout = workbenchLayout.activateView('view.4');
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('A');
  });

  /**
   * The test operates on the following layout:
   *
   * +---+---+---+---+
   * | A | B | C | D |
   * *---+---+---+---+
   */
  it('should (not) activate the part when adding a new part to the layout', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'A'});

    let workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory).addPart(MAIN_AREA);
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('A');

    // add part to the right of part 'A'
    workbenchLayout = workbenchLayout.addPart('B', {relativeTo: 'A', align: 'right'});
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('A');

    // add part to the right of part 'B'
    workbenchLayout = workbenchLayout.addPart('C', {relativeTo: 'B', align: 'right'}, {activate: false});
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('A');

    // add part to the right of part 'C'
    workbenchLayout = workbenchLayout.addPart('D', {relativeTo: 'C', align: 'right'}, {activate: true});
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('D');
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
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'A'});

    let workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('B', {relativeTo: 'A', align: 'left'})
      .addView('view.1', {partId: 'A'})
      .addView('view.2', {partId: 'A'})
      .addView('view.3', {partId: 'B'})
      .addView('view.4', {partId: 'B'})
      .addPart('C', {relativeTo: 'B', align: 'bottom'})
      .addView('view.5', {partId: 'C'})
      .addView('view.6', {partId: 'C'})
      .activatePart('B');

    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('B');

    // remove view from the part 'A'
    workbenchLayout = workbenchLayout.removeView('view.1');
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('B');

    // remove view from the part 'C'
    workbenchLayout = workbenchLayout.removeView('view.5');
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('B');
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
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'A'});

    let workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('B', {relativeTo: 'A', align: 'left'})
      .addView('view.1', {partId: 'A'})
      .addView('view.2', {partId: 'A'})
      .addView('view.3', {partId: 'B'})
      .addView('view.4', {partId: 'B'})
      .addPart('C', {relativeTo: 'B', align: 'bottom'})
      .addView('view.5', {partId: 'C'})
      .addView('view.6', {partId: 'C'});

    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('A');

    // activate view of the part 'A'
    workbenchLayout = workbenchLayout.activateView('view.1', {activatePart: true});
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('A');

    // activate view of the part 'C'
    workbenchLayout = workbenchLayout.activateView('view.5', {activatePart: false});
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('A');

    // activate view of the part 'B'
    workbenchLayout = workbenchLayout.activateView('view.3');
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('A');
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
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'A'});

    let workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('B', {relativeTo: 'A', align: 'left'})
      .addView('view.1', {partId: 'A'})
      .addView('view.2', {partId: 'A'})
      .addView('view.3', {partId: 'B'})
      .addView('view.4', {partId: 'B'})
      .addPart('C', {relativeTo: 'B', align: 'bottom'})
      .addView('view.5', {partId: 'C'})
      .addView('view.6', {partId: 'C'});

    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('A');

    // move view from part 'A' to part 'C'
    workbenchLayout = workbenchLayout.moveView('view.1', 'C', {activateView: true});
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('A');

    // move view from part 'C' to part 'B'
    workbenchLayout = workbenchLayout.moveView('view.1', 'B', {activateView: true, activatePart: true});
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('B');

    // move view from part 'C' to part 'A'
    workbenchLayout = workbenchLayout.moveView('view.1', 'A', {activateView: true, activatePart: false});
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('B');
  });

  it('should compute next view id', async () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'main'});

    let workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory).addPart(MAIN_AREA);

    expect(workbenchLayout.computeNextViewId()).toEqual('view.1');
    expect(workbenchLayout.computeNextViewId()).toEqual('view.1');

    workbenchLayout = workbenchLayout.addView('view.1', {partId: 'main'});
    expect(workbenchLayout.computeNextViewId()).toEqual('view.2');

    workbenchLayout = workbenchLayout.addView('view.2', {partId: 'main'});
    expect(workbenchLayout.computeNextViewId()).toEqual('view.3');

    workbenchLayout = workbenchLayout.addView('view.3', {partId: 'main'});
    expect(workbenchLayout.computeNextViewId()).toEqual('view.4');

    workbenchLayout = workbenchLayout.addView('view.4', {partId: 'main'});
    expect(workbenchLayout.computeNextViewId()).toEqual('view.5');

    workbenchLayout = workbenchLayout.addView('view.5', {partId: 'main'});
    expect(workbenchLayout.computeNextViewId()).toEqual('view.6');

    workbenchLayout = workbenchLayout.addView('view.6', {partId: 'main'});
    expect(workbenchLayout.computeNextViewId()).toEqual('view.7');

    workbenchLayout = workbenchLayout.removeView('view.3'); // marked for removal
    expect(workbenchLayout.computeNextViewId()).toEqual('view.7');

    workbenchLayout = workbenchLayout.removeView('view.3', {force: true});
    expect(workbenchLayout.computeNextViewId()).toEqual('view.3');

    workbenchLayout = workbenchLayout.removeView('view.1', {force: true});
    expect(workbenchLayout.computeNextViewId()).toEqual('view.1');

    workbenchLayout = workbenchLayout.addView('view.1', {partId: 'main'});
    expect(workbenchLayout.computeNextViewId()).toEqual('view.3');

    workbenchLayout = workbenchLayout.addView('view.3', {partId: 'main'});
    expect(workbenchLayout.computeNextViewId()).toEqual('view.7');
  });

  it('should remove view', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'main'});

    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addView('view.1', {partId: 'main'})
      .addView('view.2', {partId: 'main'})
      .addView('view.3', {partId: 'main'})
      .removeView('view.2', {force: true});

    expect(workbenchLayout.view({viewId: 'view.1'}, {orElse: null})).toBeDefined();
    expect(workbenchLayout.view({viewId: 'view.2'}, {orElse: null})).toBeNull();
    expect(workbenchLayout.view({viewId: 'view.3'}, {orElse: null})).toBeDefined();
  });

  it('should mark view for removal', async () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'main'});

    let workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addView('view.1', {partId: 'main'})
      .addView('view.2', {partId: 'main'})
      .addView('view.3', {partId: 'main'});

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
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'main'});

    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('innerLeft', {relativeTo: 'main', align: 'left'})
      .addPart('innerRight', {relativeTo: 'main', align: 'right'})
      .addPart('outerLeft', {relativeTo: MAIN_AREA, align: 'left'})
      .addPart('outerRight', {relativeTo: MAIN_AREA, align: 'right'});

    expect(workbenchLayout.parts().map(part => part.id)).toEqual(jasmine.arrayWithExactContents([
      MAIN_AREA,
      'outerLeft',
      'innerLeft',
      'main',
      'innerRight',
      'outerRight',
    ]));

    // Find by grid
    expect(workbenchLayout.parts({grid: 'workbench'}).map(part => part.id)).toEqual(jasmine.arrayWithExactContents([
      'outerLeft',
      MAIN_AREA,
      'outerRight',
    ]));

    // Find by grid
    expect(workbenchLayout.parts({grid: 'mainArea'}).map(part => part.id)).toEqual(jasmine.arrayWithExactContents([
      'innerLeft',
      'main',
      'innerRight',
    ]));
  });

  it('should find part by criteria', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'main'});

    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('innerLeft', {relativeTo: 'main', align: 'left'})
      .addPart('innerRight', {relativeTo: 'main', align: 'right'})
      .addPart('outerLeft', {relativeTo: MAIN_AREA, align: 'left'})
      .addPart('outerRight', {relativeTo: MAIN_AREA, align: 'right'})
      .addView('view.1', {partId: 'innerLeft'})
      .addView('view.2', {partId: 'innerRight'})
      .addView('view.3', {partId: 'outerLeft'})
      .addView('view.4', {partId: 'outerRight'});

    // Find by part id
    expect(workbenchLayout.part({partId: 'outerLeft'}).id).toEqual('outerLeft');
    expect(workbenchLayout.part({partId: 'innerLeft'}).id).toEqual('innerLeft');
    expect(workbenchLayout.part({partId: 'innerRight'}).id).toEqual('innerRight');
    expect(workbenchLayout.part({partId: 'outerRight'}).id).toEqual('outerRight');

    // Find by grid and part id
    expect(workbenchLayout.part({grid: 'workbench', partId: 'outerLeft'}).id).toEqual('outerLeft');
    expect(workbenchLayout.part({grid: 'mainArea', partId: 'innerLeft'}).id).toEqual('innerLeft');
    expect(workbenchLayout.part({grid: 'mainArea', partId: 'innerRight'}).id).toEqual('innerRight');
    expect(workbenchLayout.part({grid: 'workbench', partId: 'outerRight'}).id).toEqual('outerRight');

    // Find by view id
    expect(workbenchLayout.part({viewId: 'view.1'}).id).toEqual('innerLeft');
    expect(workbenchLayout.part({viewId: 'view.2'}).id).toEqual('innerRight');
    expect(workbenchLayout.part({viewId: 'view.3'}).id).toEqual('outerLeft');
    expect(workbenchLayout.part({viewId: 'view.4'}).id).toEqual('outerRight');

    // Find by grid and view id
    expect(workbenchLayout.part({grid: 'mainArea', viewId: 'view.1'}).id).toEqual('innerLeft');
    expect(workbenchLayout.part({grid: 'mainArea', viewId: 'view.2'}).id).toEqual('innerRight');
    expect(workbenchLayout.part({grid: 'workbench', viewId: 'view.3'}).id).toEqual('outerLeft');
    expect(workbenchLayout.part({grid: 'workbench', viewId: 'view.4'}).id).toEqual('outerRight');

    // Find by part id and view id
    expect(workbenchLayout.part({partId: 'innerLeft', viewId: 'view.1'}).id).toEqual('innerLeft');
    expect(workbenchLayout.part({partId: 'innerRight', viewId: 'view.2'}).id).toEqual('innerRight');
    expect(workbenchLayout.part({partId: 'outerLeft', viewId: 'view.3'}).id).toEqual('outerLeft');
    expect(workbenchLayout.part({partId: 'outerRight', viewId: 'view.4'}).id).toEqual('outerRight');

    // Find by grid, part id and view id
    expect(workbenchLayout.part({grid: 'mainArea', partId: 'innerLeft', viewId: 'view.1'}).id).toEqual('innerLeft');
    expect(workbenchLayout.part({grid: 'mainArea', partId: 'innerRight', viewId: 'view.2'}).id).toEqual('innerRight');
    expect(workbenchLayout.part({grid: 'workbench', partId: 'outerLeft', viewId: 'view.3'}).id).toEqual('outerLeft');
    expect(workbenchLayout.part({grid: 'workbench', partId: 'outerRight', viewId: 'view.4'}).id).toEqual('outerRight');
  });

  it('should throw an error if not finding the part', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'main'});

    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addView('view.1', {partId: 'main'});

    expect(() => workbenchLayout.part({partId: 'does-not-exist'})).toThrowError(/NullPartError/);
    expect(() => workbenchLayout.part({partId: 'does-not-exist', viewId: 'view.1'})).toThrowError(/NullPartError/);
    expect(() => workbenchLayout.part({partId: 'main', viewId: 'view.2'})).toThrowError(/NullPartError/);
    expect(() => workbenchLayout.part({grid: 'workbench', partId: 'main', viewId: 'view.1'})).toThrowError(/NullPartError/);
    expect(() => workbenchLayout.part({grid: 'workbench', viewId: 'view.1'})).toThrowError(/NullPartError/);
    expect(() => workbenchLayout.part({grid: 'workbench', partId: 'main'})).toThrowError(/NullPartError/);
  });

  it('should return `null` if not finding the part', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'main'});

    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addView('view.1', {partId: 'main'});

    expect(workbenchLayout.part({partId: 'does-not-exist'}, {orElse: null})).toBeNull();
    expect(workbenchLayout.part({partId: 'does-not-exist', viewId: 'view.1'}, {orElse: null})).toBeNull();
    expect(workbenchLayout.part({partId: 'main', viewId: 'view.2'}, {orElse: null})).toBeNull();
    expect(workbenchLayout.part({grid: 'workbench', partId: 'main', viewId: 'view.1'}, {orElse: null})).toBeNull();
    expect(workbenchLayout.part({grid: 'workbench', viewId: 'view.1'}, {orElse: null})).toBeNull();
    expect(workbenchLayout.part({grid: 'workbench', partId: 'main'}, {orElse: null})).toBeNull();
  });

  it('should return whether a part is contained in the main area', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'main'});

    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('inner', {relativeTo: 'main', align: 'left'})
      .addPart('outer', {relativeTo: MAIN_AREA, align: 'left'});

    expect(workbenchLayout.hasPart('main', {grid: 'mainArea'})).toBeTrue();
    expect(workbenchLayout.hasPart('inner', {grid: 'mainArea'})).toBeTrue();
    expect(workbenchLayout.hasPart('outer', {grid: 'mainArea'})).toBeFalse();
    expect(workbenchLayout.hasPart(MAIN_AREA, {grid: 'mainArea'})).toBeFalse();
  });

  it('should find views by criteria', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'main'});

    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('inner', {relativeTo: 'main', align: 'left'})
      .addPart('outer', {relativeTo: MAIN_AREA, align: 'left'})
      .addView('view.1', {partId: 'main'})
      .addView('view.2', {partId: 'inner'})
      .addView('view.3', {partId: 'outer'});

    expect(workbenchLayout.views().map(view => view.id)).toEqual(jasmine.arrayWithExactContents(['view.1', 'view.2', 'view.3']));

    // Find by grid
    expect(workbenchLayout.views({grid: 'workbench'}).map(view => view.id)).toEqual(jasmine.arrayWithExactContents(['view.3']));
    expect(workbenchLayout.views({grid: 'mainArea'}).map(view => view.id)).toEqual(jasmine.arrayWithExactContents(['view.1', 'view.2']));
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

  it('should find views by navigation hint', () => {
    const layout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addView('view.1', {partId: MAIN_AREA})
      .addView('view.2', {partId: MAIN_AREA})
      .addView('view.3', {partId: MAIN_AREA})
      .navigateView('view.1', ['path', 'to', 'view', '1'])
      .navigateView('view.2', ['path', 'to', 'view', '2'], {hint: 'hint1'})
      .navigateView('view.3', [], {hint: 'hint2'});

    expect(layout
      .views()
      .map(view => view.id),
    ).toEqual(jasmine.arrayWithExactContents(['view.1', 'view.2', 'view.3']));

    expect(layout
      .views({navigationHint: undefined})
      .map(view => view.id),
    ).toEqual(jasmine.arrayWithExactContents(['view.1', 'view.2', 'view.3']));

    expect(layout
      .views({navigationHint: ''})
      .map(view => view.id),
    ).toEqual([]);

    expect(layout
      .views({navigationHint: null})
      .map(view => view.id),
    ).toEqual(['view.1']);

    expect(layout
      .views({navigationHint: 'hint1'})
      .map(view => view.id),
    ).toEqual(['view.2']);

    expect(layout
      .views({navigationHint: 'hint2'})
      .map(view => view.id),
    ).toEqual(['view.3']);
  });

  it('should find views by part', () => {
    const layout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart('left')
      .addPart('right', {align: 'right'})
      .addView('view.1', {partId: 'left'})
      .addView('view.2', {partId: 'left'})
      .addView('view.3', {partId: 'right'})
      .navigateView('view.1', ['path', 'to', 'view'])
      .navigateView('view.2', ['path', 'to', 'view'])
      .navigateView('view.3', ['path', 'to', 'view']);

    expect(layout
      .views({partId: undefined})
      .map(view => view.id),
    ).toEqual(jasmine.arrayWithExactContents(['view.1', 'view.2', 'view.3']));

    expect(layout
      .views({partId: 'left'})
      .map(view => view.id),
    ).toEqual(jasmine.arrayWithExactContents(['view.1', 'view.2']));

    expect(layout
      .views({partId: 'right'})
      .map(view => view.id),
    ).toEqual(['view.3']);
  });

  it('should activate adjacent view', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'main'});

    let workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part', {relativeTo: 'main', align: 'left'})
      .addView('view.1', {partId: 'part'})
      .addView('view.2', {partId: 'part'})
      .addView('view.3', {partId: 'part'});

    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('main');
    expect(workbenchLayout.part({partId: 'part'}).activeViewId).toBeUndefined();

    // Activate adjacent view
    workbenchLayout = workbenchLayout.activateAdjacentView('view.2');
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('main');
    expect(workbenchLayout.part({partId: 'part'}).activeViewId).toEqual('view.1');

    // Activate adjacent view
    workbenchLayout = workbenchLayout.activateAdjacentView('view.3');
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('main');
    expect(workbenchLayout.part({partId: 'part'}).activeViewId).toEqual('view.2');

    // Activate adjacent view
    workbenchLayout = workbenchLayout.activateAdjacentView('view.1');
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('main');
    expect(workbenchLayout.part({partId: 'part'}).activeViewId).toEqual('view.2');

    // Activate adjacent view
    workbenchLayout = workbenchLayout.activateAdjacentView('view.2', {activatePart: true});
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part');
    expect(workbenchLayout.part({partId: 'part'}).activeViewId).toEqual('view.1');
  });

  it('should allow activating a part', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'main'});

    let workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('innerLeft', {relativeTo: 'main', align: 'left'})
      .addPart('innerRight', {relativeTo: 'main', align: 'right'})
      .addPart('outerLeft', {relativeTo: MAIN_AREA, align: 'left'})
      .addPart('outerRight', {relativeTo: MAIN_AREA, align: 'right'});

    expect(workbenchLayout.activePart({grid: 'workbench'}).id).toEqual(MAIN_AREA);
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('main');

    // Activate part 'outerLeft'
    workbenchLayout = workbenchLayout.activatePart('outerLeft');
    expect(workbenchLayout.activePart({grid: 'workbench'}).id).toEqual('outerLeft');
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('main');

    // Activate part 'outerRight'
    workbenchLayout = workbenchLayout.activatePart('outerRight');
    expect(workbenchLayout.activePart({grid: 'workbench'}).id).toEqual('outerRight');
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('main');

    // Activate part 'innerLeft'
    workbenchLayout = workbenchLayout.activatePart('innerLeft');
    expect(workbenchLayout.activePart({grid: 'workbench'}).id).toEqual('outerRight');
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('innerLeft');

    // Activate part 'innerRight'
    workbenchLayout = workbenchLayout.activatePart('innerRight');
    expect(workbenchLayout.activePart({grid: 'workbench'}).id).toEqual('outerRight');
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('innerRight');
  });

  it('should allow renaming a view', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'main'});

    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('inner', {relativeTo: 'main', align: 'left'})
      .addPart('outer', {relativeTo: MAIN_AREA, align: 'left'})
      .addView('view.1', {partId: 'inner'})
      .addView('view.2', {partId: 'inner'})
      .addView('view.3', {partId: 'outer'})
      .addView('view.4', {partId: 'outer'})
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
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'left'});

    let workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('right', {relativeTo: 'left', align: 'right'});

    // Expect default ratio to be 0.5.
    expect(findParentNode('left').ratio).toEqual(.5);

    // Set ratio to 0.3.
    workbenchLayout = workbenchLayout.setSplitRatio(findParentNode('left').id, .3);
    expect(findParentNode('left').ratio).toEqual(.3);

    // Expect to error if setting the ratio for a node not contained in the layout.
    expect(() => workbenchLayout.setSplitRatio('does-not-exist', .3)).toThrowError(/NullElementError/);

    // Expect to error if setting an illegal ratio.
    expect(() => workbenchLayout.setSplitRatio(findParentNode('left').id, -.1)).toThrowError(/LayoutModifyError/);
    expect(() => workbenchLayout.setSplitRatio(findParentNode('left').id, 0)).not.toThrowError(/LayoutModifyError/);
    expect(() => workbenchLayout.setSplitRatio(findParentNode('left').id, .5)).not.toThrowError(/LayoutModifyError/);
    expect(() => workbenchLayout.setSplitRatio(findParentNode('left').id, 1)).not.toThrowError(/LayoutModifyError/);
    expect(() => workbenchLayout.setSplitRatio(findParentNode('left').id, 1.1)).toThrowError(/LayoutModifyError/);

    function findParentNode(partId: string): MTreeNode {
      const parent = workbenchLayout.part({partId}).parent;
      if (!parent) {
        throw Error(`[MTreeNodeNotFoundError] Parent MTreeNode not found [partId=${partId}].`);
      }
      return parent;
    }
  });

  /**
   * This test verifies that identifiers are not re-generated when deserializing the layout.
   *
   * The following identifiers should be stable:
   * - {@link MTreeNode.id}
   * - {@link MPart.id}
   * - {@link MView.id}
   * - {@link MView.uid}
   * - {@link MView.navigation.id}
   */
  it('should have stable identifiers', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          mainAreaInitialPartId: 'initial',
          layout: {
            perspectives: [
              {
                id: 'perspective-1',
                layout: factory => factory
                  .addPart(MAIN_AREA)
                  .addPart('left', {align: 'left'})
                  .addView('view.100', {partId: 'left'})
                  .navigateView('view.100', ['test-view']),
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
        ]),
      ],
    });
    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();

    // Prepare main area to have to parts split vertically.
    await TestBed.inject(WorkbenchRouter).navigate(layout => layout
      .addPart('top', {relativeTo: 'initial', align: 'top'})
      .addPart('bottom', {relativeTo: 'top', align: 'bottom'})
      .removePart('initial')
      .addView('view.101', {partId: 'top'})
      .addView('view.102', {partId: 'bottom'})
      .navigateView('view.101', ['test-view'])
      .navigateView('view.102', ['test-view'])
      .activateView('view.101')
      .activateView('view.102'),
    );
    await waitUntilStable();

    // Capture model objects. The ids should not change when serializing and deserializing the layout.
    const workbenchLayoutRoot = TestBed.inject(ɵWorkbenchService).layout().workbenchGrid!.root;
    const mainAreaLayoutRoot = TestBed.inject(ɵWorkbenchService).layout().mainAreaGrid!.root;
    const view100 = TestBed.inject(ɵWorkbenchService).layout().view({viewId: 'view.100'});
    const view101 = TestBed.inject(ɵWorkbenchService).layout().view({viewId: 'view.101'});
    const view102 = TestBed.inject(ɵWorkbenchService).layout().view({viewId: 'view.102'});

    // Expect initial layout.
    expect(fixture).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          id: workbenchLayoutRoot.id,
          direction: 'row',
          ratio: .5,
          child1: new MPart({
            id: 'left',
            views: [{id: 'view.100', uid: view100.uid, navigation: {id: view100.navigation!.id}}],
            activeViewId: 'view.100',
          }),
          child2: new MPart({
            id: MAIN_AREA,
          }),
        }),
      },
      mainAreaGrid: {
        root: new MTreeNode({
          id: mainAreaLayoutRoot.id,
          direction: 'column',
          ratio: .5,
          child1: new MPart({
            id: 'top',
            views: [{id: 'view.101', uid: view101.uid, navigation: {id: view101.navigation!.id}}],
            activeViewId: 'view.101',
          }),
          child2: new MPart({
            id: 'bottom',
            views: [{id: 'view.102', uid: view102.uid, navigation: {id: view102.navigation!.id}}],
            activeViewId: 'view.102',
          }),
        }),
      },
    });

    // Modify the main area layout, causing the layout to be serialized and deserialized.
    await TestBed.inject(WorkbenchRouter).navigate(layout => layout
      .addView('view.103', {partId: 'bottom'})
      .navigateView('view.103', ['test-view']),
    );
    await waitUntilStable();

    // Expect ids not to have changed.
    expect(fixture).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          id: workbenchLayoutRoot.id,
          direction: 'row',
          ratio: .5,
          child1: new MPart({
            id: 'left',
            views: [{id: 'view.100', uid: view100.uid, navigation: {id: view100.navigation!.id}}],
            activeViewId: 'view.100',
          }),
          child2: new MPart({
            id: MAIN_AREA,
          }),
        }),
      },
      mainAreaGrid: {
        root: new MTreeNode({
          id: mainAreaLayoutRoot.id,
          direction: 'column',
          ratio: .5,
          child1: new MPart({
            id: 'top',
            views: [{id: 'view.101', uid: view101.uid, navigation: {id: view101.navigation!.id}}],
            activeViewId: 'view.101',
          }),
          child2: new MPart({
            id: 'bottom',
            views: [
              {id: 'view.102', uid: view102.uid, navigation: {id: view102.navigation!.id}},
              {id: 'view.103', uid: ANYTHING, navigation: {id: ANYTHING}},
            ],
            activeViewId: 'view.102',
          }),
        }),
      },
    });

    // Switch perspective, causing the layout to be serialized and deserialized.
    await TestBed.inject(WorkbenchService).switchPerspective('perspective-2');
    await TestBed.inject(WorkbenchService).switchPerspective('perspective-1');
    await waitUntilStable();

    // Expect ids not to have changed.
    expect(fixture).toEqualWorkbenchLayout({
      workbenchGrid: {
        root: new MTreeNode({
          id: workbenchLayoutRoot.id,
          direction: 'row',
          ratio: .5,
          child1: new MPart({
            id: 'left',
            views: [{id: 'view.100', uid: view100.uid, navigation: {id: view100.navigation!.id}}],
            activeViewId: 'view.100',
          }),
          child2: new MPart({
            id: MAIN_AREA,
          }),
        }),
      },
      mainAreaGrid: {
        root: new MTreeNode({
          id: mainAreaLayoutRoot.id,
          direction: 'column',
          ratio: .5,
          child1: new MPart({
            id: 'top',
            views: [{id: 'view.101', uid: view101.uid, navigation: {id: view101.navigation!.id}}],
            activeViewId: 'view.101',
          }),
          child2: new MPart({
            id: 'bottom',
            views: [
              {id: 'view.102', uid: view102.uid, navigation: {id: view102.navigation!.id}},
              {id: 'view.103', uid: ANYTHING, navigation: {id: ANYTHING}},
            ],
            activeViewId: 'view.102',
          }),
        }),
      },
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
    .addPart('A', {relativeTo: mainAreaInitialPartId, align: 'left'})
    .addPart('B', {relativeTo: 'A', align: 'bottom'})
    .addPart('C', {relativeTo: 'B', align: 'right'})
    .addPart('D', {relativeTo: mainAreaInitialPartId, align: 'bottom'})
    .addPart('E', {relativeTo: mainAreaInitialPartId, align: 'right'})
    .addPart('F', {relativeTo: 'E', align: 'bottom'})
    .addPart('G', {relativeTo: mainAreaInitialPartId, align: 'bottom'});
}

/**
 * Installs a {@link SpyObj} for {@link PartActivationInstantProvider}.
 */
function installPartActivationInstantProviderSpyObj(): jasmine.SpyObj<PartActivationInstantProvider> {
  const spyObj = jasmine.createSpyObj('PartActivationInstantProvider', ['getActivationInstant']);
  TestBed.overrideProvider(PartActivationInstantProvider, {useValue: spyObj});
  return spyObj;
}

/**
 * Installs a {@link SpyObj} for {@link ViewActivationInstantProvider}.
 */
function installViewActivationInstantProviderSpyObj(): jasmine.SpyObj<PartActivationInstantProvider> {
  const spyObj = jasmine.createSpyObj('ViewActivationInstantProvider', ['getActivationInstant']);
  TestBed.overrideProvider(ViewActivationInstantProvider, {useValue: spyObj});
  return spyObj;
}
