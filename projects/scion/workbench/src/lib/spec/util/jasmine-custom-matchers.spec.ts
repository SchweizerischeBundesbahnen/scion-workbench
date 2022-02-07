/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import CustomMatcher = jasmine.CustomMatcher;
import MatchersUtil = jasmine.MatchersUtil;
import CustomEqualityTester = jasmine.CustomEqualityTester;
import CustomMatcherResult = jasmine.CustomMatcherResult;
import ObjectContaining = jasmine.ObjectContaining;
import {ComponentFixture} from '@angular/core/testing';
import {PartsLayoutComponent} from '../../layout/parts-layout.component';
import {DebugElement, Type} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MPart, MTreeNode} from '../../layout/parts-layout.model';

/**
 * Extends the Jasmine expect API to support chaining with project specific custom matchers.
 *
 * See https://blog.thoughtram.io/angular/2016/12/27/angular-2-advance-testing-with-custom-matchers.html
 */
declare const global: any;
export const expect: (actual: any) => CustomMatchers<any> = (typeof window === 'undefined' ? global : window).expect;

/**
 * Provides Jasmine and project specific custom matchers.
 */
export interface CustomMatchers<T> extends jasmine.Matchers<T> {

  not: CustomMatchers<T>;

  /**
   * Expects the given parts layout. Tests only properties contained in the expected layout, i.e., if not including {@link MPart#parent}
   * in the expectation, that property is ignored in the assertion.
   *
   * The actual value can be of the type {@link MTreeNode}, {@link MPart} or {@link ComponentFixture<PartsLayoutComponent>}.
   * In the latter case, the DOM structure is also tested.
   */
  toEqualPartsLayout(expected: MTreeNode | MPart, expectationFailOutput?: any): boolean;

  /**
   * Expects a component of the given type to show.
   */
  toShow(expectedComponentType: Type<any>, expectationFailOutput?: any): boolean;
}

/**
 * Provides the implementation of project specific custom matchers.
 */
export const jasmineCustomMatchers: jasmine.CustomMatcherFactories = {
  toEqualPartsLayout: (util: MatchersUtil, customEqualityTesters: CustomEqualityTester[]): CustomMatcher => createToEqualPartsLayoutMatcher(util, customEqualityTesters),
  toShow: (util: MatchersUtil, customEqualityTesters: CustomEqualityTester[]): CustomMatcher => createToShowMatcher(util, customEqualityTesters),
};

function createToShowMatcher(util: MatchersUtil, customEqualityTesters: CustomEqualityTester[]): CustomMatcher {
  return {
    compare(actualFixture: any, expectedComponentType: Type<any>, ...args: any[]): CustomMatcherResult {
      const failOutput = args[0];
      const msgFn = (msg: string): string => [msg, failOutput].filter(Boolean).join(', ');

      // verify correct actual type
      if (!(actualFixture instanceof ComponentFixture)) {
        return {
          pass: false,
          message: msgFn(`Expected actual to be of type \'ComponentFixture\' [actual=${actualFixture.constructor.name}]`),
        };
      }

      const found = !!actualFixture.debugElement.query(By.directive(expectedComponentType));
      return found ?
        {pass: true} :
        {pass: false, message: msgFn(`Expected ${expectedComponentType.name} to show`)};
    },
  };
}

function createToEqualPartsLayoutMatcher(util: MatchersUtil, customEqualityTesters: CustomEqualityTester[]): CustomMatcher {
  return {
    compare(actual: MTreeNode | MPart | ComponentFixture<PartsLayoutComponent>, expectedLayout: MTreeNode | MPart, ...args: any[]): CustomMatcherResult {
      try {
        assertPartsLayout(expectedLayout, actual);
        return {pass: true};
      }
      catch (error) {
        if (error instanceof PartsLayoutAssertError) {
          const failOutput = args[0];
          return {pass: false, message: [error.message, failOutput].filter(Boolean).join(', ')};
        }
        throw error;
      }
    },
  };

  function assertPartsLayout(expectedLayout: MTreeNode | MPart, actual: MTreeNode | MPart | ComponentFixture<PartsLayoutComponent>): void {
    if (actual instanceof MTreeNode || actual instanceof MPart) {
      assertPartsLayoutModel(expectedLayout, actual);
    }
    else if (actual instanceof ComponentFixture && actual.componentInstance instanceof PartsLayoutComponent) {
      assertPartsLayoutModel(expectedLayout, actual.componentInstance.root);
      assertPartsLayoutDOM(expectedLayout, actual.debugElement.query(By.css('wb-tree-node')) || actual.debugElement);
    }
    else {
      throw new PartsLayoutAssertError(`Expected testee to be of type \'MTreeNode\', \'MPart\' or \'ComponentFixture&lt;PartsLayoutComponent&gt;\' [actual=${actual.constructor.name}]`);
    }
  }

  /**
   * Asserts the actual model to equal the expected model. Only properties declared on the expected object are compared ().
   */
  function assertPartsLayoutModel(expectedLayout: MTreeNode | MPart, actualLayout: MTreeNode | MPart): void {
    const result = toEqual(actualLayout, objectContainingRecursive(expectedLayout), util, customEqualityTesters);
    if (!result.pass) {
      throw new PartsLayoutAssertError(result.message);
    }
  }

  /**
   * Asserts the rendered parts layout in the DOM against the expected modelled parts layout.
   */
  function assertPartsLayoutDOM(expectedLayout: MTreeNode | MPart, actualDom: DebugElement): void {
    if (expectedLayout instanceof MTreeNode) {
      const treeNode = expectedLayout as MTreeNode;

      const nodeid = actualDom.attributes['data-nodeid'];
      if (!nodeid) {
        throw Error(`[AttributeNotFoundError] Attribute \'data-nodeid\' not found on element ${actualDom.name}`);
      }

      const sash1DomElement = actualDom.query(By.css(`wb-tree-node[data-parentnodeid="${nodeid}"].sash-1, wb-portal-outlet[data-parentnodeid="${nodeid}"].sash-1`));
      assertPartsLayoutDOM(treeNode.child1, sash1DomElement);

      const sash2DomElement = actualDom.query(By.css(`wb-tree-node[data-parentnodeid="${nodeid}"].sash-2, wb-portal-outlet[data-parentnodeid="${nodeid}"].sash-2`));
      assertPartsLayoutDOM(treeNode.child2, sash2DomElement);
    }
    else if (expectedLayout instanceof MPart) {
      const expectedPart = expectedLayout as MPart;
      const actualPartElement = actualDom.query(By.css(`wb-view-part[data-partid="${expectedPart.partId}"]`));
      if (!actualPartElement) {
        throw new PartsLayoutAssertError(`DOM: Expected element <wb-view-part data-partid="${expectedPart.partId}"> not found for view '${expectedPart.activeViewId}'`);
      }

      const actualActiveViewDebugElement = actualPartElement.query(By.css(`wb-view[data-viewid="${expectedPart.activeViewId}"]`));
      if (!actualActiveViewDebugElement) {
        throw new PartsLayoutAssertError(`DOM: Expected element <wb-view data-viewid="${expectedPart.activeViewId}"> not found for view '${expectedPart.activeViewId}'`);
      }
    }
    else {
      throw Error('[IllegalArgumentError] Layout must be of type \'TreeNode\' or \'Part\'');
    }
  }
}

// Jasmine: Use equals matcher in a custom matcher
function toEqual(actual: any, expected: any, util: MatchersUtil, customEqualityTesters: CustomEqualityTester[], expectationFailOutput?: string): CustomMatcherResult {
  const toEqualMatcher: CustomMatcher = (jasmine as any).matchers.toEqual(util, customEqualityTesters);
  const result = toEqualMatcher.compare(actual, expected);
  if (!result.pass && expectationFailOutput) {
    result.message = `${result.message} [${expectationFailOutput}]`;
  }

  return result;
}

/**
 * Creates a {@link ObjectContaining} instance of the given partial {@link MTreeNode} or {@link MPart},
 * which then can be used by jasmine equals matcher to only compare defined properties.
 */
function objectContainingRecursive(node: Partial<MTreeNode | MPart>): ObjectContaining<MTreeNode | MPart> {
  if (node instanceof MTreeNode) {
    const copy = new MTreeNode(node);
    copy.child1 = objectContainingRecursive(node.child1) as any;
    copy.child2 = objectContainingRecursive(node.child2) as any;
    return jasmine.objectContaining(copy);
  }
  return jasmine.objectContaining(node);
}

class PartsLayoutAssertError {
  constructor(public readonly message: string) {
  }
}
