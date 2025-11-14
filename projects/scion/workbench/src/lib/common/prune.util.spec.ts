/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {prune} from './prune.util';

describe('prune', () => {

  it('should delete `undefined` properties recursively', () => {
    const object: unknown = {
      key1: 'value 1',
      key2: undefined,
      key3: {
        key1: 'value 3_1',
        key2: undefined,
        key3: 'value 3_3',
        key4: {
          key1: undefined,
          key2: undefined,
        },
        key5: {},
        key6: 'value 3_6',
      },
      key4: 'value 4',
      key5: {
        key1: undefined,
        key2: undefined,
      },
    };
    expect(prune<unknown>(object)).toEqual({
      key1: 'value 1',
      key3: {
        key1: 'value 3_1',
        key3: 'value 3_3',
        key4: {},
        key5: {},
        key6: 'value 3_6',
      },
      key4: 'value 4',
      key5: {},
    });
  });

  it('should delete `undefined` properties and empty objects recursively', () => {
    const object: unknown = {
      key1: 'value 1',
      key2: undefined,
      key3: {
        key1: 'value 3_1',
        key2: undefined,
        key3: 'value 3_3',
        key4: {
          key1: undefined,
          key2: undefined,
        },
        key5: {},
        key6: 'value 3_6',
      },
      key4: 'value 4',
      key5: {
        key1: undefined,
        key2: undefined,
      },
    };
    expect(prune<unknown>(object, {pruneIfEmpty: true})).toEqual({
      key1: 'value 1',
      key3: {
        key1: 'value 3_1',
        key3: 'value 3_3',
        key6: 'value 3_6',
      },
      key4: 'value 4',
    });
  });

  it('should not prune `null`, `Map`, `Set` and `Array` properties', () => {
    const object: unknown = {
      map: new Map(),
      set: new Set(),
      array: [],
      null: null,
      undefind: undefined,
    };
    expect(prune<unknown>(object)).toEqual({
      map: new Map(),
      set: new Set(),
      array: [],
      null: null,
    });
    expect(prune<unknown>(object, {pruneIfEmpty: true})).toEqual({
      map: new Map(),
      set: new Set(),
      array: [],
      null: null,
    });
  });

  it('should preserve object type', () => {
    type Type = {key1?: string; key2?: string; key3?: string}; // eslint-disable-line @typescript-eslint/consistent-type-definitions
    const object: Type = {key1: 'value1', key2: undefined, key3: 'value3'};
    expect(prune(object)).toEqual({key1: 'value1', key3: 'value3'});
  });
});
