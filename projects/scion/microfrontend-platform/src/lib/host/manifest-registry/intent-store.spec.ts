/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { IntentionStore } from './intention-store';
import { Intention } from '../../platform.model';

describe('IntentionStore', () => {
  let store: IntentionStore;

  beforeEach(() => {
    store = new IntentionStore();
  });

  describe('add and find intentions', () => {
    describe('find using \'wildcardMatcher\' strategy', () => {
      it('should not find intentions if the store is empty', () => {
        expect(store.findById('id')).toBeUndefined();
        expect(store.findByApplication('app', undefined, {strategy: 'wildcardMatcher'})).toEqual([]);
        expect(store.findByApplication('app', null, {strategy: 'wildcardMatcher'})).toEqual([]);
        expect(store.findByApplication('app', {}, {strategy: 'wildcardMatcher'})).toEqual([]);
        expect(store.findByApplication('app', {'*': '*'}, {strategy: 'wildcardMatcher'})).toEqual([]);
      });

      it('should find intentions by id and app', () => {
        const intent: Intention = {type: 'type', metadata: {id: 'id', appSymbolicName: 'app'}};
        store.add(intent);

        expect(store.findById('id')).toBe(intent);
        expect(store.findByApplication('app', undefined, {strategy: 'wildcardMatcher'})).toEqual([intent]);
        expect(store.findByApplication('app', null, {strategy: 'wildcardMatcher'})).toEqual([intent]);
        expect(store.findByApplication('app', {}, {strategy: 'wildcardMatcher'})).toEqual([intent]);
        expect(store.findByApplication('app', {'*': '*'}, {strategy: 'wildcardMatcher'})).toEqual([intent]);
      });

      it('should find intentions of the same app', () => {
        const intention1: Intention = {type: 'type1', metadata: {id: 'id1', appSymbolicName: 'app'}};
        const intention2: Intention = {type: 'type2', metadata: {id: 'id2', appSymbolicName: 'app', implicitlyProvidedBy: 'providerId'}};
        store.add(intention1);
        store.add(intention2);

        expect(store.findById('id1')).toBe(intention1);
        expect(store.findById('id2')).toBe(intention2);
        expect(store.findByApplication('app', undefined, {strategy: 'wildcardMatcher'})).toEqual([intention1, intention2]);
        expect(store.findByApplication('app', null, {strategy: 'wildcardMatcher'})).toEqual([intention1, intention2]);
        expect(store.findByApplication('app', {}, {strategy: 'wildcardMatcher'})).toEqual([intention1, intention2]);
        expect(store.findByApplication('app', {'*': '*'}, {strategy: 'wildcardMatcher'})).toEqual([intention1, intention2]);
      });

      it('should find intentions by app and qualifier', () => {
        const nullQualifierIntention: Intention = {type: 'type1', metadata: {id: 'id1', appSymbolicName: 'app'}};
        const emptyQualifierIntention: Intention = {type: 'type2', qualifier: {}, metadata: {id: 'id2', appSymbolicName: 'app'}};
        const asterikQualifierIntention: Intention = {type: 'type3', qualifier: {entity: '*'}, metadata: {id: 'id3', appSymbolicName: 'app'}};
        const optionalQualifierIntention: Intention = {type: 'type4', qualifier: {entity: '?'}, metadata: {id: 'id4', appSymbolicName: 'app'}};
        const exactQualifierIntention: Intention = {type: 'type5', qualifier: {entity: 'test'}, metadata: {id: 'id5', appSymbolicName: 'app'}};
        store.add(nullQualifierIntention);
        store.add(emptyQualifierIntention);
        store.add(asterikQualifierIntention);
        store.add(optionalQualifierIntention);
        store.add(exactQualifierIntention);

        expect(store.findByApplication('app', undefined, {strategy: 'wildcardMatcher'})).toEqual([nullQualifierIntention, emptyQualifierIntention, optionalQualifierIntention]);
        expect(store.findByApplication('app', null, {strategy: 'wildcardMatcher'})).toEqual([nullQualifierIntention, emptyQualifierIntention, optionalQualifierIntention]);
        expect(store.findByApplication('app', {}, {strategy: 'wildcardMatcher'})).toEqual([nullQualifierIntention, emptyQualifierIntention, optionalQualifierIntention]);
        expect(store.findByApplication('app', {'*': '*'}, {strategy: 'wildcardMatcher'})).toEqual([nullQualifierIntention, emptyQualifierIntention, asterikQualifierIntention, optionalQualifierIntention, exactQualifierIntention]);
        expect(store.findByApplication('app', {'entity': '*'}, {strategy: 'wildcardMatcher'})).toEqual([asterikQualifierIntention, optionalQualifierIntention, exactQualifierIntention]);
        expect(store.findByApplication('app', {'entity': '?'}, {strategy: 'wildcardMatcher'})).toEqual([nullQualifierIntention, emptyQualifierIntention, asterikQualifierIntention, optionalQualifierIntention, exactQualifierIntention]);
        expect(store.findByApplication('app', {'entity': 'test'}, {strategy: 'wildcardMatcher'})).toEqual([asterikQualifierIntention, optionalQualifierIntention, exactQualifierIntention]);
      });
    });

    describe('find using \'intentMatcher\' strategy', () => {
      it('should not find intentions if the store is empty', () => {
        expect(store.findByApplication('app', undefined, {strategy: 'intentMatcher'})).toEqual([]);
        expect(store.findByApplication('app', null, {strategy: 'intentMatcher'})).toEqual([]);
        expect(store.findByApplication('app', {}, {strategy: 'intentMatcher'})).toEqual([]);
        expect(store.findByApplication('app', {'*': '*'}, {strategy: 'intentMatcher'})).toEqual([]);
      });

      it('should find intentions by id and app', () => {
        const intention: Intention = {type: 'type', metadata: {id: 'id', appSymbolicName: 'app'}};
        store.add(intention);

        expect(store.findById('id')).toBe(intention);
        expect(store.findByApplication('app', undefined, {strategy: 'intentMatcher'})).toEqual([intention]);
        expect(store.findByApplication('app', null, {strategy: 'intentMatcher'})).toEqual([intention]);
        expect(store.findByApplication('app', {}, {strategy: 'intentMatcher'})).toEqual([intention]);
        expect(store.findByApplication('app', {'*': '*'}, {strategy: 'intentMatcher'})).toEqual([]);
      });

      it('should find intentions of the same app', () => {
        const intention1: Intention = {type: 'type1', metadata: {id: 'id1', appSymbolicName: 'app'}};
        const intention2: Intention = {type: 'type2', metadata: {id: 'id2', appSymbolicName: 'app', implicitlyProvidedBy: 'providerId'}};
        store.add(intention1);
        store.add(intention2);

        expect(store.findById('id1')).toBe(intention1);
        expect(store.findById('id2')).toBe(intention2);
        expect(store.findByApplication('app', undefined, {strategy: 'intentMatcher'})).toEqual([intention1, intention2]);
        expect(store.findByApplication('app', null, {strategy: 'intentMatcher'})).toEqual([intention1, intention2]);
        expect(store.findByApplication('app', {}, {strategy: 'intentMatcher'})).toEqual([intention1, intention2]);
        expect(store.findByApplication('app', {'*': '*'}, {strategy: 'intentMatcher'})).toEqual([]);
      });

      it('should find intentions by app and qualifier', () => {
        const nullQualifierIntention: Intention = {type: 'type1', metadata: {id: 'id1', appSymbolicName: 'app'}};
        const emptyQualifierIntention: Intention = {type: 'type2', qualifier: {}, metadata: {id: 'id2', appSymbolicName: 'app'}};
        const asterikQualifierIntention: Intention = {type: 'type3', qualifier: {entity: '*'}, metadata: {id: 'id3', appSymbolicName: 'app'}};
        const optionalQualifierIntention: Intention = {type: 'type4', qualifier: {entity: '?'}, metadata: {id: 'id4', appSymbolicName: 'app'}};
        const exactQualifierIntention: Intention = {type: 'type5', qualifier: {entity: 'test'}, metadata: {id: 'id5', appSymbolicName: 'app'}};
        store.add(nullQualifierIntention);
        store.add(emptyQualifierIntention);
        store.add(asterikQualifierIntention);
        store.add(optionalQualifierIntention);
        store.add(exactQualifierIntention);

        expect(store.findByApplication('app', undefined, {strategy: 'intentMatcher'})).toEqual([nullQualifierIntention, emptyQualifierIntention, optionalQualifierIntention]);
        expect(store.findByApplication('app', null, {strategy: 'intentMatcher'})).toEqual([nullQualifierIntention, emptyQualifierIntention, optionalQualifierIntention]);
        expect(store.findByApplication('app', {}, {strategy: 'intentMatcher'})).toEqual([nullQualifierIntention, emptyQualifierIntention, optionalQualifierIntention]);
        expect(store.findByApplication('app', {'*': '*'}, {strategy: 'intentMatcher'})).toEqual([]);
        expect(store.findByApplication('app', {'entity': '*'}, {strategy: 'intentMatcher'})).toEqual([asterikQualifierIntention, optionalQualifierIntention]);
        expect(store.findByApplication('app', {'entity': '?'}, {strategy: 'intentMatcher'})).toEqual([asterikQualifierIntention, optionalQualifierIntention]);
        expect(store.findByApplication('app', {'entity': 'test'}, {strategy: 'intentMatcher'})).toEqual([asterikQualifierIntention, optionalQualifierIntention, exactQualifierIntention]);
      });
    });
  });

  describe('remove intentions', () => {
    it('should do nothing if the store is empty', () => {
      store.remove('app', {type: 'type', qualifier: undefined});
      store.remove('app', {type: 'type', qualifier: null});
      store.remove('app', {type: 'type', qualifier: {}});
      store.remove('app', {type: 'type', qualifier: {'*': '*'}});

      expect(store.findByApplication('app', {}, {strategy: 'wildcardMatcher'})).toEqual([]);
    });

    it('should remove intentions matching the `undefined` qualifier', () => {
      const intention1: Intention = {type: 'type', metadata: {id: 'id1', appSymbolicName: 'app'}};
      const intention2: Intention = {type: 'type', qualifier: undefined, metadata: {id: 'id2', appSymbolicName: 'app'}};
      const intention3: Intention = {type: 'type', qualifier: null, metadata: {id: 'id3', appSymbolicName: 'app'}};
      const intention4: Intention = {type: 'type', qualifier: {}, metadata: {id: 'id4', appSymbolicName: 'app'}};
      store.add(intention1);
      store.add(intention2);
      store.add(intention3);
      store.add(intention4);
      store.remove('app', {type: 'type', qualifier: undefined});

      expect(store.findById('id1')).toBeUndefined();
      expect(store.findById('id2')).toBeUndefined();
      expect(store.findById('id3')).toBeUndefined();
      expect(store.findById('id4')).toBeUndefined();
      expect(store.findByApplication('app', undefined, {strategy: 'wildcardMatcher'})).toEqual([]);
    });

    it('should remove intentions matching the `null` qualifier', () => {
      const intention1: Intention = {type: 'type', metadata: {id: 'id1', appSymbolicName: 'app'}};
      const intention2: Intention = {type: 'type', qualifier: undefined, metadata: {id: 'id2', appSymbolicName: 'app'}};
      const intention3: Intention = {type: 'type', qualifier: null, metadata: {id: 'id3', appSymbolicName: 'app'}};
      const intention4: Intention = {type: 'type', qualifier: {}, metadata: {id: 'id4', appSymbolicName: 'app'}};
      store.add(intention1);
      store.add(intention2);
      store.add(intention3);
      store.add(intention4);
      store.remove('app', {type: 'type', qualifier: null});

      expect(store.findById('id1')).toBeUndefined();
      expect(store.findById('id2')).toBeUndefined();
      expect(store.findById('id3')).toBeUndefined();
      expect(store.findById('id4')).toBeUndefined();
      expect(store.findByApplication('app', null, {strategy: 'wildcardMatcher'})).toEqual([]);
    });

    it('should remove intentions matching the empty qualifier', () => {
      const intention1: Intention = {type: 'type', metadata: {id: 'id1', appSymbolicName: 'app'}};
      const intention2: Intention = {type: 'type', qualifier: undefined, metadata: {id: 'id2', appSymbolicName: 'app'}};
      const intention3: Intention = {type: 'type', qualifier: null, metadata: {id: 'id3', appSymbolicName: 'app'}};
      const intention4: Intention = {type: 'type', qualifier: {}, metadata: {id: 'id4', appSymbolicName: 'app'}};
      store.add(intention1);
      store.add(intention2);
      store.add(intention3);
      store.add(intention4);
      store.remove('app', {type: 'type', qualifier: {}});

      expect(store.findById('id1')).toBeUndefined();
      expect(store.findById('id2')).toBeUndefined();
      expect(store.findById('id3')).toBeUndefined();
      expect(store.findById('id4')).toBeUndefined();
      expect(store.findByApplication('app', {}, {strategy: 'wildcardMatcher'})).toEqual([]);
    });

    it('should remove absolute wildcard intentions', () => {
      const intention: Intention = {type: 'type', qualifier: {'*': '*'}, metadata: {id: 'id', appSymbolicName: 'app'}};
      store.add(intention);
      store.remove('app', {type: 'type', qualifier: {'*': '*'}});

      expect(store.findById('id')).toBeUndefined();
      expect(store.findByApplication('app', {'*': '*'}, {strategy: 'wildcardMatcher'})).toEqual([]);
    });

    it('should remove intentions which contain the asterisk value wildcard in their qualifier', () => {
      const intention: Intention = {type: 'type', qualifier: {'entity': '*'}, metadata: {id: 'id', appSymbolicName: 'app'}};
      store.add(intention);
      store.remove('app', {type: 'type', qualifier: {'entity': '*'}});

      expect(store.findById('id')).toBeUndefined();
      expect(store.findByApplication('app', {'entity': '*'}, {strategy: 'wildcardMatcher'})).toEqual([]);
    });

    it('should remove intentions which contain the optional value wildcard in their qualifier', () => {
      const intention: Intention = {type: 'type', qualifier: {'entity': '?'}, metadata: {id: 'id', appSymbolicName: 'app'}};
      store.add(intention);
      store.remove('app', {type: 'type', qualifier: {'entity': '?'}});

      expect(store.findById('id')).toBeUndefined();
      expect(store.findByApplication('app', {'entity': '?'}, {strategy: 'wildcardMatcher'})).toEqual([]);
    });

    it('should remove intentions using an exact qualifier as deletion criterion', () => {
      const intention: Intention = {type: 'type', qualifier: {'entity': 'test'}, metadata: {id: 'id', appSymbolicName: 'app'}};
      store.add(intention);
      store.remove('app', {type: 'type', qualifier: {'entity': 'test'}});

      expect(store.findById('id')).toBeUndefined();
      expect(store.findByApplication('app', {'entity': 'test'}, {strategy: 'wildcardMatcher'})).toEqual([]);
    });

    it('should not interpret wildcards in the qualifier when removing intentions (asterisk wildcard as qualifier key and value)', () => {
      const intention: Intention = {type: 'type', qualifier: {'entity': 'test'}, metadata: {id: 'id', appSymbolicName: 'app'}};
      store.add(intention);
      store.remove('app', {type: 'type', qualifier: {'*': '*'}});

      expect(store.findById('id')).toBe(intention);
      expect(store.findByApplication('app', {'*': '*'}, {strategy: 'wildcardMatcher'})).toEqual([intention]);
    });

    it('should not interpret wildcards in the qualifier when removing intentions (asterisk wildcard as qualifier value)', () => {
      const intention: Intention = {type: 'type', qualifier: {'entity': 'test'}, metadata: {id: 'id', appSymbolicName: 'app'}};
      store.add(intention);
      store.remove('app', {type: 'type', qualifier: {'entity': '*'}});

      expect(store.findById('id')).toBe(intention);
      expect(store.findByApplication('app', {'entity': '*'}, {strategy: 'wildcardMatcher'})).toEqual([intention]);
    });

    it('should not interpret wildcards in the qualifier when removing intentions (optional wildcard as qualifier value)', () => {
      const intention: Intention = {type: 'type', qualifier: {'entity': 'test'}, metadata: {id: 'id', appSymbolicName: 'app'}};
      store.add(intention);
      store.remove('app', {type: 'type', qualifier: {'entity': '?'}});

      expect(store.findById('id')).toBe(intention);
      expect(store.findByApplication('app', {'entity': '?'}, {strategy: 'wildcardMatcher'})).toEqual([intention]);
    });

    it('should not remove wildcard intentions when using an exact qualifier as deletion criterion', () => {
      const intention: Intention = {type: 'type', qualifier: {'*': '*'}, metadata: {id: 'id', appSymbolicName: 'app'}};
      store.add(intention);
      store.remove('app', {type: 'type', qualifier: {'entity': 'test'}});

      expect(store.findById('id')).toBe(intention);
      expect(store.findByApplication('app', {'entity': 'test'}, {strategy: 'wildcardMatcher'})).toEqual([intention]);
      expect(store.findByApplication('app', {'*': '*'}, {strategy: 'wildcardMatcher'})).toEqual([intention]);
    });

    it('should not remove absolute wildcard intentions when specifying the asterisk wildcard only as qualifier value', () => {
      const intention: Intention = {type: 'type', qualifier: {'*': '*'}, metadata: {id: 'id', appSymbolicName: 'app'}};
      store.add(intention);
      store.remove('app', {type: 'type', qualifier: {'entity': '*'}});

      expect(store.findById('id')).toBe(intention);
      expect(store.findByApplication('app', {'entity': '*'}, {strategy: 'wildcardMatcher'})).toEqual([intention]);
      expect(store.findByApplication('app', {'*': '*'}, {strategy: 'wildcardMatcher'})).toEqual([intention]);
    });

    it('should not remove absolute wildcard intentions when specifying the optional wildcard as qualifier value', () => {
      const intention: Intention = {type: 'type', qualifier: {'*': '*'}, metadata: {id: 'id', appSymbolicName: 'app'}};
      store.add(intention);
      store.remove('app', {type: 'type', qualifier: {'entity': '?'}});

      expect(store.findById('id')).toBe(intention);
      expect(store.findByApplication('app', {'entity': '?'}, {strategy: 'wildcardMatcher'})).toEqual([intention]);
      expect(store.findByApplication('app', {'*': '*'}, {strategy: 'wildcardMatcher'})).toEqual([intention]);
    });

    it('should remove absolute wildcard intentions if not specifying a qualifier in the filter', () => {
      const intention: Intention = {type: 'type', qualifier: {'*': '*'}, metadata: {id: 'id', appSymbolicName: 'app'}};
      store.add(intention);
      store.remove('app', {type: 'type'});

      expect(store.findById('id')).toBeUndefined();
      expect(store.findByApplication('app', {'*': '*'}, {strategy: 'wildcardMatcher'})).toEqual([]);
    });

    it('should remove absolute wildcard intentions if an `undefined` qualifier is passed in the filter', () => {
      const intention: Intention = {type: 'type', qualifier: {'*': '*'}, metadata: {id: 'id', appSymbolicName: 'app'}};
      store.add(intention);
      store.remove('app', {type: 'type', qualifier: undefined});

      expect(store.findById('id')).toBeUndefined();
      expect(store.findByApplication('app', {'*': '*'}, {strategy: 'wildcardMatcher'})).toEqual([]);
    });

    it('should not remove absolute wildcard intentions if a `null` qualifier is passed in the filter', () => {
      const intention: Intention = {type: 'type', qualifier: {'*': '*'}, metadata: {id: 'id', appSymbolicName: 'app'}};
      store.add(intention);
      store.remove('app', {type: 'type', qualifier: null});

      expect(store.findById('id')).toBe(intention);
      expect(store.findByApplication('app', null, {strategy: 'wildcardMatcher'})).toEqual([intention]);
      expect(store.findByApplication('app', {'*': '*'}, {strategy: 'wildcardMatcher'})).toEqual([intention]);
    });

    it('should not remove absolute wildcard intentions if an empty qualifier is passed in the filter', () => {
      const intention: Intention = {type: 'type', qualifier: {'*': '*'}, metadata: {id: 'id', appSymbolicName: 'app'}};
      store.add(intention);
      store.remove('app', {type: 'type', qualifier: {}});

      expect(store.findById('id')).toBe(intention);
      expect(store.findByApplication('app', {}, {strategy: 'wildcardMatcher'})).toEqual([intention]);
      expect(store.findByApplication('app', {'*': '*'}, {strategy: 'wildcardMatcher'})).toEqual([intention]);
    });

    it('should not remove intentions of other types', () => {
      const intention1: Intention = {type: 'type1', metadata: {id: 'id1', appSymbolicName: 'app'}};
      const intention2: Intention = {type: 'type2', metadata: {id: 'id2', appSymbolicName: 'app'}};
      store.add(intention1);
      store.add(intention2);
      store.remove('app', {type: 'type1', qualifier: {}});

      expect(store.findById('id1')).toBeUndefined();
      expect(store.findById('id2')).toBe(intention2);
      expect(store.findByApplication('app', {'*': '*'}, {strategy: 'wildcardMatcher'})).toEqual([intention2]);
    });

    it('should not remove intentions of other apps', () => {
      const intention1: Intention = {type: 'type', metadata: {id: 'id1', appSymbolicName: 'app1'}};
      const intention2: Intention = {type: 'type', metadata: {id: 'id2', appSymbolicName: 'app2'}};
      store.add(intention1);
      store.add(intention2);
      store.remove('app1', {type: 'type', qualifier: {}});

      expect(store.findById('id1')).toBeUndefined();
      expect(store.findById('id2')).toBe(intention2);
      expect(store.findByApplication('app1', {'*': '*'}, {strategy: 'wildcardMatcher'})).toEqual([]);
      expect(store.findByApplication('app2', {'*': '*'}, {strategy: 'wildcardMatcher'})).toEqual([intention2]);
    });

    it('should not remove explicit intentions if `providedBy` is passed in the filter\', () => {', () => {
      const intention: Intention = {type: 'type', qualifier: {'*': '*'}, metadata: {id: 'id', appSymbolicName: 'app'}};
      store.add(intention);
      store.remove('app', {type: 'type', qualifier: {'*': '*'}, providedBy: 'providerId'});

      expect(store.findById('id')).toBe(intention);
      expect(store.findByApplication('app', {'*': '*'}, {strategy: 'wildcardMatcher'})).toEqual([intention]);
    });

    it('should not remove implicit intentions by default', () => {
      const intention1: Intention = {type: 'type', metadata: {id: 'id1', appSymbolicName: 'app', implicitlyProvidedBy: 'providerId'}};
      const intention2: Intention = {type: 'type', metadata: {id: 'id2', appSymbolicName: 'app'}};
      store.add(intention1);
      store.add(intention2);
      store.remove('app', {type: 'type', qualifier: {}});

      expect(store.findById('id1')).toBe(intention1);
      expect(store.findById('id2')).toBeUndefined();
      expect(store.findByApplication('app', {'*': '*'}, {strategy: 'wildcardMatcher'})).toEqual([intention1]);
    });

    it('should remove implicit intentions if explicitly stated to remove `implicit` intentions', () => {
      const intention1: Intention = {type: 'type', metadata: {id: 'id1', appSymbolicName: 'app', implicitlyProvidedBy: 'providerId'}};
      const intention2: Intention = {type: 'type', metadata: {id: 'id2', appSymbolicName: 'app'}};
      store.add(intention1);
      store.add(intention2);
      store.remove('app', {type: 'type', qualifier: {}}, {kind: 'implicit'});

      expect(store.findById('id1')).toBeUndefined();
      expect(store.findById('id2')).toBe(intention2);
      expect(store.findByApplication('app', {'*': '*'}, {strategy: 'wildcardMatcher'})).toEqual([intention2]);
    });

    it('should not remove implicit intentions if explicitly stated to remove `explicit` intentions', () => {
      const intention1: Intention = {type: 'type', metadata: {id: 'id1', appSymbolicName: 'app', implicitlyProvidedBy: 'providerId'}};
      const intention2: Intention = {type: 'type', metadata: {id: 'id2', appSymbolicName: 'app'}};
      store.add(intention1);
      store.add(intention2);
      store.remove('app', {type: 'type', qualifier: {}}, {kind: 'explicit'});

      expect(store.findById('id1')).toBe(intention1);
      expect(store.findById('id2')).toBeUndefined();
      expect(store.findByApplication('app', {'*': '*'}, {strategy: 'wildcardMatcher'})).toEqual([intention1]);
    });
  });
});
