/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import CustomMatcher = jasmine.CustomMatcher;
import MatchersUtil = jasmine.MatchersUtil;
import CustomEqualityTester = jasmine.CustomEqualityTester;
import CustomMatcherResult = jasmine.CustomMatcherResult;
import { ComponentFixture } from '@angular/core/testing';
import { ViewPartGridComponent } from '../../view-part-grid/view-part-grid.component';
import { DebugElement, Type } from '@angular/core';
import { By } from '@angular/platform-browser';
import { AssertException } from './assert-exception.spec';
import { ACTIVE_VIEW_REF_INDEX, VIEW_PART_REF_INDEX, ViewPartInfoArray, ViewPartSashBox } from '../../view-part-grid/view-part-grid-serializer.service';

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
   * Expect the given view part grid rendered in the DOM.
   */
  toBeViewPartGrid(expected: ViewPartSashBox | ViewPartInfoArray, expectationFailOutput?: any): boolean;

  /**
   * Expect a component of the given type to show.
   */
  toShow(expectedComponentType: Type<any>, expectationFailOutput?: any): boolean;
}

/**
 * Provides the implementation of project specific custom matchers.
 */
export const jasmineCustomMatchers: jasmine.CustomMatcherFactories = {
  toBeViewPartGrid: (util: MatchersUtil, customEqualityTesters: CustomEqualityTester[]): CustomMatcher => createToBeViewPartGridMatcher(util, customEqualityTesters),
  toShow: (util: MatchersUtil, customEqualityTesters: CustomEqualityTester[]): CustomMatcher => createToDisplayMatcher(util, customEqualityTesters),
};

function createToDisplayMatcher(util: MatchersUtil, customEqualityTesters: CustomEqualityTester[]): CustomMatcher {
  return {
    compare(actualFixture: any, expectedComponentType: Type<any>): CustomMatcherResult {
      const failOutput = arguments[2];
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

function createToBeViewPartGridMatcher(util: MatchersUtil, customEqualityTesters: CustomEqualityTester[]): CustomMatcher {
  return {
    compare(actualViewPartGridFixture: any, expectedViewPartGrid: ViewPartSashBox | ViewPartInfoArray): CustomMatcherResult {
      const failOutput = arguments[2];
      const msgFn = (msg: string): string => [msg, failOutput].filter(Boolean).join(', ');

      // verify correct actual type
      if (!(actualViewPartGridFixture instanceof ComponentFixture)) {
        return {
          pass: false,
          message: msgFn(`Expected actual to be of type \'ComponentFixture\' [actual=${Object.getOwnPropertyNames(actualViewPartGridFixture)}]`),
        };
      }

      const actualGridFixture: ComponentFixture<ViewPartGridComponent> = actualViewPartGridFixture;
      try {
        // Verify grid object
        const result = toEqual(actualGridFixture.componentInstance.root, expectedViewPartGrid, util, customEqualityTesters);
        if (!result.pass) {
          return result;
        }

        // Verify DOM representation
        assertRenderedGridInDom(expectedViewPartGrid, actualGridFixture.debugElement.query(By.css('wb-view-part-sash-box')) || actualGridFixture.debugElement);
      } catch (error) {
        if (error instanceof AssertException) {
          return {pass: false, message: msgFn(error.message)};
        }
        else {
          throw error;
        }
      }

      return {pass: true};
    },
  };

  /**
   * Asserts the rendered grid in the DOM against the expected modelled grid.
   */
  function assertRenderedGridInDom(expectedGridElement: ViewPartSashBox | ViewPartInfoArray, actualDom: DebugElement): void {
    if (!Array.isArray(expectedGridElement)) {
      // ViewPartSashBox
      assertRenderedGridInDom(expectedGridElement.sash1, actualDom.children.find(child => ['wb-view-part-sash-box', 'wb-portal-outlet'].includes(child.name) && child.nativeElement.classList.contains('sash-1')));
      assertRenderedGridInDom(expectedGridElement.sash2, actualDom.children.find(child => ['wb-view-part-sash-box', 'wb-portal-outlet'].includes(child.name) && child.nativeElement.classList.contains('sash-2')));
    }
    else {
      // ViewPartInfoArray
      const expectedViewPartRef = expectedGridElement[VIEW_PART_REF_INDEX];
      const expectedActiveViewRef = expectedGridElement[ACTIVE_VIEW_REF_INDEX];

      const actualViewPartElement = actualDom.query(By.css(`wb-view-part#${expectedViewPartRef.replace('\.', '\\.')}`));
      if (!actualViewPartElement) {
        throw new AssertException(`DOM: Expected element <wb-view-part id=${expectedViewPartRef}> not found for view '${expectedActiveViewRef}'`);
      }

      const actualActiveViewDebugElement = actualViewPartElement.query(By.css(`wb-view#${expectedActiveViewRef.replace('\.', '\\.')}`));
      if (!actualActiveViewDebugElement) {
        throw new AssertException(`DOM: Expected element <wb-view id=${expectedActiveViewRef}> not found for view '${expectedActiveViewRef}'`);
      }
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
