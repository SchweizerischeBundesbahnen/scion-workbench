/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

export class Defined {

  private constructor() {
  }

  /**
   * Returns the value, if present, otherwise returns the `orElseValue`, which can be a static value or a supplier function.
   */
  public static orElse<T>(value: T, orElseValue: T | (() => T)): T {
    return (value !== undefined ? value : (typeof orElseValue === 'function' ? ((orElseValue) as Function)() : orElseValue));
  }

  /**
   * Returns the value, if present, otherwise throws an exception to be created by the provided supplier.
   */
  public static orElseThrow<T>(value: T, orElseThrowFn: () => Error): T {
    if (value !== undefined) {
      return value;
    }
    throw orElseThrowFn();
  }
}
