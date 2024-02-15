/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {NamedParameters} from './named-parameters.util';

describe('Named Parameters', () => {

  it('should substitute parameter in a string', async () => {
    const testee = 'testee :param1 :param2';
    expect(NamedParameters.substitute(testee)).toEqual('testee :param1 :param2');
    expect(NamedParameters.substitute(testee, new Map())).toEqual('testee :param1 :param2');
    expect(NamedParameters.substitute(testee, new Map().set('paramX', 'X'))).toEqual('testee :param1 :param2');
    expect(NamedParameters.substitute(testee, new Map().set('param1', 'a'))).toEqual('testee a :param2');
    expect(NamedParameters.substitute(testee, new Map().set('param1', null))).toEqual('testee null :param2');
    expect(NamedParameters.substitute(testee, new Map().set('param1', undefined))).toEqual('testee :param1 :param2');
    expect(NamedParameters.substitute(testee, new Map().set('param1', 123))).toEqual('testee 123 :param2');
    expect(NamedParameters.substitute(testee, new Map().set('param1', true))).toEqual('testee true :param2');
    expect(NamedParameters.substitute(testee, new Map().set('param1', ['a', 'b', 'c']))).toEqual('testee a,b,c :param2');
    expect(NamedParameters.substitute(testee, new Map().set('param1', 'a').set('param2', 'b'))).toEqual('testee a b');
  });

  it('should return value if it is null, undefined or empty', async () => {
    expect(NamedParameters.substitute(null)).toBeNull();
    expect(NamedParameters.substitute(null, new Map().set('param1', 'a'))).toBeNull();
    expect(NamedParameters.substitute(undefined)).toBeUndefined();
    expect(NamedParameters.substitute(undefined, new Map().set('param1', 'a'))).toBeUndefined();
    expect(NamedParameters.substitute('')).toEqual('');
    expect(NamedParameters.substitute('', new Map().set('param1', 'a'))).toEqual('');
  });
});
