/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Microfrontends} from './microfrontend.util';
import {Capability} from '@scion/microfrontend-platform';

describe('Microfrontends.substituteNamedParameters', () => {

  it('should substitute named parameters', async () => {
    const testee = 'testee :param1 :param2';
    expect(Microfrontends.substituteNamedParameters(testee)).toEqual('testee :param1 :param2');
    expect(Microfrontends.substituteNamedParameters(testee, new Map())).toEqual('testee :param1 :param2');
    expect(Microfrontends.substituteNamedParameters(testee, new Map().set('paramX', 'X'))).toEqual('testee :param1 :param2');
    expect(Microfrontends.substituteNamedParameters(testee, new Map().set('param1', 'a'))).toEqual('testee a :param2');
    expect(Microfrontends.substituteNamedParameters(testee, new Map().set('param1', null))).toEqual('testee null :param2');
    expect(Microfrontends.substituteNamedParameters(testee, new Map().set('param1', undefined))).toEqual('testee :param1 :param2');
    expect(Microfrontends.substituteNamedParameters(testee, new Map().set('param1', 123))).toEqual('testee 123 :param2');
    expect(Microfrontends.substituteNamedParameters(testee, new Map().set('param1', true))).toEqual('testee true :param2');
    expect(Microfrontends.substituteNamedParameters(testee, new Map().set('param1', ['a', 'b', 'c']))).toEqual('testee a,b,c :param2');
    expect(Microfrontends.substituteNamedParameters(testee, new Map().set('param1', 'a').set('param2', 'b'))).toEqual('testee a b');
    expect(Microfrontends.substituteNamedParameters(testee, new Map().set('param1', 'a').set('param2', 'b').set('param3', 'c'))).toEqual('testee a b');
  });

  it(`should return value if it is 'null', 'undefined' or empty`, async () => {
    expect(Microfrontends.substituteNamedParameters(null)).toBeNull();
    expect(Microfrontends.substituteNamedParameters(null, new Map().set('param1', 'a'))).toBeNull();
    expect(Microfrontends.substituteNamedParameters(undefined)).toBeUndefined();
    expect(Microfrontends.substituteNamedParameters(undefined, new Map().set('param1', 'a'))).toBeUndefined();
    expect(Microfrontends.substituteNamedParameters('')).toEqual('');
    expect(Microfrontends.substituteNamedParameters('', new Map().set('param1', 'a'))).toEqual('');
  });
});

describe('Microfrontends.createStableIdentifier', () => {

  it('should generate stable identifier', async () => {
    const capability: Capability = {
      type: 'type',
      qualifier: {a: 'b'},
      metadata: {appSymbolicName: 'app'} as Capability['metadata'],
    };

    expect(await Microfrontends.createStableIdentifier(capability)).toEqual('86e3cd3');
    expect(await Microfrontends.createStableIdentifier(capability)).toEqual('86e3cd3');
  });

  it('should ignore order of qualifier entries', async () => {
    const capability1: Capability = {
      type: 'type',
      qualifier: {a: 'b', c: 'd', e: 'f'},
      metadata: {appSymbolicName: 'app'} as Capability['metadata'],
    };
    const capability2: Capability = {
      type: 'type',
      qualifier: {a: 'b', e: 'f', c: 'd'},
      metadata: {appSymbolicName: 'app'} as Capability['metadata'],
    };

    const identifier1 = await Microfrontends.createStableIdentifier(capability1);
    const identifier2 = await Microfrontends.createStableIdentifier(capability2);
    expect(identifier1).toEqual(identifier2);
  });

  it('should not ignore capability type', async () => {
    const capability1: Capability = {
      type: 'type1',
      qualifier: {a: 'b'},
      metadata: {appSymbolicName: 'app'} as Capability['metadata'],
    };
    const capability2: Capability = {
      type: 'type2',
      qualifier: {a: 'b'},
      metadata: {appSymbolicName: 'app'} as Capability['metadata'],
    };

    const identifier1 = await Microfrontends.createStableIdentifier(capability1);
    const identifier2 = await Microfrontends.createStableIdentifier(capability2);
    expect(identifier1).not.toEqual(identifier2);
  });

  it('should use qualifier to generate id', async () => {
    const capability1: Capability = {
      type: 'type',
      qualifier: {a: 'b'},
      metadata: {appSymbolicName: 'app'} as Capability['metadata'],
    };
    const capability2: Capability = {
      type: 'type',
      qualifier: {c: 'd'},
      metadata: {appSymbolicName: 'app'} as Capability['metadata'],
    };

    const identifier1 = await Microfrontends.createStableIdentifier(capability1);
    const identifier2 = await Microfrontends.createStableIdentifier(capability2);
    expect(identifier1).not.toEqual(identifier2);
  });

  it('should use application to generate id', async () => {
    const capability1: Capability = {
      type: 'type',
      qualifier: {a: 'b'},
      metadata: {appSymbolicName: 'app1'} as Capability['metadata'],
    };
    const capability2: Capability = {
      type: 'type',
      qualifier: {a: 'b'},
      metadata: {appSymbolicName: 'app2'} as Capability['metadata'],
    };

    const identifier1 = await Microfrontends.createStableIdentifier(capability1);
    const identifier2 = await Microfrontends.createStableIdentifier(capability2);
    expect(identifier1).not.toEqual(identifier2);
  });
});
