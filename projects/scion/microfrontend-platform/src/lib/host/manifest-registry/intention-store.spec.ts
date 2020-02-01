/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Intention } from '../../platform.model';
import { matchesIntentQualifier, matchesWildcardQualifier } from '../../qualifier-tester';
import { ManifestObjectStore } from './manifest-object-store';

describe('IntentionStore', () => {
  let store: ManifestObjectStore<Intention>;

  beforeEach(() => {
    store = new ManifestObjectStore<Intention>();
  });

  describe('add and find intentions', () => {
    describe('find using \'wildcardMatcher\' strategy', () => {
      it('should not find intentions if the store is empty', () => {
        expect(store.find({id: 'id'})).toEqual([]);
        expect(store.find({appSymbolicName: 'app', qualifier: undefined}, matchesWildcardQualifier)).toEqual([]);
        expect(store.find({appSymbolicName: 'app', qualifier: null}, matchesWildcardQualifier)).toEqual([]);
        expect(store.find({appSymbolicName: 'app', qualifier: {}}, matchesWildcardQualifier)).toEqual([]);
        expect(store.find({appSymbolicName: 'app', qualifier: {'*': '*'}}, matchesWildcardQualifier)).toEqual([]);
      });

      it('should find intentions by id and app', () => {
        const intention: Intention = {type: 'type', metadata: {id: 'id', appSymbolicName: 'app'}};
        store.add(intention);

        expect(store.find({id: 'id'})).toEqual([intention]);
        expect(store.find({appSymbolicName: 'app', qualifier: undefined}, matchesWildcardQualifier)).toEqual([intention]);
        expect(store.find({appSymbolicName: 'app', qualifier: null}, matchesWildcardQualifier)).toEqual([intention]);
        expect(store.find({appSymbolicName: 'app', qualifier: {}}, matchesWildcardQualifier)).toEqual([intention]);
        expect(store.find({appSymbolicName: 'app', qualifier: {'*': '*'}}, matchesWildcardQualifier)).toEqual([intention]);
      });

      it('should find intentions of the same app', () => {
        const intention1: Intention = {type: 'type1', metadata: {id: 'id1', appSymbolicName: 'app'}};
        const intention2: Intention = {type: 'type2', metadata: {id: 'id2', appSymbolicName: 'app'}};
        store.add(intention1);
        store.add(intention2);

        expect(store.find({id: 'id1'})).toEqual([intention1]);
        expect(store.find({id: 'id2'})).toEqual([intention2]);
        expect(store.find({appSymbolicName: 'app', qualifier: undefined}, matchesWildcardQualifier)).toEqual([intention1, intention2]);
        expect(store.find({appSymbolicName: 'app', qualifier: null}, matchesWildcardQualifier)).toEqual([intention1, intention2]);
        expect(store.find({appSymbolicName: 'app', qualifier: {}}, matchesWildcardQualifier)).toEqual([intention1, intention2]);
        expect(store.find({appSymbolicName: 'app', qualifier: {'*': '*'}}, matchesWildcardQualifier)).toEqual([intention1, intention2]);
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

        expect(store.find({appSymbolicName: 'app', qualifier: undefined}, matchesWildcardQualifier)).toEqual([nullQualifierIntention, emptyQualifierIntention, asterikQualifierIntention, optionalQualifierIntention, exactQualifierIntention]);
        expect(store.find({appSymbolicName: 'app', qualifier: null}, matchesWildcardQualifier)).toEqual([nullQualifierIntention, emptyQualifierIntention, optionalQualifierIntention]);
        expect(store.find({appSymbolicName: 'app', qualifier: {}}, matchesWildcardQualifier)).toEqual([nullQualifierIntention, emptyQualifierIntention, optionalQualifierIntention]);
        expect(store.find({appSymbolicName: 'app', qualifier: {'*': '*'}}, matchesWildcardQualifier)).toEqual([nullQualifierIntention, emptyQualifierIntention, asterikQualifierIntention, optionalQualifierIntention, exactQualifierIntention]);
        expect(store.find({appSymbolicName: 'app', qualifier: {'entity': '*'}}, matchesWildcardQualifier)).toEqual([asterikQualifierIntention, optionalQualifierIntention, exactQualifierIntention]);
        expect(store.find({appSymbolicName: 'app', qualifier: {'entity': '?'}}, matchesWildcardQualifier)).toEqual([nullQualifierIntention, emptyQualifierIntention, asterikQualifierIntention, optionalQualifierIntention, exactQualifierIntention]);
        expect(store.find({appSymbolicName: 'app', qualifier: {'entity': 'test'}}, matchesWildcardQualifier)).toEqual([asterikQualifierIntention, optionalQualifierIntention, exactQualifierIntention]);
      });
    });

    describe('find using \'intentMatcher\' strategy', () => {
      it('should not find intentions if the store is empty', () => {
        expect(store.find({appSymbolicName: 'app', qualifier: undefined}, matchesIntentQualifier)).toEqual([]);
        expect(store.find({appSymbolicName: 'app', qualifier: null}, matchesIntentQualifier)).toEqual([]);
        expect(store.find({appSymbolicName: 'app', qualifier: {}}, matchesIntentQualifier)).toEqual([]);
        expect(store.find({appSymbolicName: 'app', qualifier: {'*': '*'}}, matchesIntentQualifier)).toEqual([]);
      });

      it('should find intentions by id and app', () => {
        const intention: Intention = {type: 'type', metadata: {id: 'id', appSymbolicName: 'app'}};
        store.add(intention);

        expect(store.find({id: 'id'})).toEqual([intention]);
        expect(store.find({appSymbolicName: 'app', qualifier: undefined}, matchesIntentQualifier)).toEqual([intention]);
        expect(store.find({appSymbolicName: 'app', qualifier: null}, matchesIntentQualifier)).toEqual([intention]);
        expect(store.find({appSymbolicName: 'app', qualifier: {}}, matchesIntentQualifier)).toEqual([intention]);
        expect(store.find({appSymbolicName: 'app', qualifier: {'*': '*'}}, matchesIntentQualifier)).toEqual([]);
      });

      it('should find intentions of the same app', () => {
        const intention1: Intention = {type: 'type1', metadata: {id: 'id1', appSymbolicName: 'app'}};
        const intention2: Intention = {type: 'type2', metadata: {id: 'id2', appSymbolicName: 'app'}};
        store.add(intention1);
        store.add(intention2);

        expect(store.find({id: 'id1'})).toEqual([intention1]);
        expect(store.find({id: 'id2'})).toEqual([intention2]);
        expect(store.find({appSymbolicName: 'app', qualifier: undefined}, matchesIntentQualifier)).toEqual([intention1, intention2]);
        expect(store.find({appSymbolicName: 'app', qualifier: null}, matchesIntentQualifier)).toEqual([intention1, intention2]);
        expect(store.find({appSymbolicName: 'app', qualifier: {}}, matchesIntentQualifier)).toEqual([intention1, intention2]);
        expect(store.find({appSymbolicName: 'app', qualifier: {'*': '*'}}, matchesIntentQualifier)).toEqual([]);
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

        expect(store.find({appSymbolicName: 'app', qualifier: undefined}, matchesIntentQualifier)).toEqual([nullQualifierIntention, emptyQualifierIntention, asterikQualifierIntention, optionalQualifierIntention, exactQualifierIntention]);
        expect(store.find({appSymbolicName: 'app', qualifier: null}, matchesIntentQualifier)).toEqual([nullQualifierIntention, emptyQualifierIntention, optionalQualifierIntention]);
        expect(store.find({appSymbolicName: 'app', qualifier: {}}, matchesIntentQualifier)).toEqual([nullQualifierIntention, emptyQualifierIntention, optionalQualifierIntention]);
        expect(store.find({appSymbolicName: 'app', qualifier: {'*': '*'}}, matchesIntentQualifier)).toEqual([]);
        expect(store.find({appSymbolicName: 'app', qualifier: {'entity': '*'}}, matchesIntentQualifier)).toEqual([asterikQualifierIntention, optionalQualifierIntention]);
        expect(store.find({appSymbolicName: 'app', qualifier: {'entity': '?'}}, matchesIntentQualifier)).toEqual([asterikQualifierIntention, optionalQualifierIntention]);
        expect(store.find({appSymbolicName: 'app', qualifier: {'entity': 'test'}}, matchesIntentQualifier)).toEqual([asterikQualifierIntention, optionalQualifierIntention, exactQualifierIntention]);
      });
    });
  });

  describe('remove intentions', () => {
    it('should do nothing if the store is empty', () => {
      store.remove({type: 'type', qualifier: undefined, appSymbolicName: 'app'});
      store.remove({type: 'type', qualifier: null, appSymbolicName: 'app'});
      store.remove({type: 'type', qualifier: {}, appSymbolicName: 'app'});
      store.remove({type: 'type', qualifier: {'*': '*'}, appSymbolicName: 'app'});

      expect(store.find({appSymbolicName: 'app', qualifier: {}}, matchesWildcardQualifier)).toEqual([]);
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
      store.remove({type: 'type', qualifier: undefined, appSymbolicName: 'app'});

      expect(store.find({id: 'id1'})).toEqual([]);
      expect(store.find({id: 'id2'})).toEqual([]);
      expect(store.find({id: 'id3'})).toEqual([]);
      expect(store.find({id: 'id4'})).toEqual([]);
      expect(store.find({appSymbolicName: 'app', qualifier: undefined}, matchesWildcardQualifier)).toEqual([]);
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
      store.remove({type: 'type', qualifier: null, appSymbolicName: 'app'});

      expect(store.find({id: 'id1'})).toEqual([]);
      expect(store.find({id: 'id2'})).toEqual([]);
      expect(store.find({id: 'id3'})).toEqual([]);
      expect(store.find({id: 'id4'})).toEqual([]);
      expect(store.find({appSymbolicName: 'app', qualifier: null}, matchesWildcardQualifier)).toEqual([]);
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
      store.remove({type: 'type', qualifier: {}, appSymbolicName: 'app'});

      expect(store.find({id: 'id1'})).toEqual([]);
      expect(store.find({id: 'id2'})).toEqual([]);
      expect(store.find({id: 'id3'})).toEqual([]);
      expect(store.find({id: 'id4'})).toEqual([]);
      expect(store.find({appSymbolicName: 'app', qualifier: {}}, matchesWildcardQualifier)).toEqual([]);
    });

    it('should remove absolute wildcard intentions', () => {
      const intention: Intention = {type: 'type', qualifier: {'*': '*'}, metadata: {id: 'id', appSymbolicName: 'app'}};
      store.add(intention);
      store.remove({type: 'type', qualifier: {'*': '*'}, appSymbolicName: 'app'});

      expect(store.find({id: 'id'})).toEqual([]);
      expect(store.find({appSymbolicName: 'app', qualifier: {'*': '*'}}, matchesWildcardQualifier)).toEqual([]);
    });

    it('should remove intentions which contain the asterisk value wildcard in their qualifier', () => {
      const intention: Intention = {type: 'type', qualifier: {'entity': '*'}, metadata: {id: 'id', appSymbolicName: 'app'}};
      store.add(intention);
      store.remove({type: 'type', qualifier: {'entity': '*'}, appSymbolicName: 'app'});

      expect(store.find({id: 'id'})).toEqual([]);
      expect(store.find({appSymbolicName: 'app', qualifier: {'entity': '*'}}, matchesWildcardQualifier)).toEqual([]);
    });

    it('should remove intentions which contain the optional value wildcard in their qualifier', () => {
      const intention: Intention = {type: 'type', qualifier: {'entity': '?'}, metadata: {id: 'id', appSymbolicName: 'app'}};
      store.add(intention);
      store.remove({type: 'type', qualifier: {'entity': '?'}, appSymbolicName: 'app'});

      expect(store.find({id: 'id'})).toEqual([]);
      expect(store.find({appSymbolicName: 'app', qualifier: {'entity': '?'}}, matchesWildcardQualifier)).toEqual([]);
    });

    it('should remove intentions using an exact qualifier as deletion criterion', () => {
      const intention: Intention = {type: 'type', qualifier: {'entity': 'test'}, metadata: {id: 'id', appSymbolicName: 'app'}};
      store.add(intention);
      store.remove({type: 'type', qualifier: {'entity': 'test'}, appSymbolicName: 'app'});

      expect(store.find({id: 'id'})).toEqual([]);
      expect(store.find({appSymbolicName: 'app', qualifier: {'entity': 'test'}}, matchesWildcardQualifier)).toEqual([]);
    });

    it('should not interpret wildcards in the qualifier when removing intentions (asterisk wildcard as qualifier key and value)', () => {
      const intention: Intention = {type: 'type', qualifier: {'entity': 'test'}, metadata: {id: 'id', appSymbolicName: 'app'}};
      store.add(intention);
      store.remove({type: 'type', qualifier: {'*': '*'}, appSymbolicName: 'app'});

      expect(store.find({id: 'id'})).toEqual([intention]);
      expect(store.find({appSymbolicName: 'app', qualifier: {'*': '*'}}, matchesWildcardQualifier)).toEqual([intention]);
    });

    it('should not interpret wildcards in the qualifier when removing intentions (asterisk wildcard as qualifier value)', () => {
      const intention: Intention = {type: 'type', qualifier: {'entity': 'test'}, metadata: {id: 'id', appSymbolicName: 'app'}};
      store.add(intention);
      store.remove({type: 'type', qualifier: {'entity': '*'}, appSymbolicName: 'app'});

      expect(store.find({id: 'id'})).toEqual([intention]);
      expect(store.find({appSymbolicName: 'app', qualifier: {'entity': '*'}}, matchesWildcardQualifier)).toEqual([intention]);
    });

    it('should not interpret wildcards in the qualifier when removing intentions (optional wildcard as qualifier value)', () => {
      const intention: Intention = {type: 'type', qualifier: {'entity': 'test'}, metadata: {id: 'id', appSymbolicName: 'app'}};
      store.add(intention);
      store.remove({type: 'type', qualifier: {'entity': '?'}, appSymbolicName: 'app'});

      expect(store.find({id: 'id'})).toEqual([intention]);
      expect(store.find({appSymbolicName: 'app', qualifier: {'entity': '?'}}, matchesWildcardQualifier)).toEqual([intention]);
    });

    it('should not remove wildcard intentions when using an exact qualifier as deletion criterion', () => {
      const intention: Intention = {type: 'type', qualifier: {'*': '*'}, metadata: {id: 'id', appSymbolicName: 'app'}};
      store.add(intention);
      store.remove({type: 'type', qualifier: {'entity': 'test'}, appSymbolicName: 'app'});

      expect(store.find({id: 'id'})).toEqual([intention]);
      expect(store.find({appSymbolicName: 'app', qualifier: {'entity': 'test'}}, matchesWildcardQualifier)).toEqual([intention]);
      expect(store.find({appSymbolicName: 'app', qualifier: {'*': '*'}}, matchesWildcardQualifier)).toEqual([intention]);
    });

    it('should not remove absolute wildcard intentions when specifying the asterisk wildcard only as qualifier value', () => {
      const intention: Intention = {type: 'type', qualifier: {'*': '*'}, metadata: {id: 'id', appSymbolicName: 'app'}};
      store.add(intention);
      store.remove({type: 'type', qualifier: {'entity': '*'}, appSymbolicName: 'app'});

      expect(store.find({id: 'id'})).toEqual([intention]);
      expect(store.find({appSymbolicName: 'app', qualifier: {'entity': '*'}}, matchesWildcardQualifier)).toEqual([intention]);
      expect(store.find({appSymbolicName: 'app', qualifier: {'*': '*'}}, matchesWildcardQualifier)).toEqual([intention]);
    });

    it('should not remove absolute wildcard intentions when specifying the optional wildcard as qualifier value', () => {
      const intention: Intention = {type: 'type', qualifier: {'*': '*'}, metadata: {id: 'id', appSymbolicName: 'app'}};
      store.add(intention);
      store.remove({type: 'type', qualifier: {'entity': '?'}, appSymbolicName: 'app'});

      expect(store.find({id: 'id'})).toEqual([intention]);
      expect(store.find({appSymbolicName: 'app', qualifier: {'entity': '?'}}, matchesWildcardQualifier)).toEqual([intention]);
      expect(store.find({appSymbolicName: 'app', qualifier: {'*': '*'}}, matchesWildcardQualifier)).toEqual([intention]);
    });

    it('should remove absolute wildcard intentions if not specifying a qualifier in the filter', () => {
      const intention: Intention = {type: 'type', qualifier: {'*': '*'}, metadata: {id: 'id', appSymbolicName: 'app'}};
      store.add(intention);
      store.remove({type: 'type', appSymbolicName: 'app'});

      expect(store.find({id: 'id'})).toEqual([]);
      expect(store.find({appSymbolicName: 'app', qualifier: {'*': '*'}}, matchesWildcardQualifier)).toEqual([]);
    });

    it('should remove absolute wildcard intentions if an `undefined` qualifier is passed in the filter', () => {
      const intention: Intention = {type: 'type', qualifier: {'*': '*'}, metadata: {id: 'id', appSymbolicName: 'app'}};
      store.add(intention);
      store.remove({type: 'type', qualifier: undefined, appSymbolicName: 'app'});

      expect(store.find({id: 'id'})).toEqual([]);
      expect(store.find({appSymbolicName: 'app', qualifier: {'*': '*'}}, matchesWildcardQualifier)).toEqual([]);
    });

    it('should not remove absolute wildcard intentions if a `null` qualifier is passed in the filter', () => {
      const intention: Intention = {type: 'type', qualifier: {'*': '*'}, metadata: {id: 'id', appSymbolicName: 'app'}};
      store.add(intention);
      store.remove({type: 'type', qualifier: null, appSymbolicName: 'app'});

      expect(store.find({id: 'id'})).toEqual([intention]);
      expect(store.find({appSymbolicName: 'app', qualifier: null}, matchesWildcardQualifier)).toEqual([intention]);
      expect(store.find({appSymbolicName: 'app', qualifier: {'*': '*'}}, matchesWildcardQualifier)).toEqual([intention]);
    });

    it('should not remove absolute wildcard intentions if an empty qualifier is passed in the filter', () => {
      const intention: Intention = {type: 'type', qualifier: {'*': '*'}, metadata: {id: 'id', appSymbolicName: 'app'}};
      store.add(intention);
      store.remove({type: 'type', qualifier: {}, appSymbolicName: 'app'});

      expect(store.find({id: 'id'})).toEqual([intention]);
      expect(store.find({appSymbolicName: 'app', qualifier: {}}, matchesWildcardQualifier)).toEqual([intention]);
      expect(store.find({appSymbolicName: 'app', qualifier: {'*': '*'}}, matchesWildcardQualifier)).toEqual([intention]);
    });

    it('should not remove intentions of other types', () => {
      const intention1: Intention = {type: 'type1', metadata: {id: 'id1', appSymbolicName: 'app'}};
      const intention2: Intention = {type: 'type2', metadata: {id: 'id2', appSymbolicName: 'app'}};
      store.add(intention1);
      store.add(intention2);
      store.remove({type: 'type1', qualifier: {}, appSymbolicName: 'app'});

      expect(store.find({id: 'id1'})).toEqual([]);
      expect(store.find({id: 'id2'})).toEqual([intention2]);
      expect(store.find({appSymbolicName: 'app', qualifier: {'*': '*'}}, matchesWildcardQualifier)).toEqual([intention2]);
    });

    it('should not remove intentions of other apps', () => {
      const intention1: Intention = {type: 'type', metadata: {id: 'id1', appSymbolicName: 'app1'}};
      const intention2: Intention = {type: 'type', metadata: {id: 'id2', appSymbolicName: 'app2'}};
      store.add(intention1);
      store.add(intention2);
      store.remove({type: 'type', qualifier: {}, appSymbolicName: 'app1'});

      expect(store.find({id: 'id1'})).toEqual([]);
      expect(store.find({id: 'id2'})).toEqual([intention2]);
      expect(store.find({appSymbolicName: 'app1', qualifier: {'*': '*'}}, matchesWildcardQualifier)).toEqual([]);
      expect(store.find({appSymbolicName: 'app2', qualifier: {'*': '*'}}, matchesWildcardQualifier)).toEqual([intention2]);
    });
  });
});
