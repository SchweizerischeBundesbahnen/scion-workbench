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

describe('Microfrontends', () => {

  describe('Named Parameters', () => {

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
});
