/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { testQualifier } from '../core/qualifier-tester';

describe('Qualifier', () => {

  describe('function \'testQualifier(...)\'', () => {

    it('tests strict equality', () => {
      expect(testQualifier({entity: 'person', id: 42}, {entity: 'person', id: 42})).toBeTruthy();
      expect(testQualifier({entity: 'person', id: 42}, {entity: 'person', id: '42'})).toBeFalsy();
      expect(testQualifier({entity: 'person', id: 42}, {entity: 'person', id: 43})).toBeFalsy();
      expect(testQualifier({entity: 'person', id: 42}, {entity: 'company', id: 42})).toBeFalsy();
      expect(testQualifier({entity: 'person', id: 42}, {entity: 'person'})).toBeFalsy();
      expect(testQualifier({entity: 'person', id: 42}, {entity: 'person', id: 42, name: 'smith'})).toBeFalsy();
      expect(testQualifier({entity: 'person', id: 42}, null)).toBeFalsy();
    });

    it('supports value wildcards', () => {
      expect(testQualifier({entity: 'person', id: '*'}, {entity: 'person', id: 42})).toBeTruthy();
      expect(testQualifier({entity: 'person', id: '*'}, {entity: 'person', id: '42'})).toBeTruthy();
      expect(testQualifier({entity: 'person', id: '*'}, {entity: 'person', id: 43})).toBeTruthy();
      expect(testQualifier({entity: 'person', id: '*'}, {entity: 'company', id: 42})).toBeFalsy();
      expect(testQualifier({entity: 'person', id: '*'}, {entity: 'person'})).toBeFalsy();
      expect(testQualifier({entity: 'person', id: '*'}, {entity: 'person', id: 42, name: 'smith'})).toBeFalsy();
      expect(testQualifier({entity: 'person', id: '*'}, null)).toBeFalsy();

      expect(testQualifier({a: 'a', b: '*', c: 'c'}, {a: 'a', b: 'b', c: 'c'})).toBeTruthy();
      expect(testQualifier({a: 'a', b: '*', c: 'c'}, {a: 'a', b: null, c: 'c'})).toBeFalsy();
      expect(testQualifier({a: 'a', b: '*', c: 'c'}, {a: 'a', c: 'c'})).toBeFalsy();
      expect(testQualifier({a: 'a', b: '*', c: 'c'}, {a: 'a', c: 'c'})).toBeFalsy();
      expect(testQualifier({a: 'a', b: '*', c: 'c'}, {a: 'a', c: 'c', d: 'd'})).toBeFalsy();
    });

    it('supports key wildcards', () => {
      expect(testQualifier({entity: 'person', '*': '*'}, {entity: 'person', id: 42})).toBeTruthy();
      expect(testQualifier({entity: 'person', '*': '*'}, {entity: 'person', id: '42'})).toBeTruthy();
      expect(testQualifier({entity: 'person', '*': '*'}, {entity: 'person', id: 43})).toBeTruthy();
      expect(testQualifier({entity: 'person', '*': '*'}, {entity: 'company', id: 42})).toBeFalsy();
      expect(testQualifier({entity: 'person', '*': '*'}, {entity: 'person'})).toBeTruthy();
      expect(testQualifier({entity: 'person', '*': '*'}, {entity: 'person', id: 42, name: 'smith'})).toBeTruthy();
      expect(testQualifier({entity: 'person', '*': '*'}, null)).toBeFalsy();
    });

    it('accepts only empty qualifiers', () => {
      expect(testQualifier({}, {})).toBeTruthy();
      expect(testQualifier({}, null)).toBeTruthy();
      expect(testQualifier({}, {entity: 'person'})).toBeFalsy();
    });

    it('accepts any qualifier is providing a wildcard qualifier', () => {
      expect(testQualifier({'*': '*'}, {})).toBeTruthy();
      expect(testQualifier({'*': '*'}, null)).toBeTruthy();
      expect(testQualifier({'*': '*'}, {entity: 'person'})).toBeTruthy();
    });

    it('accepts only empty qualifiers if not providing a pattern qualifier', () => {
      expect(testQualifier(null, {})).toBeTruthy();
      expect(testQualifier(null, null)).toBeTruthy();
      expect(testQualifier(null, {entity: 'person'})).toBeFalsy();
    });
  });
});
