/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';
import {ExpectationResult} from './custom-matchers.definition';
import {retryOnError} from '../helper/testing.util';

/**
 * Provides the implementation of {@link CustomMatchers#toHaveBoundingBox}.
 */
export async function toHaveBoundingBox(locator: Locator, expected: ExpectedBoundingBox): Promise<ExpectationResult> {
  try {
    // Retry assertion to behave like a Playwright web-first assertion, i.e., wait and retry until the expected condition is met.
    await retryOnError(() => assertBoundingBox(expected, locator));
    return {pass: true, message: () => 'passed'};
  }
  catch (error) {
    return {pass: false, message: () => error instanceof Error ? error.message : `${error}`};
  }
}

/**
 * Asserts expected bounding box.
 */
async function assertBoundingBox(expected: ExpectedBoundingBox, locator: Locator): Promise<void> {
  const {x, y, width, height} = (await locator.boundingBox())!;
  if (x !== expected.x) {
    throw Error(`[DOMAssertError] Expected element x to be ${expected.x}, but was '${x}'.`);
  }
  if (y !== expected.y) {
    throw Error(`[DOMAssertError] Expected element y to be ${expected.y}, but was '${y}'.`);
  }
  if (width !== expected.width) {
    throw Error(`[DOMAssertError] Expected element width to be ${expected.width}, but was '${width}'.`);
  }
  if (height !== expected.height) {
    throw Error(`[DOMAssertError] Expected element height to be ${expected.height}, but was '${height}'.`);
  }
}

export interface ExpectedBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}
