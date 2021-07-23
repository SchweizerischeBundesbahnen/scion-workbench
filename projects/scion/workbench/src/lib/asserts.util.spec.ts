/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {assertNotNullish, assertType} from './asserts.util';

describe('Asserts', () => {

  describe('assertType', () => {

    it('should throw for `null` values', () => {
      expect(() => assertType(null, {toBeOneOf: []})).toThrowError(/AssertError/);
    });

    it('should throw for `undefined` values', () => {
      expect(() => assertType(undefined, {toBeOneOf: []})).toThrowError(/AssertError/);
    });

    it('should throw for values not of the given type', () => {
      class Type1 {
      }

      class Type2 {
      }

      class Type3 {
      }

      expect(() => assertType(new Type1(), {toBeOneOf: [Type2, Type3]})).toThrowError(/AssertError/);
    });

    it('should not throw for values of the given type', () => {
      class Type1 {
      }

      class Type2 {
      }

      expect(assertType(new Type1(), {toBeOneOf: [Type1, Type2]})).toBeUndefined();
    });
  });

  describe('assertNotNullish', () => {

    it('should throw for `null` values', () => {
      expect(() => assertNotNullish(null)).toThrowError(/AssertError/);
      expect(() => assertNotNullish(null, {orElseThrow: () => Error('ERROR')})).toThrowError(/ERROR/);
    });

    it('should throw for `undefined` values', () => {
      expect(() => assertNotNullish(undefined)).toThrowError(/AssertError/);
      expect(() => assertNotNullish(undefined, {orElseThrow: () => Error('ERROR')})).toThrowError(/ERROR/);
    });

    it('should not throw for falsy values', () => {
      expect(assertNotNullish(0)).toBeUndefined();
      expect(assertNotNullish('')).toBeUndefined();
      expect(assertNotNullish(false)).toBeUndefined();
    });

    it('should not throw for truthy values', () => {
      expect(assertNotNullish(1)).toBeUndefined();
      expect(assertNotNullish('some value')).toBeUndefined();
      expect(assertNotNullish(true)).toBeUndefined();
    });
  });
});
