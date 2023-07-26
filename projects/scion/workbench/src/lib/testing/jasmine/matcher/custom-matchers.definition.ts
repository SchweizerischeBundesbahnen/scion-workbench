/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import {Type} from '@angular/core';
import {MPart, MPartGrid, MTreeNode} from '../../../layout/workbench-layout.model';
import MatchersUtil = jasmine.MatchersUtil;
import CustomMatcherResult = jasmine.CustomMatcherResult;
import CustomMatcher = jasmine.CustomMatcher;

/**
 * Extends the Jasmine expect API with project specific custom matchers.
 *
 * See https://jasmine.github.io/tutorials/custom_matcher.
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
   * Expects the specified workbench layout.
   *
   * The actual value can be either a {@link ɵWorkbenchLayout}, a {@link ComponentFixture<WorkbenchLayoutComponent>} or a {@link DebugElement<WorkbenchLayoutComponent>}.
   * If passing a fixture or debug element, also asserts the DOM structure.
   *
   * Note that properties not specified in the `expected` object are excluded from the assertion.
   *
   * ---
   * Usage:
   *
   * ```ts
   * expect(workbenchLayout).toEqualWorkbenchLayout({
   *   mainGrid: {
   *     root: new MTreeNode({
   *       direction: 'row',
   *       ratio: .25,
   *       child1: new MPart({id: 'A', views: [{id: 'view.1'}]}),
   *       child2: new MPart({id: 'B', views: [{id: 'view.2'}, {id: 'view.3'}]}),
   *     }),
   *   },
   * });
   * ```
   */
  toEqualWorkbenchLayout(expected: ExpectedWorkbenchLayout, expectationFailOutput?: any): boolean;

  /**
   * Expects the fixture to show a component of the specified type.
   *
   * The actual value must be a {@link ComponentFixture}.
   *
   * ---
   * Usage:
   *
   * ```ts
   * expect(fixture).toShow(YourViewComponent);
   * ```
   */
  toShow(expectedComponentType: Type<any>, expectationFailOutput?: any): boolean;

  /**
   * Expects the view to be registered in {@link WorkbenchViewRegistry} with specified properties.
   *
   * The actual value must be a view id.
   *
   * ---
   * Usage:
   *
   * ```ts
   * expect('view.1').toBeRegistered({partId: 'top-left', active: true});
   * ```
   */
  toBeRegistered(expected: {partId: string; active: boolean}, expectationFailOutput?: any): boolean;

  /**
   * Expects the component displayed in the view to have the specified transient state.
   *
   * Transient state is queried from an input element decorated with the CSS class 'transient-state'.
   *
   * The actual value must be a view id.
   *
   * ---
   * Usage:
   *
   * ```ts
   * expect('view.1').toHaveTransientState('A');
   * ```
   */
  toHaveTransientState(expected: string, expectationFailOutput?: any): boolean;
}

/**
 * Delegates to the Jasmine `toEqual` matcher to be used in custom matchers.
 */
export function toEqual(actual: any, expected: any, util: MatchersUtil, expectationFailOutput?: string): CustomMatcherResult {
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
   * Specifies the expected main grid. If not set, defaults to a grid with only the initial part.
   */
  mainGrid?: Partial<MPartGrid> & {root: MTreeNode | MPart};
  /**
   * Specifies the expected peripheral grid. If not set, defaults to a grid with only the main area part.
   */
  peripheralGrid?: Partial<MPartGrid> & {root: MTreeNode | MPart};
}
