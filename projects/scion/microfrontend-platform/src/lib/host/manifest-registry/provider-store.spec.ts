/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { ManifestObjectStore } from './manifest-object-store';
import { CapabilityProvider } from '../../platform.model';
import { matchesIntentQualifier, matchesWildcardQualifier } from '../../qualifier-tester';

describe('CapabilityProviderStore', () => {
  let store: ManifestObjectStore<CapabilityProvider>;

  beforeEach(() => {
    store = new ManifestObjectStore<CapabilityProvider>();
  });

  describe('add and find capability providers', () => {

    describe('find using no matching strategy', () => {

      it('should find providers by id', () => {
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

        expect(store.find({id: 'id_undefinedQualifierProvider'})).toEqual([undefinedQualifierProvider]);
        expect(store.find({id: 'id_nullQualifierProvider'})).toEqual([nullQualifierProvider]);
        expect(store.find({id: 'id_emptyQualifierProvider'})).toEqual([emptyQualifierProvider]);
        expect(store.find({id: 'id_asteriskQualifierProvider'})).toEqual([asteriskQualifierProvider]);
        expect(store.find({id: 'id_optionalQualifierProvider'})).toEqual([optionalQualifierProvider]);
        expect(store.find({id: 'id_exactQualifierProvider'})).toEqual([exactQualifierProvider]);
      });

      it('should find providers by type', () => {
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

        expect(store.find({type: 'type1'})).toEqual([undefinedQualifierProvider, nullQualifierProvider, emptyQualifierProvider]);
        expect(store.find({type: 'type2'})).toEqual([asteriskQualifierProvider, optionalQualifierProvider]);
        expect(store.find({type: 'type3'})).toEqual([exactQualifierProvider]);
      });

      it('should find providers by qualifier', () => {
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

        expect(store.find({qualifier: undefined})).toEqual([undefinedQualifierProvider, nullQualifierProvider, emptyQualifierProvider, asteriskQualifierProvider, optionalQualifierProvider, exactQualifierProvider]);
        expect(store.find({qualifier: null})).toEqual([undefinedQualifierProvider, nullQualifierProvider, emptyQualifierProvider, optionalQualifierProvider]);
        expect(store.find({qualifier: {}})).toEqual([undefinedQualifierProvider, nullQualifierProvider, emptyQualifierProvider, optionalQualifierProvider]);
        expect(store.find({qualifier: {'*': '*'}})).toEqual([undefinedQualifierProvider, nullQualifierProvider, emptyQualifierProvider, asteriskQualifierProvider, optionalQualifierProvider, exactQualifierProvider]);
        expect(store.find({qualifier: {'entity': '*'}})).toEqual([asteriskQualifierProvider, optionalQualifierProvider, exactQualifierProvider]);
        expect(store.find({qualifier: {'entity': '?'}})).toEqual([undefinedQualifierProvider, nullQualifierProvider, emptyQualifierProvider, asteriskQualifierProvider, optionalQualifierProvider, exactQualifierProvider]);
        expect(store.find({qualifier: {'entity': 'test'}})).toEqual([asteriskQualifierProvider, optionalQualifierProvider, exactQualifierProvider]);
      });

      it('should find providers by application', () => {
        const undefinedQualifierProvider: CapabilityProvider = {type: 'type1', metadata: {id: 'id_undefinedQualifierProvider', appSymbolicName: 'app1'}};
        const nullQualifierProvider: CapabilityProvider = {type: 'type1', qualifier: null, metadata: {id: 'id_nullQualifierProvider', appSymbolicName: 'app1'}};
        const emptyQualifierProvider: CapabilityProvider = {type: 'type1', qualifier: {}, metadata: {id: 'id_emptyQualifierProvider', appSymbolicName: 'app2'}};
        const asteriskQualifierProvider: CapabilityProvider = {type: 'type2', qualifier: {entity: '*'}, metadata: {id: 'id_asteriskQualifierProvider', appSymbolicName: 'app2'}};
        const optionalQualifierProvider: CapabilityProvider = {type: 'type2', qualifier: {entity: '?'}, metadata: {id: 'id_optionalQualifierProvider', appSymbolicName: 'app3'}};
        const exactQualifierProvider: CapabilityProvider = {type: 'type3', qualifier: {entity: 'test'}, metadata: {id: 'id_exactQualifierProvider', appSymbolicName: 'app3'}};

        store.add(undefinedQualifierProvider);
        store.add(nullQualifierProvider);
        store.add(emptyQualifierProvider);
        store.add(asteriskQualifierProvider);
        store.add(optionalQualifierProvider);
        store.add(exactQualifierProvider);

        expect(store.find({appSymbolicName: 'app1'})).toEqual([undefinedQualifierProvider, nullQualifierProvider]);
        expect(store.find({appSymbolicName: 'app2'})).toEqual([emptyQualifierProvider, asteriskQualifierProvider]);
        expect(store.find({appSymbolicName: 'app3'})).toEqual([optionalQualifierProvider, exactQualifierProvider]);
      });
    });

    describe('find using \'wildcardMatcher\' strategy', () => {
      it('should not find providers if the store is empty', () => {
        expect(store.find({id: 'id'})).toEqual([]);
        expect(store.find({type: 'type', qualifier: undefined}, matchesWildcardQualifier)).toEqual([]);
        expect(store.find({type: 'type', qualifier: null}, matchesWildcardQualifier)).toEqual([]);
        expect(store.find({type: 'type', qualifier: {}}, matchesWildcardQualifier)).toEqual([]);
        expect(store.find({type: 'type', qualifier: {entity: '?'}}, matchesWildcardQualifier)).toEqual([]);
        expect(store.find({type: 'type', qualifier: {'*': '*'}}, matchesWildcardQualifier)).toEqual([]);
        expect(store.find({appSymbolicName: 'app', qualifier: undefined}, matchesWildcardQualifier)).toEqual([]);
        expect(store.find({appSymbolicName: 'app', qualifier: null}, matchesWildcardQualifier)).toEqual([]);
        expect(store.find({appSymbolicName: 'app', qualifier: {}}, matchesWildcardQualifier)).toEqual([]);
        expect(store.find({appSymbolicName: 'app', qualifier: {'*': '*'}}, matchesWildcardQualifier)).toEqual([]);
      });

      it('should find providers by id, type and app', () => {
        const provider: CapabilityProvider = {type: 'type', metadata: {id: 'id', appSymbolicName: 'app'}};
        store.add(provider);

        expect(store.find({id: 'id'})).toEqual([provider]);
        expect(store.find({type: 'type', qualifier: undefined}, matchesWildcardQualifier)).toEqual([provider]);
        expect(store.find({type: 'type', qualifier: null}, matchesWildcardQualifier)).toEqual([provider]);
        expect(store.find({type: 'type', qualifier: {}}, matchesWildcardQualifier)).toEqual([provider]);
        expect(store.find({type: 'type', qualifier: {entity: '?'}}, matchesWildcardQualifier)).toEqual([provider]);
        expect(store.find({type: 'type', qualifier: {'*': '*'}}, matchesWildcardQualifier)).toEqual([provider]);
        expect(store.find({appSymbolicName: 'app', qualifier: undefined}, matchesWildcardQualifier)).toEqual([provider]);
        expect(store.find({appSymbolicName: 'app', qualifier: null}, matchesWildcardQualifier)).toEqual([provider]);
        expect(store.find({appSymbolicName: 'app', qualifier: {}}, matchesWildcardQualifier)).toEqual([provider]);
        expect(store.find({appSymbolicName: 'app', qualifier: {'*': '*'}}, matchesWildcardQualifier)).toEqual([provider]);
      });

      it('should find providers of the same type', () => {
        const provider1: CapabilityProvider = {type: 'type', metadata: {id: 'id1', appSymbolicName: 'app1'}};
        const provider2: CapabilityProvider = {type: 'type', metadata: {id: 'id2', appSymbolicName: 'app2'}};
        store.add(provider1);
        store.add(provider2);

        expect(store.find({id: 'id1'})).toEqual([provider1]);
        expect(store.find({id: 'id2'})).toEqual([provider2]);
        expect(store.find({type: 'type', qualifier: undefined}, matchesWildcardQualifier)).toEqual([provider1, provider2]);
        expect(store.find({type: 'type', qualifier: null}, matchesWildcardQualifier)).toEqual([provider1, provider2]);
        expect(store.find({type: 'type', qualifier: {}}, matchesWildcardQualifier)).toEqual([provider1, provider2]);
        expect(store.find({type: 'type', qualifier: {entity: '?'}}, matchesWildcardQualifier)).toEqual([provider1, provider2]);
        expect(store.find({type: 'type', qualifier: {'*': '*'}}, matchesWildcardQualifier)).toEqual([provider1, provider2]);
        expect(store.find({appSymbolicName: 'app1', qualifier: undefined}, matchesWildcardQualifier)).toEqual([provider1]);
        expect(store.find({appSymbolicName: 'app1', qualifier: null}, matchesWildcardQualifier)).toEqual([provider1]);
        expect(store.find({appSymbolicName: 'app1', qualifier: {}}, matchesWildcardQualifier)).toEqual([provider1]);
        expect(store.find({appSymbolicName: 'app1', qualifier: {entity: '?'}}, matchesWildcardQualifier)).toEqual([provider1]);
        expect(store.find({appSymbolicName: 'app1', qualifier: {'*': '*'}}, matchesWildcardQualifier)).toEqual([provider1]);
        expect(store.find({appSymbolicName: 'app2', qualifier: undefined}, matchesWildcardQualifier)).toEqual([provider2]);
        expect(store.find({appSymbolicName: 'app2', qualifier: null}, matchesWildcardQualifier)).toEqual([provider2]);
        expect(store.find({appSymbolicName: 'app2', qualifier: {}}, matchesWildcardQualifier)).toEqual([provider2]);
        expect(store.find({appSymbolicName: 'app2', qualifier: {entity: '?'}}, matchesWildcardQualifier)).toEqual([provider2]);
        expect(store.find({appSymbolicName: 'app2', qualifier: {'*': '*'}}, matchesWildcardQualifier)).toEqual([provider2]);
      });

      it('should find providers of the same app', () => {
        const provider1: CapabilityProvider = {type: 'type1', metadata: {id: 'id1', appSymbolicName: 'app'}};
        const provider2: CapabilityProvider = {type: 'type2', metadata: {id: 'id2', appSymbolicName: 'app'}};
        store.add(provider1);
        store.add(provider2);

        expect(store.find({id: 'id1'})).toEqual([provider1]);
        expect(store.find({id: 'id2'})).toEqual([provider2]);
        expect(store.find({type: 'type1', qualifier: undefined}, matchesWildcardQualifier)).toEqual([provider1]);
        expect(store.find({type: 'type1', qualifier: null}, matchesWildcardQualifier)).toEqual([provider1]);
        expect(store.find({type: 'type1', qualifier: {}}, matchesWildcardQualifier)).toEqual([provider1]);
        expect(store.find({type: 'type1', qualifier: {entity: '?'}}, matchesWildcardQualifier)).toEqual([provider1]);
        expect(store.find({type: 'type1', qualifier: {'*': '*'}}, matchesWildcardQualifier)).toEqual([provider1]);
        expect(store.find({type: 'type2', qualifier: undefined}, matchesWildcardQualifier)).toEqual([provider2]);
        expect(store.find({type: 'type2', qualifier: null}, matchesWildcardQualifier)).toEqual([provider2]);
        expect(store.find({type: 'type2', qualifier: {}}, matchesWildcardQualifier)).toEqual([provider2]);
        expect(store.find({type: 'type2', qualifier: {entity: '?'}}, matchesWildcardQualifier)).toEqual([provider2]);
        expect(store.find({type: 'type2', qualifier: {'*': '*'}}, matchesWildcardQualifier)).toEqual([provider2]);
        expect(store.find({appSymbolicName: 'app', qualifier: undefined}, matchesWildcardQualifier)).toEqual([provider1, provider2]);
        expect(store.find({appSymbolicName: 'app', qualifier: null}, matchesWildcardQualifier)).toEqual([provider1, provider2]);
        expect(store.find({appSymbolicName: 'app', qualifier: {}}, matchesWildcardQualifier)).toEqual([provider1, provider2]);
        expect(store.find({appSymbolicName: 'app', qualifier: {entity: '?'}}, matchesWildcardQualifier)).toEqual([provider1, provider2]);
        expect(store.find({appSymbolicName: 'app', qualifier: {'*': '*'}}, matchesWildcardQualifier)).toEqual([provider1, provider2]);
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

        expect(store.find({appSymbolicName: 'app', qualifier: undefined}, matchesWildcardQualifier)).toEqual([undefinedQualifierProvider, nullQualifierProvider, emptyQualifierProvider, asteriskQualifierProvider, optionalQualifierProvider, exactQualifierProvider]);
        expect(store.find({appSymbolicName: 'app', qualifier: null}, matchesWildcardQualifier)).toEqual([undefinedQualifierProvider, nullQualifierProvider, emptyQualifierProvider, optionalQualifierProvider]);
        expect(store.find({appSymbolicName: 'app', qualifier: {}}, matchesWildcardQualifier)).toEqual([undefinedQualifierProvider, nullQualifierProvider, emptyQualifierProvider, optionalQualifierProvider]);
        expect(store.find({appSymbolicName: 'app', qualifier: {'*': '*'}}, matchesWildcardQualifier)).toEqual([undefinedQualifierProvider, nullQualifierProvider, emptyQualifierProvider, asteriskQualifierProvider, optionalQualifierProvider, exactQualifierProvider]);
        expect(store.find({appSymbolicName: 'app', qualifier: {'entity': '*'}}, matchesWildcardQualifier)).toEqual([asteriskQualifierProvider, optionalQualifierProvider, exactQualifierProvider]);
        expect(store.find({appSymbolicName: 'app', qualifier: {'entity': '?'}}, matchesWildcardQualifier)).toEqual([undefinedQualifierProvider, nullQualifierProvider, emptyQualifierProvider, asteriskQualifierProvider, optionalQualifierProvider, exactQualifierProvider]);
        expect(store.find({appSymbolicName: 'app', qualifier: {'entity': 'test'}}, matchesWildcardQualifier)).toEqual([asteriskQualifierProvider, optionalQualifierProvider, exactQualifierProvider]);
      });
    });

    describe('find using \'intentMatcher\' strategy', () => {
      it('should not find providers if the store is empty', () => {
        expect(store.find({type: 'type', qualifier: undefined}, matchesIntentQualifier)).toEqual([]);
        expect(store.find({type: 'type', qualifier: null}, matchesIntentQualifier)).toEqual([]);
        expect(store.find({type: 'type', qualifier: {}}, matchesIntentQualifier)).toEqual([]);
        expect(store.find({type: 'type', qualifier: {entity: '?'}}, matchesIntentQualifier)).toEqual([]);
        expect(store.find({type: 'type', qualifier: {'*': '*'}}, matchesIntentQualifier)).toEqual([]);
      });

      it('should find provider by type', () => {
        const provider: CapabilityProvider = {type: 'type', metadata: {id: 'id', appSymbolicName: 'app'}};
        store.add(provider);

        expect(store.find({type: 'type', qualifier: undefined}, matchesIntentQualifier)).toEqual([provider]);
        expect(store.find({type: 'type', qualifier: null}, matchesIntentQualifier)).toEqual([provider]);
        expect(store.find({type: 'type', qualifier: {}}, matchesIntentQualifier)).toEqual([provider]);
        expect(store.find({type: 'type', qualifier: {entity: '?'}}, matchesIntentQualifier)).toEqual([]);
        expect(store.find({type: 'type', qualifier: {'*': '*'}}, matchesIntentQualifier)).toEqual([]);
      });

      it('should find providers of the same type', () => {
        const provider1: CapabilityProvider = {type: 'type', metadata: {id: 'id1', appSymbolicName: 'app1'}};
        const provider2: CapabilityProvider = {type: 'type', metadata: {id: 'id2', appSymbolicName: 'app2'}};
        store.add(provider1);
        store.add(provider2);

        expect(store.find({type: 'type', qualifier: undefined}, matchesIntentQualifier)).toEqual([provider1, provider2]);
        expect(store.find({type: 'type', qualifier: null}, matchesIntentQualifier)).toEqual([provider1, provider2]);
        expect(store.find({type: 'type', qualifier: {}}, matchesIntentQualifier)).toEqual([provider1, provider2]);
        expect(store.find({type: 'type', qualifier: {entity: '?'}}, matchesIntentQualifier)).toEqual([]);
        expect(store.find({type: 'type', qualifier: {'*': '*'}}, matchesIntentQualifier)).toEqual([]);
      });

      it('should find providers of the same app', () => {
        const provider1: CapabilityProvider = {type: 'type1', metadata: {id: 'id1', appSymbolicName: 'app'}};
        const provider2: CapabilityProvider = {type: 'type2', metadata: {id: 'id2', appSymbolicName: 'app'}};
        store.add(provider1);
        store.add(provider2);

        expect(store.find({type: 'type1', qualifier: undefined}, matchesIntentQualifier)).toEqual([provider1]);
        expect(store.find({type: 'type1', qualifier: null}, matchesIntentQualifier)).toEqual([provider1]);
        expect(store.find({type: 'type1', qualifier: {}}, matchesIntentQualifier)).toEqual([provider1]);
        expect(store.find({type: 'type1', qualifier: {entity: '?'}}, matchesIntentQualifier)).toEqual([]);
        expect(store.find({type: 'type1', qualifier: {'*': '*'}}, matchesIntentQualifier)).toEqual([]);
        expect(store.find({type: 'type2', qualifier: undefined}, matchesIntentQualifier)).toEqual([provider2]);
        expect(store.find({type: 'type2', qualifier: null}, matchesIntentQualifier)).toEqual([provider2]);
        expect(store.find({type: 'type2', qualifier: {}}, matchesIntentQualifier)).toEqual([provider2]);
        expect(store.find({type: 'type2', qualifier: {entity: '?'}}, matchesIntentQualifier)).toEqual([]);
        expect(store.find({type: 'type2', qualifier: {'*': '*'}}, matchesIntentQualifier)).toEqual([]);
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

        expect(store.find({type: 'type', qualifier: undefined}, matchesIntentQualifier)).toEqual([undefinedQualifierProvider, nullQualifierProvider, emptyQualifierProvider, asteriskQualifierProvider, optionalQualifierProvider, exactQualifierProvider]);
        expect(store.find({type: 'type', qualifier: null}, matchesIntentQualifier)).toEqual([undefinedQualifierProvider, nullQualifierProvider, emptyQualifierProvider, optionalQualifierProvider]);
        expect(store.find({type: 'type', qualifier: {}}, matchesIntentQualifier)).toEqual([undefinedQualifierProvider, nullQualifierProvider, emptyQualifierProvider, optionalQualifierProvider]);
        expect(store.find({type: 'type', qualifier: {'*': '*'}}, matchesIntentQualifier)).toEqual([]);
        expect(store.find({type: 'type', qualifier: {'entity': '*'}}, matchesIntentQualifier)).toEqual([asteriskQualifierProvider, optionalQualifierProvider]);
        expect(store.find({type: 'type', qualifier: {'entity': '?'}}, matchesIntentQualifier)).toEqual([asteriskQualifierProvider, optionalQualifierProvider]);
        expect(store.find({type: 'type', qualifier: {'entity': 'test'}}, matchesIntentQualifier)).toEqual([asteriskQualifierProvider, optionalQualifierProvider, exactQualifierProvider]);
      });
    });
  });

  describe('remove providers', () => {
    describe('empty store', () => {
      it('should do nothing if no provider with the given id exists', () => {
        store.remove({id: 'non_existant_id', appSymbolicName: 'app'});

        expect(store.find({id: 'non_existant_id'})).toEqual([]);
      });

      it('should do nothing if no provider of given type and qualifier exists (empty qualifier)', () => {
        store.remove({type: 'type', qualifier: undefined, appSymbolicName: 'app'});
        store.remove({type: 'type', qualifier: null, appSymbolicName: 'app'});
        store.remove({type: 'type', qualifier: {}, appSymbolicName: 'app'});

        expect(store.find({type: 'type', qualifier: {}}, matchesWildcardQualifier)).toEqual([]);
      });

      it('should do nothing if no provider of given type and qualifier exists (absolute wildcard qualifier)', () => {
        store.remove({type: 'type', qualifier: {'*': '*'}, appSymbolicName: 'app'});

        expect(store.find({type: 'type', qualifier: {'*': '*'}}, matchesWildcardQualifier)).toEqual([]);
      });

      it('should do nothing if no provider of given type and qualifier exists (exact qualifier)', () => {
        store.remove({type: 'type', qualifier: {entity: 'test'}, appSymbolicName: 'app'});

        expect(store.find({type: 'type', qualifier: {entity: 'test'}}, matchesWildcardQualifier)).toEqual([]);
      });
    });

    describe('remove by id', () => {
      it('should remove a provider by id', () => {
        const provider: CapabilityProvider = {type: 'type', metadata: {id: 'id', appSymbolicName: 'app'}};
        store.add(provider);
        store.remove({id: 'id', appSymbolicName: 'app'});

        expect(store.find({id: 'id'})).toEqual([]);
        expect(store.find({type: 'type', qualifier: {}}, matchesWildcardQualifier)).toEqual([]);
        expect(store.find({appSymbolicName: 'app', qualifier: {}})).toEqual([]);
      });

      it('should not remove any provider if no provider with the given id exists', () => {
        const provider: CapabilityProvider = {type: 'type', metadata: {id: 'id', appSymbolicName: 'app'}};
        store.add(provider);
        store.remove({id: 'non-existent', appSymbolicName: 'app'});

        expect(store.find({id: 'id'})).toEqual([provider]);
        expect(store.find({type: 'type', qualifier: {}}, matchesWildcardQualifier)).toEqual([provider]);
        expect(store.find({appSymbolicName: 'app', qualifier: {}})).toEqual([provider]);
      });
    });

    describe('check provider isolation', () => {
      it('should remove providers of the type \'type1\'', () => {
        const type1QualifierProvider: CapabilityProvider = {type: 'type1', qualifier: {'*': '*'}, metadata: {id: 'id1', appSymbolicName: 'app'}};
        const type2QualifierProvider: CapabilityProvider = {type: 'type2', qualifier: {'*': '*'}, metadata: {id: 'id2', appSymbolicName: 'app'}};
        store.add(type1QualifierProvider);
        store.add(type2QualifierProvider);

        store.remove({type: 'type1', qualifier: {'*': '*'}, appSymbolicName: 'app'});

        expect(store.find({id: 'id1'})).toEqual([]);
        expect(store.find({id: 'id2'})).toEqual([type2QualifierProvider]);
        expect(store.find({type: 'type1', qualifier: {'*': '*'}}, matchesWildcardQualifier)).toEqual([]);
        expect(store.find({type: 'type2', qualifier: {'*': '*'}}, matchesWildcardQualifier)).toEqual([type2QualifierProvider]);
        expect(store.find({appSymbolicName: 'app', qualifier: {'*': '*'}})).toEqual([type2QualifierProvider]);
      });

      it('should remove providers of the app \'app1\'', () => {
        const app1QualifierProvider: CapabilityProvider = {type: 'type', qualifier: {'*': '*'}, metadata: {id: 'id1', appSymbolicName: 'app1'}};
        const app2QualifierProvider: CapabilityProvider = {type: 'type', qualifier: {'*': '*'}, metadata: {id: 'id2', appSymbolicName: 'app2'}};
        store.add(app1QualifierProvider);
        store.add(app2QualifierProvider);

        store.remove({type: 'type', qualifier: {'*': '*'}, appSymbolicName: 'app1'});

        expect(store.find({id: 'id1'})).toEqual([]);
        expect(store.find({id: 'id2'})).toEqual([app2QualifierProvider]);
        expect(store.find({type: 'type', qualifier: {'*': '*'}}, matchesWildcardQualifier)).toEqual([app2QualifierProvider]);
        expect(store.find({appSymbolicName: 'app1', qualifier: {'*': '*'}})).toEqual([]);
        expect(store.find({appSymbolicName: 'app2', qualifier: {'*': '*'}})).toEqual([app2QualifierProvider]);
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
        store.remove({type: 'type', qualifier: undefined, appSymbolicName: 'app'});

        expect(store.find({id: 'id1'})).toEqual([]);
        expect(store.find({id: 'id2'})).toEqual([]);
        expect(store.find({id: 'id3'})).toEqual([]);
        expect(store.find({id: 'id4'})).toEqual([]);
        expect(store.find({type: 'type', qualifier: {'*': '*'}}, matchesWildcardQualifier)).toEqual([]);
        expect(store.find({appSymbolicName: 'app', qualifier: {'*': '*'}})).toEqual([]);
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
        store.remove({type: 'type', qualifier: null, appSymbolicName: 'app'});

        expect(store.find({id: 'id1'})).toEqual([]);
        expect(store.find({id: 'id2'})).toEqual([]);
        expect(store.find({id: 'id3'})).toEqual([]);
        expect(store.find({id: 'id4'})).toEqual([]);
        expect(store.find({type: 'type', qualifier: {'*': '*'}}, matchesWildcardQualifier)).toEqual([]);
        expect(store.find({appSymbolicName: 'app', qualifier: {'*': '*'}})).toEqual([]);
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
        store.remove({type: 'type', qualifier: {}, appSymbolicName: 'app'});

        expect(store.find({id: 'id1'})).toEqual([]);
        expect(store.find({id: 'id2'})).toEqual([]);
        expect(store.find({id: 'id3'})).toEqual([]);
        expect(store.find({id: 'id4'})).toEqual([]);
        expect(store.find({type: 'type', qualifier: {'*': '*'}}, matchesWildcardQualifier)).toEqual([]);
        expect(store.find({appSymbolicName: 'app', qualifier: {'*': '*'}})).toEqual([]);
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
        store.remove({type: 'type', qualifier: {entity: '?'}, appSymbolicName: 'app'});

        expect(store.find({id: 'id1'})).toEqual([provider1]);
        expect(store.find({id: 'id2'})).toEqual([provider2]);
        expect(store.find({id: 'id3'})).toEqual([provider3]);
        expect(store.find({id: 'id4'})).toEqual([provider4]);
        expect(store.find({type: 'type', qualifier: {'*': '*'}}, matchesWildcardQualifier)).toEqual([provider1, provider2, provider3, provider4]);
        expect(store.find({appSymbolicName: 'app', qualifier: {'*': '*'}})).toEqual([provider1, provider2, provider3, provider4]);
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
        store.remove({type: 'type', qualifier: {'*': '*'}, appSymbolicName: 'app'});

        expect(store.find({id: 'id1'})).toEqual([provider1]);
        expect(store.find({id: 'id2'})).toEqual([provider2]);
        expect(store.find({id: 'id3'})).toEqual([provider3]);
        expect(store.find({id: 'id4'})).toEqual([provider4]);
        expect(store.find({type: 'type', qualifier: {'*': '*'}}, matchesWildcardQualifier)).toEqual([provider1, provider2, provider3, provider4]);
        expect(store.find({appSymbolicName: 'app', qualifier: {'*': '*'}})).toEqual([provider1, provider2, provider3, provider4]);
      });

      it('should remove providers using an exact qualifier as deletion criterion', () => {
        const provider: CapabilityProvider = {type: 'type', qualifier: {'entity': 'test'}, metadata: {id: 'id', appSymbolicName: 'app'}};
        store.add(provider);
        store.remove({type: 'type', qualifier: {'entity': 'test'}, appSymbolicName: 'app'});

        expect(store.find({id: 'id'})).toEqual([]);
        expect(store.find({type: 'type', qualifier: {'entity': 'test'}}, matchesWildcardQualifier)).toEqual([]);
        expect(store.find({appSymbolicName: 'app', qualifier: {'entity': 'test'}})).toEqual([]);
      });

      it('should remove providers which contain the asterisk value wildcard in their qualifier', () => {
        const provider: CapabilityProvider = {type: 'type', qualifier: {'entity': '*'}, metadata: {id: 'id', appSymbolicName: 'app'}};
        store.add(provider);
        store.remove({type: 'type', qualifier: {'entity': 'test'}, appSymbolicName: 'app'});

        expect(store.find({id: 'id'})).toEqual([provider]);
        expect(store.find({type: 'type', qualifier: {'entity': '*'}}, matchesWildcardQualifier)).toEqual([provider]);
        expect(store.find({appSymbolicName: 'app', qualifier: {'entity': '*'}})).toEqual([provider]);
      });

      it('should remove providers which contain the optional value wildcard in their qualifier', () => {
        const provider: CapabilityProvider = {type: 'type', qualifier: {'entity': '?'}, metadata: {id: 'id', appSymbolicName: 'app'}};
        store.add(provider);
        store.remove({type: 'type', qualifier: {'entity': 'test'}, appSymbolicName: 'app'});

        expect(store.find({id: 'id'})).toEqual([provider]);
        expect(store.find({type: 'type', qualifier: {'entity': '?'}}, matchesWildcardQualifier)).toEqual([provider]);
        expect(store.find({appSymbolicName: 'app', qualifier: {'entity': '?'}})).toEqual([provider]);
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

        store.remove({type: 'type', qualifier: undefined, appSymbolicName: 'app'});

        expect(store.find({id: 'id_undefinedQualifierProvider'})).toEqual([]);
        expect(store.find({id: 'id_nullQualifierProvider'})).toEqual([]);
        expect(store.find({id: 'id_emptyQualifierProvider'})).toEqual([]);
        expect(store.find({id: 'id_asteriskQualifierProvider'})).toEqual([]);
        expect(store.find({id: 'id_optionalQualifierProvider'})).toEqual([]);
        expect(store.find({id: 'id_exactQualifierProvider'})).toEqual([]);
        expect(store.find({type: 'type', qualifier: undefined}, matchesWildcardQualifier)).toEqual([]);
        expect(store.find({appSymbolicName: 'app', qualifier: undefined})).toEqual([]);
        expect(store.find({type: 'type', qualifier: {'*': '*'}}, matchesWildcardQualifier)).toEqual([]);
        expect(store.find({appSymbolicName: 'app', qualifier: {'*': '*'}})).toEqual([]);
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

        store.remove({type: 'type', qualifier: null, appSymbolicName: 'app'});

        expect(store.find({id: 'id_undefinedQualifierProvider'})).toEqual([]);
        expect(store.find({id: 'id_nullQualifierProvider'})).toEqual([]);
        expect(store.find({id: 'id_emptyQualifierProvider'})).toEqual([]);
        expect(store.find({id: 'id_asteriskQualifierProvider'})).toEqual([asteriskQualifierProvider]);
        expect(store.find({id: 'id_optionalQualifierProvider'})).toEqual([optionalQualifierProvider]);
        expect(store.find({id: 'id_exactQualifierProvider'})).toEqual([exactQualifierProvider]);
        expect(store.find({type: 'type', qualifier: null}, matchesWildcardQualifier)).toEqual([optionalQualifierProvider]);
        expect(store.find({appSymbolicName: 'app', qualifier: null})).toEqual([optionalQualifierProvider]);
        expect(store.find({type: 'type', qualifier: {'*': '*'}}, matchesWildcardQualifier)).toEqual([asteriskQualifierProvider, optionalQualifierProvider, exactQualifierProvider]);
        expect(store.find({appSymbolicName: 'app', qualifier: {'*': '*'}})).toEqual([asteriskQualifierProvider, optionalQualifierProvider, exactQualifierProvider]);
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

        store.remove({type: 'type', qualifier: {}, appSymbolicName: 'app'});

        expect(store.find({id: 'id_undefinedQualifierProvider'})).toEqual([]);
        expect(store.find({id: 'id_nullQualifierProvider'})).toEqual([]);
        expect(store.find({id: 'id_emptyQualifierProvider'})).toEqual([]);
        expect(store.find({id: 'id_asteriskQualifierProvider'})).toEqual([asteriskQualifierProvider]);
        expect(store.find({id: 'id_optionalQualifierProvider'})).toEqual([optionalQualifierProvider]);
        expect(store.find({id: 'id_exactQualifierProvider'})).toEqual([exactQualifierProvider]);
        expect(store.find({type: 'type', qualifier: {}}, matchesWildcardQualifier)).toEqual([optionalQualifierProvider]);
        expect(store.find({appSymbolicName: 'app', qualifier: {}})).toEqual([optionalQualifierProvider]);
        expect(store.find({type: 'type', qualifier: {'*': '*'}}, matchesWildcardQualifier)).toEqual([asteriskQualifierProvider, optionalQualifierProvider, exactQualifierProvider]);
        expect(store.find({appSymbolicName: 'app', qualifier: {'*': '*'}})).toEqual([asteriskQualifierProvider, optionalQualifierProvider, exactQualifierProvider]);
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

        store.remove({type: 'type', qualifier: {'entity': '*'}, appSymbolicName: 'app'});

        expect(store.find({id: 'id_undefinedQualifierProvider'})).toEqual([undefinedQualifierProvider]);
        expect(store.find({id: 'id_nullQualifierProvider'})).toEqual([nullQualifierProvider]);
        expect(store.find({id: 'id_emptyQualifierProvider'})).toEqual([emptyQualifierProvider]);
        expect(store.find({id: 'id_asteriskQualifierProvider'})).toEqual([]);
        expect(store.find({id: 'id_optionalQualifierProvider'})).toEqual([optionalQualifierProvider]);
        expect(store.find({id: 'id_exactQualifierProvider'})).toEqual([exactQualifierProvider]);
        expect(store.find({type: 'type', qualifier: {'entity': '*'}}, matchesWildcardQualifier)).toEqual([optionalQualifierProvider, exactQualifierProvider]);
        expect(store.find({appSymbolicName: 'app', qualifier: {'entity': '*'}})).toEqual([optionalQualifierProvider, exactQualifierProvider]);
        expect(store.find({type: 'type', qualifier: {'*': '*'}}, matchesWildcardQualifier)).toEqual([undefinedQualifierProvider, nullQualifierProvider, emptyQualifierProvider, optionalQualifierProvider, exactQualifierProvider]);
        expect(store.find({appSymbolicName: 'app', qualifier: {'*': '*'}})).toEqual([undefinedQualifierProvider, nullQualifierProvider, emptyQualifierProvider, optionalQualifierProvider, exactQualifierProvider]);
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

        store.remove({type: 'type', qualifier: {'entity': '?'}, appSymbolicName: 'app'});

        expect(store.find({id: 'id_undefinedQualifierProvider'})).toEqual([undefinedQualifierProvider]);
        expect(store.find({id: 'id_nullQualifierProvider'})).toEqual([nullQualifierProvider]);
        expect(store.find({id: 'id_emptyQualifierProvider'})).toEqual([emptyQualifierProvider]);
        expect(store.find({id: 'id_asteriskQualifierProvider'})).toEqual([asteriskQualifierProvider]);
        expect(store.find({id: 'id_optionalQualifierProvider'})).toEqual([]);
        expect(store.find({id: 'id_exactQualifierProvider'})).toEqual([exactQualifierProvider]);
        expect(store.find({type: 'type', qualifier: {'entity': '?'}}, matchesWildcardQualifier)).toEqual([undefinedQualifierProvider, nullQualifierProvider, emptyQualifierProvider, asteriskQualifierProvider, exactQualifierProvider]);
        expect(store.find({appSymbolicName: 'app', qualifier: {'entity': '?'}})).toEqual([undefinedQualifierProvider, nullQualifierProvider, emptyQualifierProvider, asteriskQualifierProvider, exactQualifierProvider]);
        expect(store.find({type: 'type', qualifier: {'*': '*'}}, matchesWildcardQualifier)).toEqual([undefinedQualifierProvider, nullQualifierProvider, emptyQualifierProvider, asteriskQualifierProvider, exactQualifierProvider]);
        expect(store.find({appSymbolicName: 'app', qualifier: {'*': '*'}})).toEqual([undefinedQualifierProvider, nullQualifierProvider, emptyQualifierProvider, asteriskQualifierProvider, exactQualifierProvider]);
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

        store.remove({type: 'type', qualifier: {'entity': 'test'}, appSymbolicName: 'app'});

        expect(store.find({id: 'id_undefinedQualifierProvider'})).toEqual([undefinedQualifierProvider]);
        expect(store.find({id: 'id_nullQualifierProvider'})).toEqual([nullQualifierProvider]);
        expect(store.find({id: 'id_emptyQualifierProvider'})).toEqual([emptyQualifierProvider]);
        expect(store.find({id: 'id_asteriskQualifierProvider'})).toEqual([asteriskQualifierProvider]);
        expect(store.find({id: 'id_optionalQualifierProvider'})).toEqual([optionalQualifierProvider]);
        expect(store.find({id: 'id_exactQualifierProvider'})).toEqual([]);
        expect(store.find({type: 'type', qualifier: {'entity': 'test'}}, matchesWildcardQualifier)).toEqual([asteriskQualifierProvider, optionalQualifierProvider]);
        expect(store.find({type: 'type', qualifier: {'entity': 'test'}}, matchesWildcardQualifier)).toEqual([asteriskQualifierProvider, optionalQualifierProvider]);
        expect(store.find({type: 'type', qualifier: {'*': '*'}}, matchesWildcardQualifier)).toEqual([undefinedQualifierProvider, nullQualifierProvider, emptyQualifierProvider, asteriskQualifierProvider, optionalQualifierProvider]);
        expect(store.find({appSymbolicName: 'app', qualifier: {'*': '*'}})).toEqual([undefinedQualifierProvider, nullQualifierProvider, emptyQualifierProvider, asteriskQualifierProvider, optionalQualifierProvider]);
      });
    });
  });
});
