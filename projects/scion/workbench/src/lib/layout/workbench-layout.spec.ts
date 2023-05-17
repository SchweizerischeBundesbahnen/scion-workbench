/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {MPart, MTreeNode} from './workbench-layout.model';
import {expect, partialMPart, partialMTreeNode} from '../testing/jasmine/matcher/custom-matchers.definition';
import {WorkbenchAccessor, ɵWorkbenchLayout} from './ɵworkbench-layout';
import {MAIN_AREA_PART_ID} from './workbench-layout';
import {toEqualWorkbenchLayoutCustomMatcher} from '../testing/jasmine/matcher/to-equal-workbench-layout.matcher';
import {TestBed} from '@angular/core/testing';
import {WorkbenchLayoutSerializer} from './workench-layout-serializer.service';

describe('WorkbenchLayout', () => {

  beforeEach(() => jasmine.addMatchers(toEqualWorkbenchLayoutCustomMatcher));

  /**
   * +----+---+
   * | B  |   |
   * +----+ A |
   * | C  |   |
   * +----+---+
   */
  it('should allow adding parts relative to other parts', () => {
    const workbenchLayout = createMainAreaLayout('A')
      .addPart('B', {relativeTo: 'A', align: 'left', ratio: .25})
      .addPart('C', {relativeTo: 'B', align: 'bottom', ratio: .5});

    expect(workbenchLayout).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          direction: 'row',
          ratio: .25,
          child1: partialMTreeNode({
            direction: 'column',
            ratio: .5,
            child2: partialMPart({id: 'C'}),
            child1: partialMPart({id: 'B'}),
          }),
          child2: partialMPart({id: 'A'}),
        }),
      },
    });
  });

  /**
   * +----+---+
   * | B  |   |
   * +----+ A |
   * | C  |   |
   * +----+---+
   */
  it('should not remove the last part', () => {
    const workbenchLayout = createMainAreaLayout('A')
      .addPart('B', {relativeTo: 'A', align: 'left'})
      .addPart('C', {relativeTo: 'B', align: 'bottom'})
      .removePart('B')
      .removePart('A')
      .removePart('C');

    expect(workbenchLayout).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMPart({id: 'C'}),
      },
    });
  });

  /**
   * +-------+------+---+
   * | A     |      | E |
   * |---+---| root |   |
   * | B | C |      +---+
   * |   |   +------+ F |
   * |   |   |   G  |   |
   * |   |   +------+---+
   * |   |   |     D    |
   * +---+---+----------+
   */
  it('should support creating a complex layout', () => {
    const workbenchLayout = createComplexMainAreaLayout();

    expect(workbenchLayout).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          direction: 'row',
          child1: partialMTreeNode({
            direction: 'column',
            child1: partialMPart({id: 'A'}),
            child2: partialMTreeNode({
              direction: 'row',
              child1: partialMPart({id: 'B'}),
              child2: partialMPart({id: 'C'}),
            }),
          }),
          child2: partialMTreeNode({
            direction: 'column',
            child1: partialMTreeNode({
              direction: 'row',
              child1: partialMTreeNode({
                direction: 'column',
                child1: partialMPart({id: 'root'}),
                child2: partialMPart({id: 'G'}),
              }),
              child2: partialMTreeNode({
                direction: 'column',
                child1: partialMPart({id: 'E'}),
                child2: partialMPart({id: 'F'}),
              }),
            }),
            child2: partialMPart({id: 'D'}),
          }),
        }),
      },
    });
  });

  /**
   * Initial layout:
   *
   * +-------+------+---+
   * | A     | root | E |
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
   * |   |   | root | E |
   * |   |   |      |   |
   * | B | C |      +   +
   * |   |   +------+   |
   * |   |   |   G  |   |
   * |   |   +------+---+
   * |   |   |     D    |
   * +---+---+----------+
   */
  it('should allow removing parts \'A\' and \'F\'', () => {
    const workbenchLayout = createComplexMainAreaLayout()
      .removePart('A')
      .removePart('F');

    expect(workbenchLayout).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          direction: 'row',
          child1: partialMTreeNode({
            direction: 'row',
            child1: partialMPart({id: 'B'}),
            child2: partialMPart({id: 'C'}),
          }),
          child2: partialMTreeNode({
            direction: 'column',
            child1: partialMTreeNode({
              direction: 'row',
              child1: partialMTreeNode({
                direction: 'column',
                child1: partialMPart({id: 'root'}),
                child2: partialMPart({id: 'G'}),
              }),
              child2: partialMPart({id: 'E'}),
            }),
            child2: partialMPart({id: 'D'}),
          }),
        }),
      },
    });
  });

  /**
   * Initial layout:
   *
   * +-------+------+---+
   * | A     | root | E |
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
   * |   |   | root | E |
   * |   |   |      |   |
   * | B | C |      +   +
   * |   |   +------+   |
   * |   |   |   G  |   |
   * |   |   +------+---+
   * |   |   |     D    |
   * +---+---+----------+
   */
  it('should allow removing parts \'A\' and \'F\'', () => {
    const workbenchLayout = createComplexMainAreaLayout()
      .removePart('A')
      .removePart('F');

    expect(workbenchLayout).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          direction: 'row',
          child1: partialMTreeNode({
            direction: 'row',
            child1: partialMPart({id: 'B'}),
            child2: partialMPart({id: 'C'}),
          }),
          child2: partialMTreeNode({
            direction: 'column',
            child1: partialMTreeNode({
              direction: 'row',
              child1: partialMTreeNode({
                direction: 'column',
                child1: partialMPart({id: 'root'}),
                child2: partialMPart({id: 'G'}),
              }),
              child2: partialMPart({id: 'E'}),
            }),
            child2: partialMPart({id: 'D'}),
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
    const workbenchLayout = createMainAreaLayout('A')
      .addPart('B', {relativeTo: 'A', align: 'left', ratio: .25})
      .addPart('C', {relativeTo: 'B', align: 'bottom', ratio: .5})
      .addPart('X', {relativeTo: 'A', align: 'right', ratio: .5})
      .addPart('Y', {relativeTo: 'X', align: 'bottom', ratio: .25})
      .addPart('Z', {relativeTo: 'Y', align: 'bottom', ratio: .25});

    expect(workbenchLayout).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          direction: 'row',
          child1: partialMTreeNode({
            direction: 'column',
            child1: partialMPart({id: 'B'}),
            child2: partialMPart({id: 'C'}),
          }),
          child2: partialMTreeNode({
            direction: 'row',
            ratio: .5,
            child1: partialMPart({id: 'A'}),
            child2: partialMTreeNode({
              direction: 'column',
              ratio: .75,
              child1: partialMPart({id: 'X'}),
              child2: partialMTreeNode({
                direction: 'column',
                ratio: .75,
                child1: partialMPart({id: 'Y'}),
                child2: partialMPart({id: 'Z'}),
              }),
            }),
          }),
        }),
      },
    });

    const modifiedLayout = workbenchLayout.removePart('Y');
    expect(modifiedLayout).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          direction: 'row',
          child1: partialMTreeNode({
            direction: 'column',
            child1: partialMPart({id: 'B'}),
            child2: partialMPart({id: 'C'}),
          }),
          child2: partialMTreeNode({
            direction: 'row',
            child1: partialMPart({id: 'A'}),
            child2: partialMTreeNode({
              direction: 'column',
              ratio: .75,
              child1: partialMPart({id: 'X'}),
              child2: partialMPart({id: 'Z'}),
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
   * | A     | root | E |
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
   * |      | A     | root | E |       |
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
  it('should allow adding a new parts to the peripheral area', () => {
    const workbenchLayout = createComplexMainAreaLayout()
      .addPart('LEFT', {align: 'left'})
      .addPart('BOTTOM', {align: 'bottom'})
      .addPart('RIGHT', {align: 'right'})
      .addPart('TOP', {align: 'top'});

    expect(workbenchLayout).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          direction: 'row',
          child1: partialMTreeNode({
            direction: 'column',
            child1: partialMPart({id: 'A'}),
            child2: partialMTreeNode({
              direction: 'row',
              child1: partialMPart({id: 'B'}),
              child2: partialMPart({id: 'C'}),
            }),
          }),
          child2: partialMTreeNode({
            direction: 'column',
            child1: partialMTreeNode({
              direction: 'row',
              child1: partialMTreeNode({
                direction: 'column',
                child1: partialMPart({id: 'root'}),
                child2: partialMPart({id: 'G'}),
              }),
              child2: partialMTreeNode({
                direction: 'column',
                child1: partialMPart({id: 'E'}),
                child2: partialMPart({id: 'F'}),
              }),
            }),
            child2: partialMPart({id: 'D'}),
          }),
        }),
      },
      peripheralGrid: {
        root: partialMTreeNode({
          direction: 'column',
          child1: partialMPart({id: 'TOP'}),
          child2: partialMTreeNode({
            direction: 'row',
            child1: partialMTreeNode({
              direction: 'column',
              child1: partialMTreeNode({
                direction: 'row',
                child1: partialMPart({id: 'LEFT'}),
                child2: partialMPart({id: MAIN_AREA_PART_ID}),
              }),
              child2: partialMPart({id: 'BOTTOM'}),
            }),
            child2: partialMPart({id: 'RIGHT'}),
          }),
        }),
      },
    });
  });

  /**
   * Initial layout:
   *
   * +-------+------+---+
   * | A     | root | E |
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
   * | A     | root |   |
   * |---+---|      |   |
   * |       |      | F |
   * |       +------+   |
   * |   C   |   G  |   |
   * +-------+------+---+
   */
  it('should allow removing parts \'B\' \'D\' and \'E\'', () => {
    const workbenchLayout = createComplexMainAreaLayout()
      .removePart('B')
      .removePart('D')
      .removePart('E');

    expect(workbenchLayout).toEqualWorkbenchLayout({
      mainGrid: {
        root: partialMTreeNode({
          direction: 'row',
          child1: partialMTreeNode({
            direction: 'column',
            child1: partialMPart({id: 'A'}),
            child2: partialMPart({id: 'C'}),
          }),
          child2: partialMTreeNode({
            direction: 'row',
            child1: partialMTreeNode({
              direction: 'column',
              child1: partialMPart({id: 'root'}),
              child2: partialMPart({id: 'G'}),
            }),
            child2: partialMPart({id: 'F'}),
          }),
        }),
      },
    });
  });

  it('should throw an error when referencing an unknown part', () => {
    expect(() => createMainAreaLayout('A')
      .addPart('B', {relativeTo: 'unknown-part-id', align: 'left'}),
    ).toThrowError(/NullPartError/);
  });

  it('should throw an error when trying to remove the main area part', () => {
    const workbenchLayout = createMainAreaLayout('main');
    expect(() => workbenchLayout.removePart(MAIN_AREA_PART_ID)).toThrowError('[IllegalArgumentError] The main area part cannot be removed.');
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
    const serializedLayout = createMainAreaLayout('A')
      .addPart('B', {relativeTo: 'A', align: 'left'})
      .addPart('C', {relativeTo: 'B', align: 'bottom'})
      .serialize();
    const workbenchAccessor = createWorkbenchAccessorSpyObj();
    const workbenchLayout = new ɵWorkbenchLayout({mainGrid: serializedLayout.mainGrid, workbenchAccessor});

    // verify the main area root node.
    const rootNode = workbenchLayout.mainGrid.root as MTreeNode;
    expect(rootNode.constructor).toEqual(MTreeNode);
    expect(rootNode.parent).toBeUndefined();

    // verify the left sashbox
    const bcNode = rootNode.child1 as MTreeNode;
    expect(bcNode.constructor).toEqual(MTreeNode);
    expect(bcNode.parent).toBe(rootNode);

    // verify the 'B' part
    const topLeftPart = bcNode.child1 as MPart;
    expect(topLeftPart.constructor).toEqual(MPart);
    expect(topLeftPart.parent).toBe(bcNode);
    expect(topLeftPart.id).toEqual('B');

    // verify the 'C' part
    const bottomLeftPart = bcNode.child2 as MPart;
    expect(bottomLeftPart.constructor).toEqual(MPart);
    expect(bottomLeftPart.parent).toBe(bcNode);
    expect(bottomLeftPart.id).toEqual('C');

    // verify the main part
    const mainPart = rootNode.child2 as MPart;
    expect(mainPart.constructor).toEqual(MPart);
    expect(mainPart.parent).toBe(rootNode);
    expect(mainPart.id).toEqual('A');
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
    const workbenchLayout = createMainAreaLayout('A')
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
    const workbenchLayout = createMainAreaLayout('A')
      .addPart('B', {relativeTo: 'A', align: 'left'})
      .addPart('C', {relativeTo: 'B', align: 'bottom'})
      .addView('view.1', {partId: 'B'})
      .addView('view.2', {partId: 'B'})
      .addView('view.3', {partId: 'A'})
      .addView('view.4', {partId: 'C'});

    expect(workbenchLayout.part({by: {partId: 'B'}}).views).toEqual([{id: 'view.1'}, {id: 'view.2'}]);
    expect(workbenchLayout.part({by: {partId: 'A'}}).views).toEqual([{id: 'view.3'}]);
    expect(workbenchLayout.part({by: {partId: 'C'}}).views).toEqual([{id: 'view.4'}]);
  });

  it('should remove non-structural part when removing its last view', () => {
    const workbenchLayout = createMainAreaLayout('root')
      .addPart('left', {relativeTo: 'root', align: 'left'}, {structural: false})
      .addView('view.1', {partId: 'left'})
      .addView('view.2', {partId: 'left'})
      .removeView('view.1')
      .removeView('view.2');

    expect(() => workbenchLayout.part({by: {partId: 'left'}})).toThrowError(/NullPartError/);
    expect(workbenchLayout.part({by: {partId: 'left'}}, {orElse: null})).toBeNull();
  });

  it('should not remove structural part when removing its last view', () => {
    const workbenchLayout = createMainAreaLayout('root')
      .addPart('left', {relativeTo: 'root', align: 'left'}) // structural by default if not set
      .addView('view.1', {partId: 'left'})
      .addView('view.2', {partId: 'left'})
      .removeView('view.1')
      .removeView('view.2');

    expect(workbenchLayout.part({by: {partId: 'left'}})).toEqual(jasmine.objectContaining({id: 'left'}));
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
    // move 'view.1' to position 2
    expect(createMainAreaLayout('A')
      .addPart('B', {relativeTo: 'A', align: 'left'})
      .addPart('C', {relativeTo: 'B', align: 'bottom'})
      .addView('view.1', {partId: 'A'})
      .addView('view.2', {partId: 'A'})
      .addView('view.3', {partId: 'A'})
      .addView('view.4', {partId: 'A'})
      .moveView('view.1', 'A', {position: 2})
      .part({by: {partId: 'A'}})
      .views.map(view => view.id),
    ).toEqual(['view.2', 'view.1', 'view.3', 'view.4']);

    // move 'view.4' to position 2
    expect(createMainAreaLayout('A')
      .addPart('B', {relativeTo: 'A', align: 'left'})
      .addPart('C', {relativeTo: 'B', align: 'bottom'})
      .addView('view.1', {partId: 'A'})
      .addView('view.2', {partId: 'A'})
      .addView('view.3', {partId: 'A'})
      .addView('view.4', {partId: 'A'})
      .moveView('view.4', 'A', {position: 2})
      .part({by: {partId: 'A'}})
      .views.map(view => view.id),
    ).toEqual(['view.1', 'view.2', 'view.4', 'view.3']);

    // move 'view.2' to the end
    expect(createMainAreaLayout('A')
      .addPart('B', {relativeTo: 'A', align: 'left'})
      .addPart('C', {relativeTo: 'B', align: 'bottom'})
      .addView('view.1', {partId: 'A'})
      .addView('view.2', {partId: 'A'})
      .addView('view.3', {partId: 'A'})
      .addView('view.4', {partId: 'A'})
      .moveView('view.2', 'A')
      .part({by: {partId: 'A'}})
      .views.map(view => view.id),
    ).toEqual(['view.1', 'view.3', 'view.4', 'view.2']);

    // move 'view.3' to the start
    expect(createMainAreaLayout('A')
      .addPart('B', {relativeTo: 'A', align: 'left'})
      .addPart('C', {relativeTo: 'B', align: 'bottom'})
      .addView('view.1', {partId: 'A'})
      .addView('view.2', {partId: 'A'})
      .addView('view.3', {partId: 'A'})
      .addView('view.4', {partId: 'A'})
      .moveView('view.3', 'A', {position: 0})
      .part({by: {partId: 'A'}})
      .views.map(view => view.id),
    ).toEqual(['view.3', 'view.1', 'view.2', 'view.4']);
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
    const workbenchLayout = createMainAreaLayout('A')
      .addPart('B', {relativeTo: 'A', align: 'left'})
      .addPart('C', {relativeTo: 'B', align: 'bottom'})
      .addView('view.1', {partId: 'A'})
      .addView('view.2', {partId: 'A'})
      .addView('view.3', {partId: 'A'})
      .addView('view.4', {partId: 'A'})
      .moveView('view.1', 'B')
      .moveView('view.2', 'C')
      .moveView('view.3', 'C');

    expect(workbenchLayout.part({by: {partId: 'B'}}).views).toEqual([{id: 'view.1'}]);
    expect(workbenchLayout.part({by: {partId: 'C'}}).views).toEqual([{id: 'view.2'}, {id: 'view.3'}]);
    expect(workbenchLayout.part({by: {partId: 'A'}}).views).toEqual([{id: 'view.4'}]);
  });

  it('should activate part and view when moving view to another part', () => {
    let workbenchLayout = createMainAreaLayout('main')
      .addPart('left', {relativeTo: 'main', align: 'left'})
      .addPart('right', {relativeTo: 'left', align: 'right'})
      .addView('view.1', {partId: 'left'})
      .addView('view.2', {partId: 'left'})
      .addView('view.3', {partId: 'right'})
      .activatePart('left')
      .activateView('view.1')
      .activateView('view.3');

    expect(workbenchLayout.activePart({scope: 'main'}).id).toEqual('left');
    expect(workbenchLayout.part({by: {partId: 'left'}}).activeViewId).toEqual('view.1');
    expect(workbenchLayout.part({by: {partId: 'right'}}).activeViewId).toEqual('view.3');

    // Move view.1 to part right
    workbenchLayout = workbenchLayout.moveView('view.1', 'right', {activatePart: true, activateView: true});

    expect(workbenchLayout.activePart({scope: 'main'}).id).toEqual('right');
    expect(workbenchLayout.part({by: {partId: 'left'}}).activeViewId).toEqual('view.2');
    expect(workbenchLayout.part({by: {partId: 'right'}}).activeViewId).toEqual('view.1');
  });

  it('should not activate part and view when moving view to another part', () => {
    let workbenchLayout = createMainAreaLayout('main')
      .addPart('left', {relativeTo: 'main', align: 'left'})
      .addPart('right', {relativeTo: 'left', align: 'right'})
      .addView('view.1', {partId: 'left'})
      .addView('view.2', {partId: 'left'})
      .addView('view.3', {partId: 'right'})
      .activatePart('left')
      .activateView('view.1')
      .activateView('view.3');

    expect(workbenchLayout.activePart({scope: 'main'}).id).toEqual('left');
    expect(workbenchLayout.part({by: {partId: 'left'}}).activeViewId).toEqual('view.1');
    expect(workbenchLayout.part({by: {partId: 'right'}}).activeViewId).toEqual('view.3');

    // Move view.1 to part right
    workbenchLayout = workbenchLayout.moveView('view.1', 'right');

    expect(workbenchLayout.activePart({scope: 'main'}).id).toEqual('left');
    expect(workbenchLayout.part({by: {partId: 'left'}}).activeViewId).toEqual('view.2');
    expect(workbenchLayout.part({by: {partId: 'right'}}).activeViewId).toEqual('view.3');
  });

  it('should activate part and view when moving view inside the part', () => {
    let workbenchLayout = createMainAreaLayout('main')
      .addPart('left', {relativeTo: 'main', align: 'left'})
      .addPart('right', {relativeTo: 'left', align: 'right'})
      .addView('view.1', {partId: 'left'})
      .addView('view.2', {partId: 'left'})
      .addView('view.3', {partId: 'right'})
      .activatePart('right')
      .activateView('view.1')
      .activateView('view.3');

    expect(workbenchLayout.activePart({scope: 'main'}).id).toEqual('right');
    expect(workbenchLayout.part({by: {partId: 'left'}}).activeViewId).toEqual('view.1');
    expect(workbenchLayout.part({by: {partId: 'right'}}).activeViewId).toEqual('view.3');

    // Move view.1 to part right
    workbenchLayout = workbenchLayout.moveView('view.2', 'left', {position: 0, activatePart: true, activateView: true});

    expect(workbenchLayout.activePart({scope: 'main'}).id).toEqual('left');
    expect(workbenchLayout.part({by: {partId: 'left'}}).activeViewId).toEqual('view.2');
    expect(workbenchLayout.part({by: {partId: 'right'}}).activeViewId).toEqual('view.3');
  });

  it('should not activate part and view when moving view inside the part', () => {
    let workbenchLayout = createMainAreaLayout('main')
      .addPart('left', {relativeTo: 'main', align: 'left'})
      .addPart('right', {relativeTo: 'left', align: 'right'})
      .addView('view.1', {partId: 'left'})
      .addView('view.2', {partId: 'left'})
      .addView('view.3', {partId: 'right'})
      .activatePart('right')
      .activateView('view.1')
      .activateView('view.3');

    expect(workbenchLayout.activePart({scope: 'main'}).id).toEqual('right');
    expect(workbenchLayout.part({by: {partId: 'left'}}).activeViewId).toEqual('view.1');
    expect(workbenchLayout.part({by: {partId: 'right'}}).activeViewId).toEqual('view.3');

    // Move view.1 to part right
    workbenchLayout = workbenchLayout.moveView('view.2', 'left', {position: 0});

    expect(workbenchLayout.activePart({scope: 'main'}).id).toEqual('right');
    expect(workbenchLayout.part({by: {partId: 'left'}}).activeViewId).toEqual('view.1');
    expect(workbenchLayout.part({by: {partId: 'right'}}).activeViewId).toEqual('view.3');
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
    const workbenchLayout = createMainAreaLayout('A')
      .addPart('B', {relativeTo: 'A', align: 'left'}, {structural: false})
      .addPart('C', {relativeTo: 'B', align: 'bottom'})
      .addView('view.1', {partId: 'B'})
      .addView('view.2', {partId: 'B'})
      .addView('view.3', {partId: 'B'})
      .moveView('view.1', 'A')
      .moveView('view.2', 'A')
      .moveView('view.3', 'C');

    expect(workbenchLayout.part({by: {partId: 'B'}}, {orElse: null})).toBeNull();
    expect(workbenchLayout.part({by: {partId: 'A'}}).views).toEqual([{id: 'view.1'}, {id: 'view.2'}]);
    expect(workbenchLayout.part({by: {partId: 'C'}}).views).toEqual([{id: 'view.3'}]);
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
    const workbenchLayout = createMainAreaLayout('A')
      .addPart('B', {relativeTo: 'A', align: 'left'}) // structural by default if not set
      .addPart('C', {relativeTo: 'B', align: 'bottom'})
      .addView('view.1', {partId: 'B'})
      .addView('view.2', {partId: 'B'})
      .addView('view.3', {partId: 'B'})
      .moveView('view.1', 'A')
      .moveView('view.2', 'A')
      .moveView('view.3', 'C');

    expect(workbenchLayout.part({by: {partId: 'B'}})).toEqual(jasmine.objectContaining({id: 'B'}));
    expect(workbenchLayout.part({by: {partId: 'A'}}).views).toEqual([{id: 'view.1'}, {id: 'view.2'}]);
    expect(workbenchLayout.part({by: {partId: 'C'}}).views).toEqual([{id: 'view.3'}]);
  });

  it('should activate the most recently activated view when removing a view', () => {
    const workbenchAccessor = createWorkbenchAccessorSpyObj();
    let workbenchLayout = createMainAreaLayout('main', workbenchAccessor)
      .addView('view.1', {partId: 'main'})
      .addView('view.5', {partId: 'main'})
      .addView('view.2', {partId: 'main'})
      .addView('view.4', {partId: 'main'})
      .addView('view.3', {partId: 'main'});

    // prepare the activation history
    workbenchAccessor.getViewActivationInstant
      .withArgs('view.1').and.returnValue(5)
      .withArgs('view.2').and.returnValue(3)
      .withArgs('view.3').and.returnValue(1)
      .withArgs('view.4').and.returnValue(4)
      .withArgs('view.5').and.returnValue(2);

    workbenchLayout = workbenchLayout
      .activateView('view.1')
      .removeView('view.1');
    expect(workbenchLayout.part({by: {partId: 'main'}}).activeViewId).toEqual('view.4');

    workbenchLayout = workbenchLayout.removeView('view.4');
    expect(workbenchLayout.part({by: {partId: 'main'}}).activeViewId).toEqual('view.2');

    workbenchLayout = workbenchLayout.removeView('view.2');
    expect(workbenchLayout.part({by: {partId: 'main'}}).activeViewId).toEqual('view.5');

    workbenchLayout = workbenchLayout.removeView('view.5');
    expect(workbenchLayout.part({by: {partId: 'main'}}).activeViewId).toEqual('view.3');
  });

  /**
   * The test operates on the following layout:
   *
   * +---+---+---+---+---+
   * | A | B | C | D | E |
   * *---+---+---+---+---+
   */
  it('should activate the most recently activated part when removing a part', () => {
    const workbenchAccessor = createWorkbenchAccessorSpyObj();
    let workbenchLayout = createMainAreaLayout('A', workbenchAccessor)
      .addPart('B', {relativeTo: 'A', align: 'right'})
      .addPart('C', {relativeTo: 'B', align: 'right'})
      .addPart('D', {relativeTo: 'C', align: 'right'})
      .addPart('E', {relativeTo: 'D', align: 'right'}, {activate: true});

    // prepare the activation history
    workbenchAccessor.getPartActivationInstant
      .withArgs('A').and.returnValue(3)
      .withArgs('B').and.returnValue(1)
      .withArgs('C').and.returnValue(4)
      .withArgs('D').and.returnValue(2)
      .withArgs('E').and.returnValue(5);

    expect(workbenchLayout.activePart({scope: 'main'}).id).toEqual('E');

    workbenchLayout = workbenchLayout.removePart('E');
    expect(workbenchLayout.activePart({scope: 'main'}).id).toEqual('C');

    workbenchLayout = workbenchLayout.removePart('C');
    expect(workbenchLayout.activePart({scope: 'main'}).id).toEqual('A');

    workbenchLayout = workbenchLayout.removePart('A');
    expect(workbenchLayout.activePart({scope: 'main'}).id).toEqual('D');

    workbenchLayout = workbenchLayout.removePart('D');
    expect(workbenchLayout.activePart({scope: 'main'}).id).toEqual('B');
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
    let workbenchLayout = createMainAreaLayout('A')
      .addPart('B', {relativeTo: 'A', align: 'left'})
      .addPart('C', {relativeTo: 'B', align: 'bottom'});

    // make part 'B' the active part
    workbenchLayout = workbenchLayout.activatePart('B');
    expect(workbenchLayout.activePart({scope: 'main'}).id).toEqual('B');

    // add view to the part 'A'
    workbenchLayout = workbenchLayout.addView('view.1', {partId: 'A'});
    expect(workbenchLayout.activePart({scope: 'main'}).id).toEqual('B');

    // add view to the part 'A'
    workbenchLayout = workbenchLayout.addView('view.2', {partId: 'A', activatePart: false});
    expect(workbenchLayout.activePart({scope: 'main'}).id).toEqual('B');

    // add view to the part 'A'
    workbenchLayout = workbenchLayout.addView('view.3', {partId: 'A', activatePart: true});
    expect(workbenchLayout.activePart({scope: 'main'}).id).toEqual('A');

    // add view to the part 'C'
    workbenchLayout = workbenchLayout.addView('view.4', {partId: 'C'});
    expect(workbenchLayout.activePart({scope: 'main'}).id).toEqual('A');
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
    let workbenchLayout = createMainAreaLayout('A')
      .addPart('B', {relativeTo: 'A', align: 'left'})
      .addPart('C', {relativeTo: 'B', align: 'bottom'})
      .addView('view.1', {partId: 'A'})
      .addView('view.2', {partId: 'A'})
      .addView('view.3', {partId: 'B'})
      .addView('view.4', {partId: 'C'});

    // make part 'B' the active part
    workbenchLayout = workbenchLayout.activatePart('B');
    expect(workbenchLayout.activePart({scope: 'main'}).id).toEqual('B');

    // activate view.1
    workbenchLayout = workbenchLayout.activateView('view.1');
    expect(workbenchLayout.activePart({scope: 'main'}).id).toEqual('B');

    // activate view.2
    workbenchLayout = workbenchLayout.activateView('view.2', {activatePart: true});
    expect(workbenchLayout.activePart({scope: 'main'}).id).toEqual('A');

    // activate view.3
    workbenchLayout = workbenchLayout.activateView('view.3', {activatePart: false});
    expect(workbenchLayout.activePart({scope: 'main'}).id).toEqual('A');

    // activate view.4
    workbenchLayout = workbenchLayout.activateView('view.4');
    expect(workbenchLayout.activePart({scope: 'main'}).id).toEqual('A');
  });

  /**
   * The test operates on the following layout:
   *
   * +---+---+---+---+
   * | A | B | C | D |
   * *---+---+---+---+
   */
  it('should (not) activate the part when adding a new part to the layout', () => {
    let workbenchLayout = createMainAreaLayout('A');
    expect(workbenchLayout.activePart({scope: 'main'}).id).toEqual('A');

    // add part to the right of part 'A'
    workbenchLayout = workbenchLayout.addPart('B', {relativeTo: 'A', align: 'right'});
    expect(workbenchLayout.activePart({scope: 'main'}).id).toEqual('A');

    // add part to the right of part 'B'
    workbenchLayout = workbenchLayout.addPart('C', {relativeTo: 'B', align: 'right'}, {activate: false});
    expect(workbenchLayout.activePart({scope: 'main'}).id).toEqual('A');

    // add part to the right of part 'C'
    workbenchLayout = workbenchLayout.addPart('D', {relativeTo: 'C', align: 'right'}, {activate: true});
    expect(workbenchLayout.activePart({scope: 'main'}).id).toEqual('D');
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
    let workbenchLayout = createMainAreaLayout('A')
      .addPart('B', {relativeTo: 'A', align: 'left'})
      .addView('view.1', {partId: 'A'})
      .addView('view.2', {partId: 'A'})
      .addView('view.3', {partId: 'B'})
      .addView('view.4', {partId: 'B'})
      .addPart('C', {relativeTo: 'B', align: 'bottom'})
      .addView('view.5', {partId: 'C'})
      .addView('view.6', {partId: 'C'})
      .activatePart('B');

    expect(workbenchLayout.activePart({scope: 'main'}).id).toEqual('B');

    // remove view from the part 'A'
    workbenchLayout = workbenchLayout.removeView('view.1');
    expect(workbenchLayout.activePart({scope: 'main'}).id).toEqual('B');

    // remove view from the part 'C'
    workbenchLayout = workbenchLayout.removeView('view.5');
    expect(workbenchLayout.activePart({scope: 'main'}).id).toEqual('B');
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
    let workbenchLayout = createMainAreaLayout('A')
      .addPart('B', {relativeTo: 'A', align: 'left'})
      .addView('view.1', {partId: 'A'})
      .addView('view.2', {partId: 'A'})
      .addView('view.3', {partId: 'B'})
      .addView('view.4', {partId: 'B'})
      .addPart('C', {relativeTo: 'B', align: 'bottom'})
      .addView('view.5', {partId: 'C'})
      .addView('view.6', {partId: 'C'});

    expect(workbenchLayout.activePart({scope: 'main'}).id).toEqual('A');

    // activate view of the part 'A'
    workbenchLayout = workbenchLayout.activateView('view.1', {activatePart: true});
    expect(workbenchLayout.activePart({scope: 'main'}).id).toEqual('A');

    // activate view of the part 'C'
    workbenchLayout = workbenchLayout.activateView('view.5', {activatePart: false});
    expect(workbenchLayout.activePart({scope: 'main'}).id).toEqual('A');

    // activate view of the part 'B'
    workbenchLayout = workbenchLayout.activateView('view.3');
    expect(workbenchLayout.activePart({scope: 'main'}).id).toEqual('A');
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
    let workbenchLayout = createMainAreaLayout('A')
      .addPart('B', {relativeTo: 'A', align: 'left'})
      .addView('view.1', {partId: 'A'})
      .addView('view.2', {partId: 'A'})
      .addView('view.3', {partId: 'B'})
      .addView('view.4', {partId: 'B'})
      .addPart('C', {relativeTo: 'B', align: 'bottom'})
      .addView('view.5', {partId: 'C'})
      .addView('view.6', {partId: 'C'});

    expect(workbenchLayout.activePart({scope: 'main'}).id).toEqual('A');

    // move view from part 'A' to part 'C'
    workbenchLayout = workbenchLayout.moveView('view.1', 'C', {activateView: true});
    expect(workbenchLayout.activePart({scope: 'main'}).id).toEqual('A');

    // move view from part 'C' to part 'B'
    workbenchLayout = workbenchLayout.moveView('view.1', 'B', {activateView: true, activatePart: true});
    expect(workbenchLayout.activePart({scope: 'main'}).id).toEqual('B');

    // move view from part 'C' to part 'A'
    workbenchLayout = workbenchLayout.moveView('view.1', 'A', {activateView: true, activatePart: false});
    expect(workbenchLayout.activePart({scope: 'main'}).id).toEqual('B');
  });

  it('should compute next view id for views that are target of a primary route', async () => {
    let workbenchLayout = createMainAreaLayout('main');

    expect(workbenchLayout.computeNextViewId()).toEqual('view.1');
    expect(workbenchLayout.computeNextViewId()).toEqual('view.1');

    workbenchLayout = workbenchLayout.addView('view.1', {partId: 'main'});
    expect(workbenchLayout.computeNextViewId()).toEqual('view.2');

    workbenchLayout = workbenchLayout.addView('view.2', {partId: 'main'});
    expect(workbenchLayout.computeNextViewId()).toEqual('view.3');

    workbenchLayout = workbenchLayout.addView('view.6', {partId: 'main'});
    expect(workbenchLayout.computeNextViewId()).toEqual('view.3');

    workbenchLayout = workbenchLayout.addView('view.3', {partId: 'main'});
    expect(workbenchLayout.computeNextViewId()).toEqual('view.4');

    workbenchLayout = workbenchLayout.addView('view.4', {partId: 'main'});
    expect(workbenchLayout.computeNextViewId()).toEqual('view.5');

    workbenchLayout = workbenchLayout.addView('view.5', {partId: 'main'});
    expect(workbenchLayout.computeNextViewId()).toEqual('view.7');

    workbenchLayout = workbenchLayout.removeView('view.3');
    expect(workbenchLayout.computeNextViewId()).toEqual('view.3');

    workbenchLayout = workbenchLayout.removeView('view.1');
    expect(workbenchLayout.computeNextViewId()).toEqual('view.1');

    workbenchLayout = workbenchLayout.addView('view.1', {partId: 'main'});
    expect(workbenchLayout.computeNextViewId()).toEqual('view.3');

    workbenchLayout = workbenchLayout.addView('view.3', {partId: 'main'});
    expect(workbenchLayout.computeNextViewId()).toEqual('view.7');
  });

  it('should find parts by criteria', () => {
    const workbenchLayout = createMainAreaLayout('main')
      .addPart('innerLeft', {relativeTo: 'main', align: 'left'})
      .addPart('innerRight', {relativeTo: 'main', align: 'right'})
      .addPart('outerLeft', {relativeTo: MAIN_AREA_PART_ID, align: 'left'})
      .addPart('outerRight', {relativeTo: MAIN_AREA_PART_ID, align: 'right'});

    expect(workbenchLayout.parts().map(part => part.id)).toEqual(jasmine.arrayWithExactContents([
      MAIN_AREA_PART_ID,
      'outerLeft',
      'innerLeft',
      'main',
      'innerRight',
      'outerRight',
    ]));

    // Find by scope
    expect(workbenchLayout.parts({scope: 'peripheral'}).map(part => part.id)).toEqual(jasmine.arrayWithExactContents([
      'outerLeft',
      MAIN_AREA_PART_ID,
      'outerRight',
    ]));

    // Find by scope
    expect(workbenchLayout.parts({scope: 'main'}).map(part => part.id)).toEqual(jasmine.arrayWithExactContents([
      'innerLeft',
      'main',
      'innerRight',
    ]));
  });

  it('should find part by criteria', () => {
    const workbenchLayout = createMainAreaLayout('main')
      .addPart('innerLeft', {relativeTo: 'main', align: 'left'})
      .addPart('innerRight', {relativeTo: 'main', align: 'right'})
      .addPart('outerLeft', {relativeTo: MAIN_AREA_PART_ID, align: 'left'})
      .addPart('outerRight', {relativeTo: MAIN_AREA_PART_ID, align: 'right'})
      .addView('view.1', {partId: 'innerLeft'})
      .addView('view.2', {partId: 'innerRight'})
      .addView('view.3', {partId: 'outerLeft'})
      .addView('view.4', {partId: 'outerRight'});

    // Find by part id
    expect(workbenchLayout.part({by: {partId: 'outerLeft'}}).id).toEqual('outerLeft');
    expect(workbenchLayout.part({by: {partId: 'innerLeft'}}).id).toEqual('innerLeft');
    expect(workbenchLayout.part({by: {partId: 'innerRight'}}).id).toEqual('innerRight');
    expect(workbenchLayout.part({by: {partId: 'outerRight'}}).id).toEqual('outerRight');

    // Find by scope and part id
    expect(workbenchLayout.part({scope: 'peripheral', by: {partId: 'outerLeft'}}).id).toEqual('outerLeft');
    expect(workbenchLayout.part({scope: 'main', by: {partId: 'innerLeft'}}).id).toEqual('innerLeft');
    expect(workbenchLayout.part({scope: 'main', by: {partId: 'innerRight'}}).id).toEqual('innerRight');
    expect(workbenchLayout.part({scope: 'peripheral', by: {partId: 'outerRight'}}).id).toEqual('outerRight');

    // Find by view id
    expect(workbenchLayout.part({by: {viewId: 'view.1'}}).id).toEqual('innerLeft');
    expect(workbenchLayout.part({by: {viewId: 'view.2'}}).id).toEqual('innerRight');
    expect(workbenchLayout.part({by: {viewId: 'view.3'}}).id).toEqual('outerLeft');
    expect(workbenchLayout.part({by: {viewId: 'view.4'}}).id).toEqual('outerRight');

    // Find by scope and view id
    expect(workbenchLayout.part({scope: 'main', by: {viewId: 'view.1'}}).id).toEqual('innerLeft');
    expect(workbenchLayout.part({scope: 'main', by: {viewId: 'view.2'}}).id).toEqual('innerRight');
    expect(workbenchLayout.part({scope: 'peripheral', by: {viewId: 'view.3'}}).id).toEqual('outerLeft');
    expect(workbenchLayout.part({scope: 'peripheral', by: {viewId: 'view.4'}}).id).toEqual('outerRight');

    // Find by part id and view id
    expect(workbenchLayout.part({by: {partId: 'innerLeft', viewId: 'view.1'}}).id).toEqual('innerLeft');
    expect(workbenchLayout.part({by: {partId: 'innerRight', viewId: 'view.2'}}).id).toEqual('innerRight');
    expect(workbenchLayout.part({by: {partId: 'outerLeft', viewId: 'view.3'}}).id).toEqual('outerLeft');
    expect(workbenchLayout.part({by: {partId: 'outerRight', viewId: 'view.4'}}).id).toEqual('outerRight');

    // Find by scope, part id and view id
    expect(workbenchLayout.part({scope: 'main', by: {partId: 'innerLeft', viewId: 'view.1'}}).id).toEqual('innerLeft');
    expect(workbenchLayout.part({scope: 'main', by: {partId: 'innerRight', viewId: 'view.2'}}).id).toEqual('innerRight');
    expect(workbenchLayout.part({scope: 'peripheral', by: {partId: 'outerLeft', viewId: 'view.3'}}).id).toEqual('outerLeft');
    expect(workbenchLayout.part({scope: 'peripheral', by: {partId: 'outerRight', viewId: 'view.4'}}).id).toEqual('outerRight');
  });

  it('should throw an error if not finding the part', () => {
    const workbenchLayout = createMainAreaLayout('main')
      .addView('view.1', {partId: 'main'});

    expect(() => workbenchLayout.part({by: {partId: 'does-not-exist'}})).toThrowError(/NullPartError/);
    expect(() => workbenchLayout.part({by: {partId: 'does-not-exist', viewId: 'view.1'}})).toThrowError(/NullPartError/);
    expect(() => workbenchLayout.part({by: {partId: 'main', viewId: 'view.2'}})).toThrowError(/NullPartError/);
    expect(() => workbenchLayout.part({scope: 'peripheral', by: {partId: 'main', viewId: 'view.1'}})).toThrowError(/NullPartError/);
    expect(() => workbenchLayout.part({scope: 'peripheral', by: {viewId: 'view.1'}})).toThrowError(/NullPartError/);
    expect(() => workbenchLayout.part({scope: 'peripheral', by: {partId: 'main'}})).toThrowError(/NullPartError/);
  });

  it('should return `null` if not finding the part', () => {
    const workbenchLayout = createMainAreaLayout('main')
      .addView('view.1', {partId: 'main'});

    expect(workbenchLayout.part({by: {partId: 'does-not-exist'}}, {orElse: null})).toBeNull();
    expect(workbenchLayout.part({by: {partId: 'does-not-exist', viewId: 'view.1'}}, {orElse: null})).toBeNull();
    expect(workbenchLayout.part({by: {partId: 'main', viewId: 'view.2'}}, {orElse: null})).toBeNull();
    expect(workbenchLayout.part({scope: 'peripheral', by: {partId: 'main', viewId: 'view.1'}}, {orElse: null})).toBeNull();
    expect(workbenchLayout.part({scope: 'peripheral', by: {viewId: 'view.1'}}, {orElse: null})).toBeNull();
    expect(workbenchLayout.part({scope: 'peripheral', by: {partId: 'main'}}, {orElse: null})).toBeNull();
  });

  it('should return whether a part is contained in the main area', () => {
    const workbenchLayout = createMainAreaLayout('main')
      .addPart('inner', {relativeTo: 'main', align: 'left'})
      .addPart('outer', {relativeTo: MAIN_AREA_PART_ID, align: 'left'});

    expect(workbenchLayout.isInMainArea('main')).toBeTrue();
    expect(workbenchLayout.isInMainArea('inner')).toBeTrue();
    expect(workbenchLayout.isInMainArea('outer')).toBeFalse();
    expect(workbenchLayout.isInMainArea(MAIN_AREA_PART_ID)).toBeFalse();
  });

  it('should find views by criteria', () => {
    const workbenchLayout = createMainAreaLayout('main')
      .addPart('inner', {relativeTo: 'main', align: 'left'})
      .addPart('outer', {relativeTo: MAIN_AREA_PART_ID, align: 'left'})
      .addView('view.1', {partId: 'main'})
      .addView('view.2', {partId: 'inner'})
      .addView('view.3', {partId: 'outer'});

    expect(workbenchLayout.views().map(view => view.id)).toEqual(jasmine.arrayWithExactContents(['view.1', 'view.2', 'view.3']));

    // Find by scope
    expect(workbenchLayout.views({scope: 'peripheral'}).map(view => view.id)).toEqual(jasmine.arrayWithExactContents(['view.3']));
    expect(workbenchLayout.views({scope: 'main'}).map(view => view.id)).toEqual(jasmine.arrayWithExactContents(['view.1', 'view.2']));
  });

  it('should activate adjacent view', () => {
    let workbenchLayout = createMainAreaLayout('main')
      .addPart('part', {relativeTo: 'main', align: 'left'})
      .addView('view.1', {partId: 'part'})
      .addView('view.2', {partId: 'part'})
      .addView('view.3', {partId: 'part'});

    expect(workbenchLayout.activePart({scope: 'main'}).id).toEqual('main');
    expect(workbenchLayout.part({by: {partId: 'part'}}).activeViewId).toBeUndefined();

    // Activate adjacent view
    workbenchLayout = workbenchLayout.activateAdjacentView('view.2');
    expect(workbenchLayout.activePart({scope: 'main'}).id).toEqual('main');
    expect(workbenchLayout.part({by: {partId: 'part'}}).activeViewId).toEqual('view.3');

    // Activate adjacent view
    workbenchLayout = workbenchLayout.activateAdjacentView('view.3');
    expect(workbenchLayout.activePart({scope: 'main'}).id).toEqual('main');
    expect(workbenchLayout.part({by: {partId: 'part'}}).activeViewId).toEqual('view.2');

    // Activate adjacent view
    workbenchLayout = workbenchLayout.activateAdjacentView('view.2', {activatePart: true});
    expect(workbenchLayout.activePart({scope: 'main'}).id).toEqual('part');
    expect(workbenchLayout.part({by: {partId: 'part'}}).activeViewId).toEqual('view.3');
  });

  it('should allow activating a part', () => {
    let workbenchLayout = createMainAreaLayout('main')
      .addPart('innerLeft', {relativeTo: 'main', align: 'left'})
      .addPart('innerRight', {relativeTo: 'main', align: 'right'})
      .addPart('outerLeft', {relativeTo: MAIN_AREA_PART_ID, align: 'left'})
      .addPart('outerRight', {relativeTo: MAIN_AREA_PART_ID, align: 'right'});

    expect(workbenchLayout.activePart({scope: 'peripheral'}).id).toEqual(MAIN_AREA_PART_ID);
    expect(workbenchLayout.activePart({scope: 'main'}).id).toEqual('main');

    // Activate part 'outerLeft'
    workbenchLayout = workbenchLayout.activatePart('outerLeft');
    expect(workbenchLayout.activePart({scope: 'peripheral'}).id).toEqual('outerLeft');
    expect(workbenchLayout.activePart({scope: 'main'}).id).toEqual('main');

    // Activate part 'outerRight'
    workbenchLayout = workbenchLayout.activatePart('outerRight');
    expect(workbenchLayout.activePart({scope: 'peripheral'}).id).toEqual('outerRight');
    expect(workbenchLayout.activePart({scope: 'main'}).id).toEqual('main');

    // Activate part 'innerLeft'
    workbenchLayout = workbenchLayout.activatePart('innerLeft');
    expect(workbenchLayout.activePart({scope: 'peripheral'}).id).toEqual('outerRight');
    expect(workbenchLayout.activePart({scope: 'main'}).id).toEqual('innerLeft');

    // Activate part 'innerRight'
    workbenchLayout = workbenchLayout.activatePart('innerRight');
    expect(workbenchLayout.activePart({scope: 'peripheral'}).id).toEqual('outerRight');
    expect(workbenchLayout.activePart({scope: 'main'}).id).toEqual('innerRight');
  });

  it('should allow renaming a view', () => {
    const workbenchLayout = createMainAreaLayout('main')
      .addPart('inner', {relativeTo: 'main', align: 'left'})
      .addPart('outer', {relativeTo: MAIN_AREA_PART_ID, align: 'left'})
      .addView('view.1', {partId: 'inner'})
      .addView('view.2', {partId: 'inner'})
      .addView('view.3', {partId: 'outer'})
      .addView('view.4', {partId: 'outer'})
      .activateView('view.1')
      .activateView('view.3');

    // Rename 'view.1' to 'view.10'
    let changedLayout = workbenchLayout.renameView('view.1', 'view.10');
    expect(changedLayout.views().map(view => view.id)).toEqual(jasmine.arrayWithExactContents(['view.10', 'view.2', 'view.3', 'view.4']));

    // Rename 'view.1' to 'view.10' [scope=mainArea]
    changedLayout = workbenchLayout.renameView('view.1', 'view.10', {scope: 'main'});
    expect(changedLayout.views().map(view => view.id)).toEqual(jasmine.arrayWithExactContents(['view.10', 'view.2', 'view.3', 'view.4']));

    // Rename 'view.1' to 'view.10' [scope=root] (wrong scope)
    expect(() => workbenchLayout.renameView('view.1', 'view.10', {scope: 'peripheral'})).toThrowError(/NullPartError/);

    // Rename 'view.3' to 'view.30'
    changedLayout = workbenchLayout.renameView('view.3', 'view.30');
    expect(changedLayout.views().map(view => view.id)).toEqual(jasmine.arrayWithExactContents(['view.1', 'view.2', 'view.30', 'view.4']));

    // Rename 'view.3' to 'view.30' [scope=mainArea] (wrong scope)
    expect(() => workbenchLayout.renameView('view.3', 'view.30', {scope: 'main'})).toThrowError(/NullPartError/);

    // Rename 'view.3' to 'view.30' [scope=root]
    changedLayout = workbenchLayout.renameView('view.3', 'view.30', {scope: 'peripheral'});
    expect(changedLayout.views().map(view => view.id)).toEqual(jasmine.arrayWithExactContents(['view.1', 'view.2', 'view.30', 'view.4']));

    // Rename 'view.99' (does not exist)
    expect(() => workbenchLayout.renameView('view.99', 'view.999')).toThrowError(/NullPartError/);

    // Rename 'view.1' to 'view.2'
    expect(() => workbenchLayout.renameView('view.1', 'view.2')).toThrowError(/\[IllegalArgumentError] View id must be unique/);

    // Rename 'view.2' to 'view.3'
    expect(() => workbenchLayout.renameView('view.2', 'view.3')).toThrowError(/\[IllegalArgumentError] View id must be unique/);

    // Rename 'view.3' to 'view.4'
    expect(() => workbenchLayout.renameView('view.3', 'view.4')).toThrowError(/\[IllegalArgumentError] View id must be unique/);

    // Rename 'view.1' to 'view.10' and expect activated view to be changed.
    changedLayout = workbenchLayout.renameView('view.1', 'view.10');
    expect(changedLayout.views().map(view => view.id)).toEqual(jasmine.arrayWithExactContents(['view.10', 'view.2', 'view.3', 'view.4']));
    expect(changedLayout.part({by: {viewId: 'view.10'}}).activeViewId).toEqual('view.10');

    // Rename 'view.2' to 'view.20' and expect activated view not to be changed.
    changedLayout = workbenchLayout.renameView('view.2', 'view.20');
    expect(changedLayout.views().map(view => view.id)).toEqual(jasmine.arrayWithExactContents(['view.1', 'view.20', 'view.3', 'view.4']));
    expect(changedLayout.part({by: {viewId: 'view.20'}}).activeViewId).toEqual('view.1');

    // Rename 'view.3' to 'view.30' and expect activated view to be changed.
    changedLayout = workbenchLayout.renameView('view.3', 'view.30');
    expect(changedLayout.views().map(view => view.id)).toEqual(jasmine.arrayWithExactContents(['view.1', 'view.2', 'view.30', 'view.4']));
    expect(changedLayout.part({by: {viewId: 'view.30'}}).activeViewId).toEqual('view.30');

    // Rename 'view.4' to 'view.40' and expect activated view not to be changed.
    changedLayout = workbenchLayout.renameView('view.4', 'view.40');
    expect(changedLayout.views().map(view => view.id)).toEqual(jasmine.arrayWithExactContents(['view.1', 'view.2', 'view.3', 'view.40']));
    expect(changedLayout.part({by: {viewId: 'view.40'}}).activeViewId).toEqual('view.3');
  });

  it('should allow setting split ratio', () => {
    let workbenchLayout = createMainAreaLayout('left')
      .addPart('right', {relativeTo: 'left', align: 'right'});

    // Expect default ratio to be 0.5.
    expect(findParentNode('left').ratio).toEqual(.5);

    // Set ratio to 0.3.
    workbenchLayout = workbenchLayout.setSplitRatio(findParentNode('left').nodeId, .3);
    expect(findParentNode('left').ratio).toEqual(.3);

    // Expect to error if setting the ratio for a node not contained in the layout.
    expect(() => workbenchLayout.setSplitRatio('does-not-exist', .3)).toThrowError(/NullNodeError/);

    // Expect to error if setting an illegal ratio.
    expect(() => workbenchLayout.setSplitRatio(findParentNode('left').nodeId, -.1)).toThrowError(/IllegalArgumentError/);
    expect(() => workbenchLayout.setSplitRatio(findParentNode('left').nodeId, 0)).not.toThrowError(/IllegalArgumentError/);
    expect(() => workbenchLayout.setSplitRatio(findParentNode('left').nodeId, .5)).not.toThrowError(/IllegalArgumentError/);
    expect(() => workbenchLayout.setSplitRatio(findParentNode('left').nodeId, 1)).not.toThrowError(/IllegalArgumentError/);
    expect(() => workbenchLayout.setSplitRatio(findParentNode('left').nodeId, 1.1)).toThrowError(/IllegalArgumentError/);

    function findParentNode(partId: string): MTreeNode | undefined {
      return workbenchLayout.part({by: {partId}}).parent;
    }
  });
});

/**
 * Creates the following layout:
 *
 * +-------+------+---+
 * | A     | root | E |
 * |---+---|      |   |
 * | B | C |      +---+
 * |   |   +------+ F |
 * |   |   |   G  |   |
 * |   |   +------+---+
 * |   |   |     D    |
 * +---+---+----------+
 */
function createComplexMainAreaLayout(): ɵWorkbenchLayout {
  return createMainAreaLayout('root')
    .addPart('A', {relativeTo: 'root', align: 'left'})
    .addPart('B', {relativeTo: 'A', align: 'bottom'})
    .addPart('C', {relativeTo: 'B', align: 'right'})
    .addPart('D', {relativeTo: 'root', align: 'bottom'})
    .addPart('E', {relativeTo: 'root', align: 'right'})
    .addPart('F', {relativeTo: 'E', align: 'bottom'})
    .addPart('G', {relativeTo: 'root', align: 'bottom'});
}

/**
 * Creates a workbench layout with a main area having given initial part.
 */
function createMainAreaLayout(initialPartId: string, workbenchAccessor?: WorkbenchAccessor): ɵWorkbenchLayout {
  workbenchAccessor = workbenchAccessor || createWorkbenchAccessorSpyObj();
  return new ɵWorkbenchLayout({mainGrid: {root: new MPart({id: initialPartId}), activePartId: initialPartId}, workbenchAccessor});
}

/**
 * Creates a default {@link SpyObj} for {@link WorkbenchAccessor}.
 */
function createWorkbenchAccessorSpyObj(): jasmine.SpyObj<WorkbenchAccessor> {
  return jasmine.createSpyObj('WorkbenchAccessor', ['getViewActivationInstant', 'getPartActivationInstant'], {serializer: TestBed.inject(WorkbenchLayoutSerializer)});
}
