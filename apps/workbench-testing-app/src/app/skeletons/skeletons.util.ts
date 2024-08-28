/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

export const Skeletons = {
  /**
   *
   * Generates a random number between the specified `min` and `max` values, inclusive.
   */
  random: (min: number, max: number): number => {
    return min + Math.floor(Math.random() * (max + 1 - min));
  },
  /**
   * Constrains a value to be in the specified `min` and `max` range.
   */
  minmax: (value: number, range: {min: number; max: number}): number => {
    const {min, max} = range;
    return Math.max(min, Math.min(max, value));
  },
} as const;
