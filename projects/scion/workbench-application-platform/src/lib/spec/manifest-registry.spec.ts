/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { async, fakeAsync, inject, TestBed } from '@angular/core/testing';
import { NgModule } from '@angular/core';
import { ManifestRegistry } from '../core/manifest-registry.service';
import { PlatformCapabilityTypes, Qualifier } from '@scion/workbench-application-platform.api';

describe('ManifestRegistry', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AppTestModule],
    });
  }));

  describe('function \'isHandled(...)\'', () => {

    it('should allow any application to interact with public capabilities', fakeAsync(inject([ManifestRegistry], (manifestRegistry: ManifestRegistry) => {
      const type = PlatformCapabilityTypes.View;
      const qualifier: Qualifier = {entity: 'entity'};
      manifestRegistry.registerCapability('app-1', [{type, qualifier, private: false}]);

      expect(manifestRegistry.isHandled('app-1', type, qualifier)).toBeTruthy();
      expect(manifestRegistry.isHandled('app-2', type, qualifier)).toBeTruthy();
    })));

    it('should hide private capabilities from other applications', fakeAsync(inject([ManifestRegistry], (manifestRegistry: ManifestRegistry) => {
      const type = PlatformCapabilityTypes.View;
      const qualifier: Qualifier = {entity: 'entity'};
      manifestRegistry.registerCapability('app-1', [{type, qualifier, private: true}]);
      manifestRegistry.disableScopeChecks('app-3');

      expect(manifestRegistry.isHandled('app-1', type, qualifier)).toBeTruthy();
      expect(manifestRegistry.isHandled('app-2', type, qualifier)).toBeFalsy();
      expect(manifestRegistry.isHandled('app-3', type, qualifier)).toBeTruthy();
    })));
  });

  describe('function \'hasCapability(...)\'', () => {

    it('should return `true` only if the application provides the capability', fakeAsync(inject([ManifestRegistry], (manifestRegistry: ManifestRegistry) => {
      const type1 = 'type-1';
      const type2 = 'type2';
      const type3 = 'type-3';
      const qualifier1: Qualifier = {entity: 'entity', qualifier: 1};
      const qualifier2: Qualifier = {entity: 'entity', qualifier: 2};
      const qualifier3: Qualifier = {entity: '?'};
      manifestRegistry.registerCapability('app-1', [{type: type1, qualifier: qualifier1, private: false}]);
      manifestRegistry.registerCapability('app-1', [{type: type2, qualifier: qualifier2, private: true}]);
      manifestRegistry.registerCapability('app-1', [{type: type3, qualifier: qualifier3, private: false}]);

      expect(manifestRegistry.hasCapability('app-1', type1, qualifier1)).toBeTruthy();
      expect(manifestRegistry.hasCapability('app-1', type2, qualifier2)).toBeTruthy();
      expect(manifestRegistry.hasCapability('app-1', type3, {})).toBeTruthy();
      expect(manifestRegistry.hasCapability('app-1', 'other-type', {})).toBeFalsy();

      expect(manifestRegistry.hasCapability('app-2', type1, qualifier1)).toBeFalsy();
      expect(manifestRegistry.hasCapability('app-2', type2, qualifier2)).toBeFalsy();
      expect(manifestRegistry.hasCapability('app-2', type3, {})).toBeFalsy();
    })));

    it('should return `false` for any not-empty qualifier if registered without a qualifier', fakeAsync(inject([ManifestRegistry], (manifestRegistry: ManifestRegistry) => {
      const type = 'type';
      manifestRegistry.registerCapability('app-1', [{type, private: false}]);

      expect(manifestRegistry.hasCapability('app-1', type, {})).toBeTruthy();
      expect(manifestRegistry.hasCapability('app-1', type, {entity: 'entity'})).toBeFalsy();
      expect(manifestRegistry.hasCapability('app-1', type, undefined)).toBeTruthy();

      expect(manifestRegistry.hasCapability('app-2', type, {})).toBeFalsy();
      expect(manifestRegistry.hasCapability('app-2', type, {entity: 'entity'})).toBeFalsy();
      expect(manifestRegistry.hasCapability('app-2', type, undefined)).toBeFalsy();
    })));

    it('should return `true` if a qualifier matches the qualifier pattern (*)', fakeAsync(inject([ManifestRegistry], (manifestRegistry: ManifestRegistry) => {
      const type = 'type';
      manifestRegistry.registerCapability('app-1', [{type, qualifier: {entity: '*'}, private: false}]);

      expect(manifestRegistry.hasCapability('app-1', type, {entity: null})).toBeFalsy();
      expect(manifestRegistry.hasCapability('app-1', type, {entity: 'entity-1'})).toBeTruthy();
      expect(manifestRegistry.hasCapability('app-1', type, {entity: 'entity-2'})).toBeTruthy();
      expect(manifestRegistry.hasCapability('app-1', type, {entity: 'entity-2', name: 'smith'})).toBeFalsy();

      expect(manifestRegistry.hasCapability('app-2', type, {entity: null})).toBeFalsy();
      expect(manifestRegistry.hasCapability('app-2', type, {entity: 'entity-1'})).toBeFalsy();
      expect(manifestRegistry.hasCapability('app-2', type, {entity: 'entity-2'})).toBeFalsy();
      expect(manifestRegistry.hasCapability('app-2', type, {entity: 'entity-2', name: 'smith'})).toBeFalsy();
    })));

    it('should return `true` if a qualifier matches the qualifier pattern (?)', fakeAsync(inject([ManifestRegistry], (manifestRegistry: ManifestRegistry) => {
      const type = 'type';
      manifestRegistry.registerCapability('app-1', [{type, qualifier: {entity: '?'}, private: false}]);

      expect(manifestRegistry.hasCapability('app-1', type, null)).toBeTruthy();
      expect(manifestRegistry.hasCapability('app-1', type, undefined)).toBeTruthy();
      expect(manifestRegistry.hasCapability('app-1', type, {})).toBeTruthy();
      expect(manifestRegistry.hasCapability('app-1', type, {entity: null})).toBeTruthy();
      expect(manifestRegistry.hasCapability('app-1', type, {entity: undefined})).toBeTruthy();
      expect(manifestRegistry.hasCapability('app-1', type, {entity: 'optional-entity-1'})).toBeTruthy();
      expect(manifestRegistry.hasCapability('app-1', type, {entity: 'optional-entity-2'})).toBeTruthy();
      expect(manifestRegistry.hasCapability('app-1', type, {entity: 'optional-entity-2', name: 'smith'})).toBeFalsy();

      expect(manifestRegistry.hasCapability('app-2', type, null)).toBeFalsy();
      expect(manifestRegistry.hasCapability('app-2', type, undefined)).toBeFalsy();
      expect(manifestRegistry.hasCapability('app-2', type, {})).toBeFalsy();
      expect(manifestRegistry.hasCapability('app-2', type, {entity: null})).toBeFalsy();
      expect(manifestRegistry.hasCapability('app-2', type, {entity: undefined})).toBeFalsy();
      expect(manifestRegistry.hasCapability('app-2', type, {entity: 'optional-entity-1'})).toBeFalsy();
      expect(manifestRegistry.hasCapability('app-2', type, {entity: 'optional-entity-2'})).toBeFalsy();
      expect(manifestRegistry.hasCapability('app-2', type, {entity: 'optional-entity-2', name: 'smith'})).toBeFalsy();
    })));
  });

  describe('function \'hasIntent(...)\'', () => {

    it('should return `true` for implicit intents', fakeAsync(inject([ManifestRegistry], (manifestRegistry: ManifestRegistry) => {
      const type = 'type';
      const qualifier: Qualifier = {entity: 'entity'};
      manifestRegistry.registerCapability('app-1', [{type, qualifier}]);

      expect(manifestRegistry.hasIntent('app-1', type, qualifier)).toBeTruthy();
      expect(manifestRegistry.hasIntent('app-1', 'other-type', qualifier)).toBeFalsy();
      expect(manifestRegistry.hasIntent('app-1', type, {other: 'qualifier'})).toBeFalsy();
      expect(manifestRegistry.hasIntent('app-2', type, qualifier)).toBeFalsy();
    })));

    it('should return `true` for explicit intents', fakeAsync(inject([ManifestRegistry], (manifestRegistry: ManifestRegistry) => {
      const type = 'type';
      const qualifier: Qualifier = {entity: 'entity'};
      manifestRegistry.registerIntents('app-1', [{type, qualifier}]);

      expect(manifestRegistry.hasIntent('app-1', type, qualifier)).toBeTruthy();
      expect(manifestRegistry.hasIntent('app-1', 'other-type', qualifier)).toBeFalsy();
      expect(manifestRegistry.hasIntent('app-1', type, {other: 'qualifier'})).toBeFalsy();
      expect(manifestRegistry.hasIntent('app-2', type, qualifier)).toBeFalsy();
    })));

    it('should return `false` for any not-empty qualifier if registered without a qualifier', fakeAsync(inject([ManifestRegistry], (manifestRegistry: ManifestRegistry) => {
      const type = 'type';
      manifestRegistry.registerIntents('app-1', [{type}]);

      expect(manifestRegistry.hasIntent('app-1', type, {})).toBeTruthy();
      expect(manifestRegistry.hasIntent('app-1', type, {entity: 'entity'})).toBeFalsy();
      expect(manifestRegistry.hasIntent('app-1', 'other-type', {entity: 'entity'})).toBeFalsy();

      expect(manifestRegistry.hasIntent('app-2', type, {})).toBeFalsy();
      expect(manifestRegistry.hasIntent('app-2', type, {entity: 'entity'})).toBeFalsy();
    })));

    it('should return `true` if a qualifier matches the qualifier pattern', fakeAsync(inject([ManifestRegistry], (manifestRegistry: ManifestRegistry) => {
      const type = 'type';
      manifestRegistry.registerIntents('app-1', [{type, qualifier: {entity: '*'}}]);

      expect(manifestRegistry.hasIntent('app-1', type, {entity: null})).toBeFalsy();
      expect(manifestRegistry.hasIntent('app-1', type, {entity: 'entity-1'})).toBeTruthy();
      expect(manifestRegistry.hasIntent('app-1', type, {entity: 'entity-2'})).toBeTruthy();
      expect(manifestRegistry.hasIntent('app-1', type, {entity: 'entity-2', name: 'smith'})).toBeFalsy();
      expect(manifestRegistry.hasIntent('app-1', 'other-type', {entity: 'entity-1'})).toBeFalsy();

      expect(manifestRegistry.hasIntent('app-2', type, {entity: null})).toBeFalsy();
      expect(manifestRegistry.hasIntent('app-2', type, {entity: 'entity-1'})).toBeFalsy();
      expect(manifestRegistry.hasIntent('app-2', type, {entity: 'entity-2'})).toBeFalsy();
      expect(manifestRegistry.hasIntent('app-2', type, {entity: 'entity-2', name: 'smith'})).toBeFalsy();
    })));

    it('should return `false` for any not-empty qualifier if not qualified in the manifest', fakeAsync(inject([ManifestRegistry], (manifestRegistry: ManifestRegistry) => {
      const type = 'type';
      manifestRegistry.registerIntents('app-2', [{type}]);
      expect(manifestRegistry.hasIntent('app-2', type, {})).toBeTruthy();
      expect(manifestRegistry.hasIntent('app-2', type, {q: 'any'})).toBeFalsy();
      expect(manifestRegistry.hasIntent('app-2', type, undefined)).toBeTruthy();
    })));

    it('should return `false` if `null` or `undefined` is given as wildcard (*) intent value', fakeAsync(inject([ManifestRegistry], (manifestRegistry: ManifestRegistry) => {
      const type = 'type';
      manifestRegistry.registerIntents('app-2', [{type, qualifier: {q: '*'}}]);

      expect(manifestRegistry.hasIntent('app-2', type, {q: null})).toBeFalsy();
      expect(manifestRegistry.hasIntent('app-2', type, {q: undefined})).toBeFalsy();
    })));

    it('should return `true` if `null` or `undefined` is given as wildcard (?) intent value', fakeAsync(inject([ManifestRegistry], (manifestRegistry: ManifestRegistry) => {
      const type = 'type';
      manifestRegistry.registerIntents('app-2', [{type, qualifier: {q: '?'}}]);

      expect(manifestRegistry.hasIntent('app-2', type, {q: null})).toBeTruthy();
      expect(manifestRegistry.hasIntent('app-2', type, {q: undefined})).toBeTruthy();
      expect(manifestRegistry.hasIntent('app-2', type, {})).toBeTruthy();
      expect(manifestRegistry.hasIntent('app-2', type, null)).toBeTruthy();
      expect(manifestRegistry.hasIntent('app-2', type, undefined)).toBeTruthy();
    })));
  });

  describe('function \'getCapabilities(...)\'', () => {

    it('should return capabilities matching criteria', fakeAsync(inject([ManifestRegistry], (manifestRegistry: ManifestRegistry) => {
      manifestRegistry.registerCapability('app-1', [{type: 'type-1'}]);
      manifestRegistry.registerCapability('app-1', [{type: 'type-2', qualifier: {entity: 'entity'}}]);
      manifestRegistry.registerCapability('app-1', [{type: 'type-3', qualifier: {entity: '*'}}]);
      manifestRegistry.registerCapability('app-1', [{type: 'type-4', qualifier: {entity: '?'}}]);

      expect(manifestRegistry.getCapabilities('type-1', null).length).toBe(1);
      expect(manifestRegistry.getCapabilities('type-1', {}).length).toBe(1);
      expect(manifestRegistry.getCapabilities('type-1', {'some': 'qualifier'}).length).toBe(0);

      expect(manifestRegistry.getCapabilities('type-2', null).length).toBe(0);
      expect(manifestRegistry.getCapabilities('type-2', {}).length).toBe(0);
      expect(manifestRegistry.getCapabilities('type-2', {'entity': 'entity'}).length).toBe(1);
      expect(manifestRegistry.getCapabilities('type-2', {'entity': 'other-entity'}).length).toBe(0);
      expect(manifestRegistry.getCapabilities('type-2', {'some': 'qualifier'}).length).toBe(0);

      expect(manifestRegistry.getCapabilities('type-3', null).length).toBe(0);
      expect(manifestRegistry.getCapabilities('type-3', {}).length).toBe(0);
      expect(manifestRegistry.getCapabilities('type-3', {'entity': 'entity'}).length).toBe(1);
      expect(manifestRegistry.getCapabilities('type-3', {'entity': null}).length).toBe(0);
      expect(manifestRegistry.getCapabilities('type-3', {'entity': 'other-entity'}).length).toBe(1);
      expect(manifestRegistry.getCapabilities('type-3', {'some': 'qualifier'}).length).toBe(0);

      expect(manifestRegistry.getCapabilities('type-4', null).length).toBe(1);
      expect(manifestRegistry.getCapabilities('type-4', {}).length).toBe(1);
      expect(manifestRegistry.getCapabilities('type-4', {'entity': 'entity'}).length).toBe(1);
      expect(manifestRegistry.getCapabilities('type-4', {'entity': null}).length).toBe(1);
      expect(manifestRegistry.getCapabilities('type-4', {'entity': 'other-entity'}).length).toBe(1);
      expect(manifestRegistry.getCapabilities('type-4', {'some': 'qualifier'}).length).toBe(0);
    })));
  });

  describe('function \'getCapabilitiesByType(...)\'', () => {

    it('should return capabilities by type', fakeAsync(inject([ManifestRegistry], (manifestRegistry: ManifestRegistry) => {
      manifestRegistry.registerCapability('app-1', [{type: 'type-1'}]);
      manifestRegistry.registerCapability('app-1', [{type: 'type-2'}]);
      manifestRegistry.registerCapability('app-1', [{type: 'type-3'}]);
      manifestRegistry.registerCapability('app-2', [{type: 'type-1'}]);
      manifestRegistry.registerCapability('app-2', [{type: 'type-4'}]);

      expect(manifestRegistry.getCapabilitiesByType('type-1').length).toBe(2);
      expect(manifestRegistry.getCapabilitiesByType('type-2').length).toBe(1);
      expect(manifestRegistry.getCapabilitiesByType('type-3').length).toBe(1);
      expect(manifestRegistry.getCapabilitiesByType('type-4').length).toBe(1);
    })));
  });

  describe('function \'getCapabilitiesByPredicate(...)\'', () => {

    it('should return capabilities matching the given predicate', fakeAsync(inject([ManifestRegistry], (manifestRegistry: ManifestRegistry) => {
      manifestRegistry.registerCapability('app-1', [{type: 'type-1', private: false}]);
      manifestRegistry.registerCapability('app-1', [{type: 'type-2', qualifier: {entity: 'entity'}, private: false}]);
      manifestRegistry.registerCapability('app-1', [{type: 'type-3', qualifier: {entity: '*'}, private: false}]);
      manifestRegistry.registerCapability('app-1', [{type: 'type-4', qualifier: {entity: '?'}, private: true}]);

      expect(manifestRegistry.getCapabilitiesByPredicate(() => true).length).toBe(4);
      expect(manifestRegistry.getCapabilitiesByPredicate(capability => !capability.private).length).toBe(3);
      expect(manifestRegistry.getCapabilitiesByPredicate(capability => capability.type === 'type-3').length).toBe(1);
      expect(manifestRegistry.getCapabilitiesByPredicate(capability => capability.qualifier && capability.qualifier.hasOwnProperty('entity')).length).toBe(3);
    })));
  });

  describe('function \'getIntentsByApplication(...)\'', () => {

    it('should return intents by application', fakeAsync(inject([ManifestRegistry], (manifestRegistry: ManifestRegistry) => {
      manifestRegistry.registerIntents('app-1', [{type: 'type-1'}, {type: 'type-2'}]);
      manifestRegistry.registerIntents('app-1', [{type: 'type-3'}]);

      expect(manifestRegistry.getIntentsByApplication('app-1').length).toBe(3);
      expect(manifestRegistry.getIntentsByApplication('app-2').length).toBe(0);
    })));
  });
});

/****************************************************************************************************
 * Definition of App Test Module                                                                    *
 ****************************************************************************************************/

@NgModule({
  providers: [ManifestRegistry],
})
class AppTestModule {
}
