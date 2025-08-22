/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {createRemoteTranslatable} from './remote-text-provider';

describe('RemoteTextProvider', () => {

  describe('createRemoteTranslatable', () => {

    it('should return non-translatable text as is', () => {
      const translatable = createRemoteTranslatable('text', {appSymbolicName: 'app'});
      expect(translatable).toEqual('text');
    });

    it('should add app to key', () => {
      const translatable = createRemoteTranslatable('%key', {appSymbolicName: 'app'});
      expect(translatable).toEqual('%workbench.~app~.key');
    });

    it('should include params', () => {
      const translatable = createRemoteTranslatable('%key;param1=value1;param2=value2', {appSymbolicName: 'app'});
      expect(translatable).toEqual('%workbench.~app~.key;param1=value1;param2=value2');
    });

    it('should substitute named interpolation parameters', () => {
      const translatable1 = createRemoteTranslatable('%key;param1=:value1;param2=value2', {appSymbolicName: 'app', valueParams: {value1: 'VALUE1'}});
      expect(translatable1).toEqual('%workbench.~app~.key;param1=VALUE1;param2=value2');

      const translatable2 = createRemoteTranslatable('%key;param1=value1;param2=:value2', {appSymbolicName: 'app', valueParams: {value2: 'VALUE2'}});
      expect(translatable2).toEqual('%workbench.~app~.key;param1=value1;param2=VALUE2');

      const translatable3 = createRemoteTranslatable('%key;param1=:value1;param2=:value2', {appSymbolicName: 'app', valueParams: {value1: 'VALUE1', value2: 'VALUE2'}});
      expect(translatable3).toEqual('%workbench.~app~.key;param1=VALUE1;param2=VALUE2');
    });

    it('should not substitute unkown named interpolation parameters', () => {
      const translatable1 = createRemoteTranslatable('%key;param1=:value1;param2=value2', {appSymbolicName: 'app'});
      expect(translatable1).toEqual('%workbench.~app~.key;param1=:value1;param2=value2');

      const translatable2 = createRemoteTranslatable('%key;param1=value1;param2=:value2', {appSymbolicName: 'app'});
      expect(translatable2).toEqual('%workbench.~app~.key;param1=value1;param2=:value2');
    });

    it('should not substitute partial named interpolation parameters', () => {
      const translatable1 = createRemoteTranslatable('%key;param1=abc:value1;param2=:value2', {appSymbolicName: 'app', valueParams: {value1: 'VALUE1', value2: 'VALUE2'}});
      expect(translatable1).toEqual('%workbench.~app~.key;param1=abc:value1;param2=VALUE2');

      const translatable2 = createRemoteTranslatable('%key;param1=:value1abc;param2=:value2', {appSymbolicName: 'app', valueParams: {value1: 'VALUE1', value2: 'VALUE2'}});
      expect(translatable2).toEqual('%workbench.~app~.key;param1=:value1abc;param2=VALUE2');

      const translatable3 = createRemoteTranslatable('%key;param1=:value1;param2=abc:value2', {appSymbolicName: 'app', valueParams: {value1: 'VALUE1', value2: 'VALUE2'}});
      expect(translatable3).toEqual('%workbench.~app~.key;param1=VALUE1;param2=abc:value2');

      const translatable4 = createRemoteTranslatable('%key;param1=:value1;param2=:value2abc', {appSymbolicName: 'app', valueParams: {value1: 'VALUE1', value2: 'VALUE2'}});
      expect(translatable4).toEqual('%workbench.~app~.key;param1=VALUE1;param2=:value2abc');
    });

    it('should not substitute named interpolation parameter keys', () => {
      const translatable1 = createRemoteTranslatable('%key;:param1=value1;param2=value2', {appSymbolicName: 'app', valueParams: {param1: 'PARAM1'}});
      expect(translatable1).toEqual('%workbench.~app~.key;:param1=value1;param2=value2');

      const translatable2 = createRemoteTranslatable('%key;param1=value1;:param2=value2', {appSymbolicName: 'app', valueParams: {param2: 'PARAM2'}});
      expect(translatable2).toEqual('%workbench.~app~.key;param1=value1;:param2=value2');
    });

    it('should substitute named topic interpolation parameters', () => {
      const translatable = createRemoteTranslatable('%key;param1=:value1;param2=value2', {appSymbolicName: 'app', topicParams: {value1: 'a/b/c'}});
      expect(translatable).toEqual('%workbench.~app~.key;param1=topic://a/b/c;param2=value2');
    });

    it('should not substitute partial named topic interpolation parameters', () => {
      const translatable1 = createRemoteTranslatable('%key;param1=abc:value1;param2=:value2', {appSymbolicName: 'app', topicParams: {value1: 'a/b/c', value2: 'd/e/f'}});
      expect(translatable1).toEqual('%workbench.~app~.key;param1=abc:value1;param2=topic://d/e/f');

      const translatable2 = createRemoteTranslatable('%key;param1=:value1abc;param2=:value2', {appSymbolicName: 'app', topicParams: {value1: 'a/b/c', value2: 'd/e/f'}});
      expect(translatable2).toEqual('%workbench.~app~.key;param1=:value1abc;param2=topic://d/e/f');

      const translatable3 = createRemoteTranslatable('%key;param1=:value1;param2=abc:value2', {appSymbolicName: 'app', topicParams: {value1: 'a/b/c', value2: 'd/e/f'}});
      expect(translatable3).toEqual('%workbench.~app~.key;param1=topic://a/b/c;param2=abc:value2');

      const translatable4 = createRemoteTranslatable('%key;param1=:value1;param2=:value2abc', {appSymbolicName: 'app', topicParams: {value1: 'a/b/c', value2: 'd/e/f'}});
      expect(translatable4).toEqual('%workbench.~app~.key;param1=topic://a/b/c;param2=:value2abc');
    });

    it('should not substitute named topic interpolation parameter keys', () => {
      const translatable1 = createRemoteTranslatable('%key;:param1=value1;param2=value2', {appSymbolicName: 'app', topicParams: {param1: 'a/b/c'}});
      expect(translatable1).toEqual('%workbench.~app~.key;:param1=value1;param2=value2');

      const translatable2 = createRemoteTranslatable('%key;param1=value1;:param2=value2', {appSymbolicName: 'app', topicParams: {param2: 'd/e/f'}});
      expect(translatable2).toEqual('%workbench.~app~.key;param1=value1;:param2=value2');
    });

    it('should substitute named topic segments', () => {
      const translatable1 = createRemoteTranslatable('%key;param1=:value1;param2=value2', {appSymbolicName: 'app', valueParams: {entity: 'ENTITY'}, topicParams: {value1: ':entity/b/c'}});
      expect(translatable1).toEqual('%workbench.~app~.key;param1=topic://ENTITY/b/c;param2=value2');

      const translatable2 = createRemoteTranslatable('%key;param1=:value1;param2=value2', {appSymbolicName: 'app', valueParams: {id: 'ID'}, topicParams: {value1: 'a/:id/c'}});
      expect(translatable2).toEqual('%workbench.~app~.key;param1=topic://a/ID/c;param2=value2');
    });

    it('should not substitute unkown named topic segments', () => {
      const translatable = createRemoteTranslatable('%key;param1=:value1;param2=value2', {appSymbolicName: 'app', topicParams: {value1: 'a/:id/c'}});
      expect(translatable).toEqual('%workbench.~app~.key;param1=topic://a/:id/c;param2=value2');
    });

    it('should not substitute partial named topic segments', () => {
      const translatable1 = createRemoteTranslatable('%key;param1=:value1;param2=value2', {appSymbolicName: 'app', valueParams: {id: 'ID'}, topicParams: {value1: 'a:id/b/c'}});
      expect(translatable1).toEqual('%workbench.~app~.key;param1=topic://a:id/b/c;param2=value2');

      const translatable2 = createRemoteTranslatable('%key;param1=:value1;param2=value2', {appSymbolicName: 'app', valueParams: {id: 'ID'}, topicParams: {value1: ':ida/b/c'}});
      expect(translatable2).toEqual('%workbench.~app~.key;param1=topic://:ida/b/c;param2=value2');

      const translatable3 = createRemoteTranslatable('%key;param1=:value1;param2=value2', {appSymbolicName: 'app', valueParams: {id: 'ID'}, topicParams: {value1: 'a/b:id/c'}});
      expect(translatable3).toEqual('%workbench.~app~.key;param1=topic://a/b:id/c;param2=value2');

      const translatable4 = createRemoteTranslatable('%key;param1=:value1;param2=value2', {appSymbolicName: 'app', valueParams: {id: 'ID'}, topicParams: {value1: 'a/:idb/c'}});
      expect(translatable4).toEqual('%workbench.~app~.key;param1=topic://a/:idb/c;param2=value2');
    });
  });
});
