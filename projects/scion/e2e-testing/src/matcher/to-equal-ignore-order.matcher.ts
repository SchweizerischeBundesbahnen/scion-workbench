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
 * Provides the implementation of {@link CustomMatchers#toEqualIgnoreOrder}.
 */
export function toEqualIgnoreOrder(actual: unknown, expected: Array<any>): MatcherReturnType {
  if (Array.isArray(actual) && actual.length === expected.length && includeSameElements(actual, expected)) {
    return {
      pass: true,
      message: () => 'passed',
    };
  }
  return {
    pass: false,
    message: () => `Arrays not equal. Expected [${actual}] to equal [${expected}]`,
  };
}

function includeSameElements(array1: Array<any>, array2: Array<any>): boolean {
  return array1.every(item => array2.includes(item)) && array2.every(item => array1.includes(item));
}
