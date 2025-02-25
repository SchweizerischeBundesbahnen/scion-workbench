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

          // Resolve debug element for `WorkbenchLayoutComponent`.
          let debugElement = actual instanceof ComponentFixture ? actual.debugElement : actual;
          if (!(debugElement.componentInstance instanceof WorkbenchLayoutComponent)) {
            debugElement = debugElement.query(By.directive(WorkbenchLayoutComponent));
          }

          // Expect debug element to represent `WorkbenchLayoutComponent` element.
          if (!(debugElement.componentInstance instanceof WorkbenchLayoutComponent)) {
            return fail(`Expected fixture or DebugElement to be 'WorkbenchLayoutComponent' (or a parent), but was ${(actual.componentInstance as object).constructor.name}.`);
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
    mainAreaGrid: actual.mainAreaGrid ?? undefined,
    workbenchGrid: actual.workbenchGrid,
    maximized: actual.maximized,
    navigationStates: actual.navigationStates(),
    outlets: actual.outlets(),
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
  // Assert the workbench grid plus the main area grid if expected.
  if (expected.workbenchGrid) {
    assertGridElementDOM(expected.workbenchGrid.root, actualElement.querySelector(':scope > wb-grid-element:not([data-parentnodeid])'), expected);
  }
  // Assert only the main area grid, but not the workbench grid since not expected.
  else if (expected.mainAreaGrid) {
    assertGridElementDOM(expected.mainAreaGrid.root, actualElement.querySelector('wb-part[data-partid="part.main-area"] > wb-grid-element'), expected);
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
   * Asserts specified workbench grid, if set.
   */
  workbenchGrid?: MPartGrid;
  /**
   * Asserts specified main area grid, if set.
   */
  mainAreaGrid?: MPartGrid;
  /**
   * Asserts the layout to belong to specified perspective, if set.
   */
  perspectiveId?: string | undefined;
  /**
   * Asserts specified maximized state, if set.
   */
  maximized?: boolean;
  /**
   * Asserts specified navigation states, if set.
   */
  navigationStates?: NavigationStates;
  /**
   * Asserts specified view outlets, if set.
   */
  outlets?: Outlets;
}

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
