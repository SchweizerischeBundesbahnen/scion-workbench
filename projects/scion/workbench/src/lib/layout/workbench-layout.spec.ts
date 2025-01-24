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
import {PartId} from '../part/workbench-part.model';

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
      mainAreaGrid: {
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
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.initial'});

    const workbenchLayout = TestBed.inject(WorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.A', {relativeTo: MAIN_AREA, align: 'top', ratio: .25})
      .addPart('part.B', {relativeTo: MAIN_AREA, align: 'bottom', ratio: .5});

    expect(workbenchLayout).toEqualWorkbenchLayout({
      workbenchGrid: {
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
      mainAreaGrid: {
        root: new MPart({id: 'part.initial'}),
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
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.initial'});

    const workbenchLayout = TestBed.inject(WorkbenchLayoutFactory)
      .addPart('part.A')
      .addPart(MAIN_AREA, {relativeTo: 'part.A', align: 'bottom', ratio: .75})
      .addPart('part.B', {relativeTo: MAIN_AREA, align: 'bottom', ratio: .5});

    expect(workbenchLayout).toEqualWorkbenchLayout({
      workbenchGrid: {
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
      mainAreaGrid: {
        root: new MPart({id: 'part.initial'}),
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
      .addPart('part.A')
      .addPart('part.B', {relativeTo: 'part.A', align: 'bottom', ratio: .75})
      .addPart('part.C', {relativeTo: 'part.B', align: 'bottom', ratio: .5});

    expect(workbenchLayout).toEqualWorkbenchLayout({
      workbenchGrid: {
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
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.A'});

    const workbenchLayout = TestBed.inject(WorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.B', {relativeTo: 'part.A', align: 'left'})
      .addPart('part.C', {relativeTo: 'part.B', align: 'bottom'})
      .removePart('part.B')
      .removePart('part.A')
      .removePart('part.C');

    expect(workbenchLayout).toEqualWorkbenchLayout({
      mainAreaGrid: {
        root: new MPart({id: 'part.C'}),
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
      mainAreaGrid: {
        root: new MPart({id: 'part.B'}),
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
      mainAreaGrid: {
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
      mainAreaGrid: {
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
      mainAreaGrid: {
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
      mainAreaGrid: {
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
    });

    const modifiedLayout = workbenchLayout.removePart('part.Y');
    expect(modifiedLayout).toEqualWorkbenchLayout({
      mainAreaGrid: {
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
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.initial'});

    const workbenchLayout = createComplexMainAreaLayout()
      .addPart('part.LEFT', {align: 'left'})
      .addPart('part.BOTTOM', {align: 'bottom'})
      .addPart('part.RIGHT', {align: 'right'})
      .addPart('part.TOP', {align: 'top'});

    expect(workbenchLayout).toEqualWorkbenchLayout({
      mainAreaGrid: {
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
      workbenchGrid: {
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
      mainAreaGrid: {
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
      workbenchGrid: {
        root: new MPart({id: 'part.other'}),
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
      .addPart('part.C', {relativeTo: 'part.B', align: 'bottom'});

    const serializedWorkbenchLayout = workbenchLayout.serialize();

    // modify the layout; should not modify `workbenchLayout` instance
    workbenchLayout
      .addPart('part.X', {relativeTo: 'part.A', align: 'right'})
      .addPart('part.Y', {relativeTo: 'part.X', align: 'bottom'})
      .addPart('part.Z', {relativeTo: 'part.Y', align: 'bottom'})
      .removePart('part.Z');

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
    expect(workbenchLayout.outlets()['view.1']).toBeUndefined();
  });

  it('should also rename associated data when renaming view', () => {
    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart('part.part')
      .addView('view.1', {partId: 'part.part'})
      .navigateView('view.1', ['path/to/view'], {state: {some: 'state'}})
      .renameView('view.1', 'view.2');

    expect(workbenchLayout.navigationState({outlet: 'view.1'})).toEqual({});
    expect(workbenchLayout.urlSegments({outlet: 'view.1'})).toEqual([]);
    expect(workbenchLayout.outlets()['view.1']).toBeUndefined();

    expect(workbenchLayout.navigationState({outlet: 'view.2'})).toEqual({some: 'state'});
    expect(workbenchLayout.urlSegments({outlet: 'view.2'})).toEqual(segments(['path/to/view']));
    expect(workbenchLayout.outlets()['view.2']).toEqual(segments(['path/to/view']));
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
    expect(workbenchLayout.outlets()['part.right']).toBeUndefined();
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

  it('should compute next view id', async () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.initial'});

    let workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory).addPart(MAIN_AREA);

    expect(workbenchLayout.computeNextViewId()).toEqual('view.1');
    expect(workbenchLayout.computeNextViewId()).toEqual('view.1');

    workbenchLayout = workbenchLayout.addView('view.1', {partId: 'part.initial'});
    expect(workbenchLayout.computeNextViewId()).toEqual('view.2');

    workbenchLayout = workbenchLayout.addView('view.2', {partId: 'part.initial'});
    expect(workbenchLayout.computeNextViewId()).toEqual('view.3');

    workbenchLayout = workbenchLayout.addView('view.3', {partId: 'part.initial'});
    expect(workbenchLayout.computeNextViewId()).toEqual('view.4');

    workbenchLayout = workbenchLayout.addView('view.4', {partId: 'part.initial'});
    expect(workbenchLayout.computeNextViewId()).toEqual('view.5');

    workbenchLayout = workbenchLayout.addView('view.5', {partId: 'part.initial'});
    expect(workbenchLayout.computeNextViewId()).toEqual('view.6');

    workbenchLayout = workbenchLayout.addView('view.6', {partId: 'part.initial'});
    expect(workbenchLayout.computeNextViewId()).toEqual('view.7');

    workbenchLayout = workbenchLayout.removeView('view.3'); // marked for removal
    expect(workbenchLayout.computeNextViewId()).toEqual('view.7');

    workbenchLayout = workbenchLayout.removeView('view.3', {force: true});
    expect(workbenchLayout.computeNextViewId()).toEqual('view.3');

    workbenchLayout = workbenchLayout.removeView('view.1', {force: true});
    expect(workbenchLayout.computeNextViewId()).toEqual('view.1');

    workbenchLayout = workbenchLayout.addView('view.1', {partId: 'part.initial'});
    expect(workbenchLayout.computeNextViewId()).toEqual('view.3');

    workbenchLayout = workbenchLayout.addView('view.3', {partId: 'part.initial'});
    expect(workbenchLayout.computeNextViewId()).toEqual('view.7');
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
      .addPart('part.outerRight', {relativeTo: MAIN_AREA, align: 'right'});

    expect(workbenchLayout.parts().map(part => part.id)).toEqual(jasmine.arrayWithExactContents([
      MAIN_AREA,
      'part.outerLeft',
      'part.innerLeft',
      'part.initial',
      'part.innerRight',
      'part.outerRight',
    ]));

    // Find by grid
    expect(workbenchLayout.parts({grid: 'workbench'}).map(part => part.id)).toEqual(jasmine.arrayWithExactContents([
      'part.outerLeft',
      MAIN_AREA,
      'part.outerRight',
    ]));

    // Find by grid
    expect(workbenchLayout.parts({grid: 'mainArea'}).map(part => part.id)).toEqual(jasmine.arrayWithExactContents([
      'part.innerLeft',
      'part.initial',
      'part.innerRight',
    ]));
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

    // Find by part id
    expect(workbenchLayout.part({partId: 'part.outerLeft'}).id).toEqual('part.outerLeft');
    expect(workbenchLayout.part({partId: 'part.innerLeft'}).id).toEqual('part.innerLeft');
    expect(workbenchLayout.part({partId: 'part.innerRight'}).id).toEqual('part.innerRight');
    expect(workbenchLayout.part({partId: 'part.outerRight'}).id).toEqual('part.outerRight');

    // Find by grid and part id
    expect(workbenchLayout.part({grid: 'workbench', partId: 'part.outerLeft'}).id).toEqual('part.outerLeft');
    expect(workbenchLayout.part({grid: 'mainArea', partId: 'part.innerLeft'}).id).toEqual('part.innerLeft');
    expect(workbenchLayout.part({grid: 'mainArea', partId: 'part.innerRight'}).id).toEqual('part.innerRight');
    expect(workbenchLayout.part({grid: 'workbench', partId: 'part.outerRight'}).id).toEqual('part.outerRight');

    // Find by view id
    expect(workbenchLayout.part({viewId: 'view.1'}).id).toEqual('part.innerLeft');
    expect(workbenchLayout.part({viewId: 'view.2'}).id).toEqual('part.innerRight');
    expect(workbenchLayout.part({viewId: 'view.3'}).id).toEqual('part.outerLeft');
    expect(workbenchLayout.part({viewId: 'view.4'}).id).toEqual('part.outerRight');

    // Find by grid and view id
    expect(workbenchLayout.part({grid: 'mainArea', viewId: 'view.1'}).id).toEqual('part.innerLeft');
    expect(workbenchLayout.part({grid: 'mainArea', viewId: 'view.2'}).id).toEqual('part.innerRight');
    expect(workbenchLayout.part({grid: 'workbench', viewId: 'view.3'}).id).toEqual('part.outerLeft');
    expect(workbenchLayout.part({grid: 'workbench', viewId: 'view.4'}).id).toEqual('part.outerRight');

    // Find by part id and view id
    expect(workbenchLayout.part({partId: 'part.innerLeft', viewId: 'view.1'}).id).toEqual('part.innerLeft');
    expect(workbenchLayout.part({partId: 'part.innerRight', viewId: 'view.2'}).id).toEqual('part.innerRight');
    expect(workbenchLayout.part({partId: 'part.outerLeft', viewId: 'view.3'}).id).toEqual('part.outerLeft');
    expect(workbenchLayout.part({partId: 'part.outerRight', viewId: 'view.4'}).id).toEqual('part.outerRight');

    // Find by grid, part id and view id
    expect(workbenchLayout.part({grid: 'mainArea', partId: 'part.innerLeft', viewId: 'view.1'}).id).toEqual('part.innerLeft');
    expect(workbenchLayout.part({grid: 'mainArea', partId: 'part.innerRight', viewId: 'view.2'}).id).toEqual('part.innerRight');
    expect(workbenchLayout.part({grid: 'workbench', partId: 'part.outerLeft', viewId: 'view.3'}).id).toEqual('part.outerLeft');
    expect(workbenchLayout.part({grid: 'workbench', partId: 'part.outerRight', viewId: 'view.4'}).id).toEqual('part.outerRight');
  });

  it('should throw an error if not finding the part', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.initial'});

    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addView('view.1', {partId: 'part.initial'});

    expect(() => workbenchLayout.part({partId: 'part.does-not-exist'})).toThrowError(/NullPartError/);
    expect(() => workbenchLayout.part({partId: 'part.does-not-exist', viewId: 'view.1'})).toThrowError(/NullPartError/);
    expect(() => workbenchLayout.part({partId: 'part.initial', viewId: 'view.2'})).toThrowError(/NullPartError/);
    expect(() => workbenchLayout.part({grid: 'workbench', partId: 'part.initial', viewId: 'view.1'})).toThrowError(/NullPartError/);
    expect(() => workbenchLayout.part({grid: 'workbench', viewId: 'view.1'})).toThrowError(/NullPartError/);
    expect(() => workbenchLayout.part({grid: 'workbench', partId: 'part.initial'})).toThrowError(/NullPartError/);
    expect(() => workbenchLayout.parts({id: 'part.does-not-exist'}, {throwIfEmpty: true})).toThrowError(/NullPartError/);
    expect(workbenchLayout.parts({id: 'part.does-not-exist'})).toHaveSize(0);
  });

  it('should throw an error if finding multiple parts', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.initial'});

    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart('part')
      .addPart('part', {align: 'right'});

    expect(() => workbenchLayout.parts({id: 'part'}, {throwIfMulti: true})).toThrowError(/MultiPartError/);
    expect(workbenchLayout.parts({id: 'part'})).toHaveSize(2);
  });

  it('should return `null` if not finding the part', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.initial'});

    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addView('view.1', {partId: 'part.initial'});

    expect(workbenchLayout.part({partId: 'part.does-not-exist'}, {orElse: null})).toBeNull();
    expect(workbenchLayout.part({partId: 'part.does-not-exist', viewId: 'view.1'}, {orElse: null})).toBeNull();
    expect(workbenchLayout.part({partId: 'part.initial', viewId: 'view.2'}, {orElse: null})).toBeNull();
    expect(workbenchLayout.part({grid: 'workbench', partId: 'part.initial', viewId: 'view.1'}, {orElse: null})).toBeNull();
    expect(workbenchLayout.part({grid: 'workbench', viewId: 'view.1'}, {orElse: null})).toBeNull();
    expect(workbenchLayout.part({grid: 'workbench', partId: 'part.initial'}, {orElse: null})).toBeNull();
  });

  it('should return whether a part is contained in the main area', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.initial'});

    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.inner', {relativeTo: 'part.initial', align: 'left'})
      .addPart('part.outer', {relativeTo: MAIN_AREA, align: 'left'});

    expect(workbenchLayout.hasPart('part.initial', {grid: 'mainArea'})).toBeTrue();
    expect(workbenchLayout.hasPart('part.inner', {grid: 'mainArea'})).toBeTrue();
    expect(workbenchLayout.hasPart('part.outer', {grid: 'mainArea'})).toBeFalse();
    expect(workbenchLayout.hasPart(MAIN_AREA, {grid: 'mainArea'})).toBeFalse();
  });

  it('should find views by criteria', () => {
    TestBed.overrideProvider(MAIN_AREA_INITIAL_PART_ID, {useValue: 'part.initial'});

    const workbenchLayout = TestBed.inject(ɵWorkbenchLayoutFactory)
      .addPart(MAIN_AREA)
      .addPart('part.inner', {relativeTo: 'part.initial', align: 'left'})
      .addPart('part.outer', {relativeTo: MAIN_AREA, align: 'left'})
      .addView('view.1', {partId: 'part.initial'})
      .addView('view.2', {partId: 'part.inner'})
      .addView('view.3', {partId: 'part.outer'});

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
      .addPart('part.left')
      .addPart('part.right', {align: 'right'})
      .addView('view.1', {partId: 'part.left'})
      .addView('view.2', {partId: 'part.left'})
      .addView('view.3', {partId: 'part.right'})
      .navigateView('view.1', ['path', 'to', 'view'])
      .navigateView('view.2', ['path', 'to', 'view'])
      .navigateView('view.3', ['path', 'to', 'view']);

    expect(layout
      .views({partId: undefined})
      .map(view => view.id),
    ).toEqual(jasmine.arrayWithExactContents(['view.1', 'view.2', 'view.3']));

    expect(layout
      .views({partId: 'part.left'})
      .map(view => view.id),
    ).toEqual(jasmine.arrayWithExactContents(['view.1', 'view.2']));

    expect(layout
      .views({partId: 'part.right'})
      .map(view => view.id),
    ).toEqual(['view.3']);
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

    expect(workbenchLayout.activePart({grid: 'workbench'}).id).toEqual(MAIN_AREA);
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part.initial');

    // Activate part 'outerLeft''
    workbenchLayout = workbenchLayout.activatePart('part.outerLeft');
    expect(workbenchLayout.activePart({grid: 'workbench'}).id).toEqual('part.outerLeft');
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part.initial');

    // Activate part 'outerRight'
    workbenchLayout = workbenchLayout.activatePart('part.outerRight');
    expect(workbenchLayout.activePart({grid: 'workbench'}).id).toEqual('part.outerRight');
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part.initial');

    // Activate part 'innerLeft'
    workbenchLayout = workbenchLayout.activatePart('part.innerLeft');
    expect(workbenchLayout.activePart({grid: 'workbench'}).id).toEqual('part.outerRight');
    expect(workbenchLayout.activePart({grid: 'mainArea'})!.id).toEqual('part.innerLeft');

    // Activate part 'innerRight'
    workbenchLayout = workbenchLayout.activatePart('part.innerRight');
    expect(workbenchLayout.activePart({grid: 'workbench'}).id).toEqual('part.outerRight');
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
    workbenchLayout = workbenchLayout.setSplitRatio(findParentNode('part.left').id, .3);
    expect(findParentNode('part.left').ratio).toEqual(.3);

    // Expect to error if setting the ratio for a node not contained in the layout.
    expect(() => workbenchLayout.setSplitRatio('does-not-exist', .3)).toThrowError(/NullElementError/);

    // Expect to error if setting an illegal ratio.
    expect(() => workbenchLayout.setSplitRatio(findParentNode('part.left').id, -.1)).toThrowError(/LayoutModifyError/);
    expect(() => workbenchLayout.setSplitRatio(findParentNode('part.left').id, 0)).not.toThrowError(/LayoutModifyError/);
    expect(() => workbenchLayout.setSplitRatio(findParentNode('part.left').id, .5)).not.toThrowError(/LayoutModifyError/);
    expect(() => workbenchLayout.setSplitRatio(findParentNode('part.left').id, 1)).not.toThrowError(/LayoutModifyError/);
    expect(() => workbenchLayout.setSplitRatio(findParentNode('part.left').id, 1.1)).toThrowError(/LayoutModifyError/);

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
    await waitForInitialWorkbenchLayout();

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
    const workbenchLayoutRoot = TestBed.inject(ɵWorkbenchService).layout().workbenchGrid!.root;
    const mainAreaLayoutRoot = TestBed.inject(ɵWorkbenchService).layout().mainAreaGrid!.root;
    const view100 = TestBed.inject(ɵWorkbenchService).layout().view({viewId: 'view.100'});
    const view101 = TestBed.inject(ɵWorkbenchService).layout().view({viewId: 'view.101'});
    const view102 = TestBed.inject(ɵWorkbenchService).layout().view({viewId: 'view.102'});
    const partRight = TestBed.inject(ɵWorkbenchService).layout().part({partId: 'part.right'});
    const mainAreaParentNode = (workbenchLayoutRoot as MTreeNode).child1;

    // Expect initial layout.
    expect(fixture).toEqualWorkbenchLayout({
      workbenchGrid: {
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
      mainAreaGrid: {
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
    });

    // Modify the main area layout, causing the layout to be serialized and deserialized.
    await TestBed.inject(WorkbenchRouter).navigate(layout => layout
      .addView('view.103', {partId: 'part.bottom'})
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
      mainAreaGrid: {
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
              {id: 'view.103', navigation: {id: ANYTHING}},
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
      mainAreaGrid: {
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
              {id: 'view.103', navigation: {id: ANYTHING}},
            ],
            activeViewId: 'view.102',
          }),
        }),
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
      workbenchGrid: {
        root: new MTreeNode({
          direction: 'row',
          ratio: .5,
          child1: new MTreeNode({
            direction: 'row',
            ratio: .5,
            child1: new MPart({
              alternativeId: 'part',
              navigation: {id: ANYTHING},
            }),
            child2: new MPart({
              id: MAIN_AREA,
            }),
          }),
          child2: new MPart({
            alternativeId: 'part',
            navigation: {id: ANYTHING},
          }),
        }),
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
  const spyObj = jasmine.createSpyObj('PartActivationInstantProvider', ['getActivationInstant']);
  TestBed.overrideProvider(PartActivationInstantProvider, {useValue: spyObj});
  return spyObj;
}

/**
 * Installs a {@link SpyObj} for {@link ViewActivationInstantProvider}.
 */
function installViewActivationInstantProviderSpyObj(): jasmine.SpyObj<ViewActivationInstantProvider> {
  const spyObj = jasmine.createSpyObj('ViewActivationInstantProvider', ['getActivationInstant']);
  TestBed.overrideProvider(ViewActivationInstantProvider, {useValue: spyObj});
  return spyObj;
}
