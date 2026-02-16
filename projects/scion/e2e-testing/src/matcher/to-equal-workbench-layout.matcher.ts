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
import {MatcherReturnType} from 'playwright/types/test';
import {MAIN_AREA} from '../workbench.model';
import {prune, retryOnError} from '../helper/testing.util';
import {ActivityId, PartId, Translatable, ViewId} from '@scion/workbench';
import {SASHBOX_SPLITTER_SIZE} from '../workbench/workbench-layout-constants';
import {Objects} from '../helper/objects.util';
import {dasherize} from '../helper/dasherize.util';

/**
 * Provides the implementation of {@link CustomMatchers#toEqualWorkbenchLayout}.
 */
export async function toEqualWorkbenchLayout(locator: Locator, expected: ExpectedWorkbenchLayout): Promise<MatcherReturnType> {
  try {
    // Retry assertion to behave like a Playwright web-first assertion, i.e., wait and retry until the expected condition is met.
    await retryOnError(() => assertWorkbenchLayout(expected, locator));
    return {pass: true, message: () => 'passed'};
  }
  catch (error) {
    return {pass: false, message: () => error instanceof Error ? error.message : `${error}`};
  }
}

/**
 * Asserts expected workbench layout.
 */
async function assertWorkbenchLayout(expected: ExpectedWorkbenchLayout, locator: Locator): Promise<void> {
  // Assert activity layout.
  if (expected.activityLayout) {
    await assertActivityToolbars(expected.activityLayout, locator);
    await assertActivityPanels(expected.activityLayout, locator);
  }
  // Assert activity grids.
  for (const [activityId, grid] of Object.entries(pickActivityGrids(expected.grids))) {
    await assertGridElement(grid.root, locator.locator(`wb-layout wb-activity-panel wb-grid[data-grid="${activityId}"] > wb-grid-element`), expected.grids!);
  }
  // Assert the main grid plus the main area grid if expected.
  if (expected.grids?.main) {
    await assertGridElement(expected.grids.main.root, locator.locator('wb-layout wb-grid[data-grid="main"] > wb-grid-element'), expected.grids);
  }
  // Assert only the main area grid, but not the main grid since not expected.
  else if (expected.grids?.mainArea) {
    await assertGridElement(expected.grids.mainArea.root, locator.locator('wb-layout wb-grid[data-grid="main"] wb-part[data-partid="part.main-area"] > wb-grid[data-grid="main-area"] > wb-grid-element'), expected.grids);
  }

  for (const [expectedGridName, expectedGrid] of Objects.entries(expected.grids ?? {})) {
    const gridName = dasherize(expectedGridName);

    // Assert active part of the grid.
    if (expectedGrid?.activePartId) {
      const activePartId = expectedGrid.activePartId;
      const activePartLocator = locator.locator(`wb-layout wb-part[data-grid="${gridName}"][data-partid="${activePartId}"][data-active]`);
      await throwIfAbsent(activePartLocator, () => Error(`[DOMAssertError] Expected part '${activePartId}' to be the active part in the ${gridName} grid, but is not.`));
      await throwIfPresent(locator.locator(`wb-layout wb-part[data-grid="${gridName}"]:not([data-partid="${activePartId}"])[data-active]`), () => Error(`[DOMAssertError] Expected only part '${activePartId}' to be the active part in the ${gridName} grid, but is not.`));
    }

    // Assert reference part of the grid.
    if (expectedGrid?.referencePartId) {
      const referencePartId = expectedGrid.referencePartId;
      const referencePartLocator = locator.locator(`wb-layout wb-part[data-grid="${gridName}"][data-partid="${referencePartId}"][data-referencepart]`);
      await throwIfAbsent(referencePartLocator, () => Error(`[DOMAssertError] Expected part '${referencePartId}' to be the reference part in the ${gridName} grid, but is not.`));
      await throwIfPresent(locator.locator(`wb-layout wb-part[data-grid="${gridName}"]:not([data-partid="${referencePartId}"])[data-referencepart]`), () => Error(`[DOMAssertError] Expected only part '${referencePartId}' to be the reference part in the ${gridName} grid, but is not.`));
    }
  }
}

async function assertActivityToolbars(expectedActivityLayout: Partial<MActivityLayout>, locator: Locator): Promise<void> {
  if (expectedActivityLayout.toolbars?.leftTop) {
    await assertActivityStack(expectedActivityLayout.toolbars.leftTop, locator.locator('wb-layout > wb-activity-bar[data-align="left"] > wb-activity-stack[data-docking-area="left-top"]'));
  }
  if (expectedActivityLayout.toolbars?.leftBottom) {
    await assertActivityStack(expectedActivityLayout.toolbars.leftBottom, locator.locator('wb-layout > wb-activity-bar[data-align="left"] > wb-activity-stack[data-docking-area="left-bottom"]'));
  }
  if (expectedActivityLayout.toolbars?.rightTop) {
    await assertActivityStack(expectedActivityLayout.toolbars.rightTop, locator.locator('wb-layout > wb-activity-bar[data-align="right"] > wb-activity-stack[data-docking-area="right-top"]'));
  }
  if (expectedActivityLayout.toolbars?.rightBottom) {
    await assertActivityStack(expectedActivityLayout.toolbars.rightBottom, locator.locator('wb-layout > wb-activity-bar[data-align="right"] > wb-activity-stack[data-docking-area="right-bottom"]'));
  }
  if (expectedActivityLayout.toolbars?.topLeft) {
    await assertActivityStack(expectedActivityLayout.toolbars.topLeft, locator.locator('wb-layout > wb-activity-bar[data-align="left"] > wb-activity-stack[data-docking-area="top-left"]'));
  }
  if (expectedActivityLayout.toolbars?.topRight) {
    await assertActivityStack(expectedActivityLayout.toolbars.topRight, locator.locator('wb-layout > wb-activity-bar[data-align="right"] > wb-activity-stack[data-docking-area="top-right"]'));
  }
  if (expectedActivityLayout.toolbars?.bottomLeft) {
    await assertActivityStack(expectedActivityLayout.toolbars.bottomLeft, locator.locator('wb-layout > wb-activity-bar[data-align="left"] > wb-activity-stack[data-docking-area="bottom-left"]'));
  }
  if (expectedActivityLayout.toolbars?.bottomRight) {
    await assertActivityStack(expectedActivityLayout.toolbars.bottomRight, locator.locator('wb-layout > wb-activity-bar[data-align="right"] > wb-activity-stack[data-docking-area="bottom-right"]'));
  }
}

async function assertActivityStack(expectedStack: MActivityStack, locator: Locator): Promise<void> {
  if (expectedStack.activities.length === 0) {
    await throwIfPresent(locator, () => Error(`[DOMAssertError] Expected activity stack to not have activities, but it has. [locator=${locator}]`));
  }
  for (const [i, activity] of expectedStack.activities.entries()) {
    const activityLocator = locator.locator('wb-activity-item').nth(i).locator(`:scope[data-activityid="${activity.id}"]`);
    await throwIfAbsent(activityLocator, () => Error(`[DOMAssertError] Expected activity to be present, but is not. [activityId=${activity.id}, locator=${activityLocator}]`));
  }
  if (expectedStack.activeActivityId === 'none') {
    const activityLocator = locator.locator(`wb-activity-item[data-active]`);
    await throwIfPresent(activityLocator, () => Error(`[DOMAssertError] Expected no activity to be active, but is. [locator=${activityLocator}]`));
  }
  else {
    const activityLocator = locator.locator(`wb-activity-item[data-activityid="${expectedStack.activeActivityId}"][data-active]`);
    await throwIfAbsent(activityLocator, () => Error(`[DOMAssertError] Expected activity to be active, but is not. [activityId=${expectedStack.activeActivityId}, locator=${activityLocator}]`));
  }
}

async function assertActivityPanels(expectedActivityLayout: Partial<MActivityLayout>, locator: Locator): Promise<void> {
  if (expectedActivityLayout.panels?.left) {
    await assertLeftActivityPanel(expectedActivityLayout.panels.left, locator.locator('wb-layout wb-activity-panel[data-panel="left"]'));
  }
  if (expectedActivityLayout.panels?.right) {
    await assertRightActivityPanel(expectedActivityLayout.panels.right, locator.locator('wb-layout wb-activity-panel[data-panel="right"]'));
  }
  if (expectedActivityLayout.panels?.top) {
    await assertTopActivityPanel(expectedActivityLayout.panels.top, locator.locator('wb-layout wb-activity-panel[data-panel="top"]'));
  }
  if (expectedActivityLayout.panels?.bottom) {
    await assertBottomActivityPanel(expectedActivityLayout.panels.bottom, locator.locator('wb-layout wb-activity-panel[data-panel="bottom"]'));
  }
}

async function assertLeftActivityPanel(expectedPanel: Required<MActivityLayout['panels']>['left'], panelLocator: Locator): Promise<void> {
  if (expectedPanel === 'closed') {
    await throwIfPresent(panelLocator, () => Error(`[DOMAssertError] Expected left activity panel not to be present, but it is. [locator=${panelLocator}]`));
    return;
  }

  await throwIfAbsent(panelLocator, () => Error(`[DOMAssertError] Expected left activity panel '${panelLocator}' to be in the DOM, but is not.`));
  if (expectedPanel === 'opened') {
    return;
  }

  // Assert left activity panel width.
  const panelBoundingBox = (await panelLocator.boundingBox())!;
  await throwIfBoundingBoxNotCloseTo({
    actual: panelBoundingBox,
    expected: {
      x: panelBoundingBox.x,
      y: panelBoundingBox.y,
      width: expectedPanel.width,
      height: panelBoundingBox.height,
    },
    context: () => 'Width of left activity panel does not match expected.',
  });

  // Assert splitted panel.
  if (expectedPanel.ratio) {
    // Assert top activity bounds.
    const topGridLocator = panelLocator.locator('wb-grid').nth(0);
    const topGridBoundingBox = (await topGridLocator.boundingBox())!;
    await throwIfBoundingBoxNotCloseTo({
      actual: topGridBoundingBox,
      expected: {
        x: topGridBoundingBox.x,
        y: topGridBoundingBox.y,
        width: expectedPanel.width,
        height: (panelBoundingBox.height - SASHBOX_SPLITTER_SIZE) * expectedPanel.ratio,
      },
      context: () => 'Height of "left-top" activity does not match expected.',
    });

    // Assert bottom activity bounds.
    const bottomGridLocator = panelLocator.locator('wb-grid').nth(1);
    const bottomGridBoundingBox = (await bottomGridLocator.boundingBox())!;
    await throwIfBoundingBoxNotCloseTo({
      actual: bottomGridBoundingBox,
      expected: {
        x: bottomGridBoundingBox.x,
        y: bottomGridBoundingBox.y,
        width: expectedPanel.width,
        height: (panelBoundingBox.height - SASHBOX_SPLITTER_SIZE) * (1 - expectedPanel.ratio),
      },
      context: () => 'Height of "left-bottom" activity does not match expected.',
    });
  }
}

async function assertRightActivityPanel(expectedPanel: Required<MActivityLayout['panels']>['right'], panelLocator: Locator): Promise<void> {
  if (expectedPanel === 'closed') {
    await throwIfPresent(panelLocator, () => Error(`[DOMAssertError] Expected right activity panel not to be present, but it is. [locator=${panelLocator}]`));
    return;
  }

  await throwIfAbsent(panelLocator, () => Error(`[DOMAssertError] Expected right activity panel '${panelLocator}' to be in the DOM, but is not.`));
  if (expectedPanel === 'opened') {
    return;
  }

  // Assert right activity panel width.
  const panelBoundingBox = (await panelLocator.boundingBox())!;
  await throwIfBoundingBoxNotCloseTo({
    actual: panelBoundingBox,
    expected: {
      x: panelBoundingBox.x,
      y: panelBoundingBox.y,
      width: expectedPanel.width,
      height: panelBoundingBox.height,
    },
    context: () => 'Right activity panel width does not match expected.',
  });

  // Assert splitted panel.
  if (expectedPanel.ratio) {
    // Assert top activity bounds.
    const topGridLocator = panelLocator.locator('wb-grid').nth(0);
    const topGridBoundingBox = (await topGridLocator.boundingBox())!;
    await throwIfBoundingBoxNotCloseTo({
      actual: topGridBoundingBox,
      expected: {
        x: topGridBoundingBox.x,
        y: topGridBoundingBox.y,
        width: expectedPanel.width,
        height: (panelBoundingBox.height - SASHBOX_SPLITTER_SIZE) * expectedPanel.ratio,
      },
      context: () => 'Height of "right-top" activity does not match expected.',
    });

    // Assert bottom activity bounds.
    const bottomGridLocator = panelLocator.locator('wb-grid').nth(1);
    const bottomGridBoundingBox = (await bottomGridLocator.boundingBox())!;
    await throwIfBoundingBoxNotCloseTo({
      actual: bottomGridBoundingBox,
      expected: {
        x: bottomGridBoundingBox.x,
        y: bottomGridBoundingBox.y,
        width: expectedPanel.width,
        height: (panelBoundingBox.height - SASHBOX_SPLITTER_SIZE) * (1 - expectedPanel.ratio),
      },
      context: () => 'Height of "right-bottom" activity does not match expected.',
    });
  }
}

async function assertTopActivityPanel(expectedPanel: Required<MActivityLayout['panels']>['top'], panelLocator: Locator): Promise<void> {
  if (expectedPanel === 'closed') {
    await throwIfPresent(panelLocator, () => Error(`[DOMAssertError] Expected top activity panel not to be present, but it is. [locator=${panelLocator}]`));
    return;
  }

  await throwIfAbsent(panelLocator, () => Error(`[DOMAssertError] Expected top activity panel '${panelLocator}' to be in the DOM, but is not.`));
  if (expectedPanel === 'opened') {
    return;
  }

  // Assert top activity panel height.
  const panelBoundingBox = (await panelLocator.boundingBox())!;
  await throwIfBoundingBoxNotCloseTo({
    actual: panelBoundingBox,
    expected: {
      x: panelBoundingBox.x,
      y: panelBoundingBox.y,
      width: panelBoundingBox.width,
      height: expectedPanel.height,
    },
    context: () => 'Top activity panel height does not match expected.',
  });

  // Assert splitted panel.
  if (expectedPanel.ratio) {
    // Assert left activity bounds.
    const leftGridLocator = panelLocator.locator('wb-grid').nth(0);
    const leftGridBoundingBox = (await leftGridLocator.boundingBox())!;
    await throwIfBoundingBoxNotCloseTo({
      actual: leftGridBoundingBox,
      expected: {
        x: leftGridBoundingBox.x,
        y: leftGridBoundingBox.y,
        width: (panelBoundingBox.width - SASHBOX_SPLITTER_SIZE) * expectedPanel.ratio,
        height: expectedPanel.height,
      },
      context: () => 'Width of "top-left" activity does not match expected.',
    });

    // Assert right activity bounds.
    const rightGridLocator = panelLocator.locator('wb-grid').nth(1);
    const rightGridBoundingBox = (await rightGridLocator.boundingBox())!;
    await throwIfBoundingBoxNotCloseTo({
      actual: rightGridBoundingBox,
      expected: {
        x: rightGridBoundingBox.x,
        y: rightGridBoundingBox.y,
        width: (panelBoundingBox.width - SASHBOX_SPLITTER_SIZE) * (1 - expectedPanel.ratio),
        height: expectedPanel.height,
      },
      context: () => 'Width of "top-right" activity does not match expected.',
    });
  }
}

async function assertBottomActivityPanel(expectedPanel: Required<MActivityLayout['panels']>['bottom'], panelLocator: Locator): Promise<void> {
  if (expectedPanel === 'closed') {
    await throwIfPresent(panelLocator, () => Error(`[DOMAssertError] Expected bottom activity panel not to be present, but it is. [locator=${panelLocator}]`));
    return;
  }

  await throwIfAbsent(panelLocator, () => Error(`[DOMAssertError] Expected bottom activity panel '${panelLocator}' to be in the DOM, but is not.`));
  if (expectedPanel === 'opened') {
    return;
  }

  // Assert bottom activity panel height.
  const panelBoundingBox = (await panelLocator.boundingBox())!;
  await throwIfBoundingBoxNotCloseTo({
    actual: panelBoundingBox,
    expected: {
      x: panelBoundingBox.x,
      y: panelBoundingBox.y,
      width: panelBoundingBox.width,
      height: expectedPanel.height,
    },
    context: () => 'Bottom activity panel height does not match expected.',
  });

  // Assert splitted panel.
  if (expectedPanel.ratio) {
    // Assert left activity bounds.
    const leftGridLocator = panelLocator.locator('wb-grid').nth(0);
    const leftGridBoundingBox = (await leftGridLocator.boundingBox())!;
    await throwIfBoundingBoxNotCloseTo({
      actual: leftGridBoundingBox,
      expected: {
        x: leftGridBoundingBox.x,
        y: leftGridBoundingBox.y,
        width: (panelBoundingBox.width - SASHBOX_SPLITTER_SIZE) * expectedPanel.ratio,
        height: expectedPanel.height,
      },
      context: () => 'Width of "bottom-left" activity does not match expected.',
    });

    // Assert right activity bounds.
    const rightGridLocator = panelLocator.locator('wb-grid').nth(1);
    const rightGridBoundingBox = (await rightGridLocator.boundingBox())!;
    await throwIfBoundingBoxNotCloseTo({
      actual: rightGridBoundingBox,
      expected: {
        x: rightGridBoundingBox.x,
        y: rightGridBoundingBox.y,
        width: (panelBoundingBox.width - SASHBOX_SPLITTER_SIZE) * (1 - expectedPanel.ratio),
        height: expectedPanel.height,
      },
      context: () => 'Width of "bottom-right" activity does not match expected.',
    });
  }
}

function pickActivityGrids(grids: ExpectedWorkbenchGrids | undefined): {[activityId: ActivityId]: MPartGrid} {
  return Object.fromEntries(Object.entries(grids ?? {}).reduce((acc, [gridName, grid]) => {
    if (!grid) {
      return acc;
    }
    if (!isActivityId(gridName)) {
      return acc;
    }
    return acc.set(gridName, grid as MPartGrid);
  }, new Map<ActivityId, MPartGrid>()));
}

/**
 * Performs a recursive assertion of the DOM structure starting with the expected grid element.
 *
 * @see assertNodeGridElement
 * @see assertPartGridElement
 */
async function assertGridElement(expectedGridElement: MTreeNode | MPart, gridElementLocator: Locator, expectedGrids: ExpectedWorkbenchGrids): Promise<void> {
  await throwIfAbsent(gridElementLocator, () => Error(`[DOMAssertError] Expected grid element to be present, but is not. [${expectedGridElement.type}=${JSON.stringify(expectedGridElement)}, locator=${gridElementLocator}]`));

  if (expectedGridElement instanceof MTreeNode) {
    await assertNodeGridElement(expectedGridElement, gridElementLocator, expectedGrids);
  }
  else {
    await assertPartGridElement(expectedGridElement, gridElementLocator, expectedGrids);
  }
}

/**
 * Performs a recursive assertion of the DOM structure starting with the expected tree node.
 */
async function assertNodeGridElement(expectedTreeNode: MTreeNode, gridElementLocator: Locator, expectedGrids: ExpectedWorkbenchGrids): Promise<void> {
  const nodeId = await gridElementLocator.getAttribute('data-nodeid');
  if (!nodeId) {
    throw Error(`[DOMAssertError] Expected element 'wb-grid-element' to have attribute 'data-nodeid', but is missing. [MTreeNode=${JSON.stringify(expectedTreeNode)}, locator=${gridElementLocator}]`);
  }

  // Assert sashbox to be present.
  const sashboxSelector = `sci-sashbox[data-nodeid="${nodeId}"]`;
  if (expectedTreeNode.child1 && expectedTreeNode.child2) {
    gridElementLocator = gridElementLocator.locator(sashboxSelector);
    await throwIfAbsent(gridElementLocator, () => Error(`[DOMAssertError] Expected element '${sashboxSelector}' to be in the DOM, but is not. [MTreeNode=${JSON.stringify(expectedTreeNode)}, locator=${gridElementLocator}]`));
  }
  else {
    const sashboxLocator = gridElementLocator.locator(sashboxSelector);
    await throwIfPresent(sashboxLocator, () => Error(`[DOMAssertError] Expected element 'wb-grid-element' not to contain a 'sci-sashbox' because having a single child. [MTreeNode=${JSON.stringify(expectedTreeNode)}, locator=${sashboxLocator}]`));
  }

  // Assert sash 1 to be present.
  const child1Selector = `wb-grid-element[data-parentnodeid="${nodeId}"].sash-1`;
  const child1Locator = gridElementLocator.locator(child1Selector);
  if (expectedTreeNode.child1) {
    await throwIfAbsent(child1Locator, () => Error(`[DOMAssertError] Expected element '${child1Selector}' to be in the DOM, but is not. [${expectedTreeNode.child1!.type}=${JSON.stringify(expectedTreeNode.child1)}, locator=${child1Locator}]`));
    await assertGridElement(expectedTreeNode.child1, child1Locator, expectedGrids);
  }
  else {
    await throwIfPresent(child1Locator, () => Error(`[DOMAssertError] Expected element '${child1Selector}' not to be in the DOM, but is. [${expectedTreeNode.child1!.type}=${JSON.stringify(expectedTreeNode.child1)}, locator=${child1Locator}]`));
  }

  // Assert sash 2 to be present.
  const child2Selector = `wb-grid-element[data-parentnodeid="${nodeId}"].sash-2`;
  const child2Locator = gridElementLocator.locator(child2Selector);
  if (expectedTreeNode.child2) {
    await throwIfAbsent(child2Locator, () => Error(`[DOMAssertError] Expected element '${child2Selector}' to be in the DOM, but is not. [${expectedTreeNode.child1!.type}=${JSON.stringify(expectedTreeNode.child1)}, locator=${child2Locator}]`));
    await assertGridElement(expectedTreeNode.child2, child2Locator, expectedGrids);
  }
  else {
    await throwIfPresent(child2Locator, () => Error(`[DOMAssertError] Expected element '${child2Selector}' not to be in the DOM, but is. [${expectedTreeNode.child1!.type}=${JSON.stringify(expectedTreeNode.child1)}, locator=${child2Locator}]`));
  }

  // Assert sash bounding box.
  await assertSashBoundingBox({...expectedTreeNode, nodeId}, gridElementLocator); // eslint-disable-line @typescript-eslint/no-misused-spread
}

/**
 * Performs a recursive assertion of the DOM structure starting with the expected part.
 */
async function assertPartGridElement(expectedPart: MPart, gridElementLocator: Locator, expectedGrids: ExpectedWorkbenchGrids): Promise<void> {
  const partId = await gridElementLocator.getAttribute('data-partid');
  if (expectedPart.id && partId !== expectedPart.id) {
    throw Error(`[DOMAssertError] Expected element 'wb-grid-element' to have attribute '[data-partid="${expectedPart.id}"]', but is '[data-partid="${partId}"]'. [MPart=${JSON.stringify(expectedPart)}, locator=${gridElementLocator}]`);
  }

  if (partId === MAIN_AREA) {
    const mainAreaPartLocator = gridElementLocator.locator('wb-part[data-partid="part.main-area"]');
    await throwIfAbsent(mainAreaPartLocator, () => Error(`[DOMAssertError] Expected element 'wb-part[data-partid="part.main-area"]' to be in the DOM, but is not. [MPart=${JSON.stringify(expectedPart)}, locator=${mainAreaPartLocator}]`));
    if (expectedGrids.mainArea) {
      await assertGridElement(expectedGrids.mainArea.root, mainAreaPartLocator.locator(`> wb-grid[data-grid="main-area"] > wb-grid-element`), expectedGrids);
    }
    return;
  }

  // Assert part
  const partLocator = gridElementLocator.locator(`wb-part[data-partid="${partId}"]`);
  await throwIfAbsent(partLocator, () => Error(`[DOMAssertError] Expected element 'wb-part[data-partid="${partId}"]' to be in the DOM, but is not. [MPart=${JSON.stringify(expectedPart)}, locator=${partLocator}]`));

  // Assert active view and view tab
  if (expectedPart.activeViewId) {
    const activeViewLocator = partLocator.locator(`wb-view-slot[data-viewid="${expectedPart.activeViewId}"]`);
    await throwIfAbsent(activeViewLocator, () => Error(`[DOMAssertError] Expected element 'wb-view-slot[data-viewid="${expectedPart.activeViewId}"]' to be in the DOM, but is not. [MPart=${JSON.stringify(expectedPart)}, locator=${activeViewLocator}]`));

    const viewTabLocator = partLocator.locator(`wb-part-bar wb-view-tab[data-viewid="${expectedPart.activeViewId}"][data-active]`);
    await throwIfAbsent(viewTabLocator, () => Error(`[DOMAssertError] Expected element 'wb-view-tab[data-viewid="${expectedPart.activeViewId}"]' to be active, but is not. [MPart=${JSON.stringify(expectedPart)}, locator=${viewTabLocator}]`));
  }

  // Assert views
  if (expectedPart.views) {
    const expectedViewIds = expectedPart.views.map(view => view.id);
    const actualViewIds = new Array<string>();
    for (const viewTabLocator of await partLocator.locator('wb-part-bar wb-view-tab:not(.drag-source)').all()) {
      actualViewIds.push((await viewTabLocator.getAttribute('data-viewid'))!);
    }
    if (!isEqualArray(actualViewIds, expectedViewIds)) {
      throw Error(`[DOMAssertError] Expected part '${partId}' to have views [${[...expectedViewIds]}], but has views [${[...actualViewIds]}]. [MPart=${JSON.stringify(expectedPart)}, locator=${partLocator}]`);
    }
  }
}

/**
 * Performs an assertion of the bounding box of the sash(es) in the given 'wb-grid-element'.
 */
async function assertSashBoundingBox(expectedTreeNode: MTreeNode & {nodeId: string}, gridElementLocator: Locator): Promise<void> {
  const child1Locator = gridElementLocator.locator(`wb-grid-element[data-parentnodeid="${expectedTreeNode.nodeId}"].sash-1`);
  const child2Locator = gridElementLocator.locator(`wb-grid-element[data-parentnodeid="${expectedTreeNode.nodeId}"].sash-2`);

  const gridElementBoundingBox = (await gridElementLocator.boundingBox())!;
  if (expectedTreeNode.child1 && expectedTreeNode.child2) {
    switch (expectedTreeNode.direction) {
      case 'row': {
        // Expect bounding box of sash 1.
        await throwIfBoundingBoxNotCloseTo({
          actual: await child1Locator.boundingBox(),
          expected: {
            x: gridElementBoundingBox.x,
            y: gridElementBoundingBox.y,
            width: gridElementBoundingBox.width * expectedTreeNode.ratio,
            height: gridElementBoundingBox.height,
          },
          context: () => `Did you set direction and ratio of the expected tree node correctly? [${expectedTreeNode.child1!.type}=${JSON.stringify(expectedTreeNode.child1)}, locator=${child1Locator}]`,
        });
        // Expect bounding box of sash 2.
        await throwIfBoundingBoxNotCloseTo({
          actual: await child2Locator.boundingBox(),
          expected: {
            x: gridElementBoundingBox.x + (gridElementBoundingBox.width * expectedTreeNode.ratio),
            y: gridElementBoundingBox.y,
            width: gridElementBoundingBox.width * (1 - expectedTreeNode.ratio),
            height: gridElementBoundingBox.height,
          },
          context: () => `Did you set direction and ratio of the expected tree node correctly? [${expectedTreeNode.child2!.type}=${JSON.stringify(expectedTreeNode.child2)}, locator=${child2Locator}]`,
        });
        break;
      }
      case 'column': {
        // Expect bounding box of sash 1.
        await throwIfBoundingBoxNotCloseTo({
          actual: await child1Locator.boundingBox(),
          expected: {
            x: gridElementBoundingBox.x,
            y: gridElementBoundingBox.y,
            width: gridElementBoundingBox.width,
            height: gridElementBoundingBox.height * expectedTreeNode.ratio,
          },
          context: () => `Did you set direction and ratio of the expected tree node correctly? [${expectedTreeNode.child1!.type}=${JSON.stringify(expectedTreeNode.child1)}, locator=${child1Locator}]`,
        });
        // Expect bounding box of sash 2.
        await throwIfBoundingBoxNotCloseTo({
          actual: await child2Locator.boundingBox(),
          expected: {
            x: gridElementBoundingBox.x,
            y: gridElementBoundingBox.y + (gridElementBoundingBox.height * expectedTreeNode.ratio),
            width: gridElementBoundingBox.width,
            height: gridElementBoundingBox.height * (1 - expectedTreeNode.ratio),
          },
          context: () => `Did you set direction and ratio of the expected tree node correctly? [${expectedTreeNode.child2!.type}=${JSON.stringify(expectedTreeNode.child2)}, locator=${child1Locator}]`,
        });
        break;
      }
    }
  }
  else if (expectedTreeNode.child1) {
    // Expect bounding box of child 1.
    await throwIfBoundingBoxNotCloseTo({
      actual: await child1Locator.boundingBox(),
      expected: {
        x: gridElementBoundingBox.x,
        y: gridElementBoundingBox.y,
        width: gridElementBoundingBox.width,
        height: gridElementBoundingBox.height,
      },
      context: () => `[${expectedTreeNode.child1!.type}=${JSON.stringify(expectedTreeNode.child1)}, locator=${child1Locator}]`,
    });
  }
  else if (expectedTreeNode.child2) {
    // Expect bounding box of child 2.
    await throwIfBoundingBoxNotCloseTo({
      actual: await child2Locator.boundingBox(),
      expected: {
        x: gridElementBoundingBox.x,
        y: gridElementBoundingBox.y,
        width: gridElementBoundingBox.width,
        height: gridElementBoundingBox.height,
      },
      context: () => `[${expectedTreeNode.child2!.type}=${JSON.stringify(expectedTreeNode.child2)}, locator=${child2Locator}]`,
    });
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
  const actualBounds = actual ?? {width: 0, height: 0, x: 0, y: 0};

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

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Compares given two Arrays for shallow equality.
 */
function isEqualArray(array1: Array<unknown>, array2: Array<unknown>): boolean {
  if (array1 === array2) {
    return true;
  }
  if (array1.length !== array2.length) {
    return false;
  }
  return array1.every((item, index) => item === array2[index]);
}

function isActivityId(activityId: string | undefined | null): activityId is ActivityId {
  return activityId?.startsWith('activity.') ?? false;
}

/**
 * Expected layout used in {@link #toEqualWorkbenchLayout}.
 */
export interface ExpectedWorkbenchLayout {
  /**
   * Specifies the expected activity layout. If not set, does not assert the activity layout.
   */
  activityLayout?: Partial<MActivityLayout>;
  /**
   * Specifies the expected grids.
   */
  grids?: ExpectedWorkbenchGrids;
}

interface ExpectedWorkbenchGrids {
  /**
   * Specifies the expected main grid. If not set, does not assert the main grid.
   */
  main?: MPartGrid;
  /**
   * Specifies the expected main area grid. If not set, does not assert the main area grid.
   */
  mainArea?: MPartGrid;

  /**
   * Specifies the expected activity grids. If not set, does not assert the activity grids.
   */
  [activityId: ActivityId]: MPartGrid;
}

/**
 * Modified version of {@link MActivityLayout} to expect the workbench layout.
 */
export interface MActivityLayout {
  toolbars: {
    leftTop?: MActivityStack;
    leftBottom?: MActivityStack;
    rightTop?: MActivityStack;
    rightBottom?: MActivityStack;
    topLeft?: MActivityStack;
    topRight?: MActivityStack;
    bottomLeft?: MActivityStack;
    bottomRight?: MActivityStack;
  };
  panels: {
    left?: {
      width: number;
      ratio?: number;
    } | 'closed' | 'opened';
    right?: {
      width: number;
      ratio?: number;
    } | 'closed' | 'opened';
    top?: {
      height: number;
      ratio?: number;
    } | 'closed' | 'opened';
    bottom?: {
      height: number;
      ratio?: number;
    } | 'closed' | 'opened';
  };
}

/**
 * Modified version of {@link MActivityStack} to expect the workbench layout.
 */
export interface MActivityStack {
  activities: Array<Partial<MActivity>>;
  activeActivityId: ActivityId | 'none';
}

/**
 * Modified version of {@link MActivity} to expect the workbench layout.
 */
export interface MActivity {
  id: ActivityId;
  label: Translatable;
  icon: string;
}

/**
 * Modified version of {@link MPartGrid} to expect the workbench layout.
 */
export interface MPartGrid {
  root: MTreeNode | MPart;
  activePartId?: PartId;
  referencePartId?: PartId;
}

/**
 * Modified version of {@link MTreeNode} to expect the workbench layout.
 */
export class MTreeNode {

  public readonly type = 'MTreeNode';
  public child1?: MTreeNode | MPart;
  public child2?: MTreeNode | MPart;
  public ratio!: number;
  public direction!: 'column' | 'row';

  constructor(treeNode: Omit<MTreeNode, 'type'>) {
    Object.assign(this, treeNode);
    // If `useDefineForClassFields` TypeScript flag is enabled, all class members that are not explicitly set will be initialised to `undefined`.
    // In test expectations, only the explicitly set properties should be asserted. Therefore, `undefined` properties are deleted.
    prune(this);
  }
}

/**
 * Modified version of {@link MPart} to expect the workbench layout.
 */
export class MPart {

  public readonly type = 'MPart';
  public readonly id?: PartId;
  public readonly alternativeId?: string;
  public views?: MView[];
  public activeViewId?: ViewId;

  constructor(part: Omit<MPart, 'type'>) {
    Object.assign(this, part);
    // If `useDefineForClassFields` TypeScript flag is enabled, all class members that are not explicitly set will be initialised to `undefined`.
    // In test expectations, only the explicitly set properties should be asserted. Therefore, `undefined` properties are deleted.
    prune(this);
  }
}

/**
 * Modified version of {@link MView} to expect the workbench layout.
 */
export interface MView {
  readonly id: ViewId;
}
