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

/**
 * Provides the implementation of {@link CustomMatchers#toContainFocus}.
 */
export async function toContainFocus(locator: Locator): Promise<MatcherReturnType> {
  const focused = await locator.evaluate((element: HTMLElement) => !!document.activeElement && element.contains(document.activeElement));
  return {pass: focused, message: () => focused ? 'Focus on element or children.' : 'No focus on element or children.'};
}
