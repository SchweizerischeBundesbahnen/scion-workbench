/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { ProviderStore } from './provider-store';
import { CapabilityProvider } from '../../platform.model';

describe('CapabilityProviderStore', () => {
  let store: ProviderStore;

  beforeEach(() => {
    store = new ProviderStore();
  });

  describe('add and find capability providers', () => {

    describe('find using \'wildcardMatcher\' strategy', () => {
      it('should not find providers if the store is empty', () => {
        expect(store.findById('id')).toBeUndefined();
        expect(store.findByType('type', undefined, {strategy: 'wildcardMatcher'})).toEqual([]);
        expect(store.findByType('type', null, {strategy: 'wildcardMatcher'})).toEqual([]);
        expect(store.findByType('type', {}, {strategy: 'wildcardMatcher'})).toEqual([]);
        expect(store.findByType('type', {entity: '?'}, {strategy: 'wildcardMatcher'})).toEqual([]);
        expect(store.findByType('type', {'*': '*'}, {strategy: 'wildcardMatcher'})).toEqual([]);
        expect(store.findByApplication('app', undefined)).toEqual([]);
        expect(store.findByApplication('app', null)).toEqual([]);
        expect(store.findByApplication('app', {})).toEqual([]);
        expect(store.findByApplication('app', {'*': '*'})).toEqual([]);
      });

      it('should find providers by id, type and app', () => {
        const provider: CapabilityProvider = {type: 'type', metadata: {id: 'id', appSymbolicName: 'app'}};
        store.add(provider);

        expect(store.findById('id')).toEqual(provider);
        expect(store.findByType('type', undefined, {strategy: 'wildcardMatcher'})).toEqual([provider]);
        expect(store.findByType('type', null, {strategy: 'wildcardMatcher'})).toEqual([provider]);
        expect(store.findByType('type', {}, {strategy: 'wildcardMatcher'})).toEqual([provider]);
        expect(store.findByType('type', {entity: '?'}, {strategy: 'wildcardMatcher'})).toEqual([provider]);
        expect(store.findByType('type', {'*': '*'}, {strategy: 'wildcardMatcher'})).toEqual([provider]);
        expect(store.findByApplication('app', undefined)).toEqual([provider]);
        expect(store.findByApplication('app', null)).toEqual([provider]);
        expect(store.findByApplication('app', {})).toEqual([provider]);
        expect(store.findByApplication('app', {'*': '*'})).toEqual([provider]);
      });

      it('should find providers of the same type', () => {
        const provider1: CapabilityProvider = {type: 'type', metadata: {id: 'id1', appSymbolicName: 'app1'}};
        const provider2: CapabilityProvider = {type: 'type', metadata: {id: 'id2', appSymbolicName: 'app2'}};
        store.add(provider1);
        store.add(provider2);

        expect(store.findById('id1')).toEqual(provider1);
        expect(store.findById('id2')).toEqual(provider2);
        expect(store.findByType('type', undefined, {strategy: 'wildcardMatcher'})).toEqual([provider1, provider2]);
        expect(store.findByType('type', null, {strategy: 'wildcardMatcher'})).toEqual([provider1, provider2]);
        expect(store.findByType('type', {}, {strategy: 'wildcardMatcher'})).toEqual([provider1, provider2]);
        expect(store.findByType('type', {entity: '?'}, {strategy: 'wildcardMatcher'})).toEqual([provider1, provider2]);
        expect(store.findByType('type', {'*': '*'}, {strategy: 'wildcardMatcher'})).toEqual([provider1, provider2]);
        expect(store.findByApplication('app1', undefined)).toEqual([provider1]);
        expect(store.findByApplication('app1', null)).toEqual([provider1]);
        expect(store.findByApplication('app1', {})).toEqual([provider1]);
        expect(store.findByApplication('app1', {entity: '?'})).toEqual([provider1]);
        expect(store.findByApplication('app1', {'*': '*'})).toEqual([provider1]);
        expect(store.findByApplication('app2', undefined)).toEqual([provider2]);
        expect(store.findByApplication('app2', null)).toEqual([provider2]);
        expect(store.findByApplication('app2', {})).toEqual([provider2]);
        expect(store.findByApplication('app2', {entity: '?'})).toEqual([provider2]);
        expect(store.findByApplication('app2', {'*': '*'})).toEqual([provider2]);
      });

      it('should find providers of the same app', () => {
        const provider1: CapabilityProvider = {type: 'type1', metadata: {id: 'id1', appSymbolicName: 'app'}};
        const provider2: CapabilityProvider = {type: 'type2', metadata: {id: 'id2', appSymbolicName: 'app'}};
        store.add(provider1);
        store.add(provider2);

        expect(store.findById('id1')).toEqual(provider1);
        expect(store.findById('id2')).toEqual(provider2);
        expect(store.findByType('type1', undefined, {strategy: 'wildcardMatcher'})).toEqual([provider1]);
        expect(store.findByType('type1', null, {strategy: 'wildcardMatcher'})).toEqual([provider1]);
        expect(store.findByType('type1', {}, {strategy: 'wildcardMatcher'})).toEqual([provider1]);
        expect(store.findByType('type1', {entity: '?'}, {strategy: 'wildcardMatcher'})).toEqual([provider1]);
        expect(store.findByType('type1', {'*': '*'}, {strategy: 'wildcardMatcher'})).toEqual([provider1]);
        expect(store.findByType('type2', undefined, {strategy: 'wildcardMatcher'})).toEqual([provider2]);
        expect(store.findByType('type2', null, {strategy: 'wildcardMatcher'})).toEqual([provider2]);
        expect(store.findByType('type2', {}, {strategy: 'wildcardMatcher'})).toEqual([provider2]);
        expect(store.findByType('type2', {entity: '?'}, {strategy: 'wildcardMatcher'})).toEqual([provider2]);
        expect(store.findByType('type2', {'*': '*'}, {strategy: 'wildcardMatcher'})).toEqual([provider2]);
        expect(store.findByApplication('app', undefined)).toEqual([provider1, provider2]);
        expect(store.findByApplication('app', null)).toEqual([provider1, provider2]);
        expect(store.findByApplication('app', {})).toEqual([provider1, provider2]);
        expect(store.findByApplication('app', {entity: '?'})).toEqual([provider1, provider2]);
        expect(store.findByApplication('app', {'*': '*'})).toEqual([provider1, provider2]);
      });

      it('should find providers by app and qualifier', () => {
        const undefinedQualifierProvider: CapabilityProvider = {type: 'type1', metadata: {id: 'id_undefinedQualifierProvider', appSymbolicName: 'app'}};
        const nullQualifierProvider: CapabilityProvider = {type: 'type1', qualifier: null, metadata: {id: 'id_nullQualifierProvider', appSymbolicName: 'app'}};
        const emptyQualifierProvider: CapabilityProvider = {type: 'type1', qualifier: {}, metadata: {id: 'id_emptyQualifierProvider', appSymbolicName: 'app'}};
        const asteriskQualifierProvider: CapabilityProvider = {type: 'type2', qualifier: {entity: '*'}, metadata: {id: 'id_asteriskQualifierProvider', appSymbolicName: 'app'}};
        const optionalQualifierProvider: CapabilityProvider = {type: 'type2', qualifier: {entity: '?'}, metadata: {id: 'id_optionalQualifierProvider', appSymbolicName: 'app'}};
        const exactQualifierProvider: CapabilityProvider = {type: 'type3', qualifier: {entity: 'test'}, metadata: {id: 'id_exactQualifierProvider', appSymbolicName: 'app'}};

        store.add(undefinedQualifierProvider);
        store.add(nullQualifierProvider);
        store.add(emptyQualifierProvider);
        store.add(asteriskQualifierProvider);
        store.add(optionalQualifierProvider);
        store.add(exactQualifierProvider);

        expect(store.findByApplication('app', undefined)).toEqual([undefinedQualifierProvider, nullQualifierProvider, emptyQualifierProvider, optionalQualifierProvider]);
        expect(store.findByApplication('app', null)).toEqual([undefinedQualifierProvider, nullQualifierProvider, emptyQualifierProvider, optionalQualifierProvider]);
        expect(store.findByApplication('app', {})).toEqual([undefinedQualifierProvider, nullQualifierProvider, emptyQualifierProvider, optionalQualifierProvider]);
        expect(store.findByApplication('app', {'*': '*'})).toEqual([undefinedQualifierProvider, nullQualifierProvider, emptyQualifierProvider, asteriskQualifierProvider, optionalQualifierProvider, exactQualifierProvider]);
        expect(store.findByApplication('app', {'entity': '*'})).toEqual([asteriskQualifierProvider, optionalQualifierProvider, exactQualifierProvider]);
        expect(store.findByApplication('app', {'entity': '?'})).toEqual([undefinedQualifierProvider, nullQualifierProvider, emptyQualifierProvider, asteriskQualifierProvider, optionalQualifierProvider, exactQualifierProvider]);
        expect(store.findByApplication('app', {'entity': 'test'})).toEqual([asteriskQualifierProvider, optionalQualifierProvider, exactQualifierProvider]);
      });
    });

    describe('find using \'intentMatcher\' strategy', () => {
      it('should not find providers if the store is empty', () => {
        expect(store.findByType('type', undefined, {strategy: 'intentMatcher'})).toEqual([]);
        expect(store.findByType('type', null, {strategy: 'intentMatcher'})).toEqual([]);
        expect(store.findByType('type', {}, {strategy: 'intentMatcher'})).toEqual([]);
        expect(store.findByType('type', {entity: '?'}, {strategy: 'intentMatcher'})).toEqual([]);
        expect(store.findByType('type', {'*': '*'}, {strategy: 'intentMatcher'})).toEqual([]);
      });

      it('should find provider by type', () => {
        const provider: CapabilityProvider = {type: 'type', metadata: {id: 'id', appSymbolicName: 'app'}};
        store.add(provider);

        expect(store.findByType('type', undefined, {strategy: 'intentMatcher'})).toEqual([provider]);
        expect(store.findByType('type', null, {strategy: 'intentMatcher'})).toEqual([provider]);
        expect(store.findByType('type', {}, {strategy: 'intentMatcher'})).toEqual([provider]);
        expect(store.findByType('type', {entity: '?'}, {strategy: 'intentMatcher'})).toEqual([]);
        expect(store.findByType('type', {'*': '*'}, {strategy: 'intentMatcher'})).toEqual([]);
      });

      it('should find providers of the same type', () => {
        const provider1: CapabilityProvider = {type: 'type', metadata: {id: 'id1', appSymbolicName: 'app1'}};
        const provider2: CapabilityProvider = {type: 'type', metadata: {id: 'id2', appSymbolicName: 'app2'}};
        store.add(provider1);
        store.add(provider2);

        expect(store.findByType('type', undefined, {strategy: 'intentMatcher'})).toEqual([provider1, provider2]);
        expect(store.findByType('type', null, {strategy: 'intentMatcher'})).toEqual([provider1, provider2]);
        expect(store.findByType('type', {}, {strategy: 'intentMatcher'})).toEqual([provider1, provider2]);
        expect(store.findByType('type', {entity: '?'}, {strategy: 'intentMatcher'})).toEqual([]);
        expect(store.findByType('type', {'*': '*'}, {strategy: 'intentMatcher'})).toEqual([]);
      });

      it('should find providers of the same app', () => {
        const provider1: CapabilityProvider = {type: 'type1', metadata: {id: 'id1', appSymbolicName: 'app'}};
        const provider2: CapabilityProvider = {type: 'type2', metadata: {id: 'id2', appSymbolicName: 'app'}};
        store.add(provider1);
        store.add(provider2);

        expect(store.findByType('type1', undefined, {strategy: 'intentMatcher'})).toEqual([provider1]);
        expect(store.findByType('type1', null, {strategy: 'intentMatcher'})).toEqual([provider1]);
        expect(store.findByType('type1', {}, {strategy: 'intentMatcher'})).toEqual([provider1]);
        expect(store.findByType('type1', {entity: '?'}, {strategy: 'intentMatcher'})).toEqual([]);
        expect(store.findByType('type1', {'*': '*'}, {strategy: 'intentMatcher'})).toEqual([]);
        expect(store.findByType('type2', undefined, {strategy: 'intentMatcher'})).toEqual([provider2]);
        expect(store.findByType('type2', null, {strategy: 'intentMatcher'})).toEqual([provider2]);
        expect(store.findByType('type2', {}, {strategy: 'intentMatcher'})).toEqual([provider2]);
        expect(store.findByType('type2', {entity: '?'}, {strategy: 'intentMatcher'})).toEqual([]);
        expect(store.findByType('type2', {'*': '*'}, {strategy: 'intentMatcher'})).toEqual([]);
      });

      it('should find providers by type and qualifier', () => {
        const undefinedQualifierProvider: CapabilityProvider = {type: 'type', metadata: {id: 'id_undefinedQualifierProvider', appSymbolicName: 'app'}};
        const nullQualifierProvider: CapabilityProvider = {type: 'type', qualifier: null, metadata: {id: 'id_nullQualifierProvider', appSymbolicName: 'app1'}};
        const emptyQualifierProvider: CapabilityProvider = {type: 'type', qualifier: {}, metadata: {id: 'id_emptyQualifierProvider', appSymbolicName: 'app1'}};
        const asteriskQualifierProvider: CapabilityProvider = {type: 'type', qualifier: {entity: '*'}, metadata: {id: 'id_asteriskQualifierProvider', appSymbolicName: 'app2'}};
        const optionalQualifierProvider: CapabilityProvider = {type: 'type', qualifier: {entity: '?'}, metadata: {id: 'id_optionalQualifierProvider', appSymbolicName: 'app2'}};
        const exactQualifierProvider: CapabilityProvider = {type: 'type', qualifier: {entity: 'test'}, metadata: {id: 'id_exactQualifierProvider', appSymbolicName: 'app3'}};

        store.add(undefinedQualifierProvider);
        store.add(nullQualifierProvider);
        store.add(emptyQualifierProvider);
        store.add(asteriskQualifierProvider);
        store.add(optionalQualifierProvider);
        store.add(exactQualifierProvider);

        expect(store.findByType('type', undefined, {strategy: 'intentMatcher'})).toEqual([undefinedQualifierProvider, nullQualifierProvider, emptyQualifierProvider, optionalQualifierProvider]);
        expect(store.findByType('type', null, {strategy: 'intentMatcher'})).toEqual([undefinedQualifierProvider, nullQualifierProvider, emptyQualifierProvider, optionalQualifierProvider]);
        expect(store.findByType('type', {}, {strategy: 'intentMatcher'})).toEqual([undefinedQualifierProvider, nullQualifierProvider, emptyQualifierProvider, optionalQualifierProvider]);
        expect(store.findByType('type', {'*': '*'}, {strategy: 'intentMatcher'})).toEqual([]);
        expect(store.findByType('type', {'entity': '*'}, {strategy: 'intentMatcher'})).toEqual([asteriskQualifierProvider, optionalQualifierProvider]);
        expect(store.findByType('type', {'entity': '?'}, {strategy: 'intentMatcher'})).toEqual([asteriskQualifierProvider, optionalQualifierProvider]);
        expect(store.findByType('type', {'entity': 'test'}, {strategy: 'intentMatcher'})).toEqual([asteriskQualifierProvider, optionalQualifierProvider, exactQualifierProvider]);
      });
    });
  });

  describe('remove providers', () => {
    describe('empty store', () => {
      it('should do nothing if no provider with the given id exists', () => {
        store.remove('app', {id: 'non_existant_id'});

        expect(store.findById('non_existant_id')).toBeUndefined();
      });

      it('should do nothing if no provider of given type and qualifier exists (empty qualifier)', () => {
        store.remove('app', {type: 'type', qualifier: undefined});
        store.remove('app', {type: 'type', qualifier: null});
        store.remove('app', {type: 'type', qualifier: {}});

        expect(store.findByType('type', {}, {strategy: 'wildcardMatcher'})).toEqual([]);
      });

      it('should do nothing if no provider of given type and qualifier exists (absolute wildcard qualifier)', () => {
        store.remove('app', {type: 'type', qualifier: {'*': '*'}});

        expect(store.findByType('type', {'*': '*'}, {strategy: 'wildcardMatcher'})).toEqual([]);
      });

      it('should do nothing if no provider of given type and qualifier exists (exact qualifier)', () => {
        store.remove('app', {type: 'type', qualifier: {entity: 'test'}});

        expect(store.findByType('type', {entity: 'test'}, {strategy: 'wildcardMatcher'})).toEqual([]);
      });
    });

    describe('remove by id', () => {
      it('should remove a provider by id', () => {
        const provider: CapabilityProvider = {type: 'type', metadata: {id: 'id', appSymbolicName: 'app'}};
        store.add(provider);
        store.remove('app', {id: 'id'});

        expect(store.findById('id')).toBeUndefined();
        expect(store.findByType('type', {}, {strategy: 'wildcardMatcher'})).toEqual([]);
        expect(store.findByApplication('app', {})).toEqual([]);
      });

      it('should not remove any provider if no provider with the given id exists', () => {
        const provider: CapabilityProvider = {type: 'type', metadata: {id: 'id', appSymbolicName: 'app'}};
        store.add(provider);
        store.remove('app', {id: 'non-existent'});

        expect(store.findById('id')).toBe(provider);
        expect(store.findByType('type', {}, {strategy: 'wildcardMatcher'})).toEqual([provider]);
        expect(store.findByApplication('app', {})).toEqual([provider]);
      });
    });

    describe('check provider isolation', () => {
      it('should remove providers of the type \'type1\'', () => {
        const type1QualifierProvider: CapabilityProvider = {type: 'type1', qualifier: {'*': '*'}, metadata: {id: 'id1', appSymbolicName: 'app'}};
        const type2QualifierProvider: CapabilityProvider = {type: 'type2', qualifier: {'*': '*'}, metadata: {id: 'id2', appSymbolicName: 'app'}};
        store.add(type1QualifierProvider);
        store.add(type2QualifierProvider);

        store.remove('app', {type: 'type1', qualifier: {'*': '*'}});

        expect(store.findById('id1')).toBeUndefined();
        expect(store.findById('id2')).toBe(type2QualifierProvider);
        expect(store.findByType('type1', {'*': '*'}, {strategy: 'wildcardMatcher'})).toEqual([]);
        expect(store.findByType('type2', {'*': '*'}, {strategy: 'wildcardMatcher'})).toEqual([type2QualifierProvider]);
        expect(store.findByApplication('app', {'*': '*'})).toEqual([type2QualifierProvider]);
      });

      it('should remove providers of the app \'app1\'', () => {
        const app1QualifierProvider: CapabilityProvider = {type: 'type', qualifier: {'*': '*'}, metadata: {id: 'id1', appSymbolicName: 'app1'}};
        const app2QualifierProvider: CapabilityProvider = {type: 'type', qualifier: {'*': '*'}, metadata: {id: 'id2', appSymbolicName: 'app2'}};
        store.add(app1QualifierProvider);
        store.add(app2QualifierProvider);

        store.remove('app1', {type: 'type', qualifier: {'*': '*'}});

        expect(store.findById('id1')).toBeUndefined();
        expect(store.findById('id2')).toBe(app2QualifierProvider);
        expect(store.findByType('type', {'*': '*'}, {strategy: 'wildcardMatcher'})).toEqual([app2QualifierProvider]);
        expect(store.findByApplication('app1', {'*': '*'})).toEqual([]);
        expect(store.findByApplication('app2', {'*': '*'})).toEqual([app2QualifierProvider]);
      });
    });

    describe('remove by qualifier', () => {
      it('should remove providers matching the `undefined` qualifier', () => {
        const provider1: CapabilityProvider = {type: 'type', metadata: {id: 'id1', appSymbolicName: 'app'}};
        const provider2: CapabilityProvider = {type: 'type', qualifier: undefined, metadata: {id: 'id2', appSymbolicName: 'app'}};
        const provider3: CapabilityProvider = {type: 'type', qualifier: null, metadata: {id: 'id3', appSymbolicName: 'app'}};
        const provider4: CapabilityProvider = {type: 'type', qualifier: {}, metadata: {id: 'id4', appSymbolicName: 'app'}};
        store.add(provider1);
        store.add(provider2);
        store.add(provider3);
        store.add(provider4);
        store.remove('app', {type: 'type', qualifier: undefined});

        expect(store.findById('id1')).toBeUndefined();
        expect(store.findById('id2')).toBeUndefined();
        expect(store.findById('id3')).toBeUndefined();
        expect(store.findById('id4')).toBeUndefined();
        expect(store.findByType('type', {'*': '*'}, {strategy: 'wildcardMatcher'})).toEqual([]);
        expect(store.findByApplication('app', {'*': '*'})).toEqual([]);
      });

      it('should remove providers matching the `null` qualifier', () => {
        const provider1: CapabilityProvider = {type: 'type', metadata: {id: 'id1', appSymbolicName: 'app'}};
        const provider2: CapabilityProvider = {type: 'type', qualifier: undefined, metadata: {id: 'id2', appSymbolicName: 'app'}};
        const provider3: CapabilityProvider = {type: 'type', qualifier: null, metadata: {id: 'id3', appSymbolicName: 'app'}};
        const provider4: CapabilityProvider = {type: 'type', qualifier: {}, metadata: {id: 'id4', appSymbolicName: 'app'}};
        store.add(provider1);
        store.add(provider2);
        store.add(provider3);
        store.add(provider4);
        store.remove('app', {type: 'type', qualifier: null});

        expect(store.findById('id1')).toBeUndefined();
        expect(store.findById('id2')).toBeUndefined();
        expect(store.findById('id3')).toBeUndefined();
        expect(store.findById('id4')).toBeUndefined();
        expect(store.findByType('type', {'*': '*'}, {strategy: 'wildcardMatcher'})).toEqual([]);
        expect(store.findByApplication('app', {'*': '*'})).toEqual([]);
      });

      it('should remove providers matching the empty qualifier', () => {
        const provider1: CapabilityProvider = {type: 'type', metadata: {id: 'id1', appSymbolicName: 'app'}};
        const provider2: CapabilityProvider = {type: 'type', qualifier: undefined, metadata: {id: 'id2', appSymbolicName: 'app'}};
        const provider3: CapabilityProvider = {type: 'type', qualifier: null, metadata: {id: 'id3', appSymbolicName: 'app'}};
        const provider4: CapabilityProvider = {type: 'type', qualifier: {}, metadata: {id: 'id4', appSymbolicName: 'app'}};
        store.add(provider1);
        store.add(provider2);
        store.add(provider3);
        store.add(provider4);
        store.remove('app', {type: 'type', qualifier: {}});

        expect(store.findById('id1')).toBeUndefined();
        expect(store.findById('id2')).toBeUndefined();
        expect(store.findById('id3')).toBeUndefined();
        expect(store.findById('id4')).toBeUndefined();
        expect(store.findByType('type', {'*': '*'}, {strategy: 'wildcardMatcher'})).toEqual([]);
        expect(store.findByApplication('app', {'*': '*'})).toEqual([]);
      });

      it('should not interpret wildcards in the qualifier when removing providers (optional wildcard as qualifier value)', () => {
        const provider1: CapabilityProvider = {type: 'type', metadata: {id: 'id1', appSymbolicName: 'app'}};
        const provider2: CapabilityProvider = {type: 'type', qualifier: undefined, metadata: {id: 'id2', appSymbolicName: 'app'}};
        const provider3: CapabilityProvider = {type: 'type', qualifier: null, metadata: {id: 'id3', appSymbolicName: 'app'}};
        const provider4: CapabilityProvider = {type: 'type', qualifier: {}, metadata: {id: 'id4', appSymbolicName: 'app'}};
        store.add(provider1);
        store.add(provider2);
        store.add(provider3);
        store.add(provider4);
        store.remove('app', {type: 'type', qualifier: {entity: '?'}});

        expect(store.findById('id1')).toBe(provider1);
        expect(store.findById('id2')).toBe(provider2);
        expect(store.findById('id3')).toBe(provider3);
        expect(store.findById('id4')).toBe(provider4);
        expect(store.findByType('type', {'*': '*'}, {strategy: 'wildcardMatcher'})).toEqual([provider1, provider2, provider3, provider4]);
        expect(store.findByApplication('app', {'*': '*'})).toEqual([provider1, provider2, provider3, provider4]);
      });

      it('should not interpret wildcards in the qualifier when removing providers (asterisk wildcard as qualifier key and value)', () => {
        const provider1: CapabilityProvider = {type: 'type', metadata: {id: 'id1', appSymbolicName: 'app'}};
        const provider2: CapabilityProvider = {type: 'type', qualifier: undefined, metadata: {id: 'id2', appSymbolicName: 'app'}};
        const provider3: CapabilityProvider = {type: 'type', qualifier: null, metadata: {id: 'id3', appSymbolicName: 'app'}};
        const provider4: CapabilityProvider = {type: 'type', qualifier: {}, metadata: {id: 'id4', appSymbolicName: 'app'}};
        store.add(provider1);
        store.add(provider2);
        store.add(provider3);
        store.add(provider4);
        store.remove('app', {type: 'type', qualifier: {'*': '*'}});

        expect(store.findById('id1')).toBe(provider1);
        expect(store.findById('id2')).toBe(provider2);
        expect(store.findById('id3')).toBe(provider3);
        expect(store.findById('id4')).toBe(provider4);
        expect(store.findByType('type', {'*': '*'}, {strategy: 'wildcardMatcher'})).toEqual([provider1, provider2, provider3, provider4]);
        expect(store.findByApplication('app', {'*': '*'})).toEqual([provider1, provider2, provider3, provider4]);
      });

      it('should remove providers using an exact qualifier as deletion criterion', () => {
        const provider: CapabilityProvider = {type: 'type', qualifier: {'entity': 'test'}, metadata: {id: 'id', appSymbolicName: 'app'}};
        store.add(provider);
        store.remove('app', {type: 'type', qualifier: {'entity': 'test'}});

        expect(store.findById('id')).toBeUndefined();
        expect(store.findByType('type', {'entity': 'test'}, {strategy: 'wildcardMatcher'})).toEqual([]);
        expect(store.findByApplication('app', {'entity': 'test'})).toEqual([]);
      });

      it('should remove providers which contain the asterisk value wildcard in their qualifier', () => {
        const provider: CapabilityProvider = {type: 'type', qualifier: {'entity': '*'}, metadata: {id: 'id', appSymbolicName: 'app'}};
        store.add(provider);
        store.remove('app', {type: 'type', qualifier: {'entity': 'test'}});

        expect(store.findById('id')).toBe(provider);
        expect(store.findByType('type', {'entity': '*'}, {strategy: 'wildcardMatcher'})).toEqual([provider]);
        expect(store.findByApplication('app', {'entity': '*'})).toEqual([provider]);
      });

      it('should remove providers which contain the optional value wildcard in their qualifier', () => {
        const provider: CapabilityProvider = {type: 'type', qualifier: {'entity': '?'}, metadata: {id: 'id', appSymbolicName: 'app'}};
        store.add(provider);
        store.remove('app', {type: 'type', qualifier: {'entity': 'test'}});

        expect(store.findById('id')).toBe(provider);
        expect(store.findByType('type', {'entity': '?'}, {strategy: 'wildcardMatcher'})).toEqual([provider]);
        expect(store.findByApplication('app', {'entity': '?'})).toEqual([provider]);
      });

      it('should remove providers matching the `undefined` qualifier', () => {
        const undefinedQualifierProvider: CapabilityProvider = {type: 'type', metadata: {id: 'id_undefinedQualifierProvider', appSymbolicName: 'app'}};
        const nullQualifierProvider: CapabilityProvider = {type: 'type', qualifier: null, metadata: {id: 'id_nullQualifierProvider', appSymbolicName: 'app'}};
        const emptyQualifierProvider: CapabilityProvider = {type: 'type', qualifier: {}, metadata: {id: 'id_emptyQualifierProvider', appSymbolicName: 'app'}};
        const asteriskQualifierProvider: CapabilityProvider = {type: 'type', qualifier: {entity: '*'}, metadata: {id: 'id_asteriskQualifierProvider', appSymbolicName: 'app'}};
        const optionalQualifierProvider: CapabilityProvider = {type: 'type', qualifier: {entity: '?'}, metadata: {id: 'id_optionalQualifierProvider', appSymbolicName: 'app'}};
        const exactQualifierProvider: CapabilityProvider = {type: 'type', qualifier: {entity: 'test'}, metadata: {id: 'id_exactQualifierProvider', appSymbolicName: 'app'}};

        store.add(undefinedQualifierProvider);
        store.add(nullQualifierProvider);
        store.add(emptyQualifierProvider);
        store.add(asteriskQualifierProvider);
        store.add(optionalQualifierProvider);
        store.add(exactQualifierProvider);

        store.remove('app', {type: 'type', qualifier: undefined});

        expect(store.findById('id_undefinedQualifierProvider')).toBeUndefined();
        expect(store.findById('id_nullQualifierProvider')).toBeUndefined();
        expect(store.findById('id_emptyQualifierProvider')).toBeUndefined();
        expect(store.findById('id_asteriskQualifierProvider')).toBeUndefined();
        expect(store.findById('id_optionalQualifierProvider')).toBeUndefined();
        expect(store.findById('id_exactQualifierProvider')).toBeUndefined();
        expect(store.findByType('type', undefined, {strategy: 'wildcardMatcher'})).toEqual([]);
        expect(store.findByApplication('app', undefined)).toEqual([]);
        expect(store.findByType('type', {'*': '*'}, {strategy: 'wildcardMatcher'})).toEqual([]);
        expect(store.findByApplication('app', {'*': '*'})).toEqual([]);
      });

      it('should remove providers matching the `null` qualifier', () => {
        const undefinedQualifierProvider: CapabilityProvider = {type: 'type', metadata: {id: 'id_undefinedQualifierProvider', appSymbolicName: 'app'}};
        const nullQualifierProvider: CapabilityProvider = {type: 'type', qualifier: null, metadata: {id: 'id_nullQualifierProvider', appSymbolicName: 'app'}};
        const emptyQualifierProvider: CapabilityProvider = {type: 'type', qualifier: {}, metadata: {id: 'id_emptyQualifierProvider', appSymbolicName: 'app'}};
        const asteriskQualifierProvider: CapabilityProvider = {type: 'type', qualifier: {entity: '*'}, metadata: {id: 'id_asteriskQualifierProvider', appSymbolicName: 'app'}};
        const optionalQualifierProvider: CapabilityProvider = {type: 'type', qualifier: {entity: '?'}, metadata: {id: 'id_optionalQualifierProvider', appSymbolicName: 'app'}};
        const exactQualifierProvider: CapabilityProvider = {type: 'type', qualifier: {entity: 'test'}, metadata: {id: 'id_exactQualifierProvider', appSymbolicName: 'app'}};

        store.add(undefinedQualifierProvider);
        store.add(nullQualifierProvider);
        store.add(emptyQualifierProvider);
        store.add(asteriskQualifierProvider);
        store.add(optionalQualifierProvider);
        store.add(exactQualifierProvider);

        store.remove('app', {type: 'type', qualifier: null});

        expect(store.findById('id_undefinedQualifierProvider')).toBeUndefined();
        expect(store.findById('id_nullQualifierProvider')).toBeUndefined();
        expect(store.findById('id_emptyQualifierProvider')).toBeUndefined();
        expect(store.findById('id_asteriskQualifierProvider')).toBe(asteriskQualifierProvider);
        expect(store.findById('id_optionalQualifierProvider')).toBe(optionalQualifierProvider);
        expect(store.findById('id_exactQualifierProvider')).toBe(exactQualifierProvider);
        expect(store.findByType('type', null, {strategy: 'wildcardMatcher'})).toEqual([optionalQualifierProvider]);
        expect(store.findByApplication('app', null)).toEqual([optionalQualifierProvider]);
        expect(store.findByType('type', {'*': '*'}, {strategy: 'wildcardMatcher'})).toEqual([asteriskQualifierProvider, optionalQualifierProvider, exactQualifierProvider]);
        expect(store.findByApplication('app', {'*': '*'})).toEqual([asteriskQualifierProvider, optionalQualifierProvider, exactQualifierProvider]);
      });

      it('should remove providers matching the empty qualifier', () => {
        const undefinedQualifierProvider: CapabilityProvider = {type: 'type', metadata: {id: 'id_undefinedQualifierProvider', appSymbolicName: 'app'}};
        const nullQualifierProvider: CapabilityProvider = {type: 'type', qualifier: null, metadata: {id: 'id_nullQualifierProvider', appSymbolicName: 'app'}};
        const emptyQualifierProvider: CapabilityProvider = {type: 'type', qualifier: {}, metadata: {id: 'id_emptyQualifierProvider', appSymbolicName: 'app'}};
        const asteriskQualifierProvider: CapabilityProvider = {type: 'type', qualifier: {entity: '*'}, metadata: {id: 'id_asteriskQualifierProvider', appSymbolicName: 'app'}};
        const optionalQualifierProvider: CapabilityProvider = {type: 'type', qualifier: {entity: '?'}, metadata: {id: 'id_optionalQualifierProvider', appSymbolicName: 'app'}};
        const exactQualifierProvider: CapabilityProvider = {type: 'type', qualifier: {entity: 'test'}, metadata: {id: 'id_exactQualifierProvider', appSymbolicName: 'app'}};

        store.add(undefinedQualifierProvider);
        store.add(nullQualifierProvider);
        store.add(emptyQualifierProvider);
        store.add(asteriskQualifierProvider);
        store.add(optionalQualifierProvider);
        store.add(exactQualifierProvider);

        store.remove('app', {type: 'type', qualifier: {}});

        expect(store.findById('id_undefinedQualifierProvider')).toBeUndefined();
        expect(store.findById('id_nullQualifierProvider')).toBeUndefined();
        expect(store.findById('id_emptyQualifierProvider')).toBeUndefined();
        expect(store.findById('id_asteriskQualifierProvider')).toBe(asteriskQualifierProvider);
        expect(store.findById('id_optionalQualifierProvider')).toBe(optionalQualifierProvider);
        expect(store.findById('id_exactQualifierProvider')).toBe(exactQualifierProvider);
        expect(store.findByType('type', {}, {strategy: 'wildcardMatcher'})).toEqual([optionalQualifierProvider]);
        expect(store.findByApplication('app', {})).toEqual([optionalQualifierProvider]);
        expect(store.findByType('type', {'*': '*'}, {strategy: 'wildcardMatcher'})).toEqual([asteriskQualifierProvider, optionalQualifierProvider, exactQualifierProvider]);
        expect(store.findByApplication('app', {'*': '*'})).toEqual([asteriskQualifierProvider, optionalQualifierProvider, exactQualifierProvider]);
      });

      it('should remove providers which contain the asterisk value wildcard in their qualifier', () => {
        const undefinedQualifierProvider: CapabilityProvider = {type: 'type', metadata: {id: 'id_undefinedQualifierProvider', appSymbolicName: 'app'}};
        const nullQualifierProvider: CapabilityProvider = {type: 'type', qualifier: null, metadata: {id: 'id_nullQualifierProvider', appSymbolicName: 'app'}};
        const emptyQualifierProvider: CapabilityProvider = {type: 'type', qualifier: {}, metadata: {id: 'id_emptyQualifierProvider', appSymbolicName: 'app'}};
        const asteriskQualifierProvider: CapabilityProvider = {type: 'type', qualifier: {entity: '*'}, metadata: {id: 'id_asteriskQualifierProvider', appSymbolicName: 'app'}};
        const optionalQualifierProvider: CapabilityProvider = {type: 'type', qualifier: {entity: '?'}, metadata: {id: 'id_optionalQualifierProvider', appSymbolicName: 'app'}};
        const exactQualifierProvider: CapabilityProvider = {type: 'type', qualifier: {entity: 'test'}, metadata: {id: 'id_exactQualifierProvider', appSymbolicName: 'app'}};

        store.add(undefinedQualifierProvider);
        store.add(nullQualifierProvider);
        store.add(emptyQualifierProvider);
        store.add(asteriskQualifierProvider);
        store.add(optionalQualifierProvider);
        store.add(exactQualifierProvider);

        store.remove('app', {type: 'type', qualifier: {'entity': '*'}});

        expect(store.findById('id_undefinedQualifierProvider')).toBe(undefinedQualifierProvider);
        expect(store.findById('id_nullQualifierProvider')).toBe(nullQualifierProvider);
        expect(store.findById('id_emptyQualifierProvider')).toBe(emptyQualifierProvider);
        expect(store.findById('id_asteriskQualifierProvider')).toBeUndefined();
        expect(store.findById('id_optionalQualifierProvider')).toBe(optionalQualifierProvider);
        expect(store.findById('id_exactQualifierProvider')).toBe(exactQualifierProvider);
        expect(store.findByType('type', {'entity': '*'}, {strategy: 'wildcardMatcher'})).toEqual([optionalQualifierProvider, exactQualifierProvider]);
        expect(store.findByApplication('app', {'entity': '*'})).toEqual([optionalQualifierProvider, exactQualifierProvider]);
        expect(store.findByType('type', {'*': '*'}, {strategy: 'wildcardMatcher'})).toEqual([undefinedQualifierProvider, nullQualifierProvider, emptyQualifierProvider, optionalQualifierProvider, exactQualifierProvider]);
        expect(store.findByApplication('app', {'*': '*'})).toEqual([undefinedQualifierProvider, nullQualifierProvider, emptyQualifierProvider, optionalQualifierProvider, exactQualifierProvider]);
      });

      it('should remove providers which contain the optional value wildcard in their qualifier', () => {
        const undefinedQualifierProvider: CapabilityProvider = {type: 'type', metadata: {id: 'id_undefinedQualifierProvider', appSymbolicName: 'app'}};
        const nullQualifierProvider: CapabilityProvider = {type: 'type', qualifier: null, metadata: {id: 'id_nullQualifierProvider', appSymbolicName: 'app'}};
        const emptyQualifierProvider: CapabilityProvider = {type: 'type', qualifier: {}, metadata: {id: 'id_emptyQualifierProvider', appSymbolicName: 'app'}};
        const asteriskQualifierProvider: CapabilityProvider = {type: 'type', qualifier: {entity: '*'}, metadata: {id: 'id_asteriskQualifierProvider', appSymbolicName: 'app'}};
        const optionalQualifierProvider: CapabilityProvider = {type: 'type', qualifier: {entity: '?'}, metadata: {id: 'id_optionalQualifierProvider', appSymbolicName: 'app'}};
        const exactQualifierProvider: CapabilityProvider = {type: 'type', qualifier: {entity: 'test'}, metadata: {id: 'id_exactQualifierProvider', appSymbolicName: 'app'}};

        store.add(undefinedQualifierProvider);
        store.add(nullQualifierProvider);
        store.add(emptyQualifierProvider);
        store.add(asteriskQualifierProvider);
        store.add(optionalQualifierProvider);
        store.add(exactQualifierProvider);

        store.remove('app', {type: 'type', qualifier: {'entity': '?'}});

        expect(store.findById('id_undefinedQualifierProvider')).toBe(undefinedQualifierProvider);
        expect(store.findById('id_nullQualifierProvider')).toBe(nullQualifierProvider);
        expect(store.findById('id_emptyQualifierProvider')).toBe(emptyQualifierProvider);
        expect(store.findById('id_asteriskQualifierProvider')).toBe(asteriskQualifierProvider);
        expect(store.findById('id_optionalQualifierProvider')).toBeUndefined();
        expect(store.findById('id_exactQualifierProvider')).toBe(exactQualifierProvider);
        expect(store.findByType('type', {'entity': '?'}, {strategy: 'wildcardMatcher'})).toEqual([undefinedQualifierProvider, nullQualifierProvider, emptyQualifierProvider, asteriskQualifierProvider, exactQualifierProvider]);
        expect(store.findByApplication('app', {'entity': '?'})).toEqual([undefinedQualifierProvider, nullQualifierProvider, emptyQualifierProvider, asteriskQualifierProvider, exactQualifierProvider]);
        expect(store.findByType('type', {'*': '*'}, {strategy: 'wildcardMatcher'})).toEqual([undefinedQualifierProvider, nullQualifierProvider, emptyQualifierProvider, asteriskQualifierProvider, exactQualifierProvider]);
        expect(store.findByApplication('app', {'*': '*'})).toEqual([undefinedQualifierProvider, nullQualifierProvider, emptyQualifierProvider, asteriskQualifierProvider, exactQualifierProvider]);
      });

      it('should remove providers using an exact qualifier as deletion criterion', () => {
        const undefinedQualifierProvider: CapabilityProvider = {type: 'type', metadata: {id: 'id_undefinedQualifierProvider', appSymbolicName: 'app'}};
        const nullQualifierProvider: CapabilityProvider = {type: 'type', qualifier: null, metadata: {id: 'id_nullQualifierProvider', appSymbolicName: 'app'}};
        const emptyQualifierProvider: CapabilityProvider = {type: 'type', qualifier: {}, metadata: {id: 'id_emptyQualifierProvider', appSymbolicName: 'app'}};
        const asteriskQualifierProvider: CapabilityProvider = {type: 'type', qualifier: {entity: '*'}, metadata: {id: 'id_asteriskQualifierProvider', appSymbolicName: 'app'}};
        const optionalQualifierProvider: CapabilityProvider = {type: 'type', qualifier: {entity: '?'}, metadata: {id: 'id_optionalQualifierProvider', appSymbolicName: 'app'}};
        const exactQualifierProvider: CapabilityProvider = {type: 'type', qualifier: {entity: 'test'}, metadata: {id: 'id_exactQualifierProvider', appSymbolicName: 'app'}};

        store.add(undefinedQualifierProvider);
        store.add(nullQualifierProvider);
        store.add(emptyQualifierProvider);
        store.add(asteriskQualifierProvider);
        store.add(optionalQualifierProvider);
        store.add(exactQualifierProvider);

        store.remove('app', {type: 'type', qualifier: {'entity': 'test'}});

        expect(store.findById('id_undefinedQualifierProvider')).toBe(undefinedQualifierProvider);
        expect(store.findById('id_nullQualifierProvider')).toBe(nullQualifierProvider);
        expect(store.findById('id_emptyQualifierProvider')).toBe(emptyQualifierProvider);
        expect(store.findById('id_asteriskQualifierProvider')).toBe(asteriskQualifierProvider);
        expect(store.findById('id_optionalQualifierProvider')).toBe(optionalQualifierProvider);
        expect(store.findById('id_exactQualifierProvider')).toBeUndefined();
        expect(store.findByType('type', {'entity': 'test'}, {strategy: 'wildcardMatcher'})).toEqual([asteriskQualifierProvider, optionalQualifierProvider]);
        expect(store.findByType('type', {'entity': 'test'}, {strategy: 'wildcardMatcher'})).toEqual([asteriskQualifierProvider, optionalQualifierProvider]);
        expect(store.findByType('type', {'*': '*'}, {strategy: 'wildcardMatcher'})).toEqual([undefinedQualifierProvider, nullQualifierProvider, emptyQualifierProvider, asteriskQualifierProvider, optionalQualifierProvider]);
        expect(store.findByApplication('app', {'*': '*'})).toEqual([undefinedQualifierProvider, nullQualifierProvider, emptyQualifierProvider, asteriskQualifierProvider, optionalQualifierProvider]);
      });
    });
  });
});
