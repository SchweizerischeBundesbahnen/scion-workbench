/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import {DebugElement, Predicate, Type} from '@angular/core';
import {ExpectedWorkbenchLayout} from './to-equal-workbench-layout.matcher';

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
   *   mainAreaGrid: {
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
   * Expects to show a component of the specified type.
   *
   * The actual value must be a {@link ComponentFixture} or {@link DebugElement}.
   *
   * ---
   * Usage:
   *
   * ```ts
   * expect(fixture).toShow(YourViewComponent);
   * ```
   */
  toShow(type: Type<unknown>, expectationFailOutput?: any): boolean;

  /**
   * Expects to show the element as specified by given predicate.
   *
   * The actual value must be a {@link ComponentFixture} or {@link DebugElement}.
   *
   * ---
   * Usage:
   *
   * ```ts
   * expect(fixture).toShow(By.css('div.class'));
   * ```
   */
  toShow(predicate: Predicate<DebugElement>, expectationFailOutput?: any): boolean;

  /**
   * Expects the element to be active.
   *
   * The actual value must be a {@link DebugElement}.
   *
   * ---
   * Usage:
   *
   * ```ts
   * expect(fixture.debugElement).toBeActive();
   * ```
   */
  toBeActive(): boolean;

  /**
   * Expects the view to be registered in {@link WORKBENCH_VIEW_REGISTRY} with specified properties.
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
   * Expects the component displayed in the view to have the specified component state.
   *
   * Queries state on an input element having the CSS class 'component-state'.
   *
   * The actual value must be a view id.
   *
   * ---
   * Usage:
   *
   * ```ts
   * expect('view.1').toHaveComponentState('A');
   * ```
   */
  toHaveComponentState(expected: string, expectationFailOutput?: any): boolean;
}
