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
import {MatcherReturnType} from 'playwright/types/test';
import {retryOnError} from '../helper/testing.util';

/**
 * Provides the implementation of {@link CustomMatchers#toContainFocus}.
 */
export async function toContainFocus(locator: Locator): Promise<MatcherReturnType> {
  try {
    // Retry assertion to behave like a Playwright web-first assertion, i.e., wait and retry until the expected condition is met.
    await retryOnError(() => assertFocus(locator));
    return {pass: true, message: () => 'Focus on element or children.'};
  }
  catch (error) {
    return {pass: false, message: () => error instanceof Error ? error.message : `${error}`};
  }
}

async function assertFocus(locator: Locator): Promise<void> {
  const focused = await locator.evaluate((element: HTMLElement) => !!document.activeElement && element.contains(document.activeElement));

  if (!focused) {
    throw new Error('No focus on element or children.');
  }
}
