/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

export class Objects {

  private constructor() {
  }

  /**
   * Compares the two objects for shallow equality.
   */
  public static isEqual(a: any, b: any): boolean {
    if (a === b) {
      return true;
    }

    if (!a || !b) {
      return false;
    }

    if (Object.keys(a).length !== Object.keys(b).length) {
      return false;
    }

    return Object.entries(a).every(([key, value]) => (b[key] === value));
  }
}
