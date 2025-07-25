/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import {MatcherReturnType} from 'playwright/types/test';

/**
 * Provides the implementation of {@link CustomMatchers#toBeBetween}.
 */
export function toBeBetween(actual: number, expectedFrom: number, expectedTo: number): MatcherReturnType {
  if (actual >= expectedFrom && actual <= expectedTo) {
    return {
      pass: true,
      message: () => 'passed',
    };
  }
  return {
    pass: false,
    message: () => `Expected ${actual} to be between ${expectedFrom} and ${expectedTo}`,
  };
}
