/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

export namespace Objects {
  export function keys<T>(object: T): Array<keyof T> {
    return Object.keys(object as any) as Array<keyof T>;
  }

  export function entries<T, K = string>(object: {[key: string]: T} | ArrayLike<T>): Array<[K, T]> {
    return Object.entries(object) as Array<[K, T]>;
  }
}
