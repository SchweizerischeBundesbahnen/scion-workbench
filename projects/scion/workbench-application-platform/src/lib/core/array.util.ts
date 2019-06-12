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
 * Provides array utlity methods.
 */
export class Arrays {

  private constructor() {
  }

  /**
   * Creates an array from the given value, or returns the value if already an array.
   */
  public static from(value: string | string[]): string[] {
    if (!value || !value.length) {
      return [];
    }
    return Array.isArray(value) ? value : [value];
  }
}
