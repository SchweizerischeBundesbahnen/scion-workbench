/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import {ExpectMatcherState, Locator} from '@playwright/test';
import {MatcherReturnType} from 'playwright/types/test';
import {retryOnError} from '../helper/testing.util';

/**
 * Provides the implementation of {@link CustomMatchers#toContainFocus}.
 */
export async function toContainFocus(this: ExpectMatcherState, locator: Locator): Promise<MatcherReturnType> {
  try {
    // Retry assertion to behave like a Playwright web-first assertion, i.e., wait and retry until the expected condition is met.
    await retryOnError(() => this.isNot ? assertNotToContainFocus(locator) : assertToContainFocus(locator));
    return {pass: !this.isNot, message: () => 'passed'}; // Invert `pass` because negation is already handled by the assertion above, but Playwright still applies its own `.not` inversion.
  }
  catch (error) {
    return {pass: this.isNot, message: () => error instanceof Error ? error.message : `${error}`}; // Invert `pass` because negation is already handled by the assertion above, but Playwright still applies its own `.not` inversion.
  }
}

async function assertToContainFocus(locator: Locator): Promise<void> {
  const focused = await locator.evaluate((element: HTMLElement) => !!document.activeElement && element.contains(document.activeElement));

  if (!focused) {
    throw new Error('Expected element to contain focus.');
  }
}

async function assertNotToContainFocus(locator: Locator): Promise<void> {
  const focused = await locator.evaluate((element: HTMLElement) => !!document.activeElement && element.contains(document.activeElement));

  if (focused) {
    throw new Error('Expected element not to contain focus.');
  }
}
