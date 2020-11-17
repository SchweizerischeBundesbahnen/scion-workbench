/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { waitForAsync } from '@angular/core/testing';
import { MPart, MTreeNode } from './parts-layout.model';
import { expect, jasmineCustomMatchers } from '../spec/util/jasmine-custom-matchers.spec';
import { PartsLayout, PartsLayoutWorkbenchAccessor } from './parts-layout';
import SpyObj = jasmine.SpyObj;

describe('PartsLayout', () => {

  beforeEach(waitForAsync(() => {
    jasmine.addMatchers(jasmineCustomMatchers);
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

    expect(partsLayout.root).toEqualPartsLayout(new MTreeNode({
      direction: 'row',
      ratio: .25,
      child1: new MTreeNode({
        direction: 'column',
        ratio: .5,
        child1: new MPart({partId: 'topLeft'}),
        child2: new MPart({partId: 'bottomLeft'}),
      }),
      child2: new MPart({partId: 'main'}),
    }));
  });

  /**
   * +-------------+------+
   * | topLeft     |      |
   * +-------------+ main |
   * | bottomLeft  |      |
   * +-------------+------+
   */
  it('does not remove the last part', () => {
    const partsLayout = createSinglePartLayout('main')
      .addPart('topLeft', {relativeTo: 'main', align: 'left', ratio: .25})
      .addPart('bottomLeft', {relativeTo: 'topLeft', align: 'bottom', ratio: .5})
      .removePart('topLeft')
      .removePart('main')
      .removePart('bottomLeft');

    expect(partsLayout.root).toEqualPartsLayout(new MPart({partId: 'bottomLeft'}));
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

    expect(partsLayout.root).toEqualPartsLayout(new MTreeNode({
      direction: 'row',
      child1: new MTreeNode({
        direction: 'column',
        child1: new MPart({partId: 'A'}),
        child2: new MTreeNode({
          direction: 'row',
          child1: new MPart({partId: 'B'}),
          child2: new MPart({partId: 'C'}),
        }),
      }),
      child2: new MTreeNode({
        direction: 'column',
        child1: new MTreeNode({
          direction: 'row',
          child1: new MTreeNode({
            direction: 'column',
            child1: new MPart({partId: 'main'}),
            child2: new MPart({partId: 'G'}),
          }),
          child2: new MTreeNode({
            direction: 'column',
            child1: new MPart({partId: 'E'}),
            child2: new MPart({partId: 'F'}),
          }),
        }),
        child2: new MPart({partId: 'D'}),
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

    expect(partsLayout.root).toEqualPartsLayout(new MTreeNode({
      direction: 'row',
      child1: new MTreeNode({
        direction: 'row',
        child1: new MPart({partId: 'B'}),
        child2: new MPart({partId: 'C'}),
      }),
      child2: new MTreeNode({
        direction: 'column',
        child1: new MTreeNode({
          direction: 'row',
          child1: new MTreeNode({
            direction: 'column',
            child1: new MPart({partId: 'main'}),
            child2: new MPart({partId: 'G'}),
          }),
          child2: new MPart({partId: 'E'}),
        }),
        child2: new MPart({partId: 'D'}),
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

    expect(partsLayout.root).toEqualPartsLayout(new MTreeNode({
      direction: 'row',
      child1: new MTreeNode({
        direction: 'row',
        child1: new MPart({partId: 'B'}),
        child2: new MPart({partId: 'C'}),
      }),
      child2: new MTreeNode({
        direction: 'column',
        child1: new MTreeNode({
          direction: 'row',
          child1: new MTreeNode({
            direction: 'column',
            child1: new MPart({partId: 'main'}),
            child2: new MPart({partId: 'G'}),
          }),
          child2: new MPart({partId: 'E'}),
        }),
        child2: new MPart({partId: 'D'}),
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
      .addPart('X', {relativeTo: 'main', align: 'right', ratio: .5})
      .addPart('Y', {relativeTo: 'X', align: 'bottom', ratio: .25})
      .addPart('Z', {relativeTo: 'Y', align: 'bottom', ratio: .25});

    expect(partsLayout.root).toEqualPartsLayout(new MTreeNode({
      direction: 'row',
      child1: new MTreeNode({
        direction: 'column',
        child1: new MPart({partId: 'topLeft'}),
        child2: new MPart({partId: 'bottomLeft'}),
      }),
      child2: new MTreeNode({
        direction: 'row',
        ratio: .5,
        child1: new MPart({partId: 'main'}),
        child2: new MTreeNode({
          direction: 'column',
          ratio: .75,
          child1: new MPart({partId: 'X'}),
          child2: new MTreeNode({
            direction: 'column',
            ratio: .75,
            child1: new MPart({partId: 'Y'}),
            child2: new MPart({partId: 'Z'}),
          }),
        }),
      }),
    }));

    const modifiedLayout = partsLayout.removePart('Y');
    expect(modifiedLayout.root).toEqualPartsLayout(new MTreeNode({
      direction: 'row',
      child1: new MTreeNode({
        direction: 'column',
        child1: new MPart({partId: 'topLeft'}),
        child2: new MPart({partId: 'bottomLeft'}),
      }),
      child2: new MTreeNode({
        direction: 'row',
        child1: new MPart({partId: 'main'}),
        child2: new MTreeNode({
          direction: 'column',
          ratio: .75,
          child1: new MPart({partId: 'X'}),
          child2: new MPart({partId: 'Z'}),
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
      .addPart('LEFT', {relativeTo: null, align: 'left'})
      .addPart('BOTTOM', {relativeTo: null, align: 'bottom'})
      .addPart('RIGHT', {relativeTo: null, align: 'right'})
      .addPart('TOP', {relativeTo: null, align: 'top'});

    expect(partsLayout.root).toEqualPartsLayout(new MTreeNode({
      direction: 'column',
      child1: new MPart({partId: 'TOP'}),
      child2: new MTreeNode({
        direction: 'row',
        child1: new MTreeNode({
          direction: 'column',
          child1: new MTreeNode({
            direction: 'row',
            child1: new MPart({partId: 'LEFT'}),
            child2: new MTreeNode({
              direction: 'row',
              child1: new MTreeNode({
                direction: 'column',
                child1: new MPart({partId: 'A'}),
                child2: new MTreeNode({
                  direction: 'row',
                  child1: new MPart({partId: 'B'}),
                  child2: new MPart({partId: 'C'}),
                }),
              }),
              child2: new MTreeNode({
                direction: 'column',
                child1: new MTreeNode({
                  direction: 'row',
                  child1: new MTreeNode({
                    direction: 'column',
                    child1: new MPart({partId: 'main'}),
                    child2: new MPart({partId: 'G'}),
                  }),
                  child2: new MTreeNode({
                    direction: 'column',
                    child1: new MPart({partId: 'E'}),
                    child2: new MPart({partId: 'F'}),
                  }),
                }),
                child2: new MPart({partId: 'D'}),
              }),
            }),
          }),
          child2: new MPart({partId: 'BOTTOM'}),
        }),
        child2: new MPart({partId: 'RIGHT'}),
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

    expect(partsLayout.root).toEqualPartsLayout(new MTreeNode({
      direction: 'row',
      child1: new MTreeNode({
        direction: 'column',
        child1: new MPart({partId: 'A'}),
        child2: new MPart({partId: 'C'}),
      }),
      child2: new MTreeNode({
        direction: 'row',
        child1: new MTreeNode({
          direction: 'column',
          child1: new MPart({partId: 'main'}),
          child2: new MPart({partId: 'G'}),
        }),
        child2: new MPart({partId: 'F'}),
      }),
    }));
  });

  it('throws an error when referencing an unknown part', () => {
    expect(() => createSimplePartsLayout()
      .addPart('left', {relativeTo: 'unknown-part-id', align: 'left'}),
    ).toThrowError(/PartsLayoutError/);
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
  it('parses a serialized parts layout into tree node objects and links nodes with their parent node, if any', () => {
    const serializedPartsLayout = createSimplePartsLayout().serialize();
    const partsLayoutAccessor = jasmine.createSpyObj('PartsLayoutWorkbenchAccessor', ['getViewActivationInstant', 'provideRootPartIdentity']);
    const partsLayout = new PartsLayout(partsLayoutAccessor, serializedPartsLayout);

    // verify the root sashbox
    const rootSashBox = partsLayout.root as MTreeNode;
    expect(rootSashBox.constructor).toEqual(MTreeNode);
    expect(rootSashBox.parent).toBeFalsy();

    // verify the left sashbox
    const leftSashBox = rootSashBox.child1 as MTreeNode;
    expect(leftSashBox.constructor).toEqual(MTreeNode);
    expect(leftSashBox.parent).toBe(rootSashBox);

    // verify the 'topLeft' part
    const topLeftPart = leftSashBox.child1 as MPart;
    expect(topLeftPart.constructor).toEqual(MPart);
    expect(topLeftPart.parent).toBe(leftSashBox);
    expect(topLeftPart.partId).toEqual('topLeft');

    // verify the 'bottomLeft' part
    const bottomLeftPart = leftSashBox.child2 as MPart;
    expect(bottomLeftPart.constructor).toEqual(MPart);
    expect(bottomLeftPart.parent).toBe(leftSashBox);
    expect(bottomLeftPart.partId).toEqual('bottomLeft');

    // verify the main part
    const mainPart = rootSashBox.child2 as MPart;
    expect(mainPart.constructor).toEqual(MPart);
    expect(mainPart.parent).toBe(rootSashBox);
    expect(mainPart.partId).toEqual('main');
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

    // modify the layout; should not modify `partsLayout` instance
    partsLayout
      .addPart('X', {relativeTo: 'main', align: 'right'})
      .addPart('Y', {relativeTo: 'X', align: 'bottom'})
      .addPart('Z', {relativeTo: 'Y', align: 'bottom'})
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
      .addView('main', 'view.3')
      .addView('bottomLeft', 'view.4');

    expect(partsLayout.findPart('topLeft', {orElseThrow: true}).viewIds).toEqual(['view.1', 'view.2']);
    expect(partsLayout.findPart('main', {orElseThrow: true}).viewIds).toEqual(['view.3']);
    expect(partsLayout.findPart('bottomLeft', {orElseThrow: true}).viewIds).toEqual(['view.4']);
  });

  it('removes a part when removing its last view', () => {
    const partsLayout = createSinglePartLayout('main')
      .addPart('left', {relativeTo: 'main', align: 'left'})
      .addView('left', 'view.1')
      .addView('left', 'view.2')
      .removeView('view.1')
      .removeView('view.2');

    expect(partsLayout.findPart('left', {orElseThrow: false})).toBeNull();
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
    // move 'view.1' to position 2
    expect(createSimplePartsLayout()
      .addView('main', 'view.1')
      .addView('main', 'view.2')
      .addView('main', 'view.3')
      .addView('main', 'view.4')
      .moveView('view.1', 'main', 2)
      .findPart('main', {orElseThrow: true}).viewIds,
    ).toEqual(['view.2', 'view.1', 'view.3', 'view.4']);

    // move 'view.4' to position 2
    expect(createSimplePartsLayout()
      .addView('main', 'view.1')
      .addView('main', 'view.2')
      .addView('main', 'view.3')
      .addView('main', 'view.4')
      .moveView('view.4', 'main', 2)
      .findPart('main', {orElseThrow: true}).viewIds,
    ).toEqual(['view.1', 'view.2', 'view.4', 'view.3']);

    // move 'view.2' to the end
    expect(createSimplePartsLayout()
      .addView('main', 'view.1')
      .addView('main', 'view.2')
      .addView('main', 'view.3')
      .addView('main', 'view.4')
      .moveView('view.2', 'main')
      .findPart('main', {orElseThrow: true}).viewIds,
    ).toEqual(['view.1', 'view.3', 'view.4', 'view.2']);

    // move 'view.3' to the start
    expect(createSimplePartsLayout()
      .addView('main', 'view.1')
      .addView('main', 'view.2')
      .addView('main', 'view.3')
      .addView('main', 'view.4')
      .moveView('view.3', 'main', 0)
      .findPart('main', {orElseThrow: true}).viewIds,
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
    const partsLayout = createSimplePartsLayout()
      .addView('main', 'view.1')
      .addView('main', 'view.2')
      .addView('main', 'view.3')
      .addView('main', 'view.4')
      .moveView('view.1', 'topLeft')
      .moveView('view.2', 'bottomLeft')
      .moveView('view.3', 'bottomLeft');

    expect(partsLayout.findPart('topLeft', {orElseThrow: true}).viewIds).toEqual(['view.1']);
    expect(partsLayout.findPart('bottomLeft', {orElseThrow: true}).viewIds).toEqual(['view.2', 'view.3']);
    expect(partsLayout.findPart('main', {orElseThrow: true}).viewIds).toEqual(['view.4']);
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
    const partsLayout = createSimplePartsLayout()
      .addView('topLeft', 'view.1')
      .addView('topLeft', 'view.2')
      .addView('topLeft', 'view.3')
      .moveView('view.1', 'main')
      .moveView('view.2', 'main')
      .moveView('view.3', 'bottomLeft');

    expect(partsLayout.findPart('topLeft', {orElseThrow: false})).toBeNull();
    expect(partsLayout.findPart('main', {orElseThrow: true}).viewIds).toEqual(['view.1', 'view.2']);
    expect(partsLayout.findPart('bottomLeft', {orElseThrow: true}).viewIds).toEqual(['view.3']);
  });

  /**
   * +-------------+------+
   * | topLeft     |      |
   * +-------------+ main |
   * | bottomLeft  |      |
   * +-------------+------+
   */
  it('activates the last recently activated view when removing a view', () => {
    const partsLayoutAccessor = jasmine.createSpyObj('PartsLayoutWorkbenchAccessor', ['getViewActivationInstant', 'provideRootPartIdentity']);
    let partsLayout = createSimplePartsLayout(partsLayoutAccessor)
      .addView('main', 'view.1')
      .addView('main', 'view.5')
      .addView('main', 'view.2')
      .addView('main', 'view.4')
      .addView('main', 'view.3');

    // prepare the activation history
    partsLayoutAccessor.getViewActivationInstant
      .withArgs('view.1').and.returnValue(5)
      .withArgs('view.2').and.returnValue(3)
      .withArgs('view.3').and.returnValue(1)
      .withArgs('view.4').and.returnValue(4)
      .withArgs('view.5').and.returnValue(2);

    partsLayout = partsLayout
      .activateView('view.1')
      .removeView('view.1');
    expect(partsLayout.findPart('main', {orElseThrow: true}).activeViewId).toEqual('view.4');

    partsLayout = partsLayout.removeView('view.4');
    expect(partsLayout.findPart('main', {orElseThrow: true}).activeViewId).toEqual('view.2');

    partsLayout = partsLayout.removeView('view.2');
    expect(partsLayout.findPart('main', {orElseThrow: true}).activeViewId).toEqual('view.5');

    partsLayout = partsLayout.removeView('view.5');
    expect(partsLayout.findPart('main', {orElseThrow: true}).activeViewId).toEqual('view.3');
  });

  /**
   * +-------------+------+
   * | topLeft     | main |
   * +-------------+      |
   * | bottomLeft  |      |
   * +-------------+------+
   */
  it('makes the adjacent part the active part when removing the active part', () => {
    let partsLayout = createSimplePartsLayout().activatePart('topLeft');

    expect(partsLayout.activePart.partId).toEqual('topLeft');

    partsLayout = partsLayout.removePart('topLeft');
    expect(partsLayout.activePart.partId).toEqual('bottomLeft');

    partsLayout = partsLayout.removePart('bottomLeft');
    expect(partsLayout.activePart.partId).toEqual('main');
  });

  /**
   * +-------------+------+
   * | topLeft     | main |
   * +-------------+      |
   * | bottomLeft  |      |
   * +-------------+------+
   */
  it('activates the part when adding a view to it', () => {
    let partsLayout = createSimplePartsLayout();

    // make part 'top-left' the active part
    partsLayout = partsLayout.activatePart('topLeft');
    expect(partsLayout.activePart.partId).toEqual('topLeft');

    // add view to the main part
    partsLayout = partsLayout.addView('main', 'view.1');
    expect(partsLayout.activePart.partId).toEqual('main');

    // add view to the main part
    partsLayout = partsLayout.addView('main', 'view.2');
    expect(partsLayout.activePart.partId).toEqual('main');

    // add view to the 'top-left' part
    partsLayout = partsLayout.addView('topLeft', 'view.3');
    expect(partsLayout.activePart.partId).toEqual('topLeft');

    // add view to the 'bottom-left' part
    partsLayout = partsLayout.addView('bottomLeft', 'view.4');
    expect(partsLayout.activePart.partId).toEqual('bottomLeft');
  });

  it('activates the part when adding a new part to the layout', () => {
    let partsLayout = createSinglePartLayout('main');
    expect(partsLayout.activePart.partId).toEqual('main');

    // add part to the right of the main part
    partsLayout = partsLayout.addPart('topRight', {relativeTo: 'main', align: 'right', ratio: .5});
    expect(partsLayout.activePart.partId).toEqual('topRight');

    // add part to the bottom of the 'top-right' part
    partsLayout = partsLayout.addPart('bottomRight', {relativeTo: 'topRight', align: 'bottom', ratio: .5});
    expect(partsLayout.activePart.partId).toEqual('bottomRight');
  });

  /**
   * Creates the following parts layout:
   *
   * +-------------+------+
   * | topLeft     | main |
   * +-------------+      |
   * | bottomLeft  |      |
   * +-------------+------+
   */
  it('should not activate the part when removing a view from it', () => {
    let partsLayout = createSinglePartLayout('main')
      .addPart('topLeft', {relativeTo: 'main', align: 'left', ratio: .25})
      .addView('main', 'view.1')
      .addView('main', 'view.2')
      .addView('topLeft', 'view.3')
      .addView('topLeft', 'view.4')
      .addPart('bottomLeft', {relativeTo: 'topLeft', align: 'bottom', ratio: .5})
      .addView('bottomLeft', 'view.5')
      .addView('bottomLeft', 'view.6');

    expect(partsLayout.activePart.partId).toEqual('bottomLeft');

    // remove view from the main part
    partsLayout = partsLayout.removeView('view.1');
    expect(partsLayout.activePart.partId).toEqual('bottomLeft');

    // remove view from the 'bottom-left' part
    partsLayout = partsLayout.removeView('view.5');
    expect(partsLayout.activePart.partId).toEqual('bottomLeft');
  });

  /**
   * Creates the following parts layout:
   *
   * +-------------+------+
   * | topLeft     | main |
   * +-------------+      |
   * | bottomLeft  |      |
   * +-------------+------+
   */
  it('activates the part when activating a view of it', () => {
    let partsLayout = createSinglePartLayout('main')
      .addPart('topLeft', {relativeTo: 'main', align: 'left', ratio: .25})
      .addView('main', 'view.1')
      .addView('main', 'view.2')
      .addView('topLeft', 'view.3')
      .addView('topLeft', 'view.4')
      .addPart('bottomLeft', {relativeTo: 'topLeft', align: 'bottom', ratio: .5})
      .addView('bottomLeft', 'view.5')
      .addView('bottomLeft', 'view.6');

    expect(partsLayout.activePart.partId).toEqual('bottomLeft');

    // activate view of the main part
    partsLayout = partsLayout.activateView('view.1');
    expect(partsLayout.activePart.partId).toEqual('main');

    // activate view of the 'bottom-left' part
    partsLayout = partsLayout.activateView('view.5');
    expect(partsLayout.activePart.partId).toEqual('bottomLeft');

    // activate view of the 'top-left' part
    partsLayout = partsLayout.activateView('view.3');
    expect(partsLayout.activePart.partId).toEqual('topLeft');
  });

  /**
   * Creates the following parts layout:
   *
   * +-------------+------+
   * | topLeft     | main |
   * +-------------+      |
   * | bottomLeft  |      |
   * +-------------+------+
   */
  it('should activate the part when moving a view to it', () => {
    let partsLayout = createSinglePartLayout('main')
      .addPart('topLeft', {relativeTo: 'main', align: 'left', ratio: .25})
      .addView('main', 'view.1')
      .addView('main', 'view.2')
      .addView('topLeft', 'view.3')
      .addView('topLeft', 'view.4')
      .addPart('bottomLeft', {relativeTo: 'topLeft', align: 'bottom', ratio: .5})
      .addView('bottomLeft', 'view.5')
      .addView('bottomLeft', 'view.6');

    expect(partsLayout.activePart.partId).toEqual('bottomLeft');

    // move view from the main part to the 'bottom-left' part
    partsLayout = partsLayout.moveView('view.1', 'bottomLeft');
    expect(partsLayout.activePart.partId).toEqual('bottomLeft');

    // move view from the 'bottom-left' part to the 'top-left' part
    partsLayout = partsLayout.moveView('view.1', 'topLeft');
    expect(partsLayout.activePart.partId).toEqual('topLeft');

    // move view from the 'bottom-left' part to the 'top-left' part
    partsLayout = partsLayout.moveView('view.1', 'main');
    expect(partsLayout.activePart.partId).toEqual('main');
  });

  /**
   * Creates the following parts layout:
   *
   * +-------------+------+
   * | topLeft     | main |
   * +-------------+      |
   * | bottomLeft  |      |
   * +-------------+------+
   */
  it('should allow clearing the layout', () => {
    // create new root parts with 'root' as its identity
    const workbenchAccessor: SpyObj<PartsLayoutWorkbenchAccessor> = jasmine.createSpyObj('PartsLayoutWorkbenchAccessor', ['provideRootPartIdentity']);
    workbenchAccessor.provideRootPartIdentity.and.returnValue('root');

    const partsLayout = createSimplePartsLayout(workbenchAccessor).clear();

    expect(partsLayout.root).toEqualPartsLayout(new MPart({partId: 'root'}));
    expect(partsLayout.activePart.partId).toEqual('root');
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
function createComplexPartsLayout(workbenchAccessor?: PartsLayoutWorkbenchAccessor): PartsLayout {
  return createSinglePartLayout('main', workbenchAccessor)
    .addPart('A', {relativeTo: 'main', align: 'left'})
    .addPart('B', {relativeTo: 'A', align: 'bottom'})
    .addPart('C', {relativeTo: 'B', align: 'right'})
    .addPart('D', {relativeTo: 'main', align: 'bottom'})
    .addPart('E', {relativeTo: 'main', align: 'right'})
    .addPart('F', {relativeTo: 'E', align: 'bottom'})
    .addPart('G', {relativeTo: 'main', align: 'bottom'});
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
function createSimplePartsLayout(workbenchAccessor?: PartsLayoutWorkbenchAccessor): PartsLayout {
  return createSinglePartLayout('main', workbenchAccessor)
    .addPart('topLeft', {relativeTo: 'main', align: 'left', ratio: .25})
    .addPart('bottomLeft', {relativeTo: 'topLeft', align: 'bottom', ratio: .5});
}

/**
 * Creates a single-part layout with the specified part id.
 */
function createSinglePartLayout(partId: string, workbenchAccessor?: PartsLayoutWorkbenchAccessor): PartsLayout {
  workbenchAccessor = workbenchAccessor || jasmine.createSpyObj('PartsLayoutWorkbenchAccessor', ['getViewActivationInstant', 'provideRootPartIdentity']);
  return new PartsLayout(workbenchAccessor, {root: new MPart({partId: partId}), activePartId: partId});
}
