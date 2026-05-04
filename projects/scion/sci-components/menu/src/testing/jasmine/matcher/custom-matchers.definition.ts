/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Anchor, ExpectedMenuPosition} from './to-have-menu-position.matcher';

/**
 * Extends the Jasmine expect API with project specific custom matchers.
 *
 * See https://jasmine.github.io/tutorials/custom_matcher.
 * See https://blog.thoughtram.io/angular/2016/12/27/angular-2-advance-testing-with-custom-matchers.html
 */
declare const global: any;
export const expect = (window ?? global).expect as unknown as (actual: unknown) => CustomMatchers<unknown>; // eslint-disable-line @typescript-eslint/no-unnecessary-condition

/**
 * Provides Jasmine and project specific custom matchers.
 */
export interface CustomMatchers<T> extends jasmine.Matchers<T> {

  toHaveMenuPosition(anchor: Anchor, expected: ExpectedMenuPosition, expectationFailOutput?: any): boolean;
}
