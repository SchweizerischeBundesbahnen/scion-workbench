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
describe('Objects.isEqual', () => {

  it('should check deep equality', () => {
    const object1 = {
      key1: 'value1',
      key2: 2,
      key3: {
        key3a: 'value3a',
      },
      key4: new Map().set('A', {key4a: 'value4a', key5a: [{key5a: 'value5a'}]}),
      key5: new Set().add({key5a: [{key5a: 'value5a'}]}),
      key6: [{key6a: 'value6a'}],
      key7: {},
      key8: null,
      key9: undefined,
    };
    const object2 = {
      key1: 'value1',
      key2: 2,
      key3: {
        key3a: 'value3a',
      },
      key4: new Map().set('A', {key4a: 'value4a', key5a: [{key5a: 'value5a'}]}),
      key5: new Set().add({key5a: [{key5a: 'value5a'}]}),
      key6: [{key6a: 'value6a'}],
      key7: {},
      key8: null,
      key9: undefined,
    };
    expect(Objects.isEqual(object1, object2)).toBeTrue();
  });
});
