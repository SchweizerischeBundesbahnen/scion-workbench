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
 * Provides dictionary utility methods.
 */
export class Dictionaries {

  private constructor() {
  }

  /**
   * Creates a {@link Dictionary} from the given map. If `null` is given, `null` is returned.
   */
  public static toDictionary<T = any>(map: Map<string, T>): Dictionary<T> | null {
    if (map === null) {
      return null;
    }
    if (map === undefined) {
      return undefined;
    }

    return Array
      .from(map.entries())
      .reduce(
        (obj: Dictionary, [key, value]: [string, any]): Dictionary => ({...obj, [key]: value}),
        {},
      );
  }

  /**
   * Creates a {@link Map} from the given dictionary. If given a {@link Map}, the map is returned.
   * If `null` is given, `null` is returned.
   */
  public static toMap<T = any>(dictionary: Dictionary<T> | Map<string, T>): Map<string, T> | null {
    if (dictionary === null) {
      return null;
    }
    if (dictionary instanceof Map) {
      return dictionary;
    }
    if (dictionary === undefined) {
      return undefined;
    }

    return Object
      .entries(dictionary)
      .reduce(
        (map: Map<string, any>, [key, value]: [string, any]) => map.set(key, value),
        new Map<string, any>(),
      );
  }
}

/**
 * Represents an object with a variable number of properties, whose keys are not known at development time.
 */
export interface Dictionary<T = any> {
  [key: string]: T;
}
