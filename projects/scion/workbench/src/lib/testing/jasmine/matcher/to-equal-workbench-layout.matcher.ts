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
import {By} from '@angular/platform-browser';
import {WorkbenchLayoutComponent} from '../../../layout/workbench-layout.component';
import {MPart, MPartGrid, MTreeNode} from '../../../layout/workbench-layout.model';
import {isGridElementVisible, ɵWorkbenchLayout} from '../../../layout/ɵworkbench-layout';
import {ExpectedWorkbenchLayout, toEqual} from './custom-matchers.definition';
import {MAIN_AREA_PART_ID} from '../../../layout/workbench-layout';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {WORKBENCH_LAYOUT_INITIAL_PART_ID} from '../../../layout/workbench-layout-factory.service';

/**
 * Provides the implementation of {@link CustomMatchers#toEqualWorkbenchLayout}.
 */
export const toEqualWorkbenchLayoutCustomMatcher: jasmine.CustomMatcherFactories = {
  toEqualWorkbenchLayout: (util: MatchersUtil): CustomMatcher => {
    return {
      compare(actual: ɵWorkbenchLayout | ComponentFixture<WorkbenchLayoutComponent> | DebugElement, expected: ExpectedWorkbenchLayout, failOutput: string | undefined): CustomMatcherResult {
        expected.peripheralGrid ??= {root: new MPart({id: MAIN_AREA_PART_ID})};
        expected.mainGrid ??= {root: new MPart({id: TestBed.inject(WORKBENCH_LAYOUT_INITIAL_PART_ID)})};

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
    assertPartGridModel(expected.peripheralGrid!, actual.peripheralGrid, util);
    assertPartGridModel(expected.mainGrid!, actual.mainGrid, util);
  }
  else if ((actual instanceof ComponentFixture || actual instanceof DebugElement) && actual.componentInstance instanceof WorkbenchLayoutComponent) {
    const actualDebugElement = actual instanceof ComponentFixture ? actual.debugElement : actual;
    assertPartGridModel(expected.peripheralGrid!, actualDebugElement.componentInstance.layout.peripheralGrid, util);
    assertPartGridModel(expected.mainGrid!, actualDebugElement.componentInstance.layout.mainGrid, util);
    assertGridElementDOM(expected.peripheralGrid!.root, actualDebugElement.query(By.css('wb-grid-element')), expected);
  }
  else {
    throw Error(`Expected testee to be of type 'ɵWorkbenchLayout' or 'DebugElement<WorkbenchLayoutComponent>' [actual=${actual.constructor.name}]`);
  }
}

/**
 * Asserts the actual model to equal the expected model. Only properties declared on the expected object are asserted.
 */
function assertPartGridModel(expectedLayout: Partial<MPartGrid>, actualLayout: MPartGrid, util: MatchersUtil): void {
  const result = toEqual(actualLayout, objectContainingRecursive(expectedLayout), util);
  if (!result.pass) {
    throw Error(result.message);
  }
}

/**
 * Performs a recursive assertion of the DOM structure starting with the expected grid element.
 *
 * @see assertMTreeNodeDOM
 * @see assertMPartDOM
 */
function assertGridElementDOM(expectedModelElement: Partial<MTreeNode | MPart>, actualDom: DebugElement, expectedWorkbenchLayout: ExpectedWorkbenchLayout): void {
  if (actualDom.name !== 'wb-grid-element') {
    throw Error(`[DOMAssertError] Expected element to have name 'wb-grid-element', but was '${actualDom.name}'. [${expectedModelElement.type}=${JSON.stringify(expectedModelElement)}]`);
  }
  else if (expectedModelElement.type === 'MTreeNode') {
    assertMTreeNodeDOM(expectedModelElement, actualDom, expectedWorkbenchLayout);
  }
  else if (expectedModelElement.type === 'MPart') {
    assertMPartDOM(expectedModelElement, actualDom, expectedWorkbenchLayout);
  }
  else {
    throw Error(`[CustomMatcherError] Unsupported expected value. The matcher 'toEqualWorkbenchLayout' expects a 'MTreeNode' or 'MPart' as the expected value, but was ${JSON.stringify(expectedModelElement)}`);
  }
}

/**
 * Performs a recursive assertion of the DOM structure starting with the expected tree node.
 */
function assertMTreeNodeDOM(expectedTreeNode: Partial<MTreeNode>, actualDom: DebugElement, expectedWorkbenchLayout: ExpectedWorkbenchLayout): void {
  const nodeId = actualDom.attributes['data-nodeid'];
  if (!nodeId) {
    throw Error(`[DOMAssertError] Expected element 'wb-grid-element' to have attribute 'data-nodeid', but is missing. [MTreeNode=${JSON.stringify(expectedTreeNode)}]`);
  }

  const child1Visible = isGridElementVisible(expectedTreeNode.child1!);
  const child2Visible = isGridElementVisible(expectedTreeNode.child2!);

  // Assert sashbox.
  if (child1Visible && child2Visible) {
    actualDom = actualDom.query(By.css(`sci-sashbox[data-nodeid="${nodeId}"]`));
    if (!actualDom) {
      throw Error(`[DOMAssertError]: Expected element 'sci-sashbox[data-nodeid="${nodeId}"]' to be in the DOM, but is not. [MTreeNode=${JSON.stringify(expectedTreeNode)}]`);
    }
  }
  else {
    if (actualDom.query(By.css(`sci-sashbox[data-nodeid="${nodeId}"]`))) {
      throw Error(`[DOMAssertError]: Expected element 'wb-grid-element' not to contain a 'sci-sashbox' because having a single visible child. [MTreeNode=${JSON.stringify(expectedTreeNode)}]`);
    }
  }

  // Assert sash of child 1.
  if (child1Visible) {
    const actualChild1Element = actualDom.query(By.css(`wb-grid-element[data-parentnodeid="${nodeId}"].sash-1`));
    if (!actualChild1Element) {
      throw Error(`[DOMAssertError]: Expected element 'wb-grid-element[data-parentnodeid="${nodeId}"].sash-1' to be in the DOM, but is not. [${expectedTreeNode.child1!.type}=${JSON.stringify(expectedTreeNode.child1)}]`);
    }
    assertGridElementDOM(expectedTreeNode.child1!, actualChild1Element, expectedWorkbenchLayout);
  }

  // Assert sash of child 2.
  if (child2Visible) {
    const actualChild2Element = actualDom.query(By.css(`wb-grid-element[data-parentnodeid="${nodeId}"].sash-2`));
    if (!actualChild2Element) {
      throw Error(`[DOMAssertError]: Expected element 'wb-grid-element[data-parentnodeid="${nodeId}"].sash-2' to be in the DOM, but is not. [${expectedTreeNode.child2!.type}=${JSON.stringify(expectedTreeNode.child2)}]`);
    }
    assertGridElementDOM(expectedTreeNode.child2!, actualChild2Element, expectedWorkbenchLayout);
  }
}

/**
 * Performs a recursive assertion of the DOM structure starting with the expected part.
 */
function assertMPartDOM(expectedPart: Partial<MPart>, actualDom: DebugElement, expectedWorkbenchLayout: ExpectedWorkbenchLayout): void {
  const partId = actualDom.attributes['data-partid'];
  if (partId !== expectedPart.id) {
    throw Error(`[DOMAssertError] Expected element 'wb-grid-element' to have attribute '[data-partid="${expectedPart.id}"]', but is '[data-partid="${partId}"]'. [MPart=${JSON.stringify(expectedPart)}]`);
  }
  else if (partId === MAIN_AREA_PART_ID) {
    const actualPartElement = actualDom.query(By.css(`wb-main-area-layout[data-partid="${partId}"]`));
    if (!actualPartElement) {
      throw Error(`[DOMAssertError]: Expected element 'wb-main-area-layout[data-partid="${partId}"]' to be in the DOM, but is not. [MPart=${JSON.stringify(expectedPart)}]`);
    }
    assertGridElementDOM(expectedWorkbenchLayout.mainGrid!.root, actualPartElement.query(By.css(`wb-main-area-layout[data-partid="${partId}"] > wb-grid-element`)), expectedWorkbenchLayout);
  }
  else {
    const actualPartElement = actualDom.query(By.css(`wb-part[data-partid="${partId}"]`));
    if (!actualPartElement) {
      throw Error(`[DOMAssertError]: Expected element 'wb-part[data-partid="${partId}"]' to be in the DOM, but is not. [MPart=${JSON.stringify(expectedPart)}]`);
    }

    const actualActiveViewDebugElement = actualPartElement.query(By.css(`wb-view[data-viewid="${expectedPart.activeViewId}"]`));
    if (!actualActiveViewDebugElement) {
      throw Error(`[DOMAssertError]: Expected element 'wb-view[data-viewid="${expectedPart.activeViewId}"]' to be in the DOM, but is not. [MPart=${JSON.stringify(expectedPart)}]`);
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
