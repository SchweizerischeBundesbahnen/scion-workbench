/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import CustomMatcher = jasmine.CustomMatcher;
import MatchersUtil = jasmine.MatchersUtil;
import CustomMatcherResult = jasmine.CustomMatcherResult;
import ObjectContaining = jasmine.ObjectContaining;
import {DebugElement} from '@angular/core';
import {MPart as _MPart, MPartGrid as _MPartGrid, MTreeNode as _MTreeNode, MView as _MView} from '../../../layout/workbench-grid.model';
import {WorkbenchLayouts} from '../../../layout/workbench-layouts.util';
import {ɵWorkbenchLayout} from '../../../layout/ɵworkbench-layout';
import {MAIN_AREA} from '../../../layout/workbench-layout';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {NavigationStates, Outlets} from '../../../routing/routing.model';
import {WorkbenchLayoutService} from '../../../layout/workbench-layout.service';
import {Objects} from '@scion/toolkit/util';
import {WorkbenchComponent} from '../../../workbench.component';
import {MActivity as _MActivity, MActivityLayout as _MActivityLayout, MActivityStack as _MActivityStack} from '../../../activity/workbench-activity.model';
import {throwError} from '../../../common/throw-error.util';
import {ActivityId} from '../../../workbench.identifiers';
import {prune} from '../../../common/prune.util';

/**
 * Provides the implementation of {@link CustomMatchers#toEqualWorkbenchLayout}.
 */
export const toEqualWorkbenchLayoutCustomMatcher: jasmine.CustomMatcherFactories = {
  toEqualWorkbenchLayout: (util: MatchersUtil): CustomMatcher => {
    return {
      compare(actual: ɵWorkbenchLayout | ComponentFixture<unknown> | DebugElement | unknown, expected: ExpectedWorkbenchLayout, failOutput: string | undefined): CustomMatcherResult {
        try {
          // Expect actual to be of the expected type.
          if (!(actual instanceof ɵWorkbenchLayout) && !(actual instanceof ComponentFixture) && !(actual instanceof DebugElement)) {
            return fail(`Expected actual to be of type 'ɵWorkbenchLayout', or 'ComponentFixture', or 'DebugElement', but was '${actual?.constructor?.name}'`);
          }

          // Assert model if only passed a layout instance.
          if (actual instanceof ɵWorkbenchLayout) {
            assertWorkbenchLayoutModel(expected, actual, util);
            return pass();
          }

          // Resolve debug element for `WorkbenchComponent`.
          let debugElement = actual instanceof ComponentFixture ? actual.debugElement : actual;
          if (!(debugElement.componentInstance instanceof WorkbenchComponent)) {
            debugElement = debugElement.query(By.directive(WorkbenchComponent));
          }

          // Expect debug element to represent `WorkbenchComponent` element.
          if (!(debugElement.componentInstance instanceof WorkbenchComponent)) {
            return fail(`Expected fixture or DebugElement to be 'WorkbenchComponent' (or a parent), but was ${actual.componentInstance?.constructor?.name}.`); // eslint-disable-line @typescript-eslint/no-unsafe-member-access
          }

          // Assert model.
          assertWorkbenchLayoutModel(expected, TestBed.inject(WorkbenchLayoutService).layout(), util);
          // Assert DOM.
          assertWorkbenchLayoutDOM(expected, debugElement.nativeElement as HTMLElement);
          return pass();
        }
        catch (error) {
          return fail(error instanceof Error ? error.message : `${error}`);
        }

        function pass(): CustomMatcherResult {
          return {pass: true};
        }

        function fail(message: string): CustomMatcherResult {
          return {pass: false, message: message.concat(failOutput ? ` (${failOutput})` : '')};
        }
      },
    };
  },
};

/**
 * Asserts the actual layout model to equal the expected model. Only properties declared on the expected object are asserted.
 */
function assertWorkbenchLayoutModel(expected: ExpectedWorkbenchLayout, actual: ɵWorkbenchLayout, util: MatchersUtil): void {
  // Prepare the actual layout for comparison with the expected layout.
  const {leftTop, leftBottom, rightTop, rightBottom, bottomLeft, bottomRight} = actual.activityLayout.toolbars;
  const actualLayout: ExpectedWorkbenchLayout = {
    perspectiveId: actual.perspectiveId,
    activityLayout: {
      toolbars: {
        leftTop: {
          ...leftTop,
          activeActivityId: leftTop.activeActivityId ?? 'none',
          minimizedActivityId: leftTop.minimizedActivityId ?? 'none',
        },
        leftBottom: {
          ...leftBottom,
          activeActivityId: leftBottom.activeActivityId ?? 'none',
          minimizedActivityId: leftBottom.minimizedActivityId ?? 'none',
        },
        rightTop: {
          ...rightTop,
          activeActivityId: rightTop.activeActivityId ?? 'none',
          minimizedActivityId: rightTop.minimizedActivityId ?? 'none',
        },
        rightBottom: {
          ...rightBottom,
          activeActivityId: rightBottom.activeActivityId ?? 'none',
          minimizedActivityId: rightBottom.minimizedActivityId ?? 'none',
        },
        bottomLeft: {
          ...bottomLeft,
          activeActivityId: bottomLeft.activeActivityId ?? 'none',
          minimizedActivityId: bottomLeft.minimizedActivityId ?? 'none',
        },
        bottomRight: {
          ...bottomRight,
          activeActivityId: bottomRight.activeActivityId ?? 'none',
          minimizedActivityId: bottomRight.minimizedActivityId ?? 'none',
        },
      },
      panels: {
        left: leftTop.activeActivityId || leftBottom.activeActivityId ? actual.activityLayout.panels.left : 'closed',
        right: rightTop.activeActivityId || rightBottom.activeActivityId ? actual.activityLayout.panels.right : 'closed',
        bottom: bottomLeft.activeActivityId || bottomRight.activeActivityId ? actual.activityLayout.panels.bottom : 'closed',
      },
    },
    grids: actual.grids,
    navigationStates: actual.navigationStates(),
    outlets: actual.outlets({mainGrid: true, mainAreaGrid: true, activityGrids: true}),
  };
  const result = toEqual(actualLayout, objectContainingRecursive(expected), util);
  if (!result.pass) {
    throw Error(result.message);
  }
}

/**
 * Asserts the DOM of expected workbench layout.
 *
 * Note: To pierce the shadow DOM and use the `:scope` selector, we use `Element.querySelector` instead of `DebugElement.query(By.css(...))`, i.e., to access the light DOM of sci-viewport.
 */
function assertWorkbenchLayoutDOM(expected: ExpectedWorkbenchLayout, actualElement: Element): void {
  // Assert the activity layout.
  if (expected.activityLayout) {
    assertActivityToolbarsDOM(expected.activityLayout, actualElement);
    assertActivityPanelsDOM(expected.activityLayout, actualElement);
  }
  // Assert activity grids.
  for (const [activityId, grid] of Object.entries(WorkbenchLayouts.pickActivityGrids(expected.grids))) {
    assertGridElementDOM(grid.root, actualElement.querySelector(`wb-layout wb-activity-panel wb-grid[data-grid="${activityId}"] > wb-grid-element`), expected);
  }
  // Assert the main grid plus the main area grid if expected.
  if (expected.grids?.main) {
    assertGridElementDOM(expected.grids.main.root, actualElement.querySelector('wb-layout wb-grid[data-grid="main"] > wb-grid-element'), expected);
  }
  // Assert only the main area grid, but not the main grid since not expected.
  else if (expected.grids?.mainArea) {
    assertGridElementDOM(expected.grids.mainArea.root, actualElement.querySelector('wb-layout wb-grid[data-grid="main"] wb-part[data-partid="part.main-area"] > wb-grid[data-grid="main-area"] > wb-grid-element'), expected);
  }
}

function assertActivityToolbarsDOM(expectedActivityLayout: Partial<MActivityLayout>, actualElement: Element): void {
  if (expectedActivityLayout.toolbars?.leftTop) {
    assertActivityStackDOM(expectedActivityLayout.toolbars.leftTop, actualElement.querySelector('wb-layout > wb-activity-bar[data-align="left"] > wb-activity-stack[data-docking-area="left-top"]'), 'left-top');
  }
  if (expectedActivityLayout.toolbars?.leftBottom) {
    assertActivityStackDOM(expectedActivityLayout.toolbars.leftBottom, actualElement.querySelector('wb-layout > wb-activity-bar[data-align="left"] > wb-activity-stack[data-docking-area="left-bottom"]'), 'left-bottom');
  }
  if (expectedActivityLayout.toolbars?.rightTop) {
    assertActivityStackDOM(expectedActivityLayout.toolbars.rightTop, actualElement.querySelector('wb-layout > wb-activity-bar[data-align="right"] > wb-activity-stack[data-docking-area="right-top"]'), 'right-top');
  }
  if (expectedActivityLayout.toolbars?.rightBottom) {
    assertActivityStackDOM(expectedActivityLayout.toolbars.rightBottom, actualElement.querySelector('wb-layout > wb-activity-bar[data-align="right"] > wb-activity-stack[data-docking-area="right-bottom"]'), 'right-bottom');
  }
  if (expectedActivityLayout.toolbars?.bottomLeft) {
    assertActivityStackDOM(expectedActivityLayout.toolbars.bottomLeft, actualElement.querySelector('wb-layout > wb-activity-bar[data-align="left"] > wb-activity-stack[data-docking-area="bottom-left"]'), 'bottom-left');
  }
  if (expectedActivityLayout.toolbars?.bottomRight) {
    assertActivityStackDOM(expectedActivityLayout.toolbars.bottomRight, actualElement.querySelector('wb-layout > wb-activity-bar[data-align="right"] > wb-activity-stack[data-docking-area="bottom-right"]'), 'bottom-right');
  }
}

function assertActivityStackDOM(expectedStack: MActivityStack, actualElement: Element | null, dockingArea: 'left-top' | 'left-bottom' | 'right-top' | 'right-bottom' | 'bottom-left' | 'bottom-right'): void {
  if (expectedStack.activities.length === 0) {
    actualElement && throwError(`[DOMAssertError] Expected activity stack to not have activities, but it has. [dockingArea=${dockingArea}]`);
    return;
  }

  if (!actualElement) {
    throw Error(`[DOMAssertError] Expected activity stack to be present, but is not. [stack=${dockingArea}]`);
  }

  for (const [i, activity] of expectedStack.activities.entries()) {
    const activityElement = actualElement.querySelectorAll('wb-activity-item').item(i);
    if (activityElement.getAttribute('data-activityid') !== activity.id) {
      throw Error(`[DOMAssertError] Expected activity to be present, but is not. [dockingArea=${dockingArea}, activityId=${activity.id}]`);
    }
  }
  if (expectedStack.activeActivityId === 'none') {
    const activityElement = actualElement.querySelector(`wb-activity-item[data-active]`);
    if (activityElement) {
      throw Error(`[DOMAssertError] Expected no activity to be active in group, but is. [dockingArea=${dockingArea}, activityId=${activityElement.getAttribute('data-activityid')}]`);
    }
  }
  else if (expectedStack.activeActivityId !== undefined) {
    const activityElement = actualElement.querySelector(`wb-activity-item[data-activityid="${expectedStack.activeActivityId}"][data-active]`);
    if (!activityElement) {
      throw Error(`[DOMAssertError] Expected activity to be active, but is not. [dockingArea=${dockingArea}, activityId=${expectedStack.activeActivityId}]`);
    }
  }
}

function assertActivityPanelsDOM(expectedActivityLayout: Partial<MActivityLayout>, actualElement: Element): void {
  if (expectedActivityLayout.panels?.left) {
    assertLeftActivityPanelDOM(expectedActivityLayout.panels.left, actualElement.querySelector('wb-layout wb-activity-panel[data-panel="left"]'));
  }
  if (expectedActivityLayout.panels?.right) {
    assertRightActivityPanelDOM(expectedActivityLayout.panels.right, actualElement.querySelector('wb-layout wb-activity-panel[data-panel="right"]'));
  }
  if (expectedActivityLayout.panels?.bottom) {
    assertBottomActivityPanelDOM(expectedActivityLayout.panels.bottom, actualElement.querySelector('wb-layout wb-activity-panel[data-panel="bottom"]'));
  }
}

function assertLeftActivityPanelDOM(expectedPanel: Required<MActivityLayout['panels']>['left'], actualElement: Element | null): void {
  if (expectedPanel === 'closed') {
    actualElement && throwError(`[DOMAssertError] Expected left activity panel not to be present, but it is.`);
    return;
  }

  if (!actualElement) {
    throw Error(`[DOMAssertError] Expected left activity panel to be in the DOM, but is not.`);
  }

  // Assert left activity panel width.
  const panelBoundingBox = actualElement.getBoundingClientRect();
  if (panelBoundingBox.width !== expectedPanel.width) {
    throw Error(`[DOMAssertError] Expected width of left activity panel to be ${expectedPanel.width} but was ${panelBoundingBox.width}.`);
  }

  if (expectedPanel.ratio) {
    // Assert ratio (top group height).
    const topGridBoundingbox = actualElement.querySelectorAll('wb-grid').item(0).getBoundingClientRect();
    const expectedTopGroupHeight = (panelBoundingBox.height - SASHBOX_SPLITTER_SIZE) * expectedPanel.ratio;
    if (topGridBoundingbox.height != expectedTopGroupHeight) {
      throw Error(`[DOMAssertError] Expected height of top group of left activity panel to be ${expectedTopGroupHeight} but was ${panelBoundingBox.height}.`);
    }

    // Assert ratio (bottom group height).
    const bottomGridBoundingbox = actualElement.querySelectorAll('wb-grid').item(1).getBoundingClientRect();
    const expectedBottomGroupHeight = (panelBoundingBox.height - SASHBOX_SPLITTER_SIZE) * (1 - expectedPanel.ratio);
    if (bottomGridBoundingbox.height != expectedBottomGroupHeight) {
      throw Error(`[DOMAssertError] Expected height of bottom group of left activity panel to be ${expectedBottomGroupHeight} but was ${panelBoundingBox.height}.`);
    }
  }
}

function assertRightActivityPanelDOM(expectedPanel: Required<MActivityLayout['panels']>['right'], actualElement: Element | null): void {
  if (expectedPanel === 'closed') {
    actualElement && throwError(`[DOMAssertError] Expected right activity panel not to be present, but it is.`);
    return;
  }

  if (!actualElement) {
    throw Error(`[DOMAssertError] Expected right activity panel to be in the DOM, but is not.`);
  }

  // Assert right activity panel width.
  const panelBoundingBox = actualElement.getBoundingClientRect();
  if (panelBoundingBox.width !== expectedPanel.width) {
    throw Error(`[DOMAssertError] Expected width of right activity panel to be ${expectedPanel.width} but was ${panelBoundingBox.width}.`);
  }

  if (expectedPanel.ratio) {
    // Assert ratio (top group height).
    const topGridBoundingbox = actualElement.querySelectorAll('wb-grid').item(0).getBoundingClientRect();
    const expectedTopGroupHeight = (panelBoundingBox.height - SASHBOX_SPLITTER_SIZE) * expectedPanel.ratio;
    if (topGridBoundingbox.height != expectedTopGroupHeight) {
      throw Error(`[DOMAssertError] Expected height of top group of right activity panel to be ${expectedTopGroupHeight} but was ${panelBoundingBox.height}.`);
    }

    // Assert ratio (bottom group height).
    const bottomGridBoundingbox = actualElement.querySelectorAll('wb-grid').item(1).getBoundingClientRect();
    const expectedBottomGroupHeight = (panelBoundingBox.height - SASHBOX_SPLITTER_SIZE) * (1 - expectedPanel.ratio);
    if (bottomGridBoundingbox.height != expectedBottomGroupHeight) {
      throw Error(`[DOMAssertError] Expected height of bottom group of right activity panel to be ${expectedBottomGroupHeight} but was ${panelBoundingBox.height}.`);
    }
  }
}

function assertBottomActivityPanelDOM(expectedPanel: Required<MActivityLayout['panels']>['bottom'], actualElement: Element | null): void {
  if (expectedPanel === 'closed') {
    actualElement && throwError(`[DOMAssertError] Expected bottom activity panel not to be present, but it is.`);
    return;
  }

  if (!actualElement) {
    throw Error(`[DOMAssertError] Expected bottom activity panel to be in the DOM, but is not.`);
  }

  // Assert bottom activity panel height.
  const panelBoundingBox = actualElement.getBoundingClientRect();
  if (panelBoundingBox.height !== expectedPanel.height) {
    throw Error(`[DOMAssertError] Expected height of bottom activity panel to be ${expectedPanel.height} but was ${panelBoundingBox.height}.`);
  }

  if (expectedPanel.ratio) {
    // Assert ratio (left group width).
    const leftGridBoundingbox = actualElement.querySelectorAll('wb-grid').item(0).getBoundingClientRect();
    const expectedLeftGroupWidth = (panelBoundingBox.width - SASHBOX_SPLITTER_SIZE) * expectedPanel.ratio;
    if (leftGridBoundingbox.width != expectedLeftGroupWidth) {
      throw Error(`[DOMAssertError] Expected width of left group of bottom activity panel to be ${expectedLeftGroupWidth} but was ${leftGridBoundingbox.width}.`);
    }

    // Assert ratio (right group width).
    const rightGridBoundingbox = actualElement.querySelectorAll('wb-grid').item(1).getBoundingClientRect();
    const expectedRightGroupWidth = (panelBoundingBox.width - SASHBOX_SPLITTER_SIZE) * (1 - expectedPanel.ratio);
    if (rightGridBoundingbox.width != expectedRightGroupWidth) {
      throw Error(`[DOMAssertError] Expected width of right group of bottom activity panel to be ${expectedRightGroupWidth} but was ${rightGridBoundingbox.width}.`);
    }
  }
}

/**
 * Performs a recursive assertion of the DOM structure starting with the expected grid element.
 *
 * @see assertMTreeNodeDOM
 * @see assertMPartDOM
 */
function assertGridElementDOM(expectedModelElement: MTreeNode | MPart, actualElement: Element | null, expectedWorkbenchLayout: ExpectedWorkbenchLayout): void {
  if (!actualElement) {
    throw Error(`[DOMAssertError] Expected element to be present in the DOM, but is not. [${expectedModelElement.type}=${JSON.stringify(expectedModelElement)}]`);
  }
  else if (actualElement.tagName.toLowerCase() !== 'wb-grid-element') {
    throw Error(`[DOMAssertError] Expected element to have name 'wb-grid-element', but is '${actualElement.tagName}'. [${expectedModelElement.type}=${JSON.stringify(expectedModelElement)}]`);
  }

  switch (expectedModelElement.type) {
    case 'MTreeNode': {
      assertMTreeNodeDOM(expectedModelElement, actualElement, expectedWorkbenchLayout);
      break;
    }
    case 'MPart': {
      assertMPartDOM(expectedModelElement, actualElement, expectedWorkbenchLayout);
      break;
    }
  }
}

/**
 * Performs a recursive assertion of the DOM structure starting with the expected tree node.
 */
function assertMTreeNodeDOM(expectedTreeNode: MTreeNode, actualElement: Element, expectedWorkbenchLayout: ExpectedWorkbenchLayout): void {
  const nodeId = actualElement.getAttribute('data-nodeid');
  if (!nodeId) {
    throw Error(`[DOMAssertError] Expected element 'wb-grid-element' to have attribute 'data-nodeid', but is missing. [MTreeNode=${JSON.stringify(expectedTreeNode)}]`);
  }

  const actualTreeNode: MTreeNode = TestBed.inject(WorkbenchLayoutService).layout().treeNode({nodeId});
  const child1Visible = actualTreeNode.child1.visible;
  const child2Visible = actualTreeNode.child2.visible;

  // Assert sashbox.
  if (child1Visible && child2Visible) {
    const sashboxElement = actualElement.querySelector(`sci-sashbox[data-nodeid="${nodeId}"]`);
    if (!sashboxElement) {
      throw Error(`[DOMAssertError]: Expected element 'sci-sashbox[data-nodeid="${nodeId}"]' to be in the DOM, but is not. [MTreeNode=${JSON.stringify(expectedTreeNode)}]`);
    }
    actualElement = sashboxElement;
  }
  else {
    if (actualElement.querySelector(`sci-sashbox[data-nodeid="${nodeId}"]`)) {
      throw Error(`[DOMAssertError]: Expected element 'wb-grid-element' not to contain a 'sci-sashbox' because having a single visible child. [MTreeNode=${JSON.stringify(expectedTreeNode)}]`);
    }
  }

  // Assert sash of child 1.
  if (child1Visible) {
    const actualChild1Element = actualElement.querySelector(`wb-grid-element[data-parentnodeid="${nodeId}"].sash-1`);
    if (!actualChild1Element) {
      throw Error(`[DOMAssertError]: Expected element 'wb-grid-element[data-parentnodeid="${nodeId}"].sash-1' to be in the DOM, but is not. [${expectedTreeNode.child1.type}=${JSON.stringify(expectedTreeNode.child1)}]`);
    }
    assertGridElementDOM(expectedTreeNode.child1, actualChild1Element, expectedWorkbenchLayout);
  }

  // Assert sash of child 2.
  if (child2Visible) {
    const actualChild2Element = actualElement.querySelector(`wb-grid-element[data-parentnodeid="${nodeId}"].sash-2`);
    if (!actualChild2Element) {
      throw Error(`[DOMAssertError]: Expected element 'wb-grid-element[data-parentnodeid="${nodeId}"].sash-2' to be in the DOM, but is not. [${expectedTreeNode.child2.type}=${JSON.stringify(expectedTreeNode.child2)}]`);
    }
    assertGridElementDOM(expectedTreeNode.child2, actualChild2Element, expectedWorkbenchLayout);
  }
}

/**
 * Performs a recursive assertion of the DOM structure starting with the expected part.
 */
function assertMPartDOM(expectedPart: Partial<MPart>, actualElement: Element, expectedWorkbenchLayout: ExpectedWorkbenchLayout): void {
  const partId = actualElement.getAttribute('data-partid');
  if (partId !== expectedPart.id) {
    throw Error(`[DOMAssertError] Expected element 'wb-grid-element' to have attribute '[data-partid="${expectedPart.id}"]', but is '[data-partid="${partId}"]'. [MPart=${JSON.stringify(expectedPart)}]`);
  }

  if (partId === MAIN_AREA) {
    const actualPartElement = actualElement.querySelector('wb-part[data-partid="part.main-area"]');
    if (!actualPartElement) {
      throw Error(`[DOMAssertError]: Expected element 'wb-part[data-partid="part.main-area"]' to be in the DOM, but is not. [MPart=${JSON.stringify(expectedPart)}]`);
    }
    if (expectedWorkbenchLayout.grids?.mainArea) {
      assertGridElementDOM(expectedWorkbenchLayout.grids.mainArea.root, actualPartElement.querySelector(':scope > wb-grid[data-grid="main-area"] > wb-grid-element'), expectedWorkbenchLayout);
    }
    return;
  }

  // Assert part
  const actualPartElement = actualElement.querySelector(`wb-part[data-partid="${partId}"]`);
  if (!actualPartElement) {
    throw Error(`[DOMAssertError]: Expected element 'wb-part[data-partid="${partId}"]' to be in the DOM, but is not. [MPart=${JSON.stringify(expectedPart)}]`);
  }

  // Assert active view and view tab
  if (expectedPart.activeViewId) {
    const actualActiveViewDebugElement = actualPartElement.querySelector(`wb-view-slot[data-viewid="${expectedPart.activeViewId}"]`);
    if (!actualActiveViewDebugElement) {
      throw Error(`[DOMAssertError]: Expected element 'wb-view-slot[data-viewid="${expectedPart.activeViewId}"]' to be in the DOM, but is not. [MPart=${JSON.stringify(expectedPart)}]`);
    }

    if (!actualPartElement.querySelector(`wb-part-bar wb-view-tab[data-viewid="${expectedPart.activeViewId}"][data-active]`)) {
      throw Error(`[DOMAssertError]: Expected view tab 'wb-view-slot[data-viewid="${expectedPart.activeViewId}"]' to be active, but is not. [MPart=${JSON.stringify(expectedPart)}]`);
    }
  }

  // Assert views
  if (expectedPart.views) {
    const expectedViewIds = expectedPart.views.map(view => view.id);
    const actualViewIds = new Array<string>();
    const viewTabElements = actualPartElement.querySelectorAll('wb-part-bar wb-view-tab');
    viewTabElements.forEach(viewTabElement => actualViewIds.push(viewTabElement.getAttribute('data-viewid')!));
    if (!Objects.isEqual(actualViewIds, expectedViewIds)) {
      throw Error(`[DOMAssertError] Expected part '${partId}' to have views [${[...expectedViewIds]}], but has views [${[...actualViewIds]}]. [MPart=${JSON.stringify(expectedPart)}]`);
    }
  }
}

/**
 * Like {@link jasmine.ObjectContaining}, but applies {@link jasmine.ObjectContaining} recursively to all fields.
 */
function objectContainingRecursive<T>(object: T): ObjectContaining<T> | T {
  if (Array.isArray(object)) {
    return object.map(objectContainingRecursive) as T;
  }
  else if (object === ANYTHING) {
    return jasmine.anything();
  }
  else if (typeof object === 'object' && object !== null) {
    const workingCopy = {...object};
    Objects.entries(workingCopy).forEach(([key, value]) => {
      workingCopy[key] = objectContainingRecursive(value) as typeof value;
    });
    return jasmine.objectContaining(workingCopy);
  }
  return object;
}

/**
 * Delegates to the Jasmine `toEqual` matcher to be used in custom matchers.
 */
function toEqual(actual: any, expected: any, util: MatchersUtil, expectationFailOutput?: string): CustomMatcherResult {
  const toEqualMatcher = (jasmine as any).matchers.toEqual(util) as CustomMatcher; // eslint-disable-line @typescript-eslint/no-unsafe-member-access
  const result = toEqualMatcher.compare(actual, expected);
  if (!result.pass && expectationFailOutput) {
    result.message = `${result.message} [${expectationFailOutput}]`;
  }

  return result;
}

/**
 * Expected layout used in {@link #toEqualWorkbenchLayout}.
 */
export interface ExpectedWorkbenchLayout {
  /**
   * Asserts the specified activity layout, if set.
   */
  activityLayout?: Partial<MActivityLayout>;
  /**
   * Asserts the specified grids.
   */
  grids?: ExpectedWorkbenchGrids;
  /**
   * Asserts the layout to belong to specified perspective, if set.
   */
  perspectiveId?: string | undefined;
  /**
   * Asserts specified navigation states, if set.
   */
  navigationStates?: NavigationStates;
  /**
   * Asserts specified view outlets, if set.
   */
  outlets?: Outlets;
}

interface ExpectedWorkbenchGrids {
  /**
   * Asserts the specified main grid. If not set, does not assert the main grid.
   */
  main?: MPartGrid;
  /**
   * Asserts the specified main area grid. If not set, does not assert the main area grid.
   */
  mainArea?: MPartGrid;

  /**
   * Asserts the specified activity grids. If not set, does not assert the activity grids.
   */
  [activityId: ActivityId]: MPartGrid;
}

export type MActivityLayout = Omit<_MActivityLayout, 'toolbars' | 'panels'> & {
  toolbars: {
    leftTop?: MActivityStack;
    leftBottom?: MActivityStack;
    rightTop?: MActivityStack;
    rightBottom?: MActivityStack;
    bottomLeft?: MActivityStack;
    bottomRight?: MActivityStack;
  };
  panels: {
    left?: {
      width: number;
      ratio?: number;
    } | 'closed';
    right?: {
      width: number;
      ratio?: number;
    } | 'closed';
    bottom?: {
      height: number;
      ratio?: number;
    } | 'closed';
  };
};

export type MActivityStack = Omit<_MActivityStack, 'activities' | 'activeActivityId' | 'minimizedActivityId'> & {
  activities: Array<Partial<MActivity>>;
  activeActivityId?: ActivityId | 'none';
  minimizedActivityId?: ActivityId | 'none';
};

export type MActivity = Partial<_MActivity>;

/**
 * `MPartGrid` that can be used as expectation in {@link CustomMatchers#toEqualWorkbenchLayout}.
 */
export type MPartGrid = Partial<Omit<_MPartGrid, 'root'>> & {root: MTreeNode | MPart};

/**
 * `MView` that can be used as expectation in {@link CustomMatchers#toEqualWorkbenchLayout}.
 */
export type MView = Partial<Omit<_MView, 'navigation'> & {navigation?: Partial<_MView['navigation']>}>;

/**
 * `MTreeNode` that can be used as expectation in {@link CustomMatchers#toEqualWorkbenchLayout}.
 */
export class MTreeNode extends _MTreeNode {
  constructor(treeNode: Partial<Omit<_MTreeNode, 'type'>>) {
    super(treeNode as _MTreeNode);
    // If `useDefineForClassFields` TypeScript flag is enabled, all class members that are not explicitly set will be initialised to `undefined`.
    // In test expectations, only the explicitly set properties should be asserted. Therefore, `undefined` properties are deleted.
    prune(this);
  }
}

/**
 * `MPart` that can be used as expectation in {@link CustomMatchers#toEqualWorkbenchLayout}.
 */
export class MPart extends _MPart {
  constructor(part: Partial<Omit<_MPart, 'type' | 'views'> & {views: Array<Partial<MView>>}>) {
    super(part as _MPart);
    // If `useDefineForClassFields` TypeScript flag is enabled, all class members that are not explicitly set will be initialised to `undefined`.
    // In test expectations, only the explicitly set properties should be asserted. Therefore, `undefined` properties are deleted.
    prune(this);
  }
}

/**
 * Size of the splitter of sash boxes.
 */
const SASHBOX_SPLITTER_SIZE = 1;

/**
 * Constant used by the {@link #any} matcher to identify properties matching any value except `null` and `undefined`.
 */
const ANYTHING = {};

/**
 * Use in {@link CustomMatchers.toEqualWorkbenchLayout} to match any value not `null` and `undefined` for a layout property.
 *
 * We cannot use {@link jasmine.anything} matcher because the expected layout is also used to assert the layout representation in the DOM.
 */
export function any<T>(): T {
  return ANYTHING as T;
}
