/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Objects} from './objects.util';

describe('Objects.keys', () => {

  it('should return keys', () => {
    const object = {key1: 'value1', key2: 'value2'};
    expect(Objects.keys(object)).toEqual(['key1', 'key2']);
  });

  it('should preserve data type of keys', () => {
    type Key = `key.${number}`;
    const object: Record<Key, string> = {'key.1': 'value1', 'key.2': 'value2'};
    expect(Objects.keys(object) satisfies Key[]).toEqual(['key.1', 'key.2']);
  });
});

describe('Objects.entries', () => {

  it('should return entries', () => {
    const object = {key1: 'value1', key2: 'value2'};
    expect(Objects.entries(object)).toEqual([['key1', 'value1'], ['key2', 'value2']]);
  });

  it('should preserve data type of keys', () => {
    type Key = `key.${number}`;
    const object: Record<Key, string> = {'key.1': 'value1', 'key.2': 'value2'};
    expect(Objects.entries(object) satisfies Array<[Key, string]>).toEqual([['key.1', 'value1'], ['key.2', 'value2']]);
  });
});

describe('Objects.toMatrixNotation', () => {

  it('should stringify an object to matrix notation', () => {
    const object = {key1: 'value1', key2: undefined, key3: 'value3', key4: null};
    expect(Objects.toMatrixNotation(object)).toEqual('key1=value1;key2=undefined;key3=value3;key4=null');
  });

  it('should stringify `null` to matrix notation', () => {
    expect(Objects.toMatrixNotation(null)).toEqual('');
  });

  it('should stringify `undefined` to matrix notation', () => {
    expect(Objects.toMatrixNotation(undefined)).toEqual('');
  });
});
