/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { matchesCapabilityQualifier, matchesIntentQualifier } from '../core/qualifier-tester';

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
});
