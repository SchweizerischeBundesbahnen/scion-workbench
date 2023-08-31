/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
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
import {WorkbenchLayoutComponent} from '../../../layout/workbench-layout.component';
import {MPart, MPartGrid, MTreeNode} from '../../../layout/workbench-layout.model';
import {isGridElementVisible, ɵWorkbenchLayout} from '../../../layout/ɵworkbench-layout';
import {MAIN_AREA} from '../../../layout/workbench-layout';
import {ComponentFixture} from '@angular/core/testing';
import {Arrays} from '@scion/toolkit/util';

/**
 * Provides the implementation of {@link CustomMatchers#toEqualWorkbenchLayout}.
 */
export const toEqualWorkbenchLayoutCustomMatcher: jasmine.CustomMatcherFactories = {
  toEqualWorkbenchLayout: (util: MatchersUtil): CustomMatcher => {
    return {
      compare(actual: ɵWorkbenchLayout | ComponentFixture<WorkbenchLayoutComponent> | DebugElement, expected: ExpectedWorkbenchLayout, failOutput: string | undefined): CustomMatcherResult {
        try {
          assertWorkbenchLayout(expected, actual, util);
          return pass();
        }
        catch (error: unknown) {
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

function assertWorkbenchLayout(expected: ExpectedWorkbenchLayout, actual: ɵWorkbenchLayout | ComponentFixture<WorkbenchLayoutComponent> | DebugElement, util: MatchersUtil): void {
  if (actual instanceof ɵWorkbenchLayout) {
    expected.workbenchGrid && assertPartGridModel(expected.workbenchGrid, actual.workbenchGrid, util);
    expected.mainAreaGrid && assertPartGridModel(expected.mainAreaGrid, actual.mainAreaGrid, util);
  }
  else if ((actual instanceof ComponentFixture || actual instanceof DebugElement) && actual.componentInstance instanceof WorkbenchLayoutComponent) {
    const actualDebugElement = actual instanceof ComponentFixture ? actual.debugElement : actual;
    const workbenchLayoutComponent: WorkbenchLayoutComponent = actualDebugElement.componentInstance;
    expected.workbenchGrid && assertPartGridModel(expected.workbenchGrid, workbenchLayoutComponent.layout!.workbenchGrid, util);
    expected.mainAreaGrid && assertPartGridModel(expected.mainAreaGrid, workbenchLayoutComponent.layout!.mainAreaGrid, util);
    assertWorkbenchLayoutDOM(expected, actualDebugElement.nativeElement);
  }
  else {
    throw Error(`Expected testee to be of type 'ɵWorkbenchLayout' or 'DebugElement<WorkbenchLayoutComponent>' [actual=${actual.constructor.name}]`);
  }
}

/**
 * Asserts the actual model to equal the expected model. Only properties declared on the expected object are asserted.
 */
function assertPartGridModel(expectedLayout: Partial<MPartGrid>, actualLayout: MPartGrid | null, util: MatchersUtil): void {
  const result = toEqual(actualLayout, objectContainingRecursive(expectedLayout), util);
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
  // Assert the workbench grid plus the main area grid if expected.
  if (expected.workbenchGrid) {
    assertGridElementDOM(expected.workbenchGrid.root, actualElement.querySelector(':scope > wb-grid-element:not([data-parentnodeid])'), expected);
  }
  // Assert only the main area grid, but not the workbench grid since not expected.
  else if (expected.mainAreaGrid) {
    assertGridElementDOM(expected.mainAreaGrid.root, actualElement.querySelector(`wb-main-area-layout[data-partid="${MAIN_AREA}"] > wb-grid-element`), expected);
  }
}

/**
 * Performs a recursive assertion of the DOM structure starting with the expected grid element.
 *
 * @see assertMTreeNodeDOM
 * @see assertMPartDOM
 */
function assertGridElementDOM(expectedModelElement: Partial<MTreeNode | MPart>, actualElement: Element | null, expectedWorkbenchLayout: ExpectedWorkbenchLayout): void {
  if (!actualElement) {
    throw Error(`[DOMAssertError] Expected element to be present in the DOM, but is not. [${expectedModelElement.type}=${JSON.stringify(expectedModelElement)}]`);
  }
  else if (actualElement.tagName.toLowerCase() !== 'wb-grid-element') {
    throw Error(`[DOMAssertError] Expected element to have name 'wb-grid-element', but is '${actualElement.tagName}'. [${expectedModelElement.type}=${JSON.stringify(expectedModelElement)}]`);
  }
  else if (expectedModelElement.type === 'MTreeNode') {
    assertMTreeNodeDOM(expectedModelElement, actualElement, expectedWorkbenchLayout);
  }
  else if (expectedModelElement.type === 'MPart') {
    assertMPartDOM(expectedModelElement, actualElement, expectedWorkbenchLayout);
  }
  else {
    throw Error(`[CustomMatcherError] Unsupported expected value. The matcher 'toEqualWorkbenchLayout' expects a 'MTreeNode' or 'MPart' as the expected value, but is ${JSON.stringify(expectedModelElement)}`);
  }
}

/**
 * Performs a recursive assertion of the DOM structure starting with the expected tree node.
 */
function assertMTreeNodeDOM(expectedTreeNode: Partial<MTreeNode>, actualElement: Element, expectedWorkbenchLayout: ExpectedWorkbenchLayout): void {
  const nodeId = actualElement.getAttribute('data-nodeid');
  if (!nodeId) {
    throw Error(`[DOMAssertError] Expected element 'wb-grid-element' to have attribute 'data-nodeid', but is missing. [MTreeNode=${JSON.stringify(expectedTreeNode)}]`);
  }

  const child1Visible = isGridElementVisible(expectedTreeNode.child1!);
  const child2Visible = isGridElementVisible(expectedTreeNode.child2!);

  // Assert sashbox.
  if (child1Visible && child2Visible) {
    actualElement = actualElement.querySelector(`sci-sashbox[data-nodeid="${nodeId}"]`)!;
    if (!actualElement) {
      throw Error(`[DOMAssertError]: Expected element 'sci-sashbox[data-nodeid="${nodeId}"]' to be in the DOM, but is not. [MTreeNode=${JSON.stringify(expectedTreeNode)}]`);
    }
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
      throw Error(`[DOMAssertError]: Expected element 'wb-grid-element[data-parentnodeid="${nodeId}"].sash-1' to be in the DOM, but is not. [${expectedTreeNode.child1!.type}=${JSON.stringify(expectedTreeNode.child1)}]`);
    }
    assertGridElementDOM(expectedTreeNode.child1!, actualChild1Element, expectedWorkbenchLayout);
  }

  // Assert sash of child 2.
  if (child2Visible) {
    const actualChild2Element = actualElement.querySelector(`wb-grid-element[data-parentnodeid="${nodeId}"].sash-2`);
    if (!actualChild2Element) {
      throw Error(`[DOMAssertError]: Expected element 'wb-grid-element[data-parentnodeid="${nodeId}"].sash-2' to be in the DOM, but is not. [${expectedTreeNode.child2!.type}=${JSON.stringify(expectedTreeNode.child2)}]`);
    }
    assertGridElementDOM(expectedTreeNode.child2!, actualChild2Element, expectedWorkbenchLayout);
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
    const actualPartElement = actualElement.querySelector(`wb-main-area-layout[data-partid="${partId}"]`);
    if (!actualPartElement) {
      throw Error(`[DOMAssertError]: Expected element 'wb-main-area-layout[data-partid="${partId}"]' to be in the DOM, but is not. [MPart=${JSON.stringify(expectedPart)}]`);
    }
    if (expectedWorkbenchLayout.mainAreaGrid) {
      assertGridElementDOM(expectedWorkbenchLayout.mainAreaGrid.root, actualPartElement.querySelector(`:scope > wb-grid-element`), expectedWorkbenchLayout);
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
  else if (typeof object === 'object' && object !== null) {
    const workingCopy = {...object} as Record<string, any>;
    Object.entries(workingCopy).forEach(([key, value]) => {
      workingCopy[key] = objectContainingRecursive(value);
    });
    return jasmine.objectContaining<T>(workingCopy);
  }
  return object;
}

/**
 * Delegates to the Jasmine `toEqual` matcher to be used in custom matchers.
 */
function toEqual(actual: any, expected: any, util: MatchersUtil, expectationFailOutput?: string): CustomMatcherResult {
  const toEqualMatcher: CustomMatcher = (jasmine as any).matchers.toEqual(util);
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
   * Specifies the expected workbench grid. If not set, does not assert the workbench grid.
   */
  workbenchGrid?: Partial<MPartGrid> & {root: MTreeNode | MPart};
  /**
   * Specifies the expected main area grid. If not set, does not assert the main area grid.
   */
  mainAreaGrid?: Partial<MPartGrid> & {root: MTreeNode | MPart};
}
