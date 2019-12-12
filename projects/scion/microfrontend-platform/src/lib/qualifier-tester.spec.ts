/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { isEqualQualifier, matchesIntentQualifier, matchesWildcardQualifier } from './qualifier-tester';
import { Qualifier } from './platform.model';

describe('QualifierTester', () => {

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
      expect(isEqualQualifier({entity: 'test', id: 42}, {entity: 'person', id: 42})).toBeFalsy();
      expect(isEqualQualifier({entity: 'person', id: 42}, {entity: 'test', id: 42})).toBeFalsy();
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

  describe('function \'matchesIntentQualifier(...)\'', () => {
    describe('check against empty qualifier', () => {
      const UndefinedQualifier = undefined;
      const NullQualifier = null;
      const EmptyQualifier = {};

      it('should match empty qualifiers', () => {
        expect(matchesIntentQualifier(UndefinedQualifier, undefined)).toBeTruthy();
        expect(matchesIntentQualifier(UndefinedQualifier, null)).toBeTruthy();
        expect(matchesIntentQualifier(UndefinedQualifier, {})).toBeTruthy();
        expect(matchesIntentQualifier(NullQualifier, undefined)).toBeTruthy();
        expect(matchesIntentQualifier(NullQualifier, null)).toBeTruthy();
        expect(matchesIntentQualifier(NullQualifier, {})).toBeTruthy();
        expect(matchesIntentQualifier(EmptyQualifier, undefined)).toBeTruthy();
        expect(matchesIntentQualifier(EmptyQualifier, null)).toBeTruthy();
        expect(matchesIntentQualifier(EmptyQualifier, {})).toBeTruthy();
      });

      it('should not match `AnyQualifier`', () => {
        expect(matchesIntentQualifier(UndefinedQualifier, {'*': '*'})).toBeFalsy();
        expect(matchesIntentQualifier(NullQualifier, {'*': '*'})).toBeFalsy();
        expect(matchesIntentQualifier(EmptyQualifier, {'*': '*'})).toBeFalsy();
      });

      it('should not match `AnyQualifier` with additional wildcard (?) qualifier value', () => {
        expect(matchesIntentQualifier(UndefinedQualifier, {'*': '*', 'entity': '?'})).toBeFalsy();
        expect(matchesIntentQualifier(NullQualifier, {'*': '*', 'entity': '?'})).toBeFalsy();
        expect(matchesIntentQualifier(EmptyQualifier, {'*': '*', 'entity': '?'})).toBeFalsy();
      });

      it('should not match `AnyQualifier` with additional wildcard (*) qualifier value', () => {
        expect(matchesIntentQualifier(UndefinedQualifier, {'*': '*', 'entity': '*'})).toBeFalsy();
        expect(matchesIntentQualifier(NullQualifier, {'*': '*', 'entity': '*'})).toBeFalsy();
        expect(matchesIntentQualifier(EmptyQualifier, {'*': '*', 'entity': '*'})).toBeFalsy();
      });

      it('should not match `AnyQualifier` with additional specific qualifier value', () => {
        expect(matchesIntentQualifier(UndefinedQualifier, {'*': '*', 'entity': 'person'})).toBeFalsy();
        expect(matchesIntentQualifier(NullQualifier, {'*': '*', 'entity': 'person'})).toBeFalsy();
        expect(matchesIntentQualifier(EmptyQualifier, {'*': '*', 'entity': 'person'})).toBeFalsy();
      });

      it('should not match qualifier containing wildcard (?) value', () => {
        expect(matchesIntentQualifier(UndefinedQualifier, {'entity': '?'})).toBeFalsy();
        expect(matchesIntentQualifier(NullQualifier, {'entity': '?'})).toBeFalsy();
        expect(matchesIntentQualifier(EmptyQualifier, {'entity': '?'})).toBeFalsy();

        expect(matchesIntentQualifier(UndefinedQualifier, {'entity': '?', 'id': '?'})).toBeFalsy();
        expect(matchesIntentQualifier(NullQualifier, {'entity': '?', 'id': '?'})).toBeFalsy();
        expect(matchesIntentQualifier(EmptyQualifier, {'entity': '?', 'id': '?'})).toBeFalsy();
      });

      it('should not match qualifier containing wildcard (*) value', () => {
        expect(matchesIntentQualifier(UndefinedQualifier, {'entity': '*'})).toBeFalsy();
        expect(matchesIntentQualifier(NullQualifier, {'entity': '*'})).toBeFalsy();
        expect(matchesIntentQualifier(EmptyQualifier, {'entity': '*'})).toBeFalsy();

        expect(matchesIntentQualifier(UndefinedQualifier, {'entity': '*', 'id': '*'})).toBeFalsy();
        expect(matchesIntentQualifier(NullQualifier, {'entity': '*', 'id': '*'})).toBeFalsy();
        expect(matchesIntentQualifier(EmptyQualifier, {'entity': '*', 'id': '*'})).toBeFalsy();
      });

      it('should not match qualifier containing specific value', () => {
        expect(matchesIntentQualifier(UndefinedQualifier, {'entity': 'person'})).toBeFalsy();
        expect(matchesIntentQualifier(NullQualifier, {'entity': 'person'})).toBeFalsy();
        expect(matchesIntentQualifier(EmptyQualifier, {'entity': 'person'})).toBeFalsy();

        expect(matchesIntentQualifier(UndefinedQualifier, {'entity': 'person', 'id': '1'})).toBeFalsy();
        expect(matchesIntentQualifier(NullQualifier, {'entity': 'person', 'id': '1'})).toBeFalsy();
        expect(matchesIntentQualifier(EmptyQualifier, {'entity': 'person', 'id': '1'})).toBeFalsy();
      });
    });

    describe('check against qualifier containing specific qualifier value', () => {
      describe('qualifier containing boolean value', () => {
        it('tests strict equality for `true`', () => {
          const BooleanQualifier = {flag: true};
          expect(matchesIntentQualifier(BooleanQualifier, {flag: true})).toBeTruthy();
          expect(matchesIntentQualifier(BooleanQualifier, {flag: false})).toBeFalsy();
          expect(matchesIntentQualifier(BooleanQualifier, {flag: null})).toBeFalsy();
          expect(matchesIntentQualifier(BooleanQualifier, {flag: undefined})).toBeFalsy();
          expect(matchesIntentQualifier(BooleanQualifier, {flag: 0})).toBeFalsy();
          expect(matchesIntentQualifier(BooleanQualifier, {flag: 1})).toBeFalsy();
          expect(matchesIntentQualifier(BooleanQualifier, {flag: 'true'})).toBeFalsy();
          expect(matchesIntentQualifier(BooleanQualifier, {flag: 'false'})).toBeFalsy();
          expect(matchesIntentQualifier(BooleanQualifier, {flag: ''})).toBeFalsy();
        });

        it('tests strict equality for `false`', () => {
          const BooleanQualifier = {flag: false};
          expect(matchesIntentQualifier(BooleanQualifier, {flag: false})).toBeTruthy();
          expect(matchesIntentQualifier(BooleanQualifier, {flag: true})).toBeFalsy();
          expect(matchesIntentQualifier(BooleanQualifier, {flag: null})).toBeFalsy();
          expect(matchesIntentQualifier(BooleanQualifier, {flag: undefined})).toBeFalsy();
          expect(matchesIntentQualifier(BooleanQualifier, {flag: 0})).toBeFalsy();
          expect(matchesIntentQualifier(BooleanQualifier, {flag: 1})).toBeFalsy();
          expect(matchesIntentQualifier(BooleanQualifier, {flag: 'true'})).toBeFalsy();
          expect(matchesIntentQualifier(BooleanQualifier, {flag: 'false'})).toBeFalsy();
          expect(matchesIntentQualifier(BooleanQualifier, {flag: ''})).toBeFalsy();
        });
      });

      describe('qualifier containing numeric value', () => {
        const NumericQualifier = {id: 1};

        it('tests strict equality', () => {
          expect(matchesIntentQualifier(NumericQualifier, {id: 1})).toBeTruthy();
          expect(matchesIntentQualifier(NumericQualifier, {id: '1'})).toBeFalsy();
          expect(matchesIntentQualifier(NumericQualifier, {id: 2})).toBeFalsy();
          expect(matchesIntentQualifier(NumericQualifier, {id: undefined})).toBeFalsy();
          expect(matchesIntentQualifier(NumericQualifier, {id: null})).toBeFalsy();
          expect(matchesIntentQualifier(NumericQualifier, {id: true})).toBeFalsy();
          expect(matchesIntentQualifier(NumericQualifier, {id: false})).toBeFalsy();
          expect(matchesIntentQualifier(NumericQualifier, {id: ''})).toBeFalsy();
        });
      });

      describe('qualifier containing single key', () => {
        const SpecificQualifier = {'entity': 'person'};

        it('should not match empty qualifiers', () => {
          expect(matchesIntentQualifier(SpecificQualifier, undefined)).toBeFalsy();
          expect(matchesIntentQualifier(SpecificQualifier, null)).toBeFalsy();
          expect(matchesIntentQualifier(SpecificQualifier, {})).toBeFalsy();
        });

        it('should not match `AnyQualifier`', () => {
          expect(matchesIntentQualifier(SpecificQualifier, {'*': '*'})).toBeFalsy();
        });

        it('should not match `AnyQualifier` with additional wildcard (?) qualifier value', () => {
          expect(matchesIntentQualifier(SpecificQualifier, {'*': '*', 'entity': '?'})).toBeFalsy();
        });

        it('should not match `AnyQualifier` with additional wildcard (*) qualifier value', () => {
          expect(matchesIntentQualifier(SpecificQualifier, {'*': '*', 'entity': '*'})).toBeFalsy();
        });

        it('should not match `AnyQualifier` with additional specific qualifier value', () => {
          expect(matchesIntentQualifier(SpecificQualifier, {'*': '*', 'entity': 'person'})).toBeFalsy();
        });

        it('should match exact qualifier', () => {
          expect(matchesIntentQualifier(SpecificQualifier, {'entity': 'person'})).toBeTruthy();
        });

        it('should not match qualifier containing specific value and additional wildcard (?) value', () => {
          expect(matchesIntentQualifier(SpecificQualifier, {'entity': 'person', 'id': '?'})).toBeFalsy();
        });

        it('should not match qualifier containing specific value and additional wildcard (*) value', () => {
          expect(matchesIntentQualifier(SpecificQualifier, {'entity': 'person', 'id': '*'})).toBeFalsy();
        });

        it('should not match qualifier containing specific value and additional specific value', () => {
          expect(matchesIntentQualifier(SpecificQualifier, {'entity': 'person', 'id': '1'})).toBeFalsy();
        });

        it('should not match qualifier containing wildcard (?) value', () => {
          expect(matchesIntentQualifier(SpecificQualifier, {'entity': '?'})).toBeFalsy();
        });

        it('should not match qualifier containing wildcard (?) value and additional wildcard (?) value', () => {
          expect(matchesIntentQualifier(SpecificQualifier, {'entity': '?', 'id': '?'})).toBeFalsy();
        });

        it('should not match qualifier containing wildcard (?) value and additional wildcard (*) value', () => {
          expect(matchesIntentQualifier(SpecificQualifier, {'entity': '?', 'id': '*'})).toBeFalsy();
        });

        it('should not match qualifier containing wildcard (?) value and additional specific value', () => {
          expect(matchesIntentQualifier(SpecificQualifier, {'entity': '?', 'id': '1'})).toBeFalsy();
        });

        it('should not match qualifier containing wildcard (*) value', () => {
          expect(matchesIntentQualifier(SpecificQualifier, {'entity': '*'})).toBeFalsy();
        });

        it('should not match qualifier containing wildcard (*) value and additional wildcard (*) value', () => {
          expect(matchesIntentQualifier(SpecificQualifier, {'entity': '*', 'id': '*'})).toBeFalsy();
        });

        it('should not match qualifier containing wildcard (*) value and additional wildcard (?) value', () => {
          expect(matchesIntentQualifier(SpecificQualifier, {'entity': '*', 'id': '?'})).toBeFalsy();
        });

        it('should not match qualifier containing wildcard (*) value and additional specific value', () => {
          expect(matchesIntentQualifier(SpecificQualifier, {'entity': '*', 'id': '1'})).toBeFalsy();
        });
      });

      describe('qualifier containing multiple keys', () => {
        const SpecificQualifier = {'entity': 'person', 'type': 'user'};

        it('should not match empty qualifiers', () => {
          expect(matchesIntentQualifier(SpecificQualifier, undefined)).toBeFalsy();
          expect(matchesIntentQualifier(SpecificQualifier, null)).toBeFalsy();
          expect(matchesIntentQualifier(SpecificQualifier, {})).toBeFalsy();
        });

        it('should not match `AnyQualifier`', () => {
          expect(matchesIntentQualifier(SpecificQualifier, {'*': '*'})).toBeFalsy();
        });

        it('should not match `AnyQualifier` with additional wildcard (?) qualifier values', () => {
          expect(matchesIntentQualifier(SpecificQualifier, {'*': '*', 'entity': '?', 'type': '?'})).toBeFalsy();
        });

        it('should not match `AnyQualifier` with additional wildcard (*) qualifier values', () => {
          expect(matchesIntentQualifier(SpecificQualifier, {'*': '*', 'entity': '*', 'type': '*'})).toBeFalsy();
        });

        it('should not match `AnyQualifier` with additional specific qualifier values', () => {
          expect(matchesIntentQualifier(SpecificQualifier, {'*': '*', 'entity': 'person', 'type': 'user'})).toBeFalsy();
        });

        it('should match exact qualifier', () => {
          expect(matchesIntentQualifier(SpecificQualifier, {'entity': 'person', 'type': 'user'})).toBeTruthy();
        });

        it('should not match qualifier containing specific values and additional wildcard (?) value', () => {
          expect(matchesIntentQualifier(SpecificQualifier, {'entity': 'person', 'type': 'user', 'id': '?'})).toBeFalsy();
        });

        it('should not match qualifier containing specific values and additional wildcard (*) value', () => {
          expect(matchesIntentQualifier(SpecificQualifier, {'entity': 'person', 'type': 'user', 'id': '*'})).toBeFalsy();
        });

        it('should not match qualifier containing specific values and additional specific value', () => {
          expect(matchesIntentQualifier(SpecificQualifier, {'entity': 'person', 'type': 'user', 'id': '1'})).toBeFalsy();
        });

        it('should not match qualifier missing a key', () => {
          expect(matchesIntentQualifier(SpecificQualifier, {'entity': 'person'})).toBeFalsy();
          expect(matchesIntentQualifier(SpecificQualifier, {'type': 'user'})).toBeFalsy();
        });

        it('should not match qualifier containing different entity value', () => {
          expect(matchesIntentQualifier(SpecificQualifier, {'entity': 'x', 'type': 'user'})).toBeFalsy();
        });

        it('should not match qualifier containing different type value', () => {
          expect(matchesIntentQualifier(SpecificQualifier, {'entity': 'person', 'type': 'x'})).toBeFalsy();
        });

        it('should not match qualifier containing wildcard (?) values', () => {
          expect(matchesIntentQualifier(SpecificQualifier, {'entity': '?', 'type': '?'})).toBeFalsy();
        });

        it('should not match qualifier containing wildcard (?) values and additional wildcard (?) value', () => {
          expect(matchesIntentQualifier(SpecificQualifier, {'entity': '?', 'type': '?', 'id': '?'})).toBeFalsy();
        });

        it('should not match qualifier containing wildcard (?) values and additional wildcard (*) value', () => {
          expect(matchesIntentQualifier(SpecificQualifier, {'entity': '?', 'type': '?', 'id': '*'})).toBeFalsy();
        });

        it('should not match qualifier containing wildcard (?) values and additional specific value', () => {
          expect(matchesIntentQualifier(SpecificQualifier, {'entity': '?', 'type': '?', 'id': '1'})).toBeFalsy();
        });

        it('should not match qualifier containing wildcard (*) values', () => {
          expect(matchesIntentQualifier(SpecificQualifier, {'entity': '*', 'type': '*'})).toBeFalsy();
        });

        it('should not match qualifier containing wildcard (*) values and additional wildcard (*) value', () => {
          expect(matchesIntentQualifier(SpecificQualifier, {'entity': '*', 'type': '*', 'id': '*'})).toBeFalsy();
        });

        it('should not match qualifier containing wildcard (*) values and additional wildcard (?) value', () => {
          expect(matchesIntentQualifier(SpecificQualifier, {'entity': '*', 'type': '*', 'id': '?'})).toBeFalsy();
        });

        it('should not match qualifier containing wildcard (*) values and additional specific value', () => {
          expect(matchesIntentQualifier(SpecificQualifier, {'entity': '*', 'type': '*', 'id': '1'})).toBeFalsy();
        });

        it('should not match qualifier containing a combination of specific values and wildcard values', () => {
          expect(matchesIntentQualifier(SpecificQualifier, {'entity': 'person', 'type': '*'})).toBeFalsy();
          expect(matchesIntentQualifier(SpecificQualifier, {'entity': 'person', 'type': '?'})).toBeFalsy();
          expect(matchesIntentQualifier(SpecificQualifier, {'entity': '*', 'type': 'user'})).toBeFalsy();
          expect(matchesIntentQualifier(SpecificQualifier, {'entity': '?', 'type': 'user'})).toBeFalsy();
          expect(matchesIntentQualifier(SpecificQualifier, {'entity': '?', 'type': '*'})).toBeFalsy();
          expect(matchesIntentQualifier(SpecificQualifier, {'entity': '*', 'type': '?'})).toBeFalsy();
        });

        it('should not match qualifier containing a combination of specific values and wildcard values and additional wildcard (?) value', () => {
          expect(matchesIntentQualifier(SpecificQualifier, {'entity': 'person', 'type': '*', 'id': '?'})).toBeFalsy();
          expect(matchesIntentQualifier(SpecificQualifier, {'entity': 'person', 'type': '?', 'id': '?'})).toBeFalsy();
          expect(matchesIntentQualifier(SpecificQualifier, {'entity': '*', 'type': 'user', 'id': '?'})).toBeFalsy();
          expect(matchesIntentQualifier(SpecificQualifier, {'entity': '?', 'type': 'user', 'id': '?'})).toBeFalsy();
          expect(matchesIntentQualifier(SpecificQualifier, {'entity': '?', 'type': '*', 'id': '?'})).toBeFalsy();
          expect(matchesIntentQualifier(SpecificQualifier, {'entity': '*', 'type': '?', 'id': '?'})).toBeFalsy();
        });

        it('should not match qualifier containing a combination of specific values and wildcard values and additional wildcard (*) value', () => {
          expect(matchesIntentQualifier(SpecificQualifier, {'entity': 'person', 'type': '*', 'id': '*'})).toBeFalsy();
          expect(matchesIntentQualifier(SpecificQualifier, {'entity': 'person', 'type': '?', 'id': '*'})).toBeFalsy();
          expect(matchesIntentQualifier(SpecificQualifier, {'entity': '*', 'type': 'user', 'id': '*'})).toBeFalsy();
          expect(matchesIntentQualifier(SpecificQualifier, {'entity': '?', 'type': 'user', 'id': '*'})).toBeFalsy();
          expect(matchesIntentQualifier(SpecificQualifier, {'entity': '?', 'type': '*', 'id': '*'})).toBeFalsy();
          expect(matchesIntentQualifier(SpecificQualifier, {'entity': '*', 'type': '?', 'id': '*'})).toBeFalsy();
        });

        it('should not match qualifier containing a combination of specific values and wildcard values and additional specific value', () => {
          expect(matchesIntentQualifier(SpecificQualifier, {'entity': 'person', 'type': '*', 'id': '1'})).toBeFalsy();
          expect(matchesIntentQualifier(SpecificQualifier, {'entity': 'person', 'type': '?', 'id': '1'})).toBeFalsy();
          expect(matchesIntentQualifier(SpecificQualifier, {'entity': '*', 'type': 'user', 'id': '1'})).toBeFalsy();
          expect(matchesIntentQualifier(SpecificQualifier, {'entity': '?', 'type': 'user', 'id': '1'})).toBeFalsy();
          expect(matchesIntentQualifier(SpecificQualifier, {'entity': '?', 'type': '*', 'id': '1'})).toBeFalsy();
          expect(matchesIntentQualifier(SpecificQualifier, {'entity': '*', 'type': '?', 'id': '1'})).toBeFalsy();
        });
      });
    });

    describe('check against qualifier containing wildcard (*) qualifier value', () => {
      describe('qualifier containing single key', () => {
        const AsteriskQualifier = {'entity': '*'};

        it('should not match empty qualifiers', () => {
          expect(matchesIntentQualifier(AsteriskQualifier, undefined)).toBeFalsy();
          expect(matchesIntentQualifier(AsteriskQualifier, null)).toBeFalsy();
          expect(matchesIntentQualifier(AsteriskQualifier, {})).toBeFalsy();
        });

        it('should not match `AnyQualifier`', () => {
          expect(matchesIntentQualifier(AsteriskQualifier, {'*': '*'})).toBeFalsy();
        });

        it('should not match `AnyQualifier` with additional wildcard (?) qualifier value', () => {
          expect(matchesIntentQualifier(AsteriskQualifier, {'*': '*', 'entity': '?'})).toBeFalsy();
        });

        it('should not match `AnyQualifier` with additional wildcard (*) qualifier value', () => {
          expect(matchesIntentQualifier(AsteriskQualifier, {'*': '*', 'entity': '*'})).toBeFalsy();
        });

        it('should not match `AnyQualifier` with additional specific qualifier value', () => {
          expect(matchesIntentQualifier(AsteriskQualifier, {'*': '*', 'entity': 'person'})).toBeFalsy();
        });

        it('should match exact qualifier (asterisk is interpreted as value, not as wildcard)', () => {
          expect(matchesIntentQualifier(AsteriskQualifier, {'entity': '*'})).toBeTruthy();
        });

        it('should match qualifier containing specific value', () => {
          expect(matchesIntentQualifier(AsteriskQualifier, {'entity': 'person'})).toBeTruthy();
        });

        it('should not match qualifier containing specific value and additional wildcard (?) value', () => {
          expect(matchesIntentQualifier(AsteriskQualifier, {'entity': 'person', 'id': '?'})).toBeFalsy();
        });

        it('should not match qualifier containing specific value and additional wildcard (*) value', () => {
          expect(matchesIntentQualifier(AsteriskQualifier, {'entity': 'person', 'id': '*'})).toBeFalsy();
        });

        it('should not match qualifier containing specific value and additional specific value', () => {
          expect(matchesIntentQualifier(AsteriskQualifier, {'entity': 'person', 'id': '1'})).toBeFalsy();
        });

        it('should match qualifier containing question mark (?) value (question mark is interpreted as value, not as wildcard)', () => {
          expect(matchesIntentQualifier(AsteriskQualifier, {'entity': '?'})).toBeTruthy();
        });

        it('should not match qualifier containing wildcard (?) value and additional wildcard (?) value', () => {
          expect(matchesIntentQualifier(AsteriskQualifier, {'entity': '?', 'id': '?'})).toBeFalsy();
        });

        it('should not match qualifier containing wildcard (?) value and additional wildcard (*) value', () => {
          expect(matchesIntentQualifier(AsteriskQualifier, {'entity': '?', 'id': '*'})).toBeFalsy();
        });

        it('should not match qualifier containing wildcard (?) value and additional specific value', () => {
          expect(matchesIntentQualifier(AsteriskQualifier, {'entity': '?', 'id': '1'})).toBeFalsy();
        });

        it('should match qualifier containing asterisk (*) value (asterisk is interpreted as value, not as wildcard)', () => {
          expect(matchesIntentQualifier(AsteriskQualifier, {'entity': '*'})).toBeTruthy();
        });

        it('should not match qualifier containing wildcard (*) value and additional wildcard (*) value', () => {
          expect(matchesIntentQualifier(AsteriskQualifier, {'entity': '*', 'id': '*'})).toBeFalsy();
        });

        it('should not match qualifier containing wildcard (*) value and additional wildcard (?) value', () => {
          expect(matchesIntentQualifier(AsteriskQualifier, {'entity': '*', 'id': '?'})).toBeFalsy();
        });

        it('should not match qualifier containing wildcard (*) value and additional specific value', () => {
          expect(matchesIntentQualifier(AsteriskQualifier, {'entity': '*', 'id': '1'})).toBeFalsy();
        });
      });

      describe('qualifier containing multiple keys', () => {
        describe('qualifier only contains wildcard (*) qualifier values', () => {
          const AsteriskQualifier = {'entity': '*', 'type': '*'};

          it('should not match empty qualifiers', () => {
            expect(matchesIntentQualifier(AsteriskQualifier, undefined)).toBeFalsy();
            expect(matchesIntentQualifier(AsteriskQualifier, null)).toBeFalsy();
            expect(matchesIntentQualifier(AsteriskQualifier, {})).toBeFalsy();
          });

          it('should not match `AnyQualifier`', () => {
            expect(matchesIntentQualifier(AsteriskQualifier, {'*': '*'})).toBeFalsy();
          });

          it('should not match `AnyQualifier` with additional wildcard (?) qualifier values', () => {
            expect(matchesIntentQualifier(AsteriskQualifier, {'*': '*', 'entity': '?', 'type': '?'})).toBeFalsy();
          });

          it('should not match `AnyQualifier` with additional wildcard (*) qualifier values', () => {
            expect(matchesIntentQualifier(AsteriskQualifier, {'*': '*', 'entity': '*', 'type': '*'})).toBeFalsy();
          });

          it('should not match `AnyQualifier` with additional specific qualifier values', () => {
            expect(matchesIntentQualifier(AsteriskQualifier, {'*': '*', 'entity': 'person', 'type': 'user'})).toBeFalsy();
          });

          it('should match exact qualifier (asterisks are interpreted as values, not as wildcards)', () => {
            expect(matchesIntentQualifier(AsteriskQualifier, {'entity': '*', 'type': '*'})).toBeTruthy();
          });

          it('should match qualifier containing specific values', () => {
            expect(matchesIntentQualifier(AsteriskQualifier, {'entity': 'person', 'type': 'user'})).toBeTruthy();
          });

          it('should not match qualifier containing specific values and additional wildcard (?) value', () => {
            expect(matchesIntentQualifier(AsteriskQualifier, {'entity': 'person', 'type': 'user', 'id': '?'})).toBeFalsy();
          });

          it('should not match qualifier containing specific values and additional wildcard (*) value', () => {
            expect(matchesIntentQualifier(AsteriskQualifier, {'entity': 'person', 'type': 'user', 'id': '*'})).toBeFalsy();
          });

          it('should not match qualifier containing specific values and additional specific value', () => {
            expect(matchesIntentQualifier(AsteriskQualifier, {'entity': 'person', 'type': 'user', 'id': '1'})).toBeFalsy();
          });

          it('should not match qualifier missing a key', () => {
            expect(matchesIntentQualifier(AsteriskQualifier, {'entity': '*'})).toBeFalsy();
            expect(matchesIntentQualifier(AsteriskQualifier, {'type': '*'})).toBeFalsy();
          });

          it('should not match qualifier containing wildcard (?) values and additional wildcard (?) value', () => {
            expect(matchesIntentQualifier(AsteriskQualifier, {'entity': '?', 'type': '?', 'id': '?'})).toBeFalsy();
          });

          it('should not match qualifier containing wildcard (?) values and additional wildcard (*) value', () => {
            expect(matchesIntentQualifier(AsteriskQualifier, {'entity': '?', 'type': '?', 'id': '*'})).toBeFalsy();
          });

          it('should not match qualifier containing wildcard (?) values and additional specific value', () => {
            expect(matchesIntentQualifier(AsteriskQualifier, {'entity': '?', 'type': '?', 'id': '1'})).toBeFalsy();
          });

          it('should match qualifier containing asterisk (*) values (asterisks are interpreted as value, not as wildcard)', () => {
            expect(matchesIntentQualifier(AsteriskQualifier, {'entity': '*', 'type': '*'})).toBeTruthy();
          });

          it('should not match qualifier containing wildcard (*) values and additional wildcard (*) value', () => {
            expect(matchesIntentQualifier(AsteriskQualifier, {'entity': '*', 'type': '*', 'id': '*'})).toBeFalsy();
          });

          it('should not match qualifier containing wildcard (*) values and additional wildcard (?) value', () => {
            expect(matchesIntentQualifier(AsteriskQualifier, {'entity': '*', 'type': '*', 'id': '?'})).toBeFalsy();
          });

          it('should not match qualifier containing wildcard (*) values and additional specific value', () => {
            expect(matchesIntentQualifier(AsteriskQualifier, {'entity': '*', 'type': '*', 'id': '1'})).toBeFalsy();
          });

          it('should match qualifier containing a combination of specific values and (* and ?) values (asterisk and question mark are interpreted as values, not as wildcards)', () => {
            expect(matchesIntentQualifier(AsteriskQualifier, {'entity': 'person', 'type': '*'})).toBeTruthy();
            expect(matchesIntentQualifier(AsteriskQualifier, {'entity': 'person', 'type': '?'})).toBeTruthy();
            expect(matchesIntentQualifier(AsteriskQualifier, {'entity': '*', 'type': 'user'})).toBeTruthy();
            expect(matchesIntentQualifier(AsteriskQualifier, {'entity': '?', 'type': 'user'})).toBeTruthy();
            expect(matchesIntentQualifier(AsteriskQualifier, {'entity': '?', 'type': '*'})).toBeTruthy();
            expect(matchesIntentQualifier(AsteriskQualifier, {'entity': '*', 'type': '?'})).toBeTruthy();
          });

          it('should not match qualifier containing a combination of specific values and wildcard values and additional wildcard (?) value', () => {
            expect(matchesIntentQualifier(AsteriskQualifier, {'entity': 'person', 'type': '*', 'id': '?'})).toBeFalsy();
            expect(matchesIntentQualifier(AsteriskQualifier, {'entity': 'person', 'type': '?', 'id': '?'})).toBeFalsy();
            expect(matchesIntentQualifier(AsteriskQualifier, {'entity': '*', 'type': 'user', 'id': '?'})).toBeFalsy();
            expect(matchesIntentQualifier(AsteriskQualifier, {'entity': '?', 'type': 'user', 'id': '?'})).toBeFalsy();
            expect(matchesIntentQualifier(AsteriskQualifier, {'entity': '?', 'type': '*', 'id': '?'})).toBeFalsy();
            expect(matchesIntentQualifier(AsteriskQualifier, {'entity': '*', 'type': '?', 'id': '?'})).toBeFalsy();
          });

          it('should not match qualifier containing a combination of specific values and wildcard values and additional wildcard (*) value', () => {
            expect(matchesIntentQualifier(AsteriskQualifier, {'entity': 'person', 'type': '*', 'id': '*'})).toBeFalsy();
            expect(matchesIntentQualifier(AsteriskQualifier, {'entity': 'person', 'type': '?', 'id': '*'})).toBeFalsy();
            expect(matchesIntentQualifier(AsteriskQualifier, {'entity': '*', 'type': 'user', 'id': '*'})).toBeFalsy();
            expect(matchesIntentQualifier(AsteriskQualifier, {'entity': '?', 'type': 'user', 'id': '*'})).toBeFalsy();
            expect(matchesIntentQualifier(AsteriskQualifier, {'entity': '?', 'type': '*', 'id': '*'})).toBeFalsy();
            expect(matchesIntentQualifier(AsteriskQualifier, {'entity': '*', 'type': '?', 'id': '*'})).toBeFalsy();
          });

          it('should not match qualifier containing a combination of specific values and wildcard values and additional specific value', () => {
            expect(matchesIntentQualifier(AsteriskQualifier, {'entity': 'person', 'type': '*', 'id': '1'})).toBeFalsy();
            expect(matchesIntentQualifier(AsteriskQualifier, {'entity': 'person', 'type': '?', 'id': '1'})).toBeFalsy();
            expect(matchesIntentQualifier(AsteriskQualifier, {'entity': '*', 'type': 'user', 'id': '1'})).toBeFalsy();
            expect(matchesIntentQualifier(AsteriskQualifier, {'entity': '?', 'type': 'user', 'id': '1'})).toBeFalsy();
            expect(matchesIntentQualifier(AsteriskQualifier, {'entity': '?', 'type': '*', 'id': '1'})).toBeFalsy();
            expect(matchesIntentQualifier(AsteriskQualifier, {'entity': '*', 'type': '?', 'id': '1'})).toBeFalsy();
          });
        });

        describe('qualifier contains combination of wildcard (*) and specific qualifier values', () => {
          const CombinedQualifier = {'entity': '*', 'type': 'user'};

          it('should not match empty qualifiers', () => {
            expect(matchesIntentQualifier(CombinedQualifier, undefined)).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, null)).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {})).toBeFalsy();
          });

          it('should not match `AnyQualifier`', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'*': '*'})).toBeFalsy();
          });

          it('should not match `AnyQualifier` with additional wildcard (?) qualifier values', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'*': '*', 'entity': '?', 'type': '?'})).toBeFalsy();
          });

          it('should not match `AnyQualifier` with additional wildcard (*) qualifier values', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'*': '*', 'entity': '*', 'type': '*'})).toBeFalsy();
          });

          it('should not match `AnyQualifier` with additional specific qualifier values', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'*': '*', 'entity': 'person', 'type': 'user'})).toBeFalsy();
          });

          it('should match exact qualifier (asterisk is interpreted as value, not as wildcard)', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': 'user'})).toBeTruthy();
          });

          it('should match qualifier containing specific values', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': 'user'})).toBeTruthy();
          });

          it('should not match qualifier containing specific values and additional wildcard (?) value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': 'user', 'id': '?'})).toBeFalsy();
          });

          it('should not match qualifier containing specific values and additional wildcard (*) value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': 'user', 'id': '*'})).toBeFalsy();
          });

          it('should not match qualifier containing specific values and additional specific value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': 'user', 'id': '1'})).toBeFalsy();
          });

          it('should not match qualifier missing a key', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'type': 'user'})).toBeFalsy();
          });

          it('should not match qualifier containing different type value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': 'x'})).toBeFalsy();
          });

          it('should not match qualifier containing question mark (?) values (type has to be `user`)', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': '?'})).toBeFalsy();
          });

          it('should not match qualifier containing wildcard (?) values and additional wildcard (?) value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': '?', 'id': '?'})).toBeFalsy();
          });

          it('should not match qualifier containing wildcard (?) values and additional wildcard (*) value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': '?', 'id': '*'})).toBeFalsy();
          });

          it('should not match qualifier containing wildcard (?) values and additional specific value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': '?', 'id': '1'})).toBeFalsy();
          });

          it('should not match qualifier containing wildcard (*) values (type has to be `user`)', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': '*'})).toBeFalsy();
          });

          it('should not match qualifier containing wildcard (*) values and additional wildcard (*) value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': '*', 'id': '*'})).toBeFalsy();
          });

          it('should not match qualifier containing wildcard (*) values and additional wildcard (?) value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': '*', 'id': '?'})).toBeFalsy();
          });

          it('should not match qualifier containing wildcard (*) values and additional specific value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': '*', 'id': '1'})).toBeFalsy();
          });

          it('should match qualifier containing a combination of (* and ?) for entity and `user` for type', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': 'user'})).toBeTruthy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': 'user'})).toBeTruthy();
          });

          it('should not match qualifier containing a (* and ?) for type', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': '*'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': '?'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': '*'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': '?'})).toBeFalsy();
          });

          it('should not match qualifier containing a combination of specific values and wildcard values and additional wildcard (?) value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': '*', 'id': '?'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': '?', 'id': '?'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': 'user', 'id': '?'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': 'user', 'id': '?'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': '*', 'id': '?'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': '?', 'id': '?'})).toBeFalsy();
          });

          it('should not match qualifier containing a combination of specific values and wildcard values and additional wildcard (*) value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': '*', 'id': '*'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': '?', 'id': '*'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': 'user', 'id': '*'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': 'user', 'id': '*'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': '*', 'id': '*'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': '?', 'id': '*'})).toBeFalsy();
          });

          it('should not match qualifier containing a combination of specific values and wildcard values and additional specific value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': '*', 'id': '1'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': '?', 'id': '1'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': 'user', 'id': '1'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': 'user', 'id': '1'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': '*', 'id': '1'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': '?', 'id': '1'})).toBeFalsy();
          });
        });
      });
    });

    describe('check against qualifier containing wildcard (?) qualifier value', () => {
      describe('qualifier containing single key', () => {
        const OptionalQualifier = {'entity': '?'};

        it('should match empty qualifiers', () => {
          expect(matchesIntentQualifier(OptionalQualifier, undefined)).toBeTruthy();
          expect(matchesIntentQualifier(OptionalQualifier, null)).toBeTruthy();
          expect(matchesIntentQualifier(OptionalQualifier, {})).toBeTruthy();
        });

        it('should not match `AnyQualifier`', () => {
          expect(matchesIntentQualifier(OptionalQualifier, {'*': '*'})).toBeFalsy();
        });

        it('should not match `AnyQualifier` with additional wildcard (?) qualifier value', () => {
          expect(matchesIntentQualifier(OptionalQualifier, {'*': '*', 'entity': '?'})).toBeFalsy();
        });

        it('should not match `AnyQualifier` with additional wildcard (*) qualifier value', () => {
          expect(matchesIntentQualifier(OptionalQualifier, {'*': '*', 'entity': '*'})).toBeFalsy();
        });

        it('should not match `AnyQualifier` with additional specific qualifier value', () => {
          expect(matchesIntentQualifier(OptionalQualifier, {'*': '*', 'entity': 'person'})).toBeFalsy();
        });

        it('should match exact qualifier (question mark is interpreted as value, not as wildcard)', () => {
          expect(matchesIntentQualifier(OptionalQualifier, {'entity': '?'})).toBeTruthy();
        });

        it('should match qualifier containing specific value', () => {
          expect(matchesIntentQualifier(OptionalQualifier, {'entity': 'person'})).toBeTruthy();
        });

        it('should not match qualifier containing specific value and additional wildcard (?) value', () => {
          expect(matchesIntentQualifier(OptionalQualifier, {'entity': 'person', 'id': '?'})).toBeFalsy();
        });

        it('should not match qualifier containing specific value and additional wildcard (*) value', () => {
          expect(matchesIntentQualifier(OptionalQualifier, {'entity': 'person', 'id': '*'})).toBeFalsy();
        });

        it('should not match qualifier containing specific value and additional specific value', () => {
          expect(matchesIntentQualifier(OptionalQualifier, {'entity': 'person', 'id': '1'})).toBeFalsy();
        });

        it('should match qualifier containing question mark (?) value (question mark is interpreted as value, not as wildcard)', () => {
          expect(matchesIntentQualifier(OptionalQualifier, {'entity': '?'})).toBeTruthy();
        });

        it('should not match qualifier containing wildcard (?) value and additional wildcard (?) value', () => {
          expect(matchesIntentQualifier(OptionalQualifier, {'entity': '?', 'id': '?'})).toBeFalsy();
        });

        it('should not match qualifier containing wildcard (?) value and additional wildcard (*) value', () => {
          expect(matchesIntentQualifier(OptionalQualifier, {'entity': '?', 'id': '*'})).toBeFalsy();
        });

        it('should not match qualifier containing wildcard (?) value and additional specific value', () => {
          expect(matchesIntentQualifier(OptionalQualifier, {'entity': '?', 'id': '1'})).toBeFalsy();
        });

        it('should match qualifier containing asterisk (*) value (asterisk is interpreted as value, not as wildcard)', () => {
          expect(matchesIntentQualifier(OptionalQualifier, {'entity': '*'})).toBeTruthy();
        });

        it('should not match qualifier containing wildcard (*) value and additional wildcard (*) value', () => {
          expect(matchesIntentQualifier(OptionalQualifier, {'entity': '*', 'id': '*'})).toBeFalsy();
        });

        it('should not match qualifier containing wildcard (*) value and additional wildcard (?) value', () => {
          expect(matchesIntentQualifier(OptionalQualifier, {'entity': '*', 'id': '?'})).toBeFalsy();
        });

        it('should not match qualifier containing wildcard (*) value and additional specific value', () => {
          expect(matchesIntentQualifier(OptionalQualifier, {'entity': '*', 'id': '1'})).toBeFalsy();
        });
      });

      describe('qualifier containing multiple keys', () => {
        describe('qualifier only contains wildcard (?) qualifier values', () => {
          const OptionalQualifier = {'entity': '?', 'type': '?'};

          it('should match empty qualifiers', () => {
            expect(matchesIntentQualifier(OptionalQualifier, undefined)).toBeTruthy();
            expect(matchesIntentQualifier(OptionalQualifier, null)).toBeTruthy();
            expect(matchesIntentQualifier(OptionalQualifier, {})).toBeTruthy();
          });

          it('should not match `AnyQualifier`', () => {
            expect(matchesIntentQualifier(OptionalQualifier, {'*': '*'})).toBeFalsy();
          });

          it('should not match `AnyQualifier` with additional wildcard (?) qualifier values', () => {
            expect(matchesIntentQualifier(OptionalQualifier, {'*': '*', 'entity': '?', 'type': '?'})).toBeFalsy();
          });

          it('should not match `AnyQualifier` with additional wildcard (*) qualifier values', () => {
            expect(matchesIntentQualifier(OptionalQualifier, {'*': '*', 'entity': '*', 'type': '*'})).toBeFalsy();
          });

          it('should not match `AnyQualifier` with additional specific qualifier values', () => {
            expect(matchesIntentQualifier(OptionalQualifier, {'*': '*', 'entity': 'person', 'type': 'user'})).toBeFalsy();
          });

          it('should match exact qualifier (question marks are interpreted as values, not as wildcards)', () => {
            expect(matchesIntentQualifier(OptionalQualifier, {'entity': '?', 'type': '?'})).toBeTruthy();
          });

          it('should not match qualifier containing specific values and additional wildcard (?) value', () => {
            expect(matchesIntentQualifier(OptionalQualifier, {'entity': 'person', 'type': 'user', 'id': '?'})).toBeFalsy();
          });

          it('should not match qualifier containing specific values and additional wildcard (*) value', () => {
            expect(matchesIntentQualifier(OptionalQualifier, {'entity': 'person', 'type': 'user', 'id': '*'})).toBeFalsy();
          });

          it('should not match qualifier containing specific values and additional specific value', () => {
            expect(matchesIntentQualifier(OptionalQualifier, {'entity': 'person', 'type': 'user', 'id': '1'})).toBeFalsy();
          });

          it('should match qualifier missing a key', () => {
            expect(matchesIntentQualifier(OptionalQualifier, {'entity': '?'})).toBeTruthy();
            expect(matchesIntentQualifier(OptionalQualifier, {'type': '?'})).toBeTruthy();
          });

          it('should not match qualifier containing wildcard (?) values and additional wildcard (?) value', () => {
            expect(matchesIntentQualifier(OptionalQualifier, {'entity': '?', 'type': '?', 'id': '?'})).toBeFalsy();
          });

          it('should not match qualifier containing wildcard (?) values and additional wildcard (*) value', () => {
            expect(matchesIntentQualifier(OptionalQualifier, {'entity': '?', 'type': '?', 'id': '*'})).toBeFalsy();
          });

          it('should not match qualifier containing wildcard (?) values and additional specific value', () => {
            expect(matchesIntentQualifier(OptionalQualifier, {'entity': '?', 'type': '?', 'id': '1'})).toBeFalsy();
          });

          it('should match qualifier containing asterisk (*) values (asterisks are interpreted as values, not as wildcards)', () => {
            expect(matchesIntentQualifier(OptionalQualifier, {'entity': '*', 'type': '*'})).toBeTruthy();
          });

          it('should not match qualifier containing wildcard (*) values and additional wildcard (*) value', () => {
            expect(matchesIntentQualifier(OptionalQualifier, {'entity': '*', 'type': '*', 'id': '*'})).toBeFalsy();
          });

          it('should not match qualifier containing wildcard (*) values and additional wildcard (?) value', () => {
            expect(matchesIntentQualifier(OptionalQualifier, {'entity': '*', 'type': '*', 'id': '?'})).toBeFalsy();
          });

          it('should not match qualifier containing wildcard (*) values and additional specific value', () => {
            expect(matchesIntentQualifier(OptionalQualifier, {'entity': '*', 'type': '*', 'id': '1'})).toBeFalsy();
          });

          it('should match qualifier containing a combination of specific values and (* and ?) values (interpreted as values, not as wildcards)', () => {
            expect(matchesIntentQualifier(OptionalQualifier, {'entity': 'person', 'type': '*'})).toBeTruthy();
            expect(matchesIntentQualifier(OptionalQualifier, {'entity': 'person', 'type': '?'})).toBeTruthy();
            expect(matchesIntentQualifier(OptionalQualifier, {'entity': '*', 'type': 'user'})).toBeTruthy();
            expect(matchesIntentQualifier(OptionalQualifier, {'entity': '?', 'type': 'user'})).toBeTruthy();
            expect(matchesIntentQualifier(OptionalQualifier, {'entity': '?', 'type': '*'})).toBeTruthy();
            expect(matchesIntentQualifier(OptionalQualifier, {'entity': '*', 'type': '?'})).toBeTruthy();
          });

          it('should not match qualifier containing a combination of specific values and wildcard values and additional wildcard (?) value', () => {
            expect(matchesIntentQualifier(OptionalQualifier, {'entity': 'person', 'type': '*', 'id': '?'})).toBeFalsy();
            expect(matchesIntentQualifier(OptionalQualifier, {'entity': 'person', 'type': '?', 'id': '?'})).toBeFalsy();
            expect(matchesIntentQualifier(OptionalQualifier, {'entity': '*', 'type': 'user', 'id': '?'})).toBeFalsy();
            expect(matchesIntentQualifier(OptionalQualifier, {'entity': '?', 'type': 'user', 'id': '?'})).toBeFalsy();
            expect(matchesIntentQualifier(OptionalQualifier, {'entity': '?', 'type': '*', 'id': '?'})).toBeFalsy();
            expect(matchesIntentQualifier(OptionalQualifier, {'entity': '*', 'type': '?', 'id': '?'})).toBeFalsy();
          });

          it('should not match qualifier containing a combination of specific values and wildcard values and additional wildcard (*) value', () => {
            expect(matchesIntentQualifier(OptionalQualifier, {'entity': 'person', 'type': '*', 'id': '*'})).toBeFalsy();
            expect(matchesIntentQualifier(OptionalQualifier, {'entity': 'person', 'type': '?', 'id': '*'})).toBeFalsy();
            expect(matchesIntentQualifier(OptionalQualifier, {'entity': '*', 'type': 'user', 'id': '*'})).toBeFalsy();
            expect(matchesIntentQualifier(OptionalQualifier, {'entity': '?', 'type': 'user', 'id': '*'})).toBeFalsy();
            expect(matchesIntentQualifier(OptionalQualifier, {'entity': '?', 'type': '*', 'id': '*'})).toBeFalsy();
            expect(matchesIntentQualifier(OptionalQualifier, {'entity': '*', 'type': '?', 'id': '*'})).toBeFalsy();
          });

          it('should not match qualifier containing a combination of specific values and wildcard values and additional specific value', () => {
            expect(matchesIntentQualifier(OptionalQualifier, {'entity': 'person', 'type': '*', 'id': '1'})).toBeFalsy();
            expect(matchesIntentQualifier(OptionalQualifier, {'entity': 'person', 'type': '?', 'id': '1'})).toBeFalsy();
            expect(matchesIntentQualifier(OptionalQualifier, {'entity': '*', 'type': 'user', 'id': '1'})).toBeFalsy();
            expect(matchesIntentQualifier(OptionalQualifier, {'entity': '?', 'type': 'user', 'id': '1'})).toBeFalsy();
            expect(matchesIntentQualifier(OptionalQualifier, {'entity': '?', 'type': '*', 'id': '1'})).toBeFalsy();
            expect(matchesIntentQualifier(OptionalQualifier, {'entity': '*', 'type': '?', 'id': '1'})).toBeFalsy();
          });
        });

        describe('qualifier contains combination of wildcard (?) and wildcard (*) qualifier values', () => {
          const CombinedQualifier = {'entity': '?', 'type': '*'};

          it('should not match empty qualifiers', () => {
            expect(matchesIntentQualifier(CombinedQualifier, undefined)).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, null)).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {})).toBeFalsy();
          });

          it('should not match `AnyQualifier`', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'*': '*'})).toBeFalsy();
          });

          it('should not match `AnyQualifier` with additional wildcard (?) qualifier values', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'*': '*', 'entity': '?', 'type': '?'})).toBeFalsy();
          });

          it('should not match `AnyQualifier` with additional wildcard (*) qualifier values', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'*': '*', 'entity': '*', 'type': '*'})).toBeFalsy();
          });

          it('should not match `AnyQualifier` with additional specific qualifier values', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'*': '*', 'entity': 'person', 'type': 'user'})).toBeFalsy();
          });

          it('should match exact qualifier (* and ? are interpreted as values, not as wildcards)', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': '*'})).toBeTruthy();
          });

          it('should match qualifier containing specific values', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': 'user'})).toBeTruthy();
          });

          it('should not match qualifier containing specific values and additional wildcard (?) value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': 'user', 'id': '?'})).toBeFalsy();
          });

          it('should not match qualifier containing specific values and additional wildcard (*) value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': 'user', 'id': '*'})).toBeFalsy();
          });

          it('should not match qualifier containing specific values and additional specific value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': 'user', 'id': '1'})).toBeFalsy();
          });

          it('should match qualifier missing optional key', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'type': '*'})).toBeTruthy();
          });

          it('should not match qualifier missing mandatory key', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?'})).toBeFalsy();
          });

          it('should match qualifier containing question mark (?) values (question marks are interpreted as values, not as wildcards)', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': '?'})).toBeTruthy();
          });

          it('should not match qualifier containing wildcard (?) values and additional wildcard (?) value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': '?', 'id': '?'})).toBeFalsy();
          });

          it('should not match qualifier containing wildcard (?) values and additional wildcard (*) value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': '?', 'id': '*'})).toBeFalsy();
          });

          it('should not match qualifier containing wildcard (?) values and additional specific value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': '?', 'id': '1'})).toBeFalsy();
          });

          it('should match qualifier containing wildcard (*) values', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': '*'})).toBeTruthy();
          });

          it('should not match qualifier containing wildcard (*) values and additional wildcard (*) value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': '*', 'id': '*'})).toBeFalsy();
          });

          it('should not match qualifier containing wildcard (*) values and additional wildcard (?) value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': '*', 'id': '?'})).toBeFalsy();
          });

          it('should not match qualifier containing wildcard (*) values and additional specific value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': '*', 'id': '1'})).toBeFalsy();
          });

          it('should match qualifier containing a combination of specific values and wildcard values', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': '*'})).toBeTruthy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': '?'})).toBeTruthy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': 'user'})).toBeTruthy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': 'user'})).toBeTruthy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': '*'})).toBeTruthy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': '?'})).toBeTruthy();
          });

          it('should not match qualifier containing a combination of specific values and wildcard values and additional wildcard (?) value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': '*', 'id': '?'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': '?', 'id': '?'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': 'user', 'id': '?'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': 'user', 'id': '?'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': '*', 'id': '?'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': '?', 'id': '?'})).toBeFalsy();
          });

          it('should not match qualifier containing a combination of specific values and wildcard values and additional wildcard (*) value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': '*', 'id': '*'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': '?', 'id': '*'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': 'user', 'id': '*'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': 'user', 'id': '*'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': '*', 'id': '*'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': '?', 'id': '*'})).toBeFalsy();
          });

          it('should not match qualifier containing a combination of specific values and wildcard values and additional specific value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': '*', 'id': '1'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': '?', 'id': '1'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': 'user', 'id': '1'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': 'user', 'id': '1'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': '*', 'id': '1'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': '?', 'id': '1'})).toBeFalsy();
          });
        });

        describe('qualifier contains combination of wildcard (?) and specific qualifier values', () => {
          const CombinedQualifier = {'entity': '?', 'type': 'user'};

          it('should not match empty qualifiers', () => {
            expect(matchesIntentQualifier(CombinedQualifier, undefined)).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, null)).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {})).toBeFalsy();
          });

          it('should not match `AnyQualifier`', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'*': '*'})).toBeFalsy();
          });

          it('should not match `AnyQualifier` with additional wildcard (?) qualifier values', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'*': '*', 'entity': '?', 'type': '?'})).toBeFalsy();
          });

          it('should not match `AnyQualifier` with additional wildcard (*) qualifier values', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'*': '*', 'entity': '*', 'type': '*'})).toBeFalsy();
          });

          it('should not match `AnyQualifier` with additional specific qualifier values', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'*': '*', 'entity': 'person', 'type': 'user'})).toBeFalsy();
          });

          it('should match exact qualifier', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': 'user'})).toBeTruthy();
          });

          it('should match qualifier containing specific values', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': 'user'})).toBeTruthy();
          });

          it('should not match qualifier containing specific values and additional wildcard (?) value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': 'user', 'id': '?'})).toBeFalsy();
          });

          it('should not match qualifier containing specific values and additional wildcard (*) value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': 'user', 'id': '*'})).toBeFalsy();
          });

          it('should not match qualifier containing specific values and additional specific value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': 'user', 'id': '1'})).toBeFalsy();
          });

          it('should match qualifier missing optional key', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'type': 'user'})).toBeTruthy();
          });

          it('should not match qualifier missing mandatory key', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?'})).toBeFalsy();
          });

          it('should not match qualifier containing different type value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': 'x'})).toBeFalsy();
          });

          it('should not match qualifier containing wildcard (?) values', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': '?'})).toBeFalsy();
          });

          it('should not match qualifier containing wildcard (?) values and additional wildcard (?) value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': '?', 'id': '?'})).toBeFalsy();
          });

          it('should not match qualifier containing wildcard (?) values and additional wildcard (*) value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': '?', 'id': '*'})).toBeFalsy();
          });

          it('should not match qualifier containing wildcard (?) values and additional specific value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': '?', 'id': '1'})).toBeFalsy();
          });

          it('should not match qualifier containing wildcard (*) values', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': '*'})).toBeFalsy();
          });

          it('should not match qualifier containing wildcard (*) values and additional wildcard (*) value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': '*', 'id': '*'})).toBeFalsy();
          });

          it('should not match qualifier containing wildcard (*) values and additional wildcard (?) value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': '*', 'id': '?'})).toBeFalsy();
          });

          it('should not match qualifier containing wildcard (*) values and additional specific value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': '*', 'id': '1'})).toBeFalsy();
          });

          it('should not match qualifier containing a (* and ?) values for type', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': '*'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': '?'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': '*'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': '?'})).toBeFalsy();
          });

          it('should match qualifier containing a combination of (* and ?) values for entity and `user` for type', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': 'user'})).toBeTruthy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': 'user'})).toBeTruthy();
          });

          it('should not match qualifier containing a combination of specific values and wildcard values and additional wildcard (?) value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': '*', 'id': '?'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': '?', 'id': '?'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': 'user', 'id': '?'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': 'user', 'id': '?'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': '*', 'id': '?'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': '?', 'id': '?'})).toBeFalsy();
          });

          it('should not match qualifier containing a combination of specific values and wildcard values and additional wildcard (*) value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': '*', 'id': '*'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': '?', 'id': '*'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': 'user', 'id': '*'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': 'user', 'id': '*'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': '*', 'id': '*'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': '?', 'id': '*'})).toBeFalsy();
          });

          it('should not match qualifier containing a combination of specific values and wildcard values and additional specific value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': '*', 'id': '1'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': '?', 'id': '1'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': 'user', 'id': '1'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': 'user', 'id': '1'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': '*', 'id': '1'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': '?', 'id': '1'})).toBeFalsy();
          });
        });
      });
    });

    describe('check against `AnyQualifier`', () => {

      describe('qualifier containing single key', () => {
        const AnyQualifier = {'*': '*'};

        it('should match empty qualifiers', () => {
          expect(matchesIntentQualifier(AnyQualifier, undefined)).toBeTruthy();
          expect(matchesIntentQualifier(AnyQualifier, null)).toBeTruthy();
          expect(matchesIntentQualifier(AnyQualifier, {})).toBeTruthy();
        });

        it('should match exact qualifier', () => {
          expect(matchesIntentQualifier(AnyQualifier, {'*': '*'})).toBeTruthy();
        });

        it('should match qualifier containing specific value', () => {
          expect(matchesIntentQualifier(AnyQualifier, {'entity': 'person'})).toBeTruthy();
        });

        it('should match qualifier containing specific value and wildcard (?) value', () => {
          expect(matchesIntentQualifier(AnyQualifier, {'entity': 'person', 'id': '?'})).toBeTruthy();
        });

        it('should match qualifier containing specific value and wildcard (*) value', () => {
          expect(matchesIntentQualifier(AnyQualifier, {'entity': 'person', 'id': '*'})).toBeTruthy();
        });

        it('should match qualifier containing multiple specific values', () => {
          expect(matchesIntentQualifier(AnyQualifier, {'entity': 'person', 'id': '1'})).toBeTruthy();
        });

        it('should match qualifier containing wildcard (?) value', () => {
          expect(matchesIntentQualifier(AnyQualifier, {'entity': '?'})).toBeTruthy();
        });

        it('should match qualifier containing multiple wildcard (?) values', () => {
          expect(matchesIntentQualifier(AnyQualifier, {'entity': '?', 'id': '?'})).toBeTruthy();
        });

        it('should match qualifier containing wildcard (?) value and wildcard (*) value', () => {
          expect(matchesIntentQualifier(AnyQualifier, {'entity': '?', 'id': '*'})).toBeTruthy();
        });

        it('should match qualifier containing wildcard (?) value and specific value', () => {
          expect(matchesIntentQualifier(AnyQualifier, {'entity': '?', 'id': '1'})).toBeTruthy();
        });

        it('should match qualifier containing wildcard (*) value', () => {
          expect(matchesIntentQualifier(AnyQualifier, {'entity': '*'})).toBeTruthy();
        });

        it('should match qualifier containing multiple wildcard (*) values ', () => {
          expect(matchesIntentQualifier(AnyQualifier, {'entity': '*', 'id': '*'})).toBeTruthy();
        });

        it('should match qualifier containing wildcard (*) value and wildcard (?) value', () => {
          expect(matchesIntentQualifier(AnyQualifier, {'entity': '*', 'id': '?'})).toBeTruthy();
        });

        it('should match qualifier containing wildcard (*) value and specific value', () => {
          expect(matchesIntentQualifier(AnyQualifier, {'entity': '*', 'id': '1'})).toBeTruthy();
        });
      });

      describe('qualifier containing multiple keys', () => {
        describe('qualifier contains additional wildcard (?) qualifier value', () => {
          const CombinedQualifier = {'*': '*', 'type': '?'};

          it('should match empty qualifiers', () => {
            expect(matchesIntentQualifier(CombinedQualifier, undefined)).toBeTruthy();
            expect(matchesIntentQualifier(CombinedQualifier, null)).toBeTruthy();
            expect(matchesIntentQualifier(CombinedQualifier, {})).toBeTruthy();
          });

          it('should match `AnyQualifier`', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'*': '*'})).toBeTruthy();
          });

          it('should match exact qualifier', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'*': '*', 'type': '?'})).toBeTruthy();
          });

          it('should match qualifier containing specific values and additional wildcard (?) value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': 'user', 'id': '?'})).toBeTruthy();
          });

          it('should match qualifier containing specific values and additional wildcard (*) value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': 'user', 'id': '*'})).toBeTruthy();
          });

          it('should match qualifier containing specific values and additional specific value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': 'user', 'id': '1'})).toBeTruthy();
          });

          it('should match qualifier containing wildcard (?) values and additional wildcard (?) value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': '?', 'id': '?'})).toBeTruthy();
          });

          it('should match qualifier containing wildcard (?) values and additional wildcard (*) value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': '?', 'id': '*'})).toBeTruthy();
          });

          it('should match qualifier containing wildcard (?) values and additional specific value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': '?', 'id': '1'})).toBeTruthy();
          });

          it('should match qualifier containing wildcard (*) values', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': '*'})).toBeTruthy();
          });

          it('should match qualifier containing wildcard (*) values and additional wildcard (*) value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': '*', 'id': '*'})).toBeTruthy();
          });

          it('should match qualifier containing wildcard (*) values and additional wildcard (?) value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': '*', 'id': '?'})).toBeTruthy();
          });

          it('should match qualifier containing wildcard (*) values and additional specific value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': '*', 'id': '1'})).toBeTruthy();
          });

          it('should match qualifier containing a combination of specific values and wildcard values', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': '*'})).toBeTruthy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': '?'})).toBeTruthy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': 'user'})).toBeTruthy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': 'user'})).toBeTruthy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': '*'})).toBeTruthy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': '?'})).toBeTruthy();
          });

          it('should match qualifier containing a combination of specific values and wildcard values and additional wildcard (?) value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': '*', 'id': '?'})).toBeTruthy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': '?', 'id': '?'})).toBeTruthy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': 'user', 'id': '?'})).toBeTruthy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': 'user', 'id': '?'})).toBeTruthy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': '*', 'id': '?'})).toBeTruthy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': '?', 'id': '?'})).toBeTruthy();
          });

          it('should match qualifier containing a combination of specific values and wildcard values and additional wildcard (*) value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': '*', 'id': '*'})).toBeTruthy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': '?', 'id': '*'})).toBeTruthy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': 'user', 'id': '*'})).toBeTruthy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': 'user', 'id': '*'})).toBeTruthy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': '*', 'id': '*'})).toBeTruthy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': '?', 'id': '*'})).toBeTruthy();
          });

          it('should match qualifier containing a combination of specific values and wildcard values and additional specific value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': '*', 'id': '1'})).toBeTruthy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': '?', 'id': '1'})).toBeTruthy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': 'user', 'id': '1'})).toBeTruthy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': 'user', 'id': '1'})).toBeTruthy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': '*', 'id': '1'})).toBeTruthy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': '?', 'id': '1'})).toBeTruthy();
          });
        });

        describe('qualifier contains additional wildcard (*) qualifier value', () => {
          const CombinedQualifier = {'*': '*', 'type': '*'};

          it('should not match empty qualifiers', () => {
            expect(matchesIntentQualifier(CombinedQualifier, undefined)).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, null)).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {})).toBeFalsy();
          });

          it('should not match `AnyQualifier`', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'*': '*'})).toBeFalsy();
          });

          it('should match exact qualifier', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'*': '*', 'type': '*'})).toBeTruthy();
          });

          it('should match qualifier containing specific value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'type': 'user'})).toBeTruthy();
          });

          it('should match qualifier containing specific values and additional wildcard (?) value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': 'user', 'id': '?'})).toBeTruthy();
          });

          it('should match qualifier containing specific values and additional wildcard (*) value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': 'user', 'id': '*'})).toBeTruthy();
          });

          it('should match qualifier containing specific values and additional specific value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': 'user', 'id': '1'})).toBeTruthy();
          });

          it('should match qualifier containing wildcard (?) values and additional wildcard (?) value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': '?', 'id': '?'})).toBeTruthy();
          });

          it('should match qualifier containing wildcard (?) values and additional wildcard (*) value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': '?', 'id': '*'})).toBeTruthy();
          });

          it('should match qualifier containing wildcard (?) values and additional specific value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': '?', 'id': '1'})).toBeTruthy();
          });

          it('should match qualifier containing wildcard (*) values', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': '*'})).toBeTruthy();
          });

          it('should match qualifier containing wildcard (*) values and additional wildcard (*) value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': '*', 'id': '*'})).toBeTruthy();
          });

          it('should match qualifier containing wildcard (*) values and additional wildcard (?) value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': '*', 'id': '?'})).toBeTruthy();
          });

          it('should match qualifier containing wildcard (*) values and additional specific value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': '*', 'id': '1'})).toBeTruthy();
          });

          it('should match qualifier containing a combination of specific values and wildcard values', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': '*'})).toBeTruthy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': '?'})).toBeTruthy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': 'user'})).toBeTruthy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': 'user'})).toBeTruthy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': '*'})).toBeTruthy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': '?'})).toBeTruthy();
          });

          it('should match qualifier containing a combination of specific values and wildcard values and additional wildcard (?) value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': '*', 'id': '?'})).toBeTruthy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': '?', 'id': '?'})).toBeTruthy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': 'user', 'id': '?'})).toBeTruthy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': 'user', 'id': '?'})).toBeTruthy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': '*', 'id': '?'})).toBeTruthy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': '?', 'id': '?'})).toBeTruthy();
          });

          it('should match qualifier containing a combination of specific values and wildcard values and additional wildcard (*) value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': '*', 'id': '*'})).toBeTruthy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': '?', 'id': '*'})).toBeTruthy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': 'user', 'id': '*'})).toBeTruthy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': 'user', 'id': '*'})).toBeTruthy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': '*', 'id': '*'})).toBeTruthy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': '?', 'id': '*'})).toBeTruthy();
          });

          it('should match qualifier containing a combination of specific values and wildcard values and additional specific value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': '*', 'id': '1'})).toBeTruthy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': '?', 'id': '1'})).toBeTruthy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': 'user', 'id': '1'})).toBeTruthy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': 'user', 'id': '1'})).toBeTruthy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': '*', 'id': '1'})).toBeTruthy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': '?', 'id': '1'})).toBeTruthy();
          });
        });

        describe('qualifier contains additional specific qualifier value', () => {
          const CombinedQualifier = {'*': '*', 'type': 'user'};

          it('should not match empty qualifiers', () => {
            expect(matchesIntentQualifier(CombinedQualifier, undefined)).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, null)).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {})).toBeFalsy();
          });

          it('should not match `AnyQualifier`', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'*': '*'})).toBeFalsy();
          });

          it('should match exact qualifier', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'*': '*', 'type': 'user'})).toBeTruthy();
          });

          it('should match qualifier containing specific value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'type': 'user'})).toBeTruthy();
          });

          it('should match qualifier containing specific values and additional wildcard (?) value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': 'user', 'id': '?'})).toBeTruthy();
          });

          it('should match qualifier containing specific values and additional wildcard (*) value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': 'user', 'id': '*'})).toBeTruthy();
          });

          it('should match qualifier containing specific values and additional specific value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': 'user', 'id': '1'})).toBeTruthy();
          });

          it('should not match qualifier containing wildcard (?) values and additional wildcard (?) value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': '?', 'id': '?'})).toBeFalsy();
          });

          it('should not match qualifier containing wildcard (?) values and additional wildcard (*) value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': '?', 'id': '*'})).toBeFalsy();
          });

          it('should not match qualifier containing wildcard (?) values and additional specific value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': '?', 'id': '1'})).toBeFalsy();
          });

          it('should not match qualifier containing wildcard (*) values', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': '*'})).toBeFalsy();
          });

          it('should not match qualifier containing wildcard (*) values and additional wildcard (*) value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': '*', 'id': '*'})).toBeFalsy();
          });

          it('should not match qualifier containing wildcard (*) values and additional wildcard (?) value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': '*', 'id': '?'})).toBeFalsy();
          });

          it('should not match qualifier containing wildcard (*) values and additional specific value', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': '*', 'id': '1'})).toBeFalsy();
          });

          it('should match qualifier containing a combination of (* and ?) for entity and `user` for type', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': 'user'})).toBeTruthy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': 'user'})).toBeTruthy();
          });

          it('should not match qualifier containing a (* and ?) for type', () => {
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': '*'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': 'person', 'type': '?'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '?', 'type': '*'})).toBeFalsy();
            expect(matchesIntentQualifier(CombinedQualifier, {'entity': '*', 'type': '?'})).toBeFalsy();
          });
        });
      });
    });
  });

  describe('function \'matchesWildcardQualifier(...)\'', () => {

    function testWildcardQualifierMatcher(qualifier1: Qualifier, qualifier2: Qualifier): boolean {
      const matchingResult = matchesWildcardQualifier(qualifier1, qualifier2);
      const correlationResult = matchesWildcardQualifier(qualifier2, qualifier1);

      if (matchingResult !== correlationResult) {
        throw new Error(`... with qualifiers ${qualifier1} and ${qualifier2}`);
      }

      return matchingResult;
    }

    describe('check against empty qualifier', () => {
      const UndefinedQualifier = undefined;
      const NullQualifier = null;
      const EmptyQualifier = {};

      it('should match empty qualifiers', () => {
        expect(testWildcardQualifierMatcher(UndefinedQualifier, undefined)).toBeTruthy();
        expect(testWildcardQualifierMatcher(UndefinedQualifier, null)).toBeTruthy();
        expect(testWildcardQualifierMatcher(UndefinedQualifier, {})).toBeTruthy();
        expect(testWildcardQualifierMatcher(NullQualifier, undefined)).toBeTruthy();
        expect(testWildcardQualifierMatcher(NullQualifier, null)).toBeTruthy();
        expect(testWildcardQualifierMatcher(NullQualifier, {})).toBeTruthy();
        expect(testWildcardQualifierMatcher(EmptyQualifier, undefined)).toBeTruthy();
        expect(testWildcardQualifierMatcher(EmptyQualifier, null)).toBeTruthy();
        expect(testWildcardQualifierMatcher(EmptyQualifier, {})).toBeTruthy();
      });

      it('should match `AnyQualifier`', () => {
        expect(testWildcardQualifierMatcher(UndefinedQualifier, {'*': '*'})).toBeTruthy();
        expect(testWildcardQualifierMatcher(NullQualifier, {'*': '*'})).toBeTruthy();
        expect(testWildcardQualifierMatcher(EmptyQualifier, {'*': '*'})).toBeTruthy();
      });

      it('should match `AnyQualifier` with additional wildcard (?) qualifier value', () => {
        expect(testWildcardQualifierMatcher(UndefinedQualifier, {'*': '*', 'entity': '?'})).toBeTruthy();
        expect(testWildcardQualifierMatcher(NullQualifier, {'*': '*', 'entity': '?'})).toBeTruthy();
        expect(testWildcardQualifierMatcher(EmptyQualifier, {'*': '*', 'entity': '?'})).toBeTruthy();
      });

      it('should not match `AnyQualifier` with additional wildcard (*) qualifier value', () => {
        expect(testWildcardQualifierMatcher(UndefinedQualifier, {'*': '*', 'entity': '*'})).toBeFalsy();
        expect(testWildcardQualifierMatcher(NullQualifier, {'*': '*', 'entity': '*'})).toBeFalsy();
        expect(testWildcardQualifierMatcher(EmptyQualifier, {'*': '*', 'entity': '*'})).toBeFalsy();
      });

      it('should not match `AnyQualifier` with additional specific qualifier value', () => {
        expect(testWildcardQualifierMatcher(UndefinedQualifier, {'*': '*', 'entity': 'person'})).toBeFalsy();
        expect(testWildcardQualifierMatcher(NullQualifier, {'*': '*', 'entity': 'person'})).toBeFalsy();
        expect(testWildcardQualifierMatcher(EmptyQualifier, {'*': '*', 'entity': 'person'})).toBeFalsy();
      });

      it('should match qualifier containing wildcard (?) value', () => {
        expect(testWildcardQualifierMatcher(UndefinedQualifier, {'entity': '?'})).toBeTruthy();
        expect(testWildcardQualifierMatcher(NullQualifier, {'entity': '?'})).toBeTruthy();
        expect(testWildcardQualifierMatcher(EmptyQualifier, {'entity': '?'})).toBeTruthy();

        expect(testWildcardQualifierMatcher(UndefinedQualifier, {'entity': '?', 'id': '?'})).toBeTruthy();
        expect(testWildcardQualifierMatcher(NullQualifier, {'entity': '?', 'id': '?'})).toBeTruthy();
        expect(testWildcardQualifierMatcher(EmptyQualifier, {'entity': '?', 'id': '?'})).toBeTruthy();
      });

      it('should not match qualifier containing wildcard (*) value', () => {
        expect(testWildcardQualifierMatcher(UndefinedQualifier, {'entity': '*'})).toBeFalsy();
        expect(testWildcardQualifierMatcher(NullQualifier, {'entity': '*'})).toBeFalsy();
        expect(testWildcardQualifierMatcher(EmptyQualifier, {'entity': '*'})).toBeFalsy();

        expect(testWildcardQualifierMatcher(UndefinedQualifier, {'entity': '*', 'id': '*'})).toBeFalsy();
        expect(testWildcardQualifierMatcher(NullQualifier, {'entity': '*', 'id': '*'})).toBeFalsy();
        expect(testWildcardQualifierMatcher(EmptyQualifier, {'entity': '*', 'id': '*'})).toBeFalsy();
      });

      it('should not match qualifier containing specific value', () => {
        expect(testWildcardQualifierMatcher(UndefinedQualifier, {'entity': 'person'})).toBeFalsy();
        expect(testWildcardQualifierMatcher(NullQualifier, {'entity': 'person'})).toBeFalsy();
        expect(testWildcardQualifierMatcher(EmptyQualifier, {'entity': 'person'})).toBeFalsy();

        expect(testWildcardQualifierMatcher(UndefinedQualifier, {'entity': 'person', 'id': '1'})).toBeFalsy();
        expect(testWildcardQualifierMatcher(NullQualifier, {'entity': 'person', 'id': '1'})).toBeFalsy();
        expect(testWildcardQualifierMatcher(EmptyQualifier, {'entity': 'person', 'id': '1'})).toBeFalsy();
      });
    });

    describe('check against qualifier containing specific qualifier value', () => {
      describe('qualifier containing boolean value', () => {
        it('tests strict equality for `true`', () => {
          const BooleanQualifier = {flag: true};
          expect(testWildcardQualifierMatcher(BooleanQualifier, {flag: true})).toBeTruthy();
          expect(testWildcardQualifierMatcher(BooleanQualifier, {flag: false})).toBeFalsy();
          expect(testWildcardQualifierMatcher(BooleanQualifier, {flag: null})).toBeFalsy();
          expect(testWildcardQualifierMatcher(BooleanQualifier, {flag: undefined})).toBeFalsy();
          expect(testWildcardQualifierMatcher(BooleanQualifier, {flag: 0})).toBeFalsy();
          expect(testWildcardQualifierMatcher(BooleanQualifier, {flag: 1})).toBeFalsy();
          expect(testWildcardQualifierMatcher(BooleanQualifier, {flag: 'true'})).toBeFalsy();
          expect(testWildcardQualifierMatcher(BooleanQualifier, {flag: 'false'})).toBeFalsy();
          expect(testWildcardQualifierMatcher(BooleanQualifier, {flag: ''})).toBeFalsy();
        });

        it('tests strict equality for `false`', () => {
          const BooleanQualifier = {flag: false};
          expect(testWildcardQualifierMatcher(BooleanQualifier, {flag: false})).toBeTruthy();
          expect(testWildcardQualifierMatcher(BooleanQualifier, {flag: true})).toBeFalsy();
          expect(testWildcardQualifierMatcher(BooleanQualifier, {flag: null})).toBeFalsy();
          expect(testWildcardQualifierMatcher(BooleanQualifier, {flag: undefined})).toBeFalsy();
          expect(testWildcardQualifierMatcher(BooleanQualifier, {flag: 0})).toBeFalsy();
          expect(testWildcardQualifierMatcher(BooleanQualifier, {flag: 1})).toBeFalsy();
          expect(testWildcardQualifierMatcher(BooleanQualifier, {flag: 'true'})).toBeFalsy();
          expect(testWildcardQualifierMatcher(BooleanQualifier, {flag: 'false'})).toBeFalsy();
          expect(testWildcardQualifierMatcher(BooleanQualifier, {flag: ''})).toBeFalsy();
        });
      });

      describe('qualifier containing numeric value', () => {
        const NumericQualifier = {id: 1};

        it('tests strict equality', () => {
          expect(testWildcardQualifierMatcher(NumericQualifier, {id: 1})).toBeTruthy();
          expect(testWildcardQualifierMatcher(NumericQualifier, {id: '1'})).toBeFalsy();
          expect(testWildcardQualifierMatcher(NumericQualifier, {id: 2})).toBeFalsy();
          expect(testWildcardQualifierMatcher(NumericQualifier, {id: undefined})).toBeFalsy();
          expect(testWildcardQualifierMatcher(NumericQualifier, {id: null})).toBeFalsy();
          expect(testWildcardQualifierMatcher(NumericQualifier, {id: true})).toBeFalsy();
          expect(testWildcardQualifierMatcher(NumericQualifier, {id: false})).toBeFalsy();
          expect(testWildcardQualifierMatcher(NumericQualifier, {id: ''})).toBeFalsy();
        });
      });

      describe('qualifier containing single key', () => {
        const SpecificQualifier = {'entity': 'person'};

        it('should not match empty qualifiers', () => {
          expect(testWildcardQualifierMatcher(SpecificQualifier, undefined)).toBeFalsy();
          expect(testWildcardQualifierMatcher(SpecificQualifier, null)).toBeFalsy();
          expect(testWildcardQualifierMatcher(SpecificQualifier, {})).toBeFalsy();
        });

        it('should match `AnyQualifier`', () => {
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'*': '*'})).toBeTruthy();
        });

        it('should match `AnyQualifier` with additional wildcard (?) qualifier value', () => {
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'*': '*', 'entity': '?'})).toBeTruthy();
        });

        it('should match `AnyQualifier` with additional wildcard (*) qualifier value', () => {
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'*': '*', 'entity': '*'})).toBeTruthy();
        });

        it('should match `AnyQualifier` with additional specific qualifier value', () => {
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'*': '*', 'entity': 'person'})).toBeTruthy();
        });

        it('should not match `AnyQualifier` with superfluous qualifier key', () => {
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'*': '*', 'id': '*'})).toBeFalsy();
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'*': '*', 'id': '1'})).toBeFalsy();
        });

        it('should match `AnyQualifier` with superfluous optional qualifier key', () => {
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'*': '*', 'id': '?'})).toBeTruthy();
        });

        it('should match exact qualifier', () => {
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'entity': 'person'})).toBeTruthy();
        });

        it('should match qualifier containing specific value and additional wildcard (?) value', () => {
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'entity': 'person', 'id': '?'})).toBeTruthy();
        });

        it('should not match qualifier containing specific value and additional wildcard (*) value', () => {
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'entity': 'person', 'id': '*'})).toBeFalsy();
        });

        it('should not match qualifier containing specific value and additional specific value', () => {
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'entity': 'person', 'id': '1'})).toBeFalsy();
        });

        it('should match qualifier containing wildcard (?) value', () => {
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'entity': '?'})).toBeTruthy();
        });

        it('should match qualifier containing wildcard (?) value and additional wildcard (?) value', () => {
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'entity': '?', 'id': '?'})).toBeTruthy();
        });

        it('should not match qualifier containing wildcard (?) value and additional wildcard (*) value', () => {
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'entity': '?', 'id': '*'})).toBeFalsy();
        });

        it('should not match qualifier containing wildcard (?) value and additional specific value', () => {
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'entity': '?', 'id': '1'})).toBeFalsy();
        });

        it('should match qualifier containing wildcard (*) value', () => {
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'entity': '*'})).toBeTruthy();
        });

        it('should not match qualifier containing wildcard (*) value and additional wildcard (*) value', () => {
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'entity': '*', 'id': '*'})).toBeFalsy();
        });

        it('should match qualifier containing wildcard (*) value and additional wildcard (?) value', () => {
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'entity': '*', 'id': '?'})).toBeTruthy();
        });

        it('should not match qualifier containing wildcard (*) value and additional specific value', () => {
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'entity': '*', 'id': '1'})).toBeFalsy();
        });
      });

      describe('qualifier containing multiple keys', () => {
        const SpecificQualifier = {'entity': 'person', 'type': 'user'};

        it('should not match empty qualifiers', () => {
          expect(testWildcardQualifierMatcher(SpecificQualifier, undefined)).toBeFalsy();
          expect(testWildcardQualifierMatcher(SpecificQualifier, null)).toBeFalsy();
          expect(testWildcardQualifierMatcher(SpecificQualifier, {})).toBeFalsy();
        });

        it('should match `AnyQualifier`', () => {
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'*': '*'})).toBeTruthy();
        });

        it('should match `AnyQualifier` with additional wildcard (?) qualifier values', () => {
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'*': '*', 'entity': '?', 'type': '?'})).toBeTruthy();
        });

        it('should match `AnyQualifier` with additional wildcard (*) qualifier values', () => {
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'*': '*', 'entity': '*', 'type': '*'})).toBeTruthy();
        });

        it('should match `AnyQualifier` with additional specific qualifier values', () => {
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'*': '*', 'entity': 'person', 'type': 'user'})).toBeTruthy();
        });

        it('should not match `AnyQualifier` with superfluous qualifier key', () => {
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'*': '*', 'id': '*'})).toBeFalsy();
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'*': '*', 'id': '1'})).toBeFalsy();
        });

        it('should match `AnyQualifier` with superfluous optional qualifier key', () => {
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'*': '*', 'id': '?'})).toBeTruthy();
        });

        it('should match exact qualifier', () => {
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'entity': 'person', 'type': 'user'})).toBeTruthy();
        });

        it('should match qualifier containing specific values and additional wildcard (?) value', () => {
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'entity': 'person', 'type': 'user', 'id': '?'})).toBeTruthy();
        });

        it('should not match qualifier containing specific values and additional wildcard (*) value', () => {
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'entity': 'person', 'type': 'user', 'id': '*'})).toBeFalsy();
        });

        it('should not match qualifier containing specific values and additional specific value', () => {
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'entity': 'person', 'type': 'user', 'id': '1'})).toBeFalsy();
        });

        it('should not match qualifier missing a key', () => {
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'entity': 'person'})).toBeFalsy();
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'type': 'user'})).toBeFalsy();
        });

        it('should not match qualifier containing different entity value', () => {
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'entity': 'x', 'type': 'user'})).toBeFalsy();
        });

        it('should not match qualifier containing different type value', () => {
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'entity': 'person', 'type': 'x'})).toBeFalsy();
        });

        it('should match qualifier containing wildcard (?) values', () => {
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'entity': '?', 'type': '?'})).toBeTruthy();
        });

        it('should match qualifier containing wildcard (?) values and additional wildcard (?) value', () => {
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'entity': '?', 'type': '?', 'id': '?'})).toBeTruthy();
        });

        it('should not match qualifier containing wildcard (?) values and additional wildcard (*) value', () => {
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'entity': '?', 'type': '?', 'id': '*'})).toBeFalsy();
        });

        it('should not match qualifier containing wildcard (?) values and additional specific value', () => {
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'entity': '?', 'type': '?', 'id': '1'})).toBeFalsy();
        });

        it('should match qualifier containing wildcard (*) values', () => {
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'entity': '*', 'type': '*'})).toBeTruthy();
        });

        it('should not match qualifier containing wildcard (*) values and additional wildcard (*) value', () => {
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'entity': '*', 'type': '*', 'id': '*'})).toBeFalsy();
        });

        it('should match qualifier containing wildcard (*) values and additional wildcard (?) value', () => {
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'entity': '*', 'type': '*', 'id': '?'})).toBeTruthy();
        });

        it('should not match qualifier containing wildcard (*) values and additional specific value', () => {
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'entity': '*', 'type': '*', 'id': '1'})).toBeFalsy();
        });

        it('should match qualifier containing a combination of specific values and wildcard values', () => {
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'entity': 'person', 'type': '*'})).toBeTruthy();
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'entity': 'person', 'type': '?'})).toBeTruthy();
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'entity': '*', 'type': 'user'})).toBeTruthy();
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'entity': '?', 'type': 'user'})).toBeTruthy();
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'entity': '?', 'type': '*'})).toBeTruthy();
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'entity': '*', 'type': '?'})).toBeTruthy();
        });

        it('should match qualifier containing a combination of specific values and wildcard values and additional wildcard (?) value', () => {
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'entity': 'person', 'type': '*', 'id': '?'})).toBeTruthy();
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'entity': 'person', 'type': '?', 'id': '?'})).toBeTruthy();
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'entity': '*', 'type': 'user', 'id': '?'})).toBeTruthy();
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'entity': '?', 'type': 'user', 'id': '?'})).toBeTruthy();
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'entity': '?', 'type': '*', 'id': '?'})).toBeTruthy();
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'entity': '*', 'type': '?', 'id': '?'})).toBeTruthy();
        });

        it('should not match qualifier containing a combination of specific values and wildcard values and additional wildcard (*) value', () => {
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'entity': 'person', 'type': '*', 'id': '*'})).toBeFalsy();
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'entity': 'person', 'type': '?', 'id': '*'})).toBeFalsy();
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'entity': '*', 'type': 'user', 'id': '*'})).toBeFalsy();
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'entity': '?', 'type': 'user', 'id': '*'})).toBeFalsy();
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'entity': '?', 'type': '*', 'id': '*'})).toBeFalsy();
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'entity': '*', 'type': '?', 'id': '*'})).toBeFalsy();
        });

        it('should not match qualifier containing a combination of specific values and wildcard values and additional specific value', () => {
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'entity': 'person', 'type': '*', 'id': '1'})).toBeFalsy();
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'entity': 'person', 'type': '?', 'id': '1'})).toBeFalsy();
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'entity': '*', 'type': 'user', 'id': '1'})).toBeFalsy();
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'entity': '?', 'type': 'user', 'id': '1'})).toBeFalsy();
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'entity': '?', 'type': '*', 'id': '1'})).toBeFalsy();
          expect(testWildcardQualifierMatcher(SpecificQualifier, {'entity': '*', 'type': '?', 'id': '1'})).toBeFalsy();
        });
      });
    });

    describe('check against qualifier containing wildcard (*) qualifier value', () => {

      describe('qualifier containing single key', () => {
        const AsteriskQualifier = {'entity': '*'};

        it('should not match empty qualifiers', () => {
          expect(testWildcardQualifierMatcher(AsteriskQualifier, undefined)).toBeFalsy();
          expect(testWildcardQualifierMatcher(AsteriskQualifier, null)).toBeFalsy();
          expect(testWildcardQualifierMatcher(AsteriskQualifier, {})).toBeFalsy();
        });

        it('should match `AnyQualifier`', () => {
          expect(testWildcardQualifierMatcher(AsteriskQualifier, {'*': '*'})).toBeTruthy();
        });

        it('should match `AnyQualifier` with additional wildcard (?) qualifier value', () => {
          expect(testWildcardQualifierMatcher(AsteriskQualifier, {'*': '*', 'entity': '?'})).toBeTruthy();
        });

        it('should match `AnyQualifier` with additional wildcard (*) qualifier value', () => {
          expect(testWildcardQualifierMatcher(AsteriskQualifier, {'*': '*', 'entity': '*'})).toBeTruthy();
        });

        it('should match `AnyQualifier` with additional specific qualifier value', () => {
          expect(testWildcardQualifierMatcher(AsteriskQualifier, {'*': '*', 'entity': 'person'})).toBeTruthy();
        });

        it('should not match `AnyQualifier` with superfluous qualifier key', () => {
          expect(testWildcardQualifierMatcher(AsteriskQualifier, {'*': '*', 'id': '*'})).toBeFalsy();
          expect(testWildcardQualifierMatcher(AsteriskQualifier, {'*': '*', 'id': '1'})).toBeFalsy();
        });

        it('should match `AnyQualifier` with superfluous optional qualifier key', () => {
          expect(testWildcardQualifierMatcher(AsteriskQualifier, {'*': '*', 'id': '?'})).toBeTruthy();
        });

        it('should match exact qualifier', () => {
          expect(testWildcardQualifierMatcher(AsteriskQualifier, {'entity': '*'})).toBeTruthy();
        });

        it('should match qualifier containing specific value', () => {
          expect(testWildcardQualifierMatcher(AsteriskQualifier, {'entity': 'person'})).toBeTruthy();
        });

        it('should match qualifier containing specific value and additional wildcard (?) value', () => {
          expect(testWildcardQualifierMatcher(AsteriskQualifier, {'entity': 'person', 'id': '?'})).toBeTruthy();
        });

        it('should not match qualifier containing specific value and additional wildcard (*) value', () => {
          expect(testWildcardQualifierMatcher(AsteriskQualifier, {'entity': 'person', 'id': '*'})).toBeFalsy();
        });

        it('should not match qualifier containing specific value and additional specific value', () => {
          expect(testWildcardQualifierMatcher(AsteriskQualifier, {'entity': 'person', 'id': '1'})).toBeFalsy();
        });

        it('should match qualifier containing wildcard (?) value', () => {
          expect(testWildcardQualifierMatcher(AsteriskQualifier, {'entity': '?'})).toBeTruthy();
        });

        it('should match qualifier containing wildcard (?) value and additional wildcard (?) value', () => {
          expect(testWildcardQualifierMatcher(AsteriskQualifier, {'entity': '?', 'id': '?'})).toBeTruthy();
        });

        it('should not match qualifier containing wildcard (?) value and additional wildcard (*) value', () => {
          expect(testWildcardQualifierMatcher(AsteriskQualifier, {'entity': '?', 'id': '*'})).toBeFalsy();
        });

        it('should not match qualifier containing wildcard (?) value and additional specific value', () => {
          expect(testWildcardQualifierMatcher(AsteriskQualifier, {'entity': '?', 'id': '1'})).toBeFalsy();
        });

        it('should match qualifier containing wildcard (*) value', () => {
          expect(testWildcardQualifierMatcher(AsteriskQualifier, {'entity': '*'})).toBeTruthy();
        });

        it('should not match qualifier containing wildcard (*) value and additional wildcard (*) value', () => {
          expect(testWildcardQualifierMatcher(AsteriskQualifier, {'entity': '*', 'id': '*'})).toBeFalsy();
        });

        it('should match qualifier containing wildcard (*) value and additional wildcard (?) value', () => {
          expect(testWildcardQualifierMatcher(AsteriskQualifier, {'entity': '*', 'id': '?'})).toBeTruthy();
        });

        it('should not match qualifier containing wildcard (*) value and additional specific value', () => {
          expect(testWildcardQualifierMatcher(AsteriskQualifier, {'entity': '*', 'id': '1'})).toBeFalsy();
        });
      });

      describe('qualifier containing multiple keys', () => {
        describe('qualifier only contains wildcard (*) qualifier values', () => {
          const AsteriskQualifier = {'entity': '*', 'type': '*'};

          it('should not match empty qualifiers', () => {
            expect(testWildcardQualifierMatcher(AsteriskQualifier, undefined)).toBeFalsy();
            expect(testWildcardQualifierMatcher(AsteriskQualifier, null)).toBeFalsy();
            expect(testWildcardQualifierMatcher(AsteriskQualifier, {})).toBeFalsy();
          });

          it('should match `AnyQualifier`', () => {
            expect(testWildcardQualifierMatcher(AsteriskQualifier, {'*': '*'})).toBeTruthy();
          });

          it('should match `AnyQualifier` with additional wildcard (?) qualifier values', () => {
            expect(testWildcardQualifierMatcher(AsteriskQualifier, {'*': '*', 'entity': '?', 'type': '?'})).toBeTruthy();
          });

          it('should match `AnyQualifier` with additional wildcard (*) qualifier values', () => {
            expect(testWildcardQualifierMatcher(AsteriskQualifier, {'*': '*', 'entity': '*', 'type': '*'})).toBeTruthy();
          });

          it('should match `AnyQualifier` with additional specific qualifier values', () => {
            expect(testWildcardQualifierMatcher(AsteriskQualifier, {'*': '*', 'entity': 'person', 'type': 'user'})).toBeTruthy();
          });

          it('should match exact qualifier', () => {
            expect(testWildcardQualifierMatcher(AsteriskQualifier, {'entity': '*', 'type': '*'})).toBeTruthy();
          });

          it('should match qualifier containing specific values and additional wildcard (?) value', () => {
            expect(testWildcardQualifierMatcher(AsteriskQualifier, {'entity': 'person', 'type': 'user', 'id': '?'})).toBeTruthy();
          });

          it('should not match qualifier containing specific values and additional wildcard (*) value', () => {
            expect(testWildcardQualifierMatcher(AsteriskQualifier, {'entity': 'person', 'type': 'user', 'id': '*'})).toBeFalsy();
          });

          it('should not match qualifier containing specific values and additional specific value', () => {
            expect(testWildcardQualifierMatcher(AsteriskQualifier, {'entity': 'person', 'type': 'user', 'id': '1'})).toBeFalsy();
          });

          it('should not match qualifier missing a key', () => {
            expect(testWildcardQualifierMatcher(AsteriskQualifier, {'entity': '*'})).toBeFalsy();
            expect(testWildcardQualifierMatcher(AsteriskQualifier, {'type': '*'})).toBeFalsy();
          });

          it('should match qualifier containing wildcard (?) values and additional wildcard (?) value', () => {
            expect(testWildcardQualifierMatcher(AsteriskQualifier, {'entity': '?', 'type': '?', 'id': '?'})).toBeTruthy();
          });

          it('should not match qualifier containing wildcard (?) values and additional wildcard (*) value', () => {
            expect(testWildcardQualifierMatcher(AsteriskQualifier, {'entity': '?', 'type': '?', 'id': '*'})).toBeFalsy();
          });

          it('should not match qualifier containing wildcard (?) values and additional specific value', () => {
            expect(testWildcardQualifierMatcher(AsteriskQualifier, {'entity': '?', 'type': '?', 'id': '1'})).toBeFalsy();
          });

          it('should match qualifier containing wildcard (*) values', () => {
            expect(testWildcardQualifierMatcher(AsteriskQualifier, {'entity': '*', 'type': '*'})).toBeTruthy();
          });

          it('should not match qualifier containing wildcard (*) values and additional wildcard (*) value', () => {
            expect(testWildcardQualifierMatcher(AsteriskQualifier, {'entity': '*', 'type': '*', 'id': '*'})).toBeFalsy();
          });

          it('should match qualifier containing wildcard (*) values and additional wildcard (?) value', () => {
            expect(testWildcardQualifierMatcher(AsteriskQualifier, {'entity': '*', 'type': '*', 'id': '?'})).toBeTruthy();
          });

          it('should not match qualifier containing wildcard (*) values and additional specific value', () => {
            expect(testWildcardQualifierMatcher(AsteriskQualifier, {'entity': '*', 'type': '*', 'id': '1'})).toBeFalsy();
          });

          it('should match qualifier containing a combination of specific values and wildcard values', () => {
            expect(testWildcardQualifierMatcher(AsteriskQualifier, {'entity': 'person', 'type': '*'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(AsteriskQualifier, {'entity': 'person', 'type': '?'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(AsteriskQualifier, {'entity': '*', 'type': 'user'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(AsteriskQualifier, {'entity': '?', 'type': 'user'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(AsteriskQualifier, {'entity': '?', 'type': '*'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(AsteriskQualifier, {'entity': '*', 'type': '?'})).toBeTruthy();
          });

          it('should match qualifier containing a combination of specific values and wildcard values and additional wildcard (?) value', () => {
            expect(testWildcardQualifierMatcher(AsteriskQualifier, {'entity': 'person', 'type': '*', 'id': '?'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(AsteriskQualifier, {'entity': 'person', 'type': '?', 'id': '?'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(AsteriskQualifier, {'entity': '*', 'type': 'user', 'id': '?'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(AsteriskQualifier, {'entity': '?', 'type': 'user', 'id': '?'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(AsteriskQualifier, {'entity': '?', 'type': '*', 'id': '?'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(AsteriskQualifier, {'entity': '*', 'type': '?', 'id': '?'})).toBeTruthy();
          });

          it('should not match qualifier containing a combination of specific values and wildcard values and additional wildcard (*) value', () => {
            expect(testWildcardQualifierMatcher(AsteriskQualifier, {'entity': 'person', 'type': '*', 'id': '*'})).toBeFalsy();
            expect(testWildcardQualifierMatcher(AsteriskQualifier, {'entity': 'person', 'type': '?', 'id': '*'})).toBeFalsy();
            expect(testWildcardQualifierMatcher(AsteriskQualifier, {'entity': '*', 'type': 'user', 'id': '*'})).toBeFalsy();
            expect(testWildcardQualifierMatcher(AsteriskQualifier, {'entity': '?', 'type': 'user', 'id': '*'})).toBeFalsy();
            expect(testWildcardQualifierMatcher(AsteriskQualifier, {'entity': '?', 'type': '*', 'id': '*'})).toBeFalsy();
            expect(testWildcardQualifierMatcher(AsteriskQualifier, {'entity': '*', 'type': '?', 'id': '*'})).toBeFalsy();
          });

          it('should not match qualifier containing a combination of specific values and wildcard values and additional specific value', () => {
            expect(testWildcardQualifierMatcher(AsteriskQualifier, {'entity': 'person', 'type': '*', 'id': '1'})).toBeFalsy();
            expect(testWildcardQualifierMatcher(AsteriskQualifier, {'entity': 'person', 'type': '?', 'id': '1'})).toBeFalsy();
            expect(testWildcardQualifierMatcher(AsteriskQualifier, {'entity': '*', 'type': 'user', 'id': '1'})).toBeFalsy();
            expect(testWildcardQualifierMatcher(AsteriskQualifier, {'entity': '?', 'type': 'user', 'id': '1'})).toBeFalsy();
            expect(testWildcardQualifierMatcher(AsteriskQualifier, {'entity': '?', 'type': '*', 'id': '1'})).toBeFalsy();
            expect(testWildcardQualifierMatcher(AsteriskQualifier, {'entity': '*', 'type': '?', 'id': '1'})).toBeFalsy();
          });
        });

        describe('qualifier contains combination of wildcard (*) and specific qualifier values', () => {
          const CombinedQualifier = {'entity': '*', 'type': 'user'};

          it('should not match empty qualifiers', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, undefined)).toBeFalsy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, null)).toBeFalsy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {})).toBeFalsy();
          });

          it('should match `AnyQualifier`', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'*': '*'})).toBeTruthy();
          });

          it('should match `AnyQualifier` with additional wildcard (?) qualifier values', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'*': '*', 'entity': '?', 'type': '?'})).toBeTruthy();
          });

          it('should match `AnyQualifier` with additional wildcard (*) qualifier values', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'*': '*', 'entity': '*', 'type': '*'})).toBeTruthy();
          });

          it('should match `AnyQualifier` with additional specific qualifier values', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'*': '*', 'entity': 'person', 'type': 'user'})).toBeTruthy();
          });

          it('should match exact qualifier', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': 'user'})).toBeTruthy();
          });

          it('should match qualifier containing specific values and additional wildcard (?) value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': 'user', 'id': '?'})).toBeTruthy();
          });

          it('should not match qualifier containing specific values and additional wildcard (*) value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': 'user', 'id': '*'})).toBeFalsy();
          });

          it('should not match qualifier containing specific values and additional specific value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': 'user', 'id': '1'})).toBeFalsy();
          });

          it('should not match qualifier missing a key', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*'})).toBeFalsy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'type': 'user'})).toBeFalsy();
          });

          it('should not match qualifier containing different type value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': 'x'})).toBeFalsy();
          });

          it('should match qualifier containing wildcard (?) values', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': '?'})).toBeTruthy();
          });

          it('should match qualifier containing wildcard (?) values and additional wildcard (?) value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': '?', 'id': '?'})).toBeTruthy();
          });

          it('should not match qualifier containing wildcard (?) values and additional wildcard (*) value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': '?', 'id': '*'})).toBeFalsy();
          });

          it('should not match qualifier containing wildcard (?) values and additional specific value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': '?', 'id': '1'})).toBeFalsy();
          });

          it('should match qualifier containing wildcard (*) values', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': '*'})).toBeTruthy();
          });

          it('should not match qualifier containing wildcard (*) values and additional wildcard (*) value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': '*', 'id': '*'})).toBeFalsy();
          });

          it('should match qualifier containing wildcard (*) values and additional wildcard (?) value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': '*', 'id': '?'})).toBeTruthy();
          });

          it('should not match qualifier containing wildcard (*) values and additional specific value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': '*', 'id': '1'})).toBeFalsy();
          });

          it('should match qualifier containing a combination of specific values and wildcard values', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': '*'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': '?'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': 'user'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': 'user'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': '*'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': '?'})).toBeTruthy();
          });

          it('should match qualifier containing a combination of specific values and wildcard values and additional wildcard (?) value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': '*', 'id': '?'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': '?', 'id': '?'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': 'user', 'id': '?'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': 'user', 'id': '?'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': '*', 'id': '?'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': '?', 'id': '?'})).toBeTruthy();
          });

          it('should not match qualifier containing a combination of specific values and wildcard values and additional wildcard (*) value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': '*', 'id': '*'})).toBeFalsy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': '?', 'id': '*'})).toBeFalsy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': 'user', 'id': '*'})).toBeFalsy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': 'user', 'id': '*'})).toBeFalsy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': '*', 'id': '*'})).toBeFalsy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': '?', 'id': '*'})).toBeFalsy();
          });

          it('should not match qualifier containing a combination of specific values and wildcard values and additional specific value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': '*', 'id': '1'})).toBeFalsy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': '?', 'id': '1'})).toBeFalsy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': 'user', 'id': '1'})).toBeFalsy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': 'user', 'id': '1'})).toBeFalsy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': '*', 'id': '1'})).toBeFalsy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': '?', 'id': '1'})).toBeFalsy();
          });
        });
      });
    });

    describe('check against qualifier containing wildcard (?) qualifier value', () => {
      describe('qualifier containing single key', () => {
        const OptionalQualifier = {'entity': '?'};

        it('should match empty qualifiers', () => {
          expect(testWildcardQualifierMatcher(OptionalQualifier, undefined)).toBeTruthy();
          expect(testWildcardQualifierMatcher(OptionalQualifier, null)).toBeTruthy();
          expect(testWildcardQualifierMatcher(OptionalQualifier, {})).toBeTruthy();
        });

        it('should match `AnyQualifier`', () => {
          expect(testWildcardQualifierMatcher(OptionalQualifier, {'*': '*'})).toBeTruthy();
        });

        it('should match `AnyQualifier` with additional wildcard (?) qualifier value', () => {
          expect(testWildcardQualifierMatcher(OptionalQualifier, {'*': '*', 'entity': '?'})).toBeTruthy();
        });

        it('should match `AnyQualifier` with additional wildcard (*) qualifier value', () => {
          expect(testWildcardQualifierMatcher(OptionalQualifier, {'*': '*', 'entity': '*'})).toBeTruthy();
        });

        it('should match `AnyQualifier` with additional specific qualifier value', () => {
          expect(testWildcardQualifierMatcher(OptionalQualifier, {'*': '*', 'entity': 'person'})).toBeTruthy();
        });

        it('should not match `AnyQualifier` with superfluous qualifier key', () => {
          expect(testWildcardQualifierMatcher(OptionalQualifier, {'*': '*', 'id': '*'})).toBeFalsy();
          expect(testWildcardQualifierMatcher(OptionalQualifier, {'*': '*', 'id': '1'})).toBeFalsy();
        });

        it('should match `AnyQualifier` with supefluous optional qualifier key', () => {
          expect(testWildcardQualifierMatcher(OptionalQualifier, {'*': '*', 'id': '?'})).toBeTruthy();
        });

        it('should match exact qualifier', () => {
          expect(testWildcardQualifierMatcher(OptionalQualifier, {'entity': '?'})).toBeTruthy();
        });

        it('should match qualifier containing specific value', () => {
          expect(testWildcardQualifierMatcher(OptionalQualifier, {'entity': 'person'})).toBeTruthy();
        });

        it('should match qualifier containing specific value and additional wildcard (?) value', () => {
          expect(testWildcardQualifierMatcher(OptionalQualifier, {'entity': 'person', 'id': '?'})).toBeTruthy();
        });

        it('should not match qualifier containing specific value and additional wildcard (*) value', () => {
          expect(testWildcardQualifierMatcher(OptionalQualifier, {'entity': 'person', 'id': '*'})).toBeFalsy();
        });

        it('should not match qualifier containing specific value and additional specific value', () => {
          expect(testWildcardQualifierMatcher(OptionalQualifier, {'entity': 'person', 'id': '1'})).toBeFalsy();
        });

        it('should match qualifier containing wildcard (?) value', () => {
          expect(testWildcardQualifierMatcher(OptionalQualifier, {'entity': '?'})).toBeTruthy();
        });

        it('should match qualifier containing wildcard (?) value and additional wildcard (?) value', () => {
          expect(testWildcardQualifierMatcher(OptionalQualifier, {'entity': '?', 'id': '?'})).toBeTruthy();
        });

        it('should not match qualifier containing wildcard (?) value and additional wildcard (*) value', () => {
          expect(testWildcardQualifierMatcher(OptionalQualifier, {'entity': '?', 'id': '*'})).toBeFalsy();
        });

        it('should not match qualifier containing wildcard (?) value and additional specific value', () => {
          expect(testWildcardQualifierMatcher(OptionalQualifier, {'entity': '?', 'id': '1'})).toBeFalsy();
        });

        it('should match qualifier containing wildcard (*) value', () => {
          expect(testWildcardQualifierMatcher(OptionalQualifier, {'entity': '*'})).toBeTruthy();
        });

        it('should not match qualifier containing wildcard (*) value and additional wildcard (*) value', () => {
          expect(testWildcardQualifierMatcher(OptionalQualifier, {'entity': '*', 'id': '*'})).toBeFalsy();
        });

        it('should match qualifier containing wildcard (*) value and additional wildcard (?) value', () => {
          expect(testWildcardQualifierMatcher(OptionalQualifier, {'entity': '*', 'id': '?'})).toBeTruthy();
        });

        it('should not match qualifier containing wildcard (*) value and additional specific value', () => {
          expect(testWildcardQualifierMatcher(OptionalQualifier, {'entity': '*', 'id': '1'})).toBeFalsy();
        });
      });

      describe('qualifier containing multiple keys', () => {
        describe('qualifier only contains wildcard (?) qualifier values', () => {
          const OptionalQualifier = {'entity': '?', 'type': '?'};

          it('should match empty qualifiers', () => {
            expect(testWildcardQualifierMatcher(OptionalQualifier, undefined)).toBeTruthy();
            expect(testWildcardQualifierMatcher(OptionalQualifier, null)).toBeTruthy();
            expect(testWildcardQualifierMatcher(OptionalQualifier, {})).toBeTruthy();
          });

          it('should match `AnyQualifier`', () => {
            expect(testWildcardQualifierMatcher(OptionalQualifier, {'*': '*'})).toBeTruthy();
          });

          it('should match `AnyQualifier` with additional wildcard (?) qualifier values', () => {
            expect(testWildcardQualifierMatcher(OptionalQualifier, {'*': '*', 'entity': '?', 'type': '?'})).toBeTruthy();
          });

          it('should match `AnyQualifier` with additional wildcard (*) qualifier values', () => {
            expect(testWildcardQualifierMatcher(OptionalQualifier, {'*': '*', 'entity': '*', 'type': '*'})).toBeTruthy();
          });

          it('should match `AnyQualifier` with additional specific qualifier values', () => {
            expect(testWildcardQualifierMatcher(OptionalQualifier, {'*': '*', 'entity': 'person', 'type': 'user'})).toBeTruthy();
          });

          it('should match exact qualifier', () => {
            expect(testWildcardQualifierMatcher(OptionalQualifier, {'entity': '?', 'type': '?'})).toBeTruthy();
          });

          it('should match qualifier containing specific values and additional wildcard (?) value', () => {
            expect(testWildcardQualifierMatcher(OptionalQualifier, {'entity': 'person', 'type': 'user', 'id': '?'})).toBeTruthy();
          });

          it('should not match qualifier containing specific values and additional wildcard (*) value', () => {
            expect(testWildcardQualifierMatcher(OptionalQualifier, {'entity': 'person', 'type': 'user', 'id': '*'})).toBeFalsy();
          });

          it('should not match qualifier containing specific values and additional specific value', () => {
            expect(testWildcardQualifierMatcher(OptionalQualifier, {'entity': 'person', 'type': 'user', 'id': '1'})).toBeFalsy();
          });

          it('should match qualifier missing a key', () => {
            expect(testWildcardQualifierMatcher(OptionalQualifier, {'entity': '?'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(OptionalQualifier, {'type': '?'})).toBeTruthy();
          });

          it('should match qualifier containing wildcard (?) values and additional wildcard (?) value', () => {
            expect(testWildcardQualifierMatcher(OptionalQualifier, {'entity': '?', 'type': '?', 'id': '?'})).toBeTruthy();
          });

          it('should not match qualifier containing wildcard (?) values and additional wildcard (*) value', () => {
            expect(testWildcardQualifierMatcher(OptionalQualifier, {'entity': '?', 'type': '?', 'id': '*'})).toBeFalsy();
          });

          it('should not match qualifier containing wildcard (?) values and additional specific value', () => {
            expect(testWildcardQualifierMatcher(OptionalQualifier, {'entity': '?', 'type': '?', 'id': '1'})).toBeFalsy();
          });

          it('should match qualifier containing wildcard (*) values', () => {
            expect(testWildcardQualifierMatcher(OptionalQualifier, {'entity': '*', 'type': '*'})).toBeTruthy();
          });

          it('should not match qualifier containing wildcard (*) values and additional wildcard (*) value', () => {
            expect(testWildcardQualifierMatcher(OptionalQualifier, {'entity': '*', 'type': '*', 'id': '*'})).toBeFalsy();
          });

          it('should match qualifier containing wildcard (*) values and additional wildcard (?) value', () => {
            expect(testWildcardQualifierMatcher(OptionalQualifier, {'entity': '*', 'type': '*', 'id': '?'})).toBeTruthy();
          });

          it('should not match qualifier containing wildcard (*) values and additional specific value', () => {
            expect(testWildcardQualifierMatcher(OptionalQualifier, {'entity': '*', 'type': '*', 'id': '1'})).toBeFalsy();
          });

          it('should match qualifier containing a combination of specific values and wildcard values', () => {
            expect(testWildcardQualifierMatcher(OptionalQualifier, {'entity': 'person', 'type': '*'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(OptionalQualifier, {'entity': 'person', 'type': '?'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(OptionalQualifier, {'entity': '*', 'type': 'user'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(OptionalQualifier, {'entity': '?', 'type': 'user'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(OptionalQualifier, {'entity': '?', 'type': '*'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(OptionalQualifier, {'entity': '*', 'type': '?'})).toBeTruthy();
          });

          it('should match qualifier containing a combination of specific values and wildcard values and additional wildcard (?) value', () => {
            expect(testWildcardQualifierMatcher(OptionalQualifier, {'entity': 'person', 'type': '*', 'id': '?'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(OptionalQualifier, {'entity': 'person', 'type': '?', 'id': '?'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(OptionalQualifier, {'entity': '*', 'type': 'user', 'id': '?'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(OptionalQualifier, {'entity': '?', 'type': 'user', 'id': '?'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(OptionalQualifier, {'entity': '?', 'type': '*', 'id': '?'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(OptionalQualifier, {'entity': '*', 'type': '?', 'id': '?'})).toBeTruthy();
          });

          it('should not match qualifier containing a combination of specific values and wildcard values and additional wildcard (*) value', () => {
            expect(testWildcardQualifierMatcher(OptionalQualifier, {'entity': 'person', 'type': '*', 'id': '*'})).toBeFalsy();
            expect(testWildcardQualifierMatcher(OptionalQualifier, {'entity': 'person', 'type': '?', 'id': '*'})).toBeFalsy();
            expect(testWildcardQualifierMatcher(OptionalQualifier, {'entity': '*', 'type': 'user', 'id': '*'})).toBeFalsy();
            expect(testWildcardQualifierMatcher(OptionalQualifier, {'entity': '?', 'type': 'user', 'id': '*'})).toBeFalsy();
            expect(testWildcardQualifierMatcher(OptionalQualifier, {'entity': '?', 'type': '*', 'id': '*'})).toBeFalsy();
            expect(testWildcardQualifierMatcher(OptionalQualifier, {'entity': '*', 'type': '?', 'id': '*'})).toBeFalsy();
          });

          it('should not match qualifier containing a combination of specific values and wildcard values and additional specific value', () => {
            expect(testWildcardQualifierMatcher(OptionalQualifier, {'entity': 'person', 'type': '*', 'id': '1'})).toBeFalsy();
            expect(testWildcardQualifierMatcher(OptionalQualifier, {'entity': 'person', 'type': '?', 'id': '1'})).toBeFalsy();
            expect(testWildcardQualifierMatcher(OptionalQualifier, {'entity': '*', 'type': 'user', 'id': '1'})).toBeFalsy();
            expect(testWildcardQualifierMatcher(OptionalQualifier, {'entity': '?', 'type': 'user', 'id': '1'})).toBeFalsy();
            expect(testWildcardQualifierMatcher(OptionalQualifier, {'entity': '?', 'type': '*', 'id': '1'})).toBeFalsy();
            expect(testWildcardQualifierMatcher(OptionalQualifier, {'entity': '*', 'type': '?', 'id': '1'})).toBeFalsy();
          });
        });

        describe('qualifier contains combination of wildcard (?) and wildcard (*) qualifier values', () => {
          const CombinedQualifier = {'entity': '?', 'type': '*'};

          it('should not match empty qualifiers', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, undefined)).toBeFalsy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, null)).toBeFalsy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {})).toBeFalsy();
          });

          it('should match `AnyQualifier`', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'*': '*'})).toBeTruthy();
          });

          it('should match `AnyQualifier` with additional wildcard (?) qualifier values', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'*': '*', 'entity': '?', 'type': '?'})).toBeTruthy();
          });

          it('should match `AnyQualifier` with additional wildcard (*) qualifier values', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'*': '*', 'entity': '*', 'type': '*'})).toBeTruthy();
          });

          it('should match `AnyQualifier` with additional specific qualifier values', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'*': '*', 'entity': 'person', 'type': 'user'})).toBeTruthy();
          });

          it('should match exact qualifier', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': '*'})).toBeTruthy();
          });

          it('should match qualifier containing specific values and additional wildcard (?) value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': 'user', 'id': '?'})).toBeTruthy();
          });

          it('should not match qualifier containing specific values and additional wildcard (*) value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': 'user', 'id': '*'})).toBeFalsy();
          });

          it('should not match qualifier containing specific values and additional specific value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': 'user', 'id': '1'})).toBeFalsy();
          });

          it('should match qualifier missing optional key', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'type': '*'})).toBeTruthy();
          });

          it('should not match qualifier missing mandatory key', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?'})).toBeFalsy();
          });

          it('should match qualifier containing wildcard (?) values', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': '?'})).toBeTruthy();
          });

          it('should match qualifier containing wildcard (?) values and additional wildcard (?) value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': '?', 'id': '?'})).toBeTruthy();
          });

          it('should not match qualifier containing wildcard (?) values and additional wildcard (*) value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': '?', 'id': '*'})).toBeFalsy();
          });

          it('should not match qualifier containing wildcard (?) values and additional specific value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': '?', 'id': '1'})).toBeFalsy();
          });

          it('should match qualifier containing wildcard (*) values', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': '*'})).toBeTruthy();
          });

          it('should not match qualifier containing wildcard (*) values and additional wildcard (*) value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': '*', 'id': '*'})).toBeFalsy();
          });

          it('should match qualifier containing wildcard (*) values and additional wildcard (?) value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': '*', 'id': '?'})).toBeTruthy();
          });

          it('should not match qualifier containing wildcard (*) values and additional specific value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': '*', 'id': '1'})).toBeFalsy();
          });

          it('should match qualifier containing a combination of specific values and wildcard values', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': '*'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': '?'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': 'user'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': 'user'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': '*'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': '?'})).toBeTruthy();
          });

          it('should match qualifier containing a combination of specific values and wildcard values and additional wildcard (?) value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': '*', 'id': '?'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': '?', 'id': '?'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': 'user', 'id': '?'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': 'user', 'id': '?'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': '*', 'id': '?'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': '?', 'id': '?'})).toBeTruthy();
          });

          it('should not match qualifier containing a combination of specific values and wildcard values and additional wildcard (*) value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': '*', 'id': '*'})).toBeFalsy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': '?', 'id': '*'})).toBeFalsy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': 'user', 'id': '*'})).toBeFalsy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': 'user', 'id': '*'})).toBeFalsy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': '*', 'id': '*'})).toBeFalsy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': '?', 'id': '*'})).toBeFalsy();
          });

          it('should not match qualifier containing a combination of specific values and wildcard values and additional specific value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': '*', 'id': '1'})).toBeFalsy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': '?', 'id': '1'})).toBeFalsy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': 'user', 'id': '1'})).toBeFalsy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': 'user', 'id': '1'})).toBeFalsy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': '*', 'id': '1'})).toBeFalsy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': '?', 'id': '1'})).toBeFalsy();
          });
        });

        describe('qualifier contains combination of wildcard (?) and specific qualifier values', () => {
          const CombinedQualifier = {'entity': '?', 'type': 'user'};

          it('should not match empty qualifiers', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, undefined)).toBeFalsy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, null)).toBeFalsy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {})).toBeFalsy();
          });

          it('should match `AnyQualifier`', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'*': '*'})).toBeTruthy();
          });

          it('should match `AnyQualifier` with additional wildcard (?) qualifier values', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'*': '*', 'entity': '?', 'type': '?'})).toBeTruthy();
          });

          it('should match `AnyQualifier` with additional wildcard (*) qualifier values', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'*': '*', 'entity': '*', 'type': '*'})).toBeTruthy();
          });

          it('should match `AnyQualifier` with additional specific qualifier values', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'*': '*', 'entity': 'person', 'type': 'user'})).toBeTruthy();
          });

          it('should match exact qualifier', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': 'user'})).toBeTruthy();
          });

          it('should match qualifier containing specific values and additional wildcard (?) value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': 'user', 'id': '?'})).toBeTruthy();
          });

          it('should not match qualifier containing specific values and additional wildcard (*) value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': 'user', 'id': '*'})).toBeFalsy();
          });

          it('should not match qualifier containing specific values and additional specific value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': 'user', 'id': '1'})).toBeFalsy();
          });

          it('should match qualifier missing optional key', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'type': 'user'})).toBeTruthy();
          });

          it('should not match qualifier missing mandatory key', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?'})).toBeFalsy();
          });

          it('should not match qualifier containing different type value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': 'x'})).toBeFalsy();
          });

          it('should match qualifier containing wildcard (?) values', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': '?'})).toBeTruthy();
          });

          it('should match qualifier containing wildcard (?) values and additional wildcard (?) value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': '?', 'id': '?'})).toBeTruthy();
          });

          it('should not match qualifier containing wildcard (?) values and additional wildcard (*) value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': '?', 'id': '*'})).toBeFalsy();
          });

          it('should not match qualifier containing wildcard (?) values and additional specific value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': '?', 'id': '1'})).toBeFalsy();
          });

          it('should match qualifier containing wildcard (*) values', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': '*'})).toBeTruthy();
          });

          it('should not match qualifier containing wildcard (*) values and additional wildcard (*) value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': '*', 'id': '*'})).toBeFalsy();
          });

          it('should match qualifier containing wildcard (*) values and additional wildcard (?) value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': '*', 'id': '?'})).toBeTruthy();
          });

          it('should not match qualifier containing wildcard (*) values and additional specific value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': '*', 'id': '1'})).toBeFalsy();
          });

          it('should match qualifier containing a combination of specific values and wildcard values', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': '*'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': '?'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': 'user'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': 'user'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': '*'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': '?'})).toBeTruthy();
          });

          it('should match qualifier containing a combination of specific values and wildcard values and additional wildcard (?) value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': '*', 'id': '?'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': '?', 'id': '?'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': 'user', 'id': '?'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': 'user', 'id': '?'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': '*', 'id': '?'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': '?', 'id': '?'})).toBeTruthy();
          });

          it('should not match qualifier containing a combination of specific values and wildcard values and additional wildcard (*) value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': '*', 'id': '*'})).toBeFalsy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': '?', 'id': '*'})).toBeFalsy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': 'user', 'id': '*'})).toBeFalsy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': 'user', 'id': '*'})).toBeFalsy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': '*', 'id': '*'})).toBeFalsy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': '?', 'id': '*'})).toBeFalsy();
          });

          it('should not match qualifier containing a combination of specific values and wildcard values and additional specific value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': '*', 'id': '1'})).toBeFalsy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': '?', 'id': '1'})).toBeFalsy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': 'user', 'id': '1'})).toBeFalsy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': 'user', 'id': '1'})).toBeFalsy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': '*', 'id': '1'})).toBeFalsy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': '?', 'id': '1'})).toBeFalsy();
          });
        });
      });
    });

    describe('check against `AnyQualifier`', () => {

      describe('qualifier containing single key', () => {
        const AnyQualifier = {'*': '*'};

        it('should match empty qualifiers', () => {
          expect(testWildcardQualifierMatcher(AnyQualifier, undefined)).toBeTruthy();
          expect(testWildcardQualifierMatcher(AnyQualifier, null)).toBeTruthy();
          expect(testWildcardQualifierMatcher(AnyQualifier, {})).toBeTruthy();
        });

        it('should match exact qualifier', () => {
          expect(testWildcardQualifierMatcher(AnyQualifier, {'*': '*'})).toBeTruthy();
        });

        it('should match qualifier containing specific value', () => {
          expect(testWildcardQualifierMatcher(AnyQualifier, {'entity': 'person'})).toBeTruthy();
        });

        it('should match qualifier containing specific value and wildcard (?) value', () => {
          expect(testWildcardQualifierMatcher(AnyQualifier, {'entity': 'person', 'id': '?'})).toBeTruthy();
        });

        it('should match qualifier containing specific value and wildcard (*) value', () => {
          expect(testWildcardQualifierMatcher(AnyQualifier, {'entity': 'person', 'id': '*'})).toBeTruthy();
        });

        it('should match qualifier containing multiple specific values', () => {
          expect(testWildcardQualifierMatcher(AnyQualifier, {'entity': 'person', 'id': '1'})).toBeTruthy();
        });

        it('should match qualifier containing wildcard (?) value', () => {
          expect(testWildcardQualifierMatcher(AnyQualifier, {'entity': '?'})).toBeTruthy();
        });

        it('should match qualifier containing multiple wildcard (?) values', () => {
          expect(testWildcardQualifierMatcher(AnyQualifier, {'entity': '?', 'id': '?'})).toBeTruthy();
        });

        it('should match qualifier containing wildcard (?) value and wildcard (*) value', () => {
          expect(testWildcardQualifierMatcher(AnyQualifier, {'entity': '?', 'id': '*'})).toBeTruthy();
        });

        it('should match qualifier containing wildcard (?) value and specific value', () => {
          expect(testWildcardQualifierMatcher(AnyQualifier, {'entity': '?', 'id': '1'})).toBeTruthy();
        });

        it('should match qualifier containing wildcard (*) value', () => {
          expect(testWildcardQualifierMatcher(AnyQualifier, {'entity': '*'})).toBeTruthy();
        });

        it('should match qualifier containing multiple wildcard (*) values ', () => {
          expect(testWildcardQualifierMatcher(AnyQualifier, {'entity': '*', 'id': '*'})).toBeTruthy();
        });

        it('should match qualifier containing wildcard (*) value and wildcard (?) value', () => {
          expect(testWildcardQualifierMatcher(AnyQualifier, {'entity': '*', 'id': '?'})).toBeTruthy();
        });

        it('should match qualifier containing wildcard (*) value and specific value', () => {
          expect(testWildcardQualifierMatcher(AnyQualifier, {'entity': '*', 'id': '1'})).toBeTruthy();
        });
      });

      describe('qualifier containing multiple keys', () => {
        describe('qualifier contains additional wildcard (?) qualifier value', () => {
          const CombinedQualifier = {'*': '*', 'type': '?'};

          it('should match empty qualifiers', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, undefined)).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, null)).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {})).toBeTruthy();
          });

          it('should match `AnyQualifier`', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'*': '*'})).toBeTruthy();
          });

          it('should match exact qualifier', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'*': '*', 'type': '?'})).toBeTruthy();
          });

          it('should match qualifier containing specific values and additional wildcard (?) value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': 'user', 'id': '?'})).toBeTruthy();
          });

          it('should match qualifier containing specific values and additional wildcard (*) value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': 'user', 'id': '*'})).toBeTruthy();
          });

          it('should match qualifier containing specific values and additional specific value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': 'user', 'id': '1'})).toBeTruthy();
          });

          it('should match qualifier containing wildcard (?) values and additional wildcard (?) value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': '?', 'id': '?'})).toBeTruthy();
          });

          it('should match qualifier containing wildcard (?) values and additional wildcard (*) value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': '?', 'id': '*'})).toBeTruthy();
          });

          it('should match qualifier containing wildcard (?) values and additional specific value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': '?', 'id': '1'})).toBeTruthy();
          });

          it('should match qualifier containing wildcard (*) values', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': '*'})).toBeTruthy();
          });

          it('should match qualifier containing wildcard (*) values and additional wildcard (*) value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': '*', 'id': '*'})).toBeTruthy();
          });

          it('should match qualifier containing wildcard (*) values and additional wildcard (?) value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': '*', 'id': '?'})).toBeTruthy();
          });

          it('should match qualifier containing wildcard (*) values and additional specific value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': '*', 'id': '1'})).toBeTruthy();
          });

          it('should match qualifier containing a combination of specific values and wildcard values', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': '*'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': '?'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': 'user'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': 'user'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': '*'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': '?'})).toBeTruthy();
          });

          it('should match qualifier containing a combination of specific values and wildcard values and additional wildcard (?) value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': '*', 'id': '?'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': '?', 'id': '?'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': 'user', 'id': '?'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': 'user', 'id': '?'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': '*', 'id': '?'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': '?', 'id': '?'})).toBeTruthy();
          });

          it('should match qualifier containing a combination of specific values and wildcard values and additional wildcard (*) value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': '*', 'id': '*'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': '?', 'id': '*'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': 'user', 'id': '*'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': 'user', 'id': '*'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': '*', 'id': '*'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': '?', 'id': '*'})).toBeTruthy();
          });

          it('should match qualifier containing a combination of specific values and wildcard values and additional specific value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': '*', 'id': '1'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': '?', 'id': '1'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': 'user', 'id': '1'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': 'user', 'id': '1'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': '*', 'id': '1'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': '?', 'id': '1'})).toBeTruthy();
          });
        });

        describe('qualifier contains additional wildcard (*) qualifier value', () => {
          const CombinedQualifier = {'*': '*', 'type': '*'};

          it('should not match empty qualifiers', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, undefined)).toBeFalsy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, null)).toBeFalsy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {})).toBeFalsy();
          });

          it('should match `AnyQualifier`', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'*': '*'})).toBeTruthy();
          });

          it('should match exact qualifier', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'*': '*', 'type': '*'})).toBeTruthy();
          });

          it('should match qualifier containing specific values and additional wildcard (?) value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': 'user', 'id': '?'})).toBeTruthy();
          });

          it('should match qualifier containing specific values and additional wildcard (*) value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': 'user', 'id': '*'})).toBeTruthy();
          });

          it('should match qualifier containing specific values and additional specific value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': 'user', 'id': '1'})).toBeTruthy();
          });

          it('should match qualifier containing wildcard (?) values and additional wildcard (?) value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': '?', 'id': '?'})).toBeTruthy();
          });

          it('should match qualifier containing wildcard (?) values and additional wildcard (*) value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': '?', 'id': '*'})).toBeTruthy();
          });

          it('should match qualifier containing wildcard (?) values and additional specific value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': '?', 'id': '1'})).toBeTruthy();
          });

          it('should match qualifier containing wildcard (*) values', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': '*'})).toBeTruthy();
          });

          it('should match qualifier containing wildcard (*) values and additional wildcard (*) value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': '*', 'id': '*'})).toBeTruthy();
          });

          it('should match qualifier containing wildcard (*) values and additional wildcard (?) value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': '*', 'id': '?'})).toBeTruthy();
          });

          it('should match qualifier containing wildcard (*) values and additional specific value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': '*', 'id': '1'})).toBeTruthy();
          });

          it('should match qualifier containing a combination of specific values and wildcard values', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': '*'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': '?'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': 'user'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': 'user'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': '*'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': '?'})).toBeTruthy();
          });

          it('should match qualifier containing a combination of specific values and wildcard values and additional wildcard (?) value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': '*', 'id': '?'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': '?', 'id': '?'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': 'user', 'id': '?'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': 'user', 'id': '?'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': '*', 'id': '?'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': '?', 'id': '?'})).toBeTruthy();
          });

          it('should match qualifier containing a combination of specific values and wildcard values and additional wildcard (*) value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': '*', 'id': '*'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': '?', 'id': '*'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': 'user', 'id': '*'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': 'user', 'id': '*'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': '*', 'id': '*'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': '?', 'id': '*'})).toBeTruthy();
          });

          it('should match qualifier containing a combination of specific values and wildcard values and additional specific value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': '*', 'id': '1'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': '?', 'id': '1'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': 'user', 'id': '1'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': 'user', 'id': '1'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': '*', 'id': '1'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': '?', 'id': '1'})).toBeTruthy();
          });
        });

        describe('qualifier contains additional specific qualifier value', () => {
          const CombinedQualifier = {'*': '*', 'type': 'user'};

          it('should not match empty qualifiers', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, undefined)).toBeFalsy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, null)).toBeFalsy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {})).toBeFalsy();
          });

          it('should match `AnyQualifier`', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'*': '*'})).toBeTruthy();
          });

          it('should match exact qualifier', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'*': '*', 'type': 'user'})).toBeTruthy();
          });

          it('should match qualifier containing specific values and additional wildcard (?) value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': 'user', 'id': '?'})).toBeTruthy();
          });

          it('should match qualifier containing specific values and additional wildcard (*) value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': 'user', 'id': '*'})).toBeTruthy();
          });

          it('should match qualifier containing specific values and additional specific value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': 'user', 'id': '1'})).toBeTruthy();
          });

          it('should match qualifier containing wildcard (?) values and additional wildcard (?) value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': '?', 'id': '?'})).toBeTruthy();
          });

          it('should match qualifier containing wildcard (?) values and additional wildcard (*) value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': '?', 'id': '*'})).toBeTruthy();
          });

          it('should match qualifier containing wildcard (?) values and additional specific value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': '?', 'id': '1'})).toBeTruthy();
          });

          it('should match qualifier containing wildcard (*) values', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': '*'})).toBeTruthy();
          });

          it('should match qualifier containing wildcard (*) values and additional wildcard (*) value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': '*', 'id': '*'})).toBeTruthy();
          });

          it('should match qualifier containing wildcard (*) values and additional wildcard (?) value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': '*', 'id': '?'})).toBeTruthy();
          });

          it('should match qualifier containing wildcard (*) values and additional specific value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': '*', 'id': '1'})).toBeTruthy();
          });

          it('should match qualifier containing a combination of specific values and wildcard values', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': '*'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': '?'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': 'user'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': 'user'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': '*'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': '?'})).toBeTruthy();
          });

          it('should match qualifier containing a combination of specific values and wildcard values and additional wildcard (?) value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': '*', 'id': '?'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': '?', 'id': '?'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': 'user', 'id': '?'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': 'user', 'id': '?'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': '*', 'id': '?'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': '?', 'id': '?'})).toBeTruthy();
          });

          it('should match qualifier containing a combination of specific values and wildcard values and additional wildcard (*) value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': '*', 'id': '*'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': '?', 'id': '*'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': 'user', 'id': '*'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': 'user', 'id': '*'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': '*', 'id': '*'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': '?', 'id': '*'})).toBeTruthy();
          });

          it('should match qualifier containing a combination of specific values and wildcard values and additional specific value', () => {
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': '*', 'id': '1'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': 'person', 'type': '?', 'id': '1'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': 'user', 'id': '1'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': 'user', 'id': '1'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '?', 'type': '*', 'id': '1'})).toBeTruthy();
            expect(testWildcardQualifierMatcher(CombinedQualifier, {'entity': '*', 'type': '?', 'id': '1'})).toBeTruthy();
          });
        });
      });
    });
  });
});
