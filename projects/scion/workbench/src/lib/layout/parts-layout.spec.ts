/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { NgModule } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import { WorkbenchViewRegistry } from '../workbench-view-registry.service';
import { RouterTestingModule } from '@angular/router/testing';
import { WorkbenchTestingModule } from '../spec/workbench-testing.module';
import { PartsLayout } from './parts-layout';
import { Part, TreeNode } from './parts-layout.model';
import { MAIN_PART_ID } from '../workbench.constants';
import { expect, jasmineCustomMatchers } from '../spec/util/jasmine-custom-matchers.spec';

describe('PartsLayout', () => {

  beforeEach(async(() => {
    jasmine.addMatchers(jasmineCustomMatchers);

    TestBed.configureTestingModule({
      declarations: [],
      imports: [AppTestModule],
    });
  }));

  /**
   * +-------------+------+
   * | topLeft     |      |
   * +-------------+ main |
   * | bottomLeft  |      |
   * +-------------+------+
   */
  it('allows adding parts relative to other parts', () => {
    const partsLayout = createSimplePartsLayout();

    expect(partsLayout.root).toBePartsLayout(new TreeNode({
      direction: 'row',
      ratio: .25,
      child1: new TreeNode({
        direction: 'column',
        ratio: .5,
        child1: new Part({partId: 'topLeft'}),
        child2: new Part({partId: 'bottomLeft'}),
      }),
      child2: new Part({partId: MAIN_PART_ID}),
    }));
  });

  /**
   * +-------------+-----------+--------------+
   * | topLeft     |           |              |
   * +-------------+ MAIN PART | otherPrimary |
   * | bottomLeft  |           |              |
   * +-------------+-----------+--------------+
   */
  it('does not remove the last primary part', () => {
    const partsLayout = new PartsLayout(TestBed.get(WorkbenchViewRegistry))
      .addPart('topLeft', {partId: MAIN_PART_ID, align: 'left', ratio: .25})
      .addPart('bottomLeft', {partId: 'topLeft', align: 'bottom', ratio: .5})
      .addPart('otherPrimary', {partId: MAIN_PART_ID, align: 'right', ratio: .5}, {primary: true})
      .removePart('topLeft')
      .removePart(MAIN_PART_ID)
      .removePart('bottomLeft')
      .removePart('otherPrimary');

    expect(partsLayout.root).toBePartsLayout(new Part({partId: 'otherPrimary'}));
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
  it('allows creating a complex layout', () => {
    const partsLayout = createComplexPartsLayout();

    expect(partsLayout.root).toBePartsLayout(new TreeNode({
      direction: 'row',
      child1: new TreeNode({
        direction: 'column',
        child1: new Part({partId: 'A'}),
        child2: new TreeNode({
          direction: 'row',
          child1: new Part({partId: 'B'}),
          child2: new Part({partId: 'C'}),
        }),
      }),
      child2: new TreeNode({
        direction: 'column',
        child1: new TreeNode({
          direction: 'row',
          child1: new TreeNode({
            direction: 'column',
            child1: new Part({partId: MAIN_PART_ID}),
            child2: new Part({partId: 'G'}),
          }),
          child2: new TreeNode({
            direction: 'column',
            child1: new Part({partId: 'E'}),
            child2: new Part({partId: 'F'}),
          }),
        }),
        child2: new Part({partId: 'D'}),
      }),
    }));
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
  it('allows removing parts \'A\' and \'F\'', () => {
    const partsLayout = createComplexPartsLayout()
      .removePart('A')
      .removePart('F');

    expect(partsLayout.root).toBePartsLayout(new TreeNode({
      direction: 'row',
      child1: new TreeNode({
        direction: 'row',
        child1: new Part({partId: 'B'}),
        child2: new Part({partId: 'C'}),
      }),
      child2: new TreeNode({
        direction: 'column',
        child1: new TreeNode({
          direction: 'row',
          child1: new TreeNode({
            direction: 'column',
            child1: new Part({partId: MAIN_PART_ID}),
            child2: new Part({partId: 'G'}),
          }),
          child2: new Part({partId: 'E'}),
        }),
        child2: new Part({partId: 'D'}),
      }),
    }));
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
  it('allows removing parts \'A\' and \'F\'', () => {
    const partsLayout = createComplexPartsLayout()
      .removePart('A')
      .removePart('F');

    expect(partsLayout.root).toBePartsLayout(new TreeNode({
      direction: 'row',
      child1: new TreeNode({
        direction: 'row',
        child1: new Part({partId: 'B'}),
        child2: new Part({partId: 'C'}),
      }),
      child2: new TreeNode({
        direction: 'column',
        child1: new TreeNode({
          direction: 'row',
          child1: new TreeNode({
            direction: 'column',
            child1: new Part({partId: MAIN_PART_ID}),
            child2: new Part({partId: 'G'}),
          }),
          child2: new Part({partId: 'E'}),
        }),
        child2: new Part({partId: 'D'}),
      }),
    }));
  });

  /**
   * The test operates on the following parts layout:
   *
   * +-------------+------+---+
   * | topLeft     | main | X |
   * |             |      +---+
   * |             |      | Y |
   * +-------------+      +---+
   * | bottomLeft  |      | Z |
   * +-------------+------+---+
   */
  it('allows removing a part in the middle (Y)', () => {
    const partsLayout = createSimplePartsLayout()
      .addPart('X', {partId: MAIN_PART_ID, align: 'right', ratio: .5})
      .addPart('Y', {partId: 'X', align: 'bottom', ratio: .25})
      .addPart('Z', {partId: 'Y', align: 'bottom', ratio: .25});

    expect(partsLayout.root).toBePartsLayout(new TreeNode({
      direction: 'row',
      child1: new TreeNode({
        direction: 'column',
        child1: new Part({partId: 'topLeft'}),
        child2: new Part({partId: 'bottomLeft'}),
      }),
      child2: new TreeNode({
        direction: 'row',
        ratio: .5,
        child1: new Part({partId: MAIN_PART_ID}),
        child2: new TreeNode({
          direction: 'column',
          ratio: .75,
          child1: new Part({partId: 'X'}),
          child2: new TreeNode({
            direction: 'column',
            ratio: .75,
            child1: new Part({partId: 'Y'}),
            child2: new Part({partId: 'Z'}),
          }),
        }),
      }),
    }));

    const modifiedLayout = partsLayout.removePart('Y');
    expect(modifiedLayout.root).toBePartsLayout(new TreeNode({
      direction: 'row',
      child1: new TreeNode({
        direction: 'column',
        child1: new Part({partId: 'topLeft'}),
        child2: new Part({partId: 'bottomLeft'}),
      }),
      child2: new TreeNode({
        direction: 'row',
        child1: new Part({partId: MAIN_PART_ID}),
        child2: new TreeNode({
          direction: 'column',
          ratio: .75,
          child1: new Part({partId: 'X'}),
          child2: new Part({partId: 'Z'}),
        }),
      }),
    }));
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
  it('allows adding a new parts to the outer edges', () => {
    const partsLayout = createComplexPartsLayout()
      .addPart('LEFT', {partId: null, align: 'left'})
      .addPart('BOTTOM', {partId: null, align: 'bottom'})
      .addPart('RIGHT', {partId: null, align: 'right'})
      .addPart('TOP', {partId: null, align: 'top'});

    expect(partsLayout.root).toBePartsLayout(new TreeNode({
      direction: 'column',
      child1: new Part({partId: 'TOP'}),
      child2: new TreeNode({
        direction: 'row',
        child1: new TreeNode({
          direction: 'column',
          child1: new TreeNode({
            direction: 'row',
            child1: new Part({partId: 'LEFT'}),
            child2: new TreeNode({
              direction: 'row',
              child1: new TreeNode({
                direction: 'column',
                child1: new Part({partId: 'A'}),
                child2: new TreeNode({
                  direction: 'row',
                  child1: new Part({partId: 'B'}),
                  child2: new Part({partId: 'C'}),
                }),
              }),
              child2: new TreeNode({
                direction: 'column',
                child1: new TreeNode({
                  direction: 'row',
                  child1: new TreeNode({
                    direction: 'column',
                    child1: new Part({partId: MAIN_PART_ID}),
                    child2: new Part({partId: 'G'}),
                  }),
                  child2: new TreeNode({
                    direction: 'column',
                    child1: new Part({partId: 'E'}),
                    child2: new Part({partId: 'F'}),
                  }),
                }),
                child2: new Part({partId: 'D'}),
              }),
            }),
          }),
          child2: new Part({partId: 'BOTTOM'}),
        }),
        child2: new Part({partId: 'RIGHT'}),
      }),
    }));
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
  it('allows removing parts \'B\' \'D\' and \'E\'', () => {
    const partsLayout = createComplexPartsLayout()
      .removePart('B')
      .removePart('D')
      .removePart('E');

    expect(partsLayout.root).toBePartsLayout(new TreeNode({
      direction: 'row',
      child1: new TreeNode({
        direction: 'column',
        child1: new Part({partId: 'A'}),
        child2: new Part({partId: 'C'}),
      }),
      child2: new TreeNode({
        direction: 'row',
        child1: new TreeNode({
          direction: 'column',
          child1: new Part({partId: MAIN_PART_ID}),
          child2: new Part({partId: 'G'}),
        }),
        child2: new Part({partId: 'F'}),
      }),
    }));
  });

  /**
   * +-------------+--------------+-----+
   * | topLeft     | main         |     |
   * +-------------+--------------+  X  |
   * | bottomLeft  | bottomMiddle |     |
   * +-------------+--------------+-----+
   */
  it('inserts a new part beside the root if the reference part is not found (e.g. because it was removed from the layout)', () => {
    const partsLayout = createSimplePartsLayout()
      .addPart('bottomMiddle', {partId: MAIN_PART_ID, align: 'bottom'})
      .addPart('X', {partId: 'unknown-part-id', align: 'right'});

    expect(partsLayout.root).toBePartsLayout(new TreeNode({
        direction: 'row',
        child1: new TreeNode({
          direction: 'row',
          child1: new TreeNode({
            direction: 'column',
            child1: new Part({partId: 'topLeft'}),
            child2: new Part({partId: 'bottomLeft'}),
          }),
          child2: new TreeNode({
            direction: 'column',
            child1: new Part({partId: MAIN_PART_ID}),
            child2: new Part({partId: 'bottomMiddle'}),
          }),
        }),
        child2: new Part({partId: 'X'}),
      }),
    );
  });

  /**
   * The test operates on the following parts layout:
   *
   * +-------------+------+
   * | topLeft     | main |
   * +-------------+      |
   * | bottomLeft  |      |
   * +-------------+------+
   */
  it('parses a serialized parts layout into particular tree node objects and links nodes with their parent node, if any', () => {
    const serializedPartsLayout = createSimplePartsLayout().serialize();

    const partsLayout = new PartsLayout(TestBed.get(WorkbenchViewRegistry), serializedPartsLayout);

    // verify the root sashbox
    const rootSashBox = partsLayout.root as TreeNode;
    expect(rootSashBox.constructor).toEqual(TreeNode);
    expect(rootSashBox.parent).toBeFalsy();

    // verify the left sashbox
    const leftSashBox = rootSashBox.child1 as TreeNode;
    expect(leftSashBox.constructor).toEqual(TreeNode);
    expect(leftSashBox.parent).toBe(rootSashBox);

    // verify the 'topLeft' part
    const topLeftPart = leftSashBox.child1 as Part;
    expect(topLeftPart.constructor).toEqual(Part);
    expect(topLeftPart.parent).toBe(leftSashBox);
    expect(topLeftPart.partId).toEqual('topLeft');

    // verify the 'bottomLeft' part
    const bottomLeftPart = leftSashBox.child2 as Part;
    expect(bottomLeftPart.constructor).toEqual(Part);
    expect(bottomLeftPart.parent).toBe(leftSashBox);
    expect(bottomLeftPart.partId).toEqual('bottomLeft');

    // verify the main part
    const mainPart = rootSashBox.child2 as Part;
    expect(mainPart.constructor).toEqual(Part);
    expect(mainPart.parent).toBe(rootSashBox);
    expect(mainPart.partId).toEqual(MAIN_PART_ID);
  });

  /**
   * The test operates on the following parts layout:
   *
   * +-------------+------+
   * | topLeft     | main |
   * +-------------+      |
   * | bottomLeft  |      |
   * +-------------+------+
   */
  it('is immutable', () => {
    const partsLayout = createSimplePartsLayout();
    const serializedPartsLayout = partsLayout.serialize();

    // change the layout
    partsLayout
      .addPart('X', {partId: MAIN_PART_ID, align: 'right'})
      .addPart('Y', {partId: 'X', align: 'bottom'})
      .addPart('Z', {partId: 'Y', align: 'bottom'})
      .removePart('Z');

    expect(partsLayout.serialize()).toEqual(serializedPartsLayout);
  });

  /**
   * The test operates on the following parts layout:
   *
   * +-------------+------+
   * | topLeft     | main |
   * +-------------+      |
   * | bottomLeft  |      |
   * +-------------+------+
   */
  it('allows adding views to a part', () => {
    const partsLayout = createSimplePartsLayout()
      .addView('topLeft', 'view.1')
      .addView('topLeft', 'view.2')
      .addView(MAIN_PART_ID, 'view.3')
      .addView('bottomLeft', 'view.4');

    expect(partsLayout.findPart('topLeft', {orElseThrow: true}).viewIds).toEqual(['view.1', 'view.2']);
    expect(partsLayout.findPart(MAIN_PART_ID, {orElseThrow: true}).viewIds).toEqual(['view.3']);
    expect(partsLayout.findPart('bottomLeft', {orElseThrow: true}).viewIds).toEqual(['view.4']);
  });

  it('removes a part when its last view is removed (by default)', () => {
    const partsLayout = new PartsLayout(TestBed.get(WorkbenchViewRegistry))
      .addPart('left', {partId: MAIN_PART_ID, align: 'left'})
      .addView('left', 'view.1')
      .addView('left', 'view.2')
      .removeView('view.1')
      .removeView('view.2');

    expect(partsLayout.findPart('left', {orElseThrow: false})).toBeNull();
  });

  it('removes a part when its last view is removed (removeWithLastView=true)', () => {
    const partsLayout = new PartsLayout(TestBed.get(WorkbenchViewRegistry))
      .addPart('left', {partId: MAIN_PART_ID, align: 'left'}, {removeWithLastView: true})
      .addView('left', 'view.1')
      .addView('left', 'view.2')
      .removeView('view.1')
      .removeView('view.2');

    expect(partsLayout.findPart('left', {orElseThrow: false})).toBeNull();
  });

  it('does not remove a part when its last view is removed (removeWithLastView=false)', () => {
    const partsLayout = new PartsLayout(TestBed.get(WorkbenchViewRegistry))
      .addPart('left', {partId: MAIN_PART_ID, align: 'left'}, {removeWithLastView: false})
      .addView('left', 'view.1')
      .addView('left', 'view.2')
      .removeView('view.1')
      .removeView('view.2');

    expect(partsLayout.findPart('left', {orElseThrow: true}).viewIds).toEqual([]);
  });

  /**
   * The test operates on the following parts layout:
   *
   * +-------------+------+
   * | topLeft     | main |
   * +-------------+      |
   * | bottomLeft  |      |
   * +-------------+------+
   */
  it('allows changing the view tab order', () => {
    const viewRegistry: WorkbenchViewRegistry = TestBed.get(WorkbenchViewRegistry);
    viewRegistry.addViewOutlet('view.1', false);
    viewRegistry.addViewOutlet('view.2', false);
    viewRegistry.addViewOutlet('view.3', false);
    viewRegistry.addViewOutlet('view.4', false);

    // move 'view.1' to position 2
    expect(createSimplePartsLayout()
      .addView(MAIN_PART_ID, 'view.1')
      .addView(MAIN_PART_ID, 'view.2')
      .addView(MAIN_PART_ID, 'view.3')
      .addView(MAIN_PART_ID, 'view.4')
      .moveView('view.1', MAIN_PART_ID, 2)
      .findPart(MAIN_PART_ID, {orElseThrow: true}).viewIds,
    ).toEqual(['view.2', 'view.1', 'view.3', 'view.4']);

    // move 'view.4' to position 2
    expect(createSimplePartsLayout()
      .addView(MAIN_PART_ID, 'view.1')
      .addView(MAIN_PART_ID, 'view.2')
      .addView(MAIN_PART_ID, 'view.3')
      .addView(MAIN_PART_ID, 'view.4')
      .moveView('view.4', MAIN_PART_ID, 2)
      .findPart(MAIN_PART_ID, {orElseThrow: true}).viewIds,
    ).toEqual(['view.1', 'view.2', 'view.4', 'view.3']);

    // move 'view.2' to the end
    expect(createSimplePartsLayout()
      .addView(MAIN_PART_ID, 'view.1')
      .addView(MAIN_PART_ID, 'view.2')
      .addView(MAIN_PART_ID, 'view.3')
      .addView(MAIN_PART_ID, 'view.4')
      .moveView('view.2', MAIN_PART_ID)
      .findPart(MAIN_PART_ID, {orElseThrow: true}).viewIds,
    ).toEqual(['view.1', 'view.3', 'view.4', 'view.2']);

    // move 'view.3' to the start
    expect(createSimplePartsLayout()
      .addView(MAIN_PART_ID, 'view.1')
      .addView(MAIN_PART_ID, 'view.2')
      .addView(MAIN_PART_ID, 'view.3')
      .addView(MAIN_PART_ID, 'view.4')
      .moveView('view.3', MAIN_PART_ID, 0)
      .findPart(MAIN_PART_ID, {orElseThrow: true}).viewIds,
    ).toEqual(['view.3', 'view.1', 'view.2', 'view.4']);
  });

  /**
   * The test operates on the following parts layout:
   *
   * +-------------+------+
   * | topLeft     | main |
   * +-------------+      |
   * | bottomLeft  |      |
   * +-------------+------+
   */
  it('allows moving views to other parts', () => {
    const viewRegistry: WorkbenchViewRegistry = TestBed.get(WorkbenchViewRegistry);
    viewRegistry.addViewOutlet('view.1', false);
    viewRegistry.addViewOutlet('view.2', false);
    viewRegistry.addViewOutlet('view.3', false);
    viewRegistry.addViewOutlet('view.4', false);

    const partsLayout = createSimplePartsLayout()
      .addView(MAIN_PART_ID, 'view.1')
      .addView(MAIN_PART_ID, 'view.2')
      .addView(MAIN_PART_ID, 'view.3')
      .addView(MAIN_PART_ID, 'view.4')
      .moveView('view.1', 'topLeft')
      .moveView('view.2', 'bottomLeft')
      .moveView('view.3', 'bottomLeft');

    expect(partsLayout.findPart('topLeft', {orElseThrow: true}).viewIds).toEqual(['view.1']);
    expect(partsLayout.findPart('bottomLeft', {orElseThrow: true}).viewIds).toEqual(['view.2', 'view.3']);
    expect(partsLayout.findPart(MAIN_PART_ID, {orElseThrow: true}).viewIds).toEqual(['view.4']);
  });

  /**
   * The test operates on the following parts layout:
   *
   * +-------------+------+
   * | topLeft     | main |
   * +-------------+      |
   * | bottomLeft  |      |
   * +-------------+------+
   */
  it('removes a part when moving its last view to another part', () => {
    const viewRegistry: WorkbenchViewRegistry = TestBed.get(WorkbenchViewRegistry);
    viewRegistry.addViewOutlet('view.1', false);
    viewRegistry.addViewOutlet('view.2', false);
    viewRegistry.addViewOutlet('view.3', false);

    const partsLayout = createSimplePartsLayout()
      .addView('topLeft', 'view.1')
      .addView('topLeft', 'view.2')
      .addView('topLeft', 'view.3')
      .moveView('view.1', MAIN_PART_ID)
      .moveView('view.2', MAIN_PART_ID)
      .moveView('view.3', 'bottomLeft');

    expect(partsLayout.findPart('topLeft', {orElseThrow: false})).toBeNull();
    expect(partsLayout.findPart(MAIN_PART_ID, {orElseThrow: true}).viewIds).toEqual(['view.1', 'view.2']);
    expect(partsLayout.findPart('bottomLeft', {orElseThrow: true}).viewIds).toEqual(['view.3']);
  });

  /**
   * +-------------+------+
   * | topLeft     |      |
   * +-------------+ main |
   * | bottomLeft  |      |
   * +-------------+------+
   */
  it('does not remove the main part if removing its last view', () => {
    const partsLayout = createSimplePartsLayout()
      .addView(MAIN_PART_ID, 'view.1')
      .addView(MAIN_PART_ID, 'view.2')
      .removeView('view.1')
      .removeView('view.2');

    expect(partsLayout.findPart(MAIN_PART_ID, {orElseThrow: true}).viewIds).toEqual([]);
  });

  /**
   * +-------------+------+
   * | topLeft     |      |
   * +-------------+ main |
   * | bottomLeft  |      |
   * +-------------+------+
   */
  it('does not remove the main part if moving its last view to some other part', () => {
    const partsLayout = createSimplePartsLayout()
      .addView(MAIN_PART_ID, 'view.1')
      .addView(MAIN_PART_ID, 'view.2')
      .moveView('view.1', 'topLeft')
      .moveView('view.2', 'bottomLeft');

    expect(partsLayout.findPart(MAIN_PART_ID, {orElseThrow: true}).viewIds).toEqual([]);
  });

  /**
   * +-------------+------+
   * | topLeft     |      |
   * +-------------+ main |
   * | bottomLeft  |      |
   * +-------------+------+
   */
  it('activates the last recently activated view when removing a view', () => {
    const viewRegistry: WorkbenchViewRegistry = TestBed.get(WorkbenchViewRegistry);
    viewRegistry.addViewOutlet('view.1', false);
    viewRegistry.addViewOutlet('view.2', false);
    viewRegistry.addViewOutlet('view.3', false);
    viewRegistry.addViewOutlet('view.4', false);
    viewRegistry.addViewOutlet('view.5', false);

    let partsLayout = createSimplePartsLayout()
      .addView(MAIN_PART_ID, 'view.1')
      .addView(MAIN_PART_ID, 'view.5')
      .addView(MAIN_PART_ID, 'view.2')
      .addView(MAIN_PART_ID, 'view.4')
      .addView(MAIN_PART_ID, 'view.3');

    // prepare the activation history
    viewRegistry.getElseThrow('view.3').activate(true);
    viewRegistry.getElseThrow('view.5').activate(true);
    viewRegistry.getElseThrow('view.2').activate(true);
    viewRegistry.getElseThrow('view.4').activate(true);
    viewRegistry.getElseThrow('view.1').activate(true);

    partsLayout = partsLayout
      .activateView('view.1')
      .removeView('view.1');
    expect(partsLayout.findPart(MAIN_PART_ID, {orElseThrow: true}).activeViewId).toEqual('view.4');

    partsLayout = partsLayout.removeView('view.4');
    expect(partsLayout.findPart(MAIN_PART_ID, {orElseThrow: true}).activeViewId).toEqual('view.2');

    partsLayout = partsLayout.removeView('view.2');
    expect(partsLayout.findPart(MAIN_PART_ID, {orElseThrow: true}).activeViewId).toEqual('view.5');

    partsLayout = partsLayout.removeView('view.5');
    expect(partsLayout.findPart(MAIN_PART_ID, {orElseThrow: true}).activeViewId).toEqual('view.3');
  });
});

/**
 * Creates the following parts layout:
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
 */
function createComplexPartsLayout(): PartsLayout {
  return new PartsLayout(TestBed.get(WorkbenchViewRegistry))
    .addPart('A', {partId: MAIN_PART_ID, align: 'left'})
    .addPart('B', {partId: 'A', align: 'bottom'})
    .addPart('C', {partId: 'B', align: 'right'})
    .addPart('D', {partId: MAIN_PART_ID, align: 'bottom'})
    .addPart('E', {partId: MAIN_PART_ID, align: 'right'})
    .addPart('F', {partId: 'E', align: 'bottom'})
    .addPart('G', {partId: MAIN_PART_ID, align: 'bottom'});
}

/**
 * Creates the following parts layout:
 *
 * +-------------+------+
 * | topLeft     | main |
 * +-------------+      |
 * | bottomLeft  |      |
 * +-------------+------+
 */
function createSimplePartsLayout(): PartsLayout {
  return new PartsLayout(TestBed.get(WorkbenchViewRegistry))
    .addPart('topLeft', {partId: MAIN_PART_ID, align: 'left', ratio: .25})
    .addPart('bottomLeft', {partId: 'topLeft', align: 'bottom', ratio: .5});
}

/****************************************************************************************************
 * Definition of App Test Module                                                                    *
 ****************************************************************************************************/
@NgModule({
  imports: [
    WorkbenchTestingModule.forRoot(),
    RouterTestingModule,
  ],
})
class AppTestModule {
}
