/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { isEqualQualifier, matchesCapabilityQualifier, matchesIntentQualifier } from '../core/qualifier-tester';
import { patchQualifier } from '../core/qualifier-patcher';

describe('Qualifier', () => {

  describe('function \'matchesCapabilityQualifier(...)\'', () => {

    it('tests strict equality', () => {
      expect(matchesCapabilityQualifier({entity: 'person', id: 42}, {entity: 'person', id: 42})).toBeTruthy();
      expect(matchesCapabilityQualifier({entity: 'person', id: 42}, {entity: 'person', id: '42'})).toBeFalsy();
      expect(matchesCapabilityQualifier({entity: 'person', id: 42}, {entity: 'person', id: 43})).toBeFalsy();
      expect(matchesCapabilityQualifier({entity: 'person', id: 42}, {entity: 'company', id: 42})).toBeFalsy();
      expect(matchesCapabilityQualifier({entity: 'person', id: 42}, {entity: 'person'})).toBeFalsy();
      expect(matchesCapabilityQualifier({entity: 'person', id: 42}, {entity: 'person', id: 42, name: 'smith'})).toBeFalsy();
      expect(matchesCapabilityQualifier({entity: 'person', id: 42}, null)).toBeFalsy();
      expect(matchesCapabilityQualifier({entity: 'person', flag: true}, {entity: 'person', flag: true})).toBeTruthy();
      expect(matchesCapabilityQualifier({entity: 'person', flag: true}, {entity: 'person', flag: 'true'})).toBeFalsy();
      expect(matchesCapabilityQualifier({entity: 'person', flag: true}, {entity: 'person', flag: false})).toBeFalsy();
      expect(matchesCapabilityQualifier({entity: 'person', flag: false}, {entity: 'person', flag: 'false'})).toBeFalsy();
    });

    it('supports value wildcards (*)', () => {
      expect(matchesCapabilityQualifier({entity: 'person', id: '*'}, {entity: 'person', id: 42})).toBeTruthy();
      expect(matchesCapabilityQualifier({entity: 'person', id: '*'}, {entity: 'person', id: '42'})).toBeTruthy();
      expect(matchesCapabilityQualifier({entity: 'person', id: '*'}, {entity: 'person', id: 43})).toBeTruthy();
      expect(matchesCapabilityQualifier({entity: 'person', id: '*'}, {entity: 'company', id: 42})).toBeFalsy();
      expect(matchesCapabilityQualifier({entity: 'person', id: '*'}, {entity: 'person'})).toBeFalsy();
      expect(matchesCapabilityQualifier({entity: 'person', id: '*'}, {entity: 'person', id: 42, name: 'smith'})).toBeFalsy();
      expect(matchesCapabilityQualifier({entity: 'person', id: '*'}, null)).toBeFalsy();

      expect(matchesCapabilityQualifier({a: 'a', b: '*', c: 'c'}, {a: 'a', b: 'b', c: 'c'})).toBeTruthy();
      expect(matchesCapabilityQualifier({a: 'a', b: '*', c: 'c'}, {a: 'a', b: null, c: 'c'})).toBeFalsy();
      expect(matchesCapabilityQualifier({a: 'a', b: '*', c: 'c'}, {a: 'a', c: 'c'})).toBeFalsy();
      expect(matchesCapabilityQualifier({a: 'a', b: '*', c: 'c'}, {a: 'a', c: 'c', d: 'd'})).toBeFalsy();

      expect(matchesCapabilityQualifier({entity: '*'}, undefined)).toBeFalsy();
      expect(matchesCapabilityQualifier({entity: '*'}, null)).toBeFalsy();
      expect(matchesCapabilityQualifier({entity: '*'}, {})).toBeFalsy();
    });

    it('supports value wildcards (?)', () => {
      expect(matchesCapabilityQualifier({entity: 'person', id: '?'}, {entity: 'person', id: 42})).toBeTruthy();
      expect(matchesCapabilityQualifier({entity: 'person', id: '?'}, {entity: 'person', id: '42'})).toBeTruthy();
      expect(matchesCapabilityQualifier({entity: 'person', id: '?'}, {entity: 'person', id: 43})).toBeTruthy();
      expect(matchesCapabilityQualifier({entity: 'person', id: '?'}, {entity: 'company', id: 42})).toBeFalsy();
      expect(matchesCapabilityQualifier({entity: 'person', id: '?'}, {entity: 'person'})).toBeTruthy();
      expect(matchesCapabilityQualifier({entity: 'person', id: '?'}, {entity: 'person', id: 42, name: 'smith'})).toBeFalsy();
      expect(matchesCapabilityQualifier({entity: 'person', id: '?'}, null)).toBeFalsy();

      expect(matchesCapabilityQualifier({a: 'a', b: '?', c: 'c'}, {a: 'a', b: 'b', c: 'c'})).toBeTruthy();
      expect(matchesCapabilityQualifier({a: 'a', b: '?', c: 'c'}, {a: 'a', b: null, c: 'c'})).toBeTruthy();
      expect(matchesCapabilityQualifier({a: 'a', b: '?', c: 'c'}, {a: 'a', c: 'c'})).toBeTruthy();
      expect(matchesCapabilityQualifier({a: 'a', b: '?', c: 'c'}, {a: 'a', c: 'c', d: 'd'})).toBeFalsy();

      expect(matchesCapabilityQualifier({entity: '?'}, undefined)).toBeTruthy();
      expect(matchesCapabilityQualifier({entity: '?'}, null)).toBeTruthy();
      expect(matchesCapabilityQualifier({entity: '?'}, {})).toBeTruthy();
    });

    it('accepts only empty qualifiers', () => {
      expect(matchesCapabilityQualifier({}, {})).toBeTruthy();
      expect(matchesCapabilityQualifier({}, null)).toBeTruthy();
      expect(matchesCapabilityQualifier({}, {entity: 'person'})).toBeFalsy();
    });

    it('throws IllegalKeyError if qualifier key is \'*\'', () => {
      const errorMatcher = /IllegalCapabilityKeyError/;
      expect(() => matchesCapabilityQualifier({'*': '*'}, {})).toThrowError(errorMatcher);
      expect(() => matchesCapabilityQualifier({'*': '*'}, null)).toThrowError(errorMatcher);
      expect(() => matchesCapabilityQualifier({'*': '*'}, {entity: 'person'})).toThrowError(errorMatcher);
    });

    it('accepts only empty qualifiers if not providing a pattern qualifier', () => {
      expect(matchesCapabilityQualifier(null, {})).toBeTruthy();
      expect(matchesCapabilityQualifier(null, null)).toBeTruthy();
      expect(matchesCapabilityQualifier(null, {entity: 'person'})).toBeFalsy();
    });
  });

  describe('function \'matchesIntentQualifier(...)\'', () => {

    it('tests strict equality', () => {
      expect(matchesIntentQualifier({entity: 'person', id: 42}, {entity: 'person', id: 42})).toBeTruthy();
      expect(matchesIntentQualifier({entity: 'person', id: 42}, {entity: 'person', id: '42'})).toBeFalsy();
      expect(matchesIntentQualifier({entity: 'person', id: 42}, {entity: 'person', id: 43})).toBeFalsy();
      expect(matchesIntentQualifier({entity: 'person', id: 42}, {entity: 'company', id: 42})).toBeFalsy();
      expect(matchesIntentQualifier({entity: 'person', id: 42}, {entity: 'person'})).toBeFalsy();
      expect(matchesIntentQualifier({entity: 'person', id: 42}, {entity: 'person', id: 42, name: 'smith'})).toBeFalsy();
      expect(matchesIntentQualifier({entity: 'person', id: 42}, null)).toBeFalsy();
      expect(matchesIntentQualifier({entity: 'person', flag: true}, {entity: 'person', flag: true})).toBeTruthy();
      expect(matchesIntentQualifier({entity: 'person', flag: true}, {entity: 'person', flag: 'true'})).toBeFalsy();
      expect(matchesIntentQualifier({entity: 'person', flag: true}, {entity: 'person', flag: false})).toBeFalsy();
      expect(matchesIntentQualifier({entity: 'person', flag: false}, {entity: 'person', flag: 'false'})).toBeFalsy();
    });

    it('supports value wildcards (*)', () => {
      expect(matchesIntentQualifier({entity: 'person', id: '*'}, {entity: 'person', id: 42})).toBeTruthy();
      expect(matchesIntentQualifier({entity: 'person', id: '*'}, {entity: 'person', id: '42'})).toBeTruthy();
      expect(matchesIntentQualifier({entity: 'person', id: '*'}, {entity: 'person', id: 43})).toBeTruthy();
      expect(matchesIntentQualifier({entity: 'person', id: '*'}, {entity: 'company', id: 42})).toBeFalsy();
      expect(matchesIntentQualifier({entity: 'person', id: '*'}, {entity: 'person'})).toBeFalsy();
      expect(matchesIntentQualifier({entity: 'person', id: '*'}, {entity: 'person', id: 42, name: 'smith'})).toBeFalsy();
      expect(matchesIntentQualifier({entity: 'person', id: '*'}, null)).toBeFalsy();

      expect(matchesIntentQualifier({a: 'a', b: '*', c: 'c'}, {a: 'a', b: 'b', c: 'c'})).toBeTruthy();
      expect(matchesIntentQualifier({a: 'a', b: '*', c: 'c'}, {a: 'a', b: null, c: 'c'})).toBeFalsy();
      expect(matchesIntentQualifier({a: 'a', b: '*', c: 'c'}, {a: 'a', c: 'c'})).toBeFalsy();
      expect(matchesIntentQualifier({a: 'a', b: '*', c: 'c'}, {a: 'a', c: 'c', d: 'd'})).toBeFalsy();
    });

    it('supports value wildcards (?)', () => {
      expect(matchesIntentQualifier({entity: 'person', id: '?'}, {entity: 'person', id: 42})).toBeTruthy();
      expect(matchesIntentQualifier({entity: 'person', id: '?'}, {entity: 'person', id: '42'})).toBeTruthy();
      expect(matchesIntentQualifier({entity: 'person', id: '?'}, {entity: 'person', id: 43})).toBeTruthy();
      expect(matchesIntentQualifier({entity: 'person', id: '?'}, {entity: 'company', id: 42})).toBeFalsy();
      expect(matchesIntentQualifier({entity: 'person', id: '?'}, {entity: 'person'})).toBeTruthy();
      expect(matchesIntentQualifier({entity: 'person', id: '?'}, {entity: 'person', id: 42, name: 'smith'})).toBeFalsy();
      expect(matchesIntentQualifier({entity: 'person', id: '?'}, null)).toBeFalsy();

      expect(matchesIntentQualifier({a: 'a', b: '?', c: 'c'}, {a: 'a', b: 'b', c: 'c'})).toBeTruthy();
      expect(matchesIntentQualifier({a: 'a', b: '?', c: 'c'}, {a: 'a', b: null, c: 'c'})).toBeTruthy();
      expect(matchesIntentQualifier({a: 'a', b: '?', c: 'c'}, {a: 'a', b: undefined, c: 'c'})).toBeTruthy();
      expect(matchesIntentQualifier({a: 'a', b: '?', c: 'c'}, {a: 'a', c: 'c'})).toBeTruthy();
      expect(matchesIntentQualifier({a: 'a', b: '?', c: 'c'}, {a: 'a', c: 'c', d: 'd'})).toBeFalsy();
    });

    it('supports key wildcards (*)', () => {
      expect(matchesIntentQualifier({entity: 'person', '*': '*'}, {entity: 'person', id: 42})).toBeTruthy();
      expect(matchesIntentQualifier({entity: 'person', '*': '*'}, {entity: 'person', id: '42'})).toBeTruthy();
      expect(matchesIntentQualifier({entity: 'person', '*': '*'}, {entity: 'person', id: 43})).toBeTruthy();
      expect(matchesIntentQualifier({entity: 'person', '*': '*'}, {entity: 'company', id: 42})).toBeFalsy();
      expect(matchesIntentQualifier({entity: 'person', '*': '*'}, {entity: 'person'})).toBeTruthy();
      expect(matchesIntentQualifier({entity: 'person', '*': '*'}, {entity: 'person', id: 42, name: 'smith'})).toBeTruthy();
      expect(matchesIntentQualifier({entity: 'person', '*': '*'}, null)).toBeFalsy();
    });

    it('accepts only empty qualifiers', () => {
      expect(matchesIntentQualifier({}, {})).toBeTruthy();
      expect(matchesIntentQualifier({}, null)).toBeTruthy();
      expect(matchesIntentQualifier({}, {entity: 'person'})).toBeFalsy();
    });

    it('accepts any qualifier if providing a wildcard qualifier', () => {
      expect(matchesIntentQualifier({'*': '*'}, {})).toBeTruthy();
      expect(matchesIntentQualifier({'*': '*'}, null)).toBeTruthy();
      expect(matchesIntentQualifier({'*': '*'}, {entity: 'person'})).toBeTruthy();
    });

    it('accepts only empty qualifiers if not providing a pattern qualifier', () => {
      expect(matchesIntentQualifier(null, {})).toBeTruthy();
      expect(matchesIntentQualifier(null, null)).toBeTruthy();
      expect(matchesIntentQualifier(null, {entity: 'person'})).toBeFalsy();
    });
  });

  describe('function \'patchQualifier(...)\'', () => {

    it('returns \'NilQualifier\' for an empty intent qualifier', () => {
      expect(patchQualifier(null, null)).toEqual({});
      expect(patchQualifier(undefined, null)).toEqual({});
      expect(patchQualifier({}, null)).toEqual({});

      expect(patchQualifier(null, undefined)).toEqual({});
      expect(patchQualifier(undefined, undefined)).toEqual({});
      expect(patchQualifier({}, undefined)).toEqual({});

      expect(patchQualifier(null, {})).toEqual({});
      expect(patchQualifier(undefined, {})).toEqual({});
      expect(patchQualifier({}, {})).toEqual({});

      expect(patchQualifier(null, {entity: 'user'})).toEqual({});
      expect(patchQualifier(undefined, {entity: 'user'})).toEqual({});
      expect(patchQualifier({}, {entity: 'user'})).toEqual({});
    });

    it('returns an exact copy of the intent qualifier for an empty capability qualifier', () => {
      expect(patchQualifier({entity: 'train'}, undefined)).toEqual({entity: 'train'});
      expect(patchQualifier({entity: 'user', id: '*'}, undefined)).toEqual({entity: 'user', id: '*'});
      expect(patchQualifier({entity: 'user', id: '?'}, undefined)).toEqual({entity: 'user', id: '?'});

      expect(patchQualifier({entity: 'train'}, null)).toEqual({entity: 'train'});
      expect(patchQualifier({entity: 'user', id: '*'}, null)).toEqual({entity: 'user', id: '*'});
      expect(patchQualifier({entity: 'user', id: '?'}, null)).toEqual({entity: 'user', id: '?'});

      expect(patchQualifier({entity: 'train'}, {})).toEqual({entity: 'train'});
      expect(patchQualifier({entity: 'user', id: '*'}, {})).toEqual({entity: 'user', id: '*'});
      expect(patchQualifier({entity: 'user', id: '?'}, {})).toEqual({entity: 'user', id: '?'});
    });

    it('patches intent qualifier wildcard values by capability qualifier values', () => {
      expect(patchQualifier({entity: 'train'}, {entity: 'user'})).toEqual({entity: 'train'});
      expect(patchQualifier({entity: 'user', id: '*'}, {entity: 'user'})).toEqual({entity: 'user', id: '*'});
      expect(patchQualifier({entity: 'user', id: '?'}, {entity: 'user'})).toEqual({entity: 'user', id: '?'});

      expect(patchQualifier({entity: 'user'}, {entity: 'user'})).toEqual({entity: 'user'});
      expect(patchQualifier({entity: '*'}, {entity: 'user'})).toEqual({entity: 'user'});
      expect(patchQualifier({entity: '?'}, {entity: 'user'})).toEqual({entity: 'user'});
      expect(patchQualifier({'*': '*'}, {entity: 'user'})).toEqual({entity: 'user'});

      expect(patchQualifier({id: '42'}, {id: '42'})).toEqual({id: '42'});
      expect(patchQualifier({id: '*'}, {id: '42'})).toEqual({id: '42'});
      expect(patchQualifier({id: '?'}, {id: 42})).toEqual({id: 42});
      expect(patchQualifier({'*': '*'}, {id: 42})).toEqual({id: 42});

      expect(patchQualifier({flag: true}, {flag: true})).toEqual({flag: true});
      expect(patchQualifier({flag: '*'}, {flag: false})).toEqual({flag: false});
      expect(patchQualifier({flag: '?'}, {flag: false})).toEqual({flag: false});
    });

    it('patches intent qualifier wildcard values by capability qualifier wildcard (*) values', () => {
      expect(patchQualifier(null, {entity: 'user', id: '*'})).toEqual({});
      expect(patchQualifier(undefined, {entity: 'user', id: '*'})).toEqual({});
      expect(patchQualifier({}, {entity: 'user', id: '*'})).toEqual({});

      expect(patchQualifier({entity: 'train'}, {entity: 'user', id: '*'})).toEqual({entity: 'train'});
      expect(patchQualifier({entity: 'user'}, {entity: 'user', id: '*'})).toEqual({entity: 'user'});
      expect(patchQualifier({entity: 'user', id: '*', name: 'smith'}, {entity: 'user', id: '*'})).toEqual({entity: 'user', id: '*', name: 'smith'});
      expect(patchQualifier({entity: 'user', id: '?', name: 'smith'}, {entity: 'user', id: '*'})).toEqual({entity: 'user', id: '*', name: 'smith'});
      expect(patchQualifier({entity: 'person', '*': '*'}, {entity: 'user', id: '*'})).toEqual({entity: 'person', id: '*'});

      expect(patchQualifier({entity: 'user', id: '*'}, {entity: 'user', id: '*'})).toEqual({entity: 'user', id: '*'});
      expect(patchQualifier({entity: 'user', id: '?'}, {entity: 'user', id: '*'})).toEqual({entity: 'user', id: '*'});
      expect(patchQualifier({entity: '*', id: '*'}, {entity: 'user', id: '*'})).toEqual({entity: 'user', id: '*'});
      expect(patchQualifier({entity: '?', id: '?'}, {entity: 'user', id: '*'})).toEqual({entity: 'user', id: '*'});
      expect(patchQualifier({'*': '*'}, {entity: 'user', id: '*'})).toEqual({entity: 'user', id: '*'});
    });

    it('patches intent qualifier wildcard values by capability qualifier wildcard (?) values', () => {
      expect(patchQualifier(null, {entity: 'user', id: '?'})).toEqual({});
      expect(patchQualifier(undefined, {entity: 'user', id: '?'})).toEqual({});
      expect(patchQualifier({}, {entity: 'user', id: '?'})).toEqual({});

      expect(patchQualifier({entity: 'train'}, {entity: 'user', id: '?'})).toEqual({entity: 'train'});
      expect(patchQualifier({entity: 'user'}, {entity: 'user', id: '?'})).toEqual({entity: 'user'});
      expect(patchQualifier({entity: 'user', id: '*', name: 'smith'}, {entity: 'user', id: '?'})).toEqual({entity: 'user', id: '?', name: 'smith'});
      expect(patchQualifier({entity: 'user', id: '?', name: 'smith'}, {entity: 'user', id: '?'})).toEqual({entity: 'user', id: '?', name: 'smith'});
      expect(patchQualifier({entity: 'person', '*': '*'}, {entity: 'user', id: '?'})).toEqual({entity: 'person', id: '?'});

      expect(patchQualifier({entity: 'user', id: '*'}, {entity: 'user', id: '?'})).toEqual({entity: 'user', id: '?'});
      expect(patchQualifier({entity: 'user', id: '?'}, {entity: 'user', id: '?'})).toEqual({entity: 'user', id: '?'});
      expect(patchQualifier({entity: '*', id: '*'}, {entity: 'user', id: '?'})).toEqual({entity: 'user', id: '?'});
      expect(patchQualifier({entity: '?', id: '?'}, {entity: 'user', id: '?'})).toEqual({entity: 'user', id: '?'});
      expect(patchQualifier({'*': '*'}, {entity: 'user', id: '?'})).toEqual({entity: 'user', id: '?'});
    });
  });

  describe('function \'isEqualQualifier(...)\'', () => {

    it('equals same qualifiers', () => {
      const qualifier = {entity: 'person', id: 42};
      expect(isEqualQualifier(qualifier, qualifier)).toBeTruthy();
    });

    it('equals if all keys and values match', () => {
      expect(isEqualQualifier(null, null)).toBeTruthy();
      expect(isEqualQualifier(undefined, undefined)).toBeTruthy();
      expect(isEqualQualifier({}, {})).toBeTruthy();
      expect(isEqualQualifier({entity: 'person', id: 42}, {entity: 'person', id: 42})).toBeTruthy();
      expect(isEqualQualifier({entity: '*', id: 42}, {entity: '*', id: 42})).toBeTruthy();
      expect(isEqualQualifier({entity: '?', id: 42}, {entity: '?', id: 42})).toBeTruthy();
      expect(isEqualQualifier({'*': '*'}, {'*': '*'})).toBeTruthy();
    });

    it('is not equal if having different qualifier keys', () => {
      expect(isEqualQualifier({entity: 'person'}, {entity: 'person', id: 42})).toBeFalsy();
      expect(isEqualQualifier({entity: 'person', id: 42}, {entity: 'person'})).toBeFalsy();
    });

    it('is not equal if having different qualifier values', () => {
      expect(isEqualQualifier({entity: 'person', id: 42}, {entity: 'person', id: 43})).toBeFalsy();
      expect(isEqualQualifier({entity: 'person', id: 43}, {entity: 'person', id: 42})).toBeFalsy();
    });

    it('is not equal if comparing wildcard qualifier with specific qualifier', () => {
      expect(isEqualQualifier({'*': '*'}, {entity: 'person'})).toBeFalsy();
      expect(isEqualQualifier({entity: '*'}, {entity: 'person'})).toBeFalsy();
      expect(isEqualQualifier({entity: '?'}, {entity: 'person'})).toBeFalsy();
      expect(isEqualQualifier({entity: 'person'}, {'*': '*'})).toBeFalsy();
      expect(isEqualQualifier({entity: 'person'}, {entity: '*'})).toBeFalsy();
      expect(isEqualQualifier({entity: 'person'}, {entity: '?'})).toBeFalsy();
    });

    it('is not equal if comparing empty qualifier with non-empty qualifier', () => {
      expect(isEqualQualifier(null, {entity: 'person'})).toBeFalsy();
      expect(isEqualQualifier(undefined, {entity: 'person'})).toBeFalsy();
      expect(isEqualQualifier({}, {entity: 'person'})).toBeFalsy();
      expect(isEqualQualifier({entity: 'person'}, null)).toBeFalsy();
      expect(isEqualQualifier({entity: 'person'}, undefined)).toBeFalsy();
      expect(isEqualQualifier({entity: 'person'}, {})).toBeFalsy();
    });
  });
});
