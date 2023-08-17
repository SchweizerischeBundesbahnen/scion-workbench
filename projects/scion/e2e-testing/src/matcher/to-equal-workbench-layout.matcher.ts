/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';
import {ExpectationResult} from './custom-matchers.definition';
import {MAIN_AREA} from '../workbench.model';

/**
 * Provides the implementation of {@link CustomMatchers#toEqualWorkbenchLayout}.
 */
export async function toEqualWorkbenchLayout(locator: Locator, expected: ExpectedWorkbenchLayout): Promise<ExpectationResult> {
  try {
    await assertWorkbenchLayout(expected, locator);
    return {pass: true};
  }
  catch (error: unknown) {
    return {pass: false, message: () => error instanceof Error ? error.message : `${error}`};
  }
}

/**
 * Asserts expected workbench layout.
 */
async function assertWorkbenchLayout(expected: ExpectedWorkbenchLayout, locator: Locator): Promise<void> {
  // Assert the workbench grid plus the main area grid if expected.
  if (expected.workbenchGrid) {
    await assertGridElement(expected.workbenchGrid.root, locator.locator('wb-workbench-layout > wb-grid-element:not([data-parentnodeid])'), expected);
  }
  // Assert only the main area grid, but not the workbench grid since not expected.
  else if (expected.mainAreaGrid) {
    await assertGridElement(expected.mainAreaGrid.root, locator.locator(`wb-main-area-layout[data-partid="${MAIN_AREA}"] > wb-grid-element`), expected);
  }

  // Assert active part of the main area grid.
  if (expected.mainAreaGrid?.activePartId) {
    const activePartId = expected.mainAreaGrid.activePartId;
    const activePartLocator = locator.locator(`wb-workbench-layout wb-main-area-layout wb-part[data-partid="${activePartId}"].active`);
    await throwIfAbsent(activePartLocator, () => Error(`[DOMAssertError] Expected part '${activePartId}' to be the active part in the main area grid, but is not.`));
    await throwIfPresent(locator.locator(`wb-workbench-layout wb-main-area-layout wb-part:not([data-partid="${activePartId}"]).active`), () => Error(`[DOMAssertError] Expected only part '${activePartId}' to be the active part in the main area grid, but is not.`));
  }
  // Assert active part of the workbench grid.
  if (expected.workbenchGrid?.activePartId) {
    const activePartId = expected.workbenchGrid.activePartId;
    const activePartLocator = locator.locator(`wb-workbench-layout wb-part[data-partid="${activePartId}"]:not(.e2e-main-area).active`);
    await throwIfAbsent(activePartLocator, () => Error(`[DOMAssertError] Expected part '${activePartId}' to be the active part in the workbench grid, but is not.`));
    await throwIfPresent(locator.locator(`wb-workbench-layout wb-part:not([data-partid="${activePartId}"]):not(.e2e-main-area).active`), () => Error(`[DOMAssertError] Expected only part '${activePartId}' to be the active part in the workbench grid, but is not.`));
  }
}

/**
 * Performs a recursive assertion of the DOM structure starting with the expected grid element.
 *
 * @see assertNodeGridElement
 * @see assertPartGridElement
 */
async function assertGridElement(expectedGridElement: MTreeNode | MPart, gridElementLocator: Locator, expectedWorkbenchLayout: ExpectedWorkbenchLayout): Promise<void> {
  await throwIfAbsent(gridElementLocator, () => Error(`[DOMAssertError] Expected grid element to be present, but is not'. [${expectedGridElement.type}=${JSON.stringify(expectedGridElement)}, locator=${gridElementLocator}]`));

  if (expectedGridElement instanceof BinaryMTreeNode || expectedGridElement instanceof UnaryMTreeNode) {
    await assertNodeGridElement(expectedGridElement, gridElementLocator, expectedWorkbenchLayout);
  }
  else {
    await assertPartGridElement(expectedGridElement, gridElementLocator, expectedWorkbenchLayout);
  }
}

/**
 * Performs a recursive assertion of the DOM structure starting with the expected tree node.
 */
async function assertNodeGridElement(expectedTreeNode: MTreeNode, gridElementLocator: Locator, expectedWorkbenchLayout: ExpectedWorkbenchLayout): Promise<void> {
  const nodeId = await gridElementLocator.getAttribute('data-nodeid');
  if (!nodeId) {
    throw Error(`[DOMAssertError] Expected element 'wb-grid-element' to have attribute 'data-nodeid', but is missing. [MTreeNode=${JSON.stringify(expectedTreeNode)}, locator=${gridElementLocator}]`);
  }

  const gridElementBoundingBox = (await gridElementLocator.boundingBox())!;
  const sashboxSelector = `sci-sashbox[data-nodeid="${nodeId}"]`;
  const sashboxLocator = gridElementLocator.locator(sashboxSelector);

  if (expectedTreeNode instanceof BinaryMTreeNode) {
    // Expect sashbox to be present.
    await throwIfAbsent(sashboxLocator, () => Error(`[DOMAssertError] Expected element '${sashboxSelector}' to be in the DOM, but is not. [MTreeNode=${JSON.stringify(expectedTreeNode)}, locator=${sashboxLocator}]`));

    // Assert child 1
    const expectedBoundsChild1 = expectedTreeNode.direction === 'row' ? {
      x: gridElementBoundingBox.x,
      y: gridElementBoundingBox.y,
      width: gridElementBoundingBox.width * expectedTreeNode.ratio,
      height: gridElementBoundingBox.height,
    } : {
      x: gridElementBoundingBox.x,
      y: gridElementBoundingBox.y,
      width: gridElementBoundingBox.width,
      height: gridElementBoundingBox.height * expectedTreeNode.ratio,
    };
    await assertChild(expectedTreeNode.child1, sashboxLocator.locator(`wb-grid-element[data-parentnodeid="${nodeId}"].sash-1`), expectedBoundsChild1, expectedWorkbenchLayout);

    // Assert child 2
    const expectedBoundsChild2 = expectedTreeNode.direction === 'row' ? {
      x: gridElementBoundingBox.x + (gridElementBoundingBox.width * expectedTreeNode.ratio),
      y: gridElementBoundingBox.y,
      width: gridElementBoundingBox.width * (1 - expectedTreeNode.ratio),
      height: gridElementBoundingBox.height,
    } : {
      x: gridElementBoundingBox.x,
      y: gridElementBoundingBox.y + (gridElementBoundingBox.height * expectedTreeNode.ratio),
      width: gridElementBoundingBox.width,
      height: gridElementBoundingBox.height * (1 - expectedTreeNode.ratio),
    };
    await assertChild(expectedTreeNode.child2, sashboxLocator.locator(`wb-grid-element[data-parentnodeid="${nodeId}"].sash-2`), expectedBoundsChild2, expectedWorkbenchLayout);
  }
  else {
    // Expect no sashbox to be present.
    await throwIfPresent(sashboxLocator, () => Error(`[DOMAssertError] Expected element 'wb-grid-element' not to contain a 'sci-sashbox' because having a single child. [MTreeNode=${JSON.stringify(expectedTreeNode)}, locator=${sashboxLocator}]`));

    await assertChild(expectedTreeNode.child, gridElementLocator.locator(`wb-grid-element[data-parentnodeid="${nodeId}"]`), {
      x: gridElementBoundingBox.x,
      y: gridElementBoundingBox.y,
      width: gridElementBoundingBox.width,
      height: gridElementBoundingBox.height,
    }, expectedWorkbenchLayout);
  }
}

async function assertChild(child: MPart | MTreeNode, childLocator: Locator, expectedBoundingBox: BoundingBox, expectedWorkbenchLayout: ExpectedWorkbenchLayout): Promise<void> {
  // Assert child resolves to exactly one DOM element.
  switch (await childLocator.count()) {
    case 0:
      throw Error(`[DOMAssertError] Expected child to be in the DOM, but is not. [${child.type}=${JSON.stringify(child)}, locator=${childLocator}]`);
    case 1:
      break;
    default:
      throw Error(`[DOMAssertError] Expected child to resolve to exactly one DOM element, but resolves to multiple DOM elements. [${child.type}=${JSON.stringify(child)}, locator=${childLocator}]`);
  }

  // Assert bounding box.
  await throwIfBoundingBoxNotCloseTo({
    actual: await childLocator.boundingBox(),
    expected: expectedBoundingBox,
    context: () => `[${child.type}=${JSON.stringify(child)}, locator=${childLocator}]`,
  });

  // Continue assertion.
  await assertGridElement(child, childLocator, expectedWorkbenchLayout);
}

/**
 * Performs a recursive assertion of the DOM structure starting with the expected part.
 */
async function assertPartGridElement(expectedPart: MPart, gridElementLocator: Locator, expectedWorkbenchLayout: ExpectedWorkbenchLayout): Promise<void> {
  const partId = await gridElementLocator.getAttribute('data-partid');
  if (expectedPart.id && partId !== expectedPart.id) {
    throw Error(`[DOMAssertError] Expected element 'wb-grid-element' to have attribute '[data-partid="${expectedPart.id}"]', but is '[data-partid="${partId}"]'. [MPart=${JSON.stringify(expectedPart)}, locator=${gridElementLocator}]`);
  }

  if (partId === MAIN_AREA) {
    const mainAreaLayoutLocator = gridElementLocator.locator(`wb-main-area-layout[data-partid="${MAIN_AREA}"]`);
    await throwIfAbsent(mainAreaLayoutLocator, () => Error(`[DOMAssertError] Expected element 'wb-main-area-layout[data-partid="${MAIN_AREA}"]' to be in the DOM, but is not. [MPart=${JSON.stringify(expectedPart)}, locator=${mainAreaLayoutLocator}]`));
    if (expectedWorkbenchLayout.mainAreaGrid) {
      await assertGridElement(expectedWorkbenchLayout.mainAreaGrid.root, mainAreaLayoutLocator.locator(`> wb-grid-element`), expectedWorkbenchLayout);
    }
    return;
  }

  // Assert part
  const partLocator = gridElementLocator.locator(`wb-part[data-partid="${partId}"]`);
  await throwIfAbsent(partLocator, () => Error(`[DOMAssertError] Expected element 'wb-part[data-partid="${partId}"]' to be in the DOM, but is not. [MPart=${JSON.stringify(expectedPart)}, locator=${partLocator}]`));

  // Assert active view and view tab
  if (expectedPart.activeViewId) {
    const activeViewLocator = partLocator.locator(`wb-view[data-viewid="${expectedPart.activeViewId}"]`);
    await throwIfAbsent(activeViewLocator, () => Error(`[DOMAssertError] Expected element 'wb-view[data-viewid="${expectedPart.activeViewId}"]' to be in the DOM, but is not. [MPart=${JSON.stringify(expectedPart)}, locator=${activeViewLocator}]`));

    const viewTabLocator = partLocator.locator(`wb-part-bar wb-view-tab[data-viewid="${expectedPart.activeViewId}"].active`);
    await throwIfAbsent(viewTabLocator, () => Error(`[DOMAssertError] Expected view tab 'wb-view[data-viewid="${expectedPart.activeViewId}"]' to be active, but is not. [MPart=${JSON.stringify(expectedPart)}, locator=${viewTabLocator}]`));
  }

  // Assert views
  if (expectedPart.views) {
    const expectedViewIds = expectedPart.views.map(view => view.id);
    const actualViewIds = new Array<string>();
    for (const viewTabLocator of await partLocator.locator('wb-part-bar wb-view-tab').all()) {
      actualViewIds.push((await viewTabLocator.getAttribute('data-viewid'))!);
    }
    if (!isEqualArray(actualViewIds, expectedViewIds)) {
      throw Error(`[DOMAssertError] Expected part '${partId}' to have views [${[...expectedViewIds]}], but has views [${[...actualViewIds]}]. [MPart=${JSON.stringify(expectedPart)}, locator=${partLocator}]`);
    }
  }
}

/**
 * Throws if specified element can be located in the DOM.
 */
async function throwIfPresent(locator: Locator, error: () => Error): Promise<void> {
  if (await locator.count() > 0) {
    throw error();
  }
}

/**
 * Throws if specified element cannot be located in the DOM.
 */
async function throwIfAbsent(locator: Locator, error: () => Error): Promise<void> {
  if (await locator.count() === 0) {
    throw error();
  }
}

/**
 * Throws if given bounding boxes are not approximately equal.
 */
async function throwIfBoundingBoxNotCloseTo(args: {actual: BoundingBox | null | undefined; expected: BoundingBox; context: () => string}): Promise<void> {
  const {actual, expected, context} = args;
  const actualBounds = actual || {width: 0, height: 0, x: 0, y: 0};

  if (actualBounds.width < (expected.width - 1) || actualBounds.width > (expected.width + 1)) {
    throw Error(`[DOMAssertError] Expected element width '${actualBounds.width}' to be close to ${expected.width}, but was not. ${context()}`);
  }
  if (actualBounds.height < (expected.height - 1) || actualBounds.height > (expected.height + 1)) {
    throw Error(`[DOMAssertError] Expected element height '${actualBounds.height}' to be close to ${expected.height}, but was not. ${context()}`);
  }
  if (actualBounds.x < (expected.x - 1) || actualBounds.x > (expected.x + 1)) {
    throw Error(`[DOMAssertError] Expected element x-position '${actualBounds.x}' to be close to ${expected.x}, but was not. ${context()}`);
  }
  if (actualBounds.y < (expected.y - 1) || actualBounds.y > (expected.y + 1)) {
    throw Error(`[DOMAssertError] Expected element y-position '${actualBounds.y}' to be close to ${expected.y}, but was not. ${context()}`);
  }
}

/**
 * Compares given two Arrays for shallow equality.
 */
function isEqualArray(array1: Array<unknown>, array2: Array<unknown>): boolean {
  if (array1 === array2) {
    return true;
  }
  if (!array1 || !array2) {
    return false;
  }
  if (array1.length !== array2.length) {
    return false;
  }
  return array1.every((item, index) => item === array2[index]);
}

/**
 * Expected layout used in {@link #toEqualWorkbenchLayout}.
 */
export interface ExpectedWorkbenchLayout {
  /**
   * Specifies the expected workbench grid. If not set, does not assert the workbench grid.
   */
  workbenchGrid?: MPartGrid;
  /**
   * Specifies the expected main area grid. If not set, does not assert the main area grid.
   */
  mainAreaGrid?: MPartGrid;
}

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Modified version of {@link MPartGrid} to expect the workbench layout.
 */
export interface MPartGrid {
  root: MTreeNode | MPart;
  activePartId?: string;
}

export type MTreeNode = BinaryMTreeNode | UnaryMTreeNode;

/**
 * Modified version of {@link MTreeNode} with two children to expect the workbench layout.
 */
export class BinaryMTreeNode {

  public readonly type = 'MTreeNode';
  public child1!: MTreeNode | MPart;
  public child2!: MTreeNode | MPart;
  public ratio!: number;
  public direction!: 'column' | 'row';

  constructor(treeNode: Omit<BinaryMTreeNode, 'type'>) {
    Object.assign(this, treeNode);
  }
}

/**
 * Modified version of {@link MTreeNode} with a single child to expect the workbench layout.
 */
export class UnaryMTreeNode {

  public readonly type = 'MTreeNode';
  public child!: MTreeNode | MPart;

  constructor(treeNode: Omit<UnaryMTreeNode, 'type'>) {
    Object.assign(this, treeNode);
  }
}

/**
 * Modified version of {@link MPart} to expect the workbench layout.
 */
export class MPart {

  public readonly type = 'MPart';
  public readonly id?: string;
  public views?: MView[];
  public activeViewId?: string;

  constructor(part: Omit<MPart, 'type'>) {
    Object.assign(this, part);
  }
}

/**
 * Modified version of {@link MView} to expect the workbench layout.
 */
export interface MView {
  readonly id: string;
}
