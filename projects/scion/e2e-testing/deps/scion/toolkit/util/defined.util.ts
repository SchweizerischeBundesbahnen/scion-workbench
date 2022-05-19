/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

/**
 * Provides utility methods to work with `undefined` values. The value `null` is considered as a defined value.
 *
 * Note: TypeScript 3.7 introduces the `nullish coalescing operator` [1] `(??)`, which is similar to the `Defined` function,
 * but also applies for `null` values.
 *
 * ## Links:
 * [1] https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#nullish-coalescing
 */
export namespace Defined {

  /**
   * Returns the value if not `undefined`, otherwise "orElseValue". The "orElseValue" value can be created with a factory function.
   *
   * Unlike JavaScript's "nullish coalescing operator (??)", the "orElse" function only tests for `undefined`, not `null`.
   */
  export function orElse<T>(value: T | undefined, orElseValue: T | (() => T)): T {
    return (value !== undefined ? value : (typeof orElseValue === 'function' ? (orElseValue as (() => T))() : orElseValue));
  }

  /**
   * Returns the value if not `undefined`, otherwise throws the error created by the passed factory function.
   */
  export function orElseThrow<T>(value: T | undefined, orElseThrowFn: () => Error): T {
    if (value !== undefined) {
      return value;
    }
    throw orElseThrowFn();
  }
}
