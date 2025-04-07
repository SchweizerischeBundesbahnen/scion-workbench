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
import {MPart as _MPart, MPartGrid as _MPartGrid, MTreeNode as _MTreeNode, MView as _MView} from '../../../layout/workbench-layout.model';
import {WorkbenchLayouts} from '../../../layout/workbench-layouts.util';
import {ɵWorkbenchLayout} from '../../../layout/ɵworkbench-layout';
import {MAIN_AREA} from '../../../layout/workbench-layout';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Arrays} from '@scion/toolkit/util';
import {By} from '@angular/platform-browser';
import {NavigationStates, Outlets} from '../../../routing/routing.model';
import {WorkbenchLayoutService} from '../../../layout/workbench-layout.service';
import {Objects} from '../../../common/objects.util';
import {WorkbenchComponent} from '../../../workbench.component';
import {ActivityId, MActivity as _MActivity, MActivityGroup as _MActivityGroup, MActivityLayout as _MActivityLayout} from '../../../activity/workbench-activity.model';
import {noneIfUndefined} from '../../testing.util';

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
          assertWorkbenchLayoutModel(expected, TestBed.inject(WorkbenchLayoutService).layout()!, util);
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
  const actualLayout: ExpectedWorkbenchLayout = {
    perspectiveId: actual.perspectiveId,
    activityLayout: {
      ...actual.activityLayout,
      toolbars: {
        leftTop: noneIfUndefined(actual.activityLayout.toolbars.leftTop, 'activeActivityId', 'minimizedActivityId'),
        leftBottom: noneIfUndefined(actual.activityLayout.toolbars.leftBottom, 'activeActivityId', 'minimizedActivityId'),
        rightTop: noneIfUndefined(actual.activityLayout.toolbars.rightTop, 'activeActivityId', 'minimizedActivityId'),
        rightBottom: noneIfUndefined(actual.activityLayout.toolbars.rightBottom, 'activeActivityId', 'minimizedActivityId'),
        bottomLeft: noneIfUndefined(actual.activityLayout.toolbars.bottomLeft, 'activeActivityId', 'minimizedActivityId'),
        bottomRight: noneIfUndefined(actual.activityLayout.toolbars.bottomRight, 'activeActivityId', 'minimizedActivityId'),
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
    assertActivityLayoutDOM(expected.activityLayout, actualElement);
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

function assertActivityLayoutDOM(expectedActivityLayout: Partial<MActivityLayout>, actualElement: Element): void {
  assertActivityToolbarsDOM(expectedActivityLayout, actualElement);
  assertActivityPanelsDOM(expectedActivityLayout, actualElement);
}

function assertActivityToolbarsDOM(expectedActivityLayout: Partial<MActivityLayout>, actualElement: Element): void {
  if (expectedActivityLayout.toolbars?.leftTop) {
    assertActivityGroupDOM(expectedActivityLayout.toolbars.leftTop, actualElement.querySelector('wb-layout > wb-activity-bar[data-align="left"] > wb-activity-group[data-group="left-top"]'), 'left-top');
  }
  if (expectedActivityLayout.toolbars?.leftBottom) {
    assertActivityGroupDOM(expectedActivityLayout.toolbars.leftBottom, actualElement.querySelector('wb-layout > wb-activity-bar[data-align="left"] > wb-activity-group[data-group="left-bottom"]'), 'left-bottom');
  }
  if (expectedActivityLayout.toolbars?.rightTop) {
    assertActivityGroupDOM(expectedActivityLayout.toolbars.rightTop, actualElement.querySelector('wb-layout > wb-activity-bar[data-align="right"] > wb-activity-group[data-group="right-top"]'), 'right-top');
  }
  if (expectedActivityLayout.toolbars?.rightBottom) {
    assertActivityGroupDOM(expectedActivityLayout.toolbars.rightBottom, actualElement.querySelector('wb-layout > wb-activity-bar[data-align="right"] > wb-activity-group[data-group="right-bottom"]'), 'right-bottom');
  }
  if (expectedActivityLayout.toolbars?.bottomLeft) {
    assertActivityGroupDOM(expectedActivityLayout.toolbars.bottomLeft, actualElement.querySelector('wb-layout > wb-activity-bar[data-align="left"] > wb-activity-group[data-group="bottom-left"]'), 'bottom-left');
  }
  if (expectedActivityLayout.toolbars?.bottomRight) {
    assertActivityGroupDOM(expectedActivityLayout.toolbars.bottomRight, actualElement.querySelector('wb-layout > wb-activity-bar[data-align="right"] > wb-activity-group[data-group="bottom-right"]'), 'bottom-right');
  }
}

function assertActivityGroupDOM(expectedGroup: MActivityGroup, actualElement: Element | null, group: 'left-top' | 'left-bottom' | 'right-top' | 'right-bottom' | 'bottom-left' | 'bottom-right'): void {
  if (!actualElement) {
    throw Error(`[DOMAssertError] Expected activity group element to be present in the DOM, but is not. [group=${group}]`);
  }
  if (expectedGroup.activities.length === 0) {
    const activity = actualElement.querySelector('wb-activity-item');
    if (activity) {
      throw Error(`[DOMAssertError] Expected activity group to not have activities, but it has. [element=${actualElement}]`);
    }
  }
  for (const [i, activity] of expectedGroup.activities.entries()) {
    const activityElement = actualElement.querySelectorAll('wb-activity-item').item(i);
    if (activityElement.getAttribute('data-activityid') !== activity.id) {
      throw Error(`[DOMAssertError] Expected activity to be present, but is not. [group=${group}, activityId=${activity.id}]`);
    }
  }
  if (expectedGroup.activeActivityId === 'none') {
    const activityElement = actualElement.querySelector(`wb-activity-item.active`);
    if (activityElement) {
      throw Error(`[DOMAssertError] Expected no activity to be active in group, but is. [group=${group}, activityId=${activityElement.getAttribute('data-activityid')}]`);
    }
  }
  else if (expectedGroup.activeActivityId !== undefined) {
    const activityElement = actualElement.querySelector(`wb-activity-item[data-activityid="${expectedGroup.activeActivityId}"].active`);
    if (!activityElement) {
      throw Error(`[DOMAssertError] Expected activity to be active, but is not. [group=${group}, activityId=${expectedGroup.activeActivityId}]`);
    }
  }
}

function assertActivityPanelsDOM(expectedActivityLayout: Partial<MActivityLayout>, actualElement: Element): void {
  assertLeftActivityPanelDOM(expectedActivityLayout.panels?.left, actualElement.querySelector('wb-layout wb-activity-panel[data-panel="left"]'));
  assertRightActivityPanelDOM(expectedActivityLayout.panels?.right, actualElement.querySelector('wb-layout wb-activity-panel[data-panel="right"]'));
  assertBottomActivityPanelDOM(expectedActivityLayout.panels?.bottom, actualElement.querySelector('wb-layout wb-activity-panel[data-panel="bottom"]'));
}

function assertLeftActivityPanelDOM(expectedPanel: {width: number; ratio?: number} | undefined, actualElement: Element | null): void {
  if (!expectedPanel) {
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

function assertRightActivityPanelDOM(expectedPanel: {width: number; ratio?: number} | undefined, actualElement: Element | null): void {
  if (!expectedPanel) {
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

function assertBottomActivityPanelDOM(expectedPanel: {height: number; ratio?: number} | undefined, actualElement: Element | null): void {
  if (!expectedPanel) {
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

  const child1Visible = WorkbenchLayouts.isGridElementVisible(expectedTreeNode.child1);
  const child2Visible = WorkbenchLayouts.isGridElementVisible(expectedTreeNode.child2);

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
    const actualActiveViewDebugElement = actualPartElement.querySelector(`wb-view[data-viewid="${expectedPart.activeViewId}"]`);
    if (!actualActiveViewDebugElement) {
      throw Error(`[DOMAssertError]: Expected element 'wb-view[data-viewid="${expectedPart.activeViewId}"]' to be in the DOM, but is not. [MPart=${JSON.stringify(expectedPart)}]`);
    }

    if (!actualPartElement.querySelector(`wb-part-bar wb-view-tab[data-viewid="${expectedPart.activeViewId}"].active`)) {
      throw Error(`[DOMAssertError]: Expected view tab 'wb-view[data-viewid="${expectedPart.activeViewId}"]' to be active, but is not. [MPart=${JSON.stringify(expectedPart)}]`);
    }
  }

  // Assert views
  if (expectedPart.views) {
    const expectedViewIds = expectedPart.views.map(view => view.id);
    const actualViewIds = new Array<string>();
    const viewTabElements = actualPartElement.querySelectorAll('wb-part-bar wb-view-tab');
    viewTabElements.forEach(viewTabElement => actualViewIds.push(viewTabElement.getAttribute('data-viewid')!));
    if (!Arrays.isEqual(actualViewIds, expectedViewIds, {exactOrder: true})) {
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
    leftTop?: MActivityGroup;
    leftBottom?: MActivityGroup;
    rightTop?: MActivityGroup;
    rightBottom?: MActivityGroup;
    bottomLeft?: MActivityGroup;
    bottomRight?: MActivityGroup;
  };
  panels: {
    left?: {
      width: number;
      ratio?: number;
    };
    right?: {
      width: number;
      ratio?: number;
    };
    bottom?: {
      height: number;
      ratio?: number;
    };
  };
};

export type MActivityGroup = Omit<_MActivityGroup, 'activities' | 'activeActivityId' | 'minimizedActivityId'> & {
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
    Object.keys(this).forEach(key => {
      if (this[key as keyof this] === undefined) {
        delete this[key as keyof this]; // eslint-disable-line @typescript-eslint/no-dynamic-delete
      }
    });
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
    Object.keys(this).forEach(key => {
      if (this[key as keyof this] === undefined) {
        delete this[key as keyof this]; // eslint-disable-line @typescript-eslint/no-dynamic-delete
      }
    });
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
