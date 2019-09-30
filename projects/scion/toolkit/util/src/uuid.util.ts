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
 * Utility for random numbers.
 */
export class UUID {

  private constructor() {
  }

  /**
   * Generates a 'pseudo-random' identifier.
   */
  public static randomUUID(): string {
    let now = Date.now();
    if (typeof window !== 'undefined' && typeof window.performance !== 'undefined' && typeof window.performance.now === 'function') {
      now += performance.now(); // use high-precision timer if available
    }

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, char => {
      const random = (now + Math.random() * 16) % 16 | 0; // tslint:disable-line:no-bitwise
      now = Math.floor(now / 16);
      return (char === 'x' ? random : (random & 0x3 | 0x8)).toString(16); // tslint:disable-line:no-bitwise
    });
  }
}
