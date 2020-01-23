/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { expectToBeRejectedWithError, seleniumWebDriverClickFix, SeleniumWebDriverClickFix } from '../spec.util';
import { TestingAppOrigins, TestingAppPO } from '../testing-app.po';
import { RegisterCapabilityProvidersPagePO } from './register-capability-providers-page.po';
import { LookupCapabilityProvidersPagePO } from './lookup-capability-providers-page.po';
import { RegisterIntentionsPagePO } from './register-intentions-page.po';
import { LookupIntentionsPagePO } from './lookup-intentions-page.po';

describe('Manifest Registry', () => {

  let fix: SeleniumWebDriverClickFix;
  beforeAll(() => fix = seleniumWebDriverClickFix().install());
  afterAll(() => fix.uninstall());

  describe('Register capability providers', () => {

    it('should allow to register a capability provider', async () => {
      const testingAppPO = new TestingAppPO();
      const pagePOs = await testingAppPO.navigateTo({
        registrator: RegisterCapabilityProvidersPagePO,
        lookup: LookupCapabilityProvidersPagePO,
      }, {queryParams: new Map().set('manifestClassifier', 'blank').set('activatorApiDisabled', true)});
      const registratorPO = pagePOs.get<RegisterCapabilityProvidersPagePO>('registrator');
      const lookupPO = pagePOs.get<LookupCapabilityProvidersPagePO>('lookup');

      // Register the provider
      const providerId = await registratorPO.registerProvider({type: 'type', qualifier: {key: 'value'}, private: true});

      // Verify registration
      await lookupPO.lookup();
      await expect(lookupPO.getLookedUpProviderIds()).toEqual([providerId]);
    });
  });

  describe('Unregister capability providers', () => {

    it('should allow to unregister a capability provider by id', async () => {
      const testingAppPO = new TestingAppPO();
      const pagePOs = await testingAppPO.navigateTo({
        registrator: RegisterCapabilityProvidersPagePO,
        lookup: LookupCapabilityProvidersPagePO,
      }, {queryParams: new Map().set('manifestClassifier', 'blank').set('activatorApiDisabled', true)});
      const registratorPO = pagePOs.get<RegisterCapabilityProvidersPagePO>('registrator');
      const lookupPO = pagePOs.get<LookupCapabilityProvidersPagePO>('lookup');

      // Register providers
      const provider1Id = await registratorPO.registerProvider({type: 'type', qualifier: {key: 'value1'}, private: true});
      const provider2Id = await registratorPO.registerProvider({type: 'type', qualifier: {key: 'value2'}, private: true});
      await lookupPO.lookup();
      await expect(lookupPO.getLookedUpProviderIds()).toEqual(jasmine.arrayWithExactContents([provider1Id, provider2Id]));

      // Unregister provider1
      await registratorPO.unregisterProvider({id: provider1Id});
      await expect(lookupPO.getLookedUpProviderIds()).toEqual([provider2Id]);

      // Unregister provider2
      await registratorPO.unregisterProvider({id: provider2Id});
      await expect(lookupPO.getLookedUpProviderIds()).toEqual([]);
    });

    it('should allow to unregister a capability provider by type', async () => {
      const testingAppPO = new TestingAppPO();
      const pagePOs = await testingAppPO.navigateTo({
        registrator: RegisterCapabilityProvidersPagePO,
        lookup: LookupCapabilityProvidersPagePO,
      }, {queryParams: new Map().set('manifestClassifier', 'blank').set('activatorApiDisabled', true)});
      const registratorPO = pagePOs.get<RegisterCapabilityProvidersPagePO>('registrator');
      const lookupPO = pagePOs.get<LookupCapabilityProvidersPagePO>('lookup');

      // Register providers
      const provider1Id = await registratorPO.registerProvider({type: 'type1', qualifier: {key: 'value1'}, private: true});
      const provider2Id = await registratorPO.registerProvider({type: 'type1', qualifier: {key: 'value2'}, private: true});
      const provider3Id = await registratorPO.registerProvider({type: 'type2', qualifier: {key: 'value1'}, private: true});
      const provider4Id = await registratorPO.registerProvider({type: 'type2', qualifier: {key: 'value2'}, private: true});
      await lookupPO.lookup();
      await expect(lookupPO.getLookedUpProviderIds()).toEqual(jasmine.arrayWithExactContents([provider1Id, provider2Id, provider3Id, provider4Id]));

      // Unregister by 'type1'
      await registratorPO.unregisterProvider({type: 'type1'});
      await expect(lookupPO.getLookedUpProviderIds()).toEqual(jasmine.arrayWithExactContents([provider3Id, provider4Id]));

      // Unregister by 'type2'
      await registratorPO.unregisterProvider({type: 'type2'});
      await expect(lookupPO.getLookedUpProviderIds()).toEqual([]);
    });

    it('should allow to unregister a capability provider by qualifier', async () => {
      const testingAppPO = new TestingAppPO();
      const pagePOs = await testingAppPO.navigateTo({
        registrator: RegisterCapabilityProvidersPagePO,
        lookup: LookupCapabilityProvidersPagePO,
      }, {queryParams: new Map().set('manifestClassifier', 'blank').set('activatorApiDisabled', true)});
      const registratorPO = pagePOs.get<RegisterCapabilityProvidersPagePO>('registrator');
      const lookupPO = pagePOs.get<LookupCapabilityProvidersPagePO>('lookup');

      // Register providers
      const provider1Id = await registratorPO.registerProvider({type: 'type1', qualifier: undefined, private: true});
      const provider2Id = await registratorPO.registerProvider({type: 'type2', qualifier: {}, private: true});
      const provider3Id = await registratorPO.registerProvider({type: 'type3', qualifier: {key: 'a'}, private: true});
      const provider4Id = await registratorPO.registerProvider({type: 'type4', qualifier: {key: 'b'}, private: true});
      const provider5Id = await registratorPO.registerProvider({type: 'type5', qualifier: {key: 'c'}, private: true});
      const provider6Id = await registratorPO.registerProvider({type: 'type6', qualifier: {key: 'c'}, private: true});
      const provider7Id = await registratorPO.registerProvider({type: 'type7', qualifier: {key: 'd'}, private: true});
      await lookupPO.lookup();
      await expect(lookupPO.getLookedUpProviderIds()).toEqual(jasmine.arrayWithExactContents([provider1Id, provider2Id, provider3Id, provider4Id, provider5Id, provider6Id, provider7Id]));

      // Unregister by qualifier {}
      await registratorPO.unregisterProvider({qualifier: {}});
      await expect(lookupPO.getLookedUpProviderIds()).toEqual(jasmine.arrayWithExactContents([provider3Id, provider4Id, provider5Id, provider6Id, provider7Id]));

      // Unregister by qualifier {key: 'a'}
      await registratorPO.unregisterProvider({qualifier: {key: 'a'}});
      await expect(lookupPO.getLookedUpProviderIds()).toEqual(jasmine.arrayWithExactContents([provider4Id, provider5Id, provider6Id, provider7Id]));

      // Unregister by qualifier {key: 'b'}
      await registratorPO.unregisterProvider({qualifier: {key: 'b'}});
      await expect(lookupPO.getLookedUpProviderIds()).toEqual(jasmine.arrayWithExactContents([provider5Id, provider6Id, provider7Id]));

      // Unregister by qualifier {key: 'c'}
      await registratorPO.unregisterProvider({qualifier: {key: 'c'}});
      await expect(lookupPO.getLookedUpProviderIds()).toEqual([provider7Id]);

      // Unregister by qualifier {key: 'd'}
      await registratorPO.unregisterProvider({qualifier: {key: 'd'}});
      await expect(lookupPO.getLookedUpProviderIds()).toEqual([]);
    });

    it('should allow to unregister a capability provider by type and qualifier', async () => {
      const testingAppPO = new TestingAppPO();
      const pagePOs = await testingAppPO.navigateTo({
        registrator: RegisterCapabilityProvidersPagePO,
        lookup: LookupCapabilityProvidersPagePO,
      }, {queryParams: new Map().set('manifestClassifier', 'blank').set('activatorApiDisabled', true)});
      const registratorPO = pagePOs.get<RegisterCapabilityProvidersPagePO>('registrator');
      const lookupPO = pagePOs.get<LookupCapabilityProvidersPagePO>('lookup');

      // Register providers
      const provider1Id = await registratorPO.registerProvider({type: 'type1', qualifier: {key: 'a'}, private: true});
      const provider2Id = await registratorPO.registerProvider({type: 'type1', qualifier: {key: 'b'}, private: true});
      const provider3Id = await registratorPO.registerProvider({type: 'type2', qualifier: {key: 'a'}, private: true});
      const provider4Id = await registratorPO.registerProvider({type: 'type2', qualifier: {key: 'b'}, private: true});
      const provider5Id = await registratorPO.registerProvider({type: 'type3', qualifier: {key: 'a'}, private: true});
      const provider6Id = await registratorPO.registerProvider({type: 'type3', qualifier: {key: 'b'}, private: true});
      await lookupPO.lookup();
      await expect(lookupPO.getLookedUpProviderIds()).toEqual(jasmine.arrayWithExactContents([provider1Id, provider2Id, provider3Id, provider4Id, provider5Id, provider6Id]));

      // Unregister by type 'type1' and qualifier {key: 'a'}
      await registratorPO.unregisterProvider({type: 'type1', qualifier: {key: 'a'}});
      await expect(lookupPO.getLookedUpProviderIds()).toEqual(jasmine.arrayWithExactContents([provider2Id, provider3Id, provider4Id, provider5Id, provider6Id]));

      // Unregister by type 'type1' and qualifier {key: 'b'}
      await registratorPO.unregisterProvider({type: 'type1', qualifier: {key: 'b'}});
      await expect(lookupPO.getLookedUpProviderIds()).toEqual(jasmine.arrayWithExactContents([provider3Id, provider4Id, provider5Id, provider6Id]));

      // Unregister by type 'type2' and qualifier {key: 'a'}
      await registratorPO.unregisterProvider({type: 'type2', qualifier: {key: 'a'}});
      await expect(lookupPO.getLookedUpProviderIds()).toEqual(jasmine.arrayWithExactContents([provider4Id, provider5Id, provider6Id]));

      // Unregister by type 'type2' and qualifier {key: 'b'}
      await registratorPO.unregisterProvider({type: 'type2', qualifier: {key: 'b'}});
      await expect(lookupPO.getLookedUpProviderIds()).toEqual(jasmine.arrayWithExactContents([provider5Id, provider6Id]));

      // Unregister by type 'type3' and qualifier {key: 'a'}
      await registratorPO.unregisterProvider({type: 'type3', qualifier: {key: 'a'}});
      await expect(lookupPO.getLookedUpProviderIds()).toEqual([provider6Id]);

      // Unregister by type 'type3' and qualifier {key: 'b'}
      await registratorPO.unregisterProvider({type: 'type3', qualifier: {key: 'b'}});
      await expect(lookupPO.getLookedUpProviderIds()).toEqual([]);
    });

    it('should not allow to unregister capability providers from other applications', async () => {
      const testingAppPO = new TestingAppPO();
      const pagePOs = await testingAppPO.navigateTo({
        registrator_app2: {useClass: RegisterCapabilityProvidersPagePO, origin: TestingAppOrigins.APP_2},
        registrator_app3: {useClass: RegisterCapabilityProvidersPagePO, origin: TestingAppOrigins.APP_3},
        lookup_app2: {useClass: LookupCapabilityProvidersPagePO, origin: TestingAppOrigins.APP_2},
        lookup_app3: {useClass: LookupCapabilityProvidersPagePO, origin: TestingAppOrigins.APP_3},
      }, {queryParams: new Map().set('manifestClassifier', 'blank').set('activatorApiDisabled', true)});
      const registratorApp2PO = pagePOs.get<RegisterCapabilityProvidersPagePO>('registrator_app2');
      const registratorApp3PO = pagePOs.get<RegisterCapabilityProvidersPagePO>('registrator_app3');
      const lookupApp2PO = pagePOs.get<LookupCapabilityProvidersPagePO>('lookup_app2');
      const lookupApp3PO = pagePOs.get<LookupCapabilityProvidersPagePO>('lookup_app3');

      // Register providers
      const providerApp2Id = await registratorApp2PO.registerProvider({type: 'type', qualifier: {key: 'value'}, private: false});
      const providerApp3Id = await registratorApp3PO.registerProvider({type: 'type', qualifier: {key: 'value'}, private: false});

      await lookupApp2PO.lookup();
      await expect(lookupApp2PO.getLookedUpProviderIds()).toEqual([providerApp2Id]);
      await lookupApp3PO.lookup();
      await expect(lookupApp3PO.getLookedUpProviderIds()).toEqual([providerApp3Id]);

      // Unregister the provider in 'app-2'
      await registratorApp2PO.unregisterProvider({type: 'type', qualifier: {key: 'value'}});
      await registratorApp2PO.unregisterProvider({type: 'type', qualifier: {key: 'value'}, appSymbolicName: 'app-2'});
      await registratorApp2PO.unregisterProvider({type: 'type', qualifier: {key: 'value'}, appSymbolicName: 'app-3'});
      await expect(lookupApp2PO.getLookedUpProviderIds()).toEqual([]);
      await expect(lookupApp3PO.getLookedUpProviderIds()).toEqual([providerApp3Id]);

      // Unregister the provider in 'app-3'
      await registratorApp3PO.unregisterProvider({type: 'type', qualifier: {key: 'value'}});
      await registratorApp3PO.unregisterProvider({type: 'type', qualifier: {key: 'value'}, appSymbolicName: 'app-2'});
      await registratorApp3PO.unregisterProvider({type: 'type', qualifier: {key: 'value'}, appSymbolicName: 'app-3'});
      await expect(lookupApp2PO.getLookedUpProviderIds()).toEqual([]);
      await expect(lookupApp3PO.getLookedUpProviderIds()).toEqual([]);
    });
  });

  describe('Lookup capability providers', () => {

    it('should allow to look up capabilities of the requesting application', async () => {
      const testingAppPO = new TestingAppPO();
      const pagePOs = await testingAppPO.navigateTo({
        registrator_app1: {useClass: RegisterCapabilityProvidersPagePO, origin: TestingAppOrigins.APP_1},
        registrator_app3: {useClass: RegisterCapabilityProvidersPagePO, origin: TestingAppOrigins.APP_3},
        lookup_app1: {useClass: LookupCapabilityProvidersPagePO, origin: TestingAppOrigins.APP_1},
      }, {queryParams: new Map().set('manifestClassifier', 'blank').set('activatorApiDisabled', true)});
      const registratorApp1PO = pagePOs.get<RegisterCapabilityProvidersPagePO>('registrator_app1');
      const registratorApp3PO = pagePOs.get<RegisterCapabilityProvidersPagePO>('registrator_app3');
      const lookupApp1PO = pagePOs.get<LookupCapabilityProvidersPagePO>('lookup_app1');

      // Register providers in 'app-1'
      const provider1Id = await registratorApp1PO.registerProvider({type: 'type1', qualifier: {key: 'a'}, private: false});
      const provider2Id = await registratorApp1PO.registerProvider({type: 'type1', qualifier: {key: 'b'}, private: false});
      const provider3Id = await registratorApp1PO.registerProvider({type: 'type1', qualifier: {key: 'c'}, private: false});

      // Register providers in 'app-2'
      await registratorApp3PO.registerProvider({type: 'type2', qualifier: {key: 'a'}, private: false});
      await registratorApp3PO.registerProvider({type: 'type2', qualifier: {key: 'b'}, private: false});
      await registratorApp3PO.registerProvider({type: 'type2', qualifier: {key: 'c'}, private: false});

      // Verify the lookup when setting the app explicitly via filter
      await lookupApp1PO.lookup({appSymbolicName: 'app-1'});
      await expect(lookupApp1PO.getLookedUpProviderIds()).toEqual(jasmine.arrayWithExactContents([provider1Id, provider2Id, provider3Id]));
    });

    it('should allow to look up capabilities by id', async () => {
      const testingAppPO = new TestingAppPO();
      const pagePOs = await testingAppPO.navigateTo({
        registrator: RegisterCapabilityProvidersPagePO,
        lookup: LookupCapabilityProvidersPagePO,
      }, {queryParams: new Map().set('manifestClassifier', 'blank').set('activatorApiDisabled', true)});
      const registratorPO = pagePOs.get<RegisterCapabilityProvidersPagePO>('registrator');
      const lookupPO = pagePOs.get<LookupCapabilityProvidersPagePO>('lookup');

      // Register providers
      const provider1Id = await registratorPO.registerProvider({type: 'type1', qualifier: {key: 'a'}, private: false});
      const provider2Id = await registratorPO.registerProvider({type: 'type2', qualifier: {key: 'b'}, private: false});
      const provider3Id = await registratorPO.registerProvider({type: 'type3', qualifier: {key: 'c'}, private: false});

      // Lookup provider 1
      await lookupPO.lookup({id: provider1Id});
      await expect(lookupPO.getLookedUpProviderIds()).toEqual([provider1Id]);

      // Lookup provider 2
      await lookupPO.lookup({id: provider2Id});
      await expect(lookupPO.getLookedUpProviderIds()).toEqual([provider2Id]);

      // Lookup provider 3
      await lookupPO.lookup({id: provider3Id});
      await expect(lookupPO.getLookedUpProviderIds()).toEqual([provider3Id]);
    });

    it('should allow to look up capabilities by type', async () => {
      const testingAppPO = new TestingAppPO();
      const pagePOs = await testingAppPO.navigateTo({
        registrator: RegisterCapabilityProvidersPagePO,
        lookup: LookupCapabilityProvidersPagePO,
      }, {queryParams: new Map().set('manifestClassifier', 'blank').set('activatorApiDisabled', true)});
      const registratorPO = pagePOs.get<RegisterCapabilityProvidersPagePO>('registrator');
      const lookupPO = pagePOs.get<LookupCapabilityProvidersPagePO>('lookup');

      // Register providers
      const provider1Id = await registratorPO.registerProvider({type: 'type1', qualifier: {key: 'a'}, private: false});
      const provider2Id = await registratorPO.registerProvider({type: 'type2', qualifier: {key: 'b'}, private: false});
      const provider3Id = await registratorPO.registerProvider({type: 'type3', qualifier: {key: 'c'}, private: false});

      // Lookup provider 1
      await lookupPO.lookup({type: 'type1'});
      await expect(lookupPO.getLookedUpProviderIds()).toEqual([provider1Id]);

      // Lookup provider 2
      await lookupPO.lookup({type: 'type2'});
      await expect(lookupPO.getLookedUpProviderIds()).toEqual([provider2Id]);

      // Lookup provider 3
      await lookupPO.lookup({type: 'type3'});
      await expect(lookupPO.getLookedUpProviderIds()).toEqual([provider3Id]);
    });

    it('should allow to look up capabilities by qualifier', async () => {
      const testingAppPO = new TestingAppPO();
      const pagePOs = await testingAppPO.navigateTo({
        registrator: RegisterCapabilityProvidersPagePO,
        lookup: LookupCapabilityProvidersPagePO,
      }, {queryParams: new Map().set('manifestClassifier', 'blank').set('activatorApiDisabled', true)});
      const registratorPO = pagePOs.get<RegisterCapabilityProvidersPagePO>('registrator');
      const lookupPO = pagePOs.get<LookupCapabilityProvidersPagePO>('lookup');

      // Register providers
      const provider1Id = await registratorPO.registerProvider({type: 'type1', qualifier: {key: 'a'}, private: false});
      const provider2Id = await registratorPO.registerProvider({type: 'type2', qualifier: {key: 'b'}, private: false});
      const provider3Id = await registratorPO.registerProvider({type: 'type3', qualifier: {key: 'c'}, private: false});

      // Lookup provider 1
      await lookupPO.lookup({qualifier: {key: 'a'}});
      await expect(lookupPO.getLookedUpProviderIds()).toEqual([provider1Id]);

      // Lookup provider 2
      await lookupPO.lookup({qualifier: {key: 'b'}});
      await expect(lookupPO.getLookedUpProviderIds()).toEqual([provider2Id]);

      // Lookup provider 3
      await lookupPO.lookup({qualifier: {key: 'c'}});
      await expect(lookupPO.getLookedUpProviderIds()).toEqual([provider3Id]);
    });

    it('should allow to look up capabilities by type and qualifier', async () => {
      const testingAppPO = new TestingAppPO();
      const pagePOs = await testingAppPO.navigateTo({
        registrator: RegisterCapabilityProvidersPagePO,
        lookup: LookupCapabilityProvidersPagePO,
      }, {queryParams: new Map().set('manifestClassifier', 'blank').set('activatorApiDisabled', true)});
      const registratorPO = pagePOs.get<RegisterCapabilityProvidersPagePO>('registrator');
      const lookupPO = pagePOs.get<LookupCapabilityProvidersPagePO>('lookup');

      // Register providers
      const provider1Id = await registratorPO.registerProvider({type: 'type1', qualifier: {key: 'a'}, private: false});
      const provider2Id = await registratorPO.registerProvider({type: 'type2', qualifier: {key: 'b'}, private: false});
      const provider3Id = await registratorPO.registerProvider({type: 'type3', qualifier: {key: 'c'}, private: false});
      const provider4Id = await registratorPO.registerProvider({type: 'type1', qualifier: {key: 'd'}, private: false});
      const provider5Id = await registratorPO.registerProvider({type: 'type2', qualifier: {key: 'e'}, private: false});
      const provider6Id = await registratorPO.registerProvider({type: 'type3', qualifier: {key: 'f'}, private: false});

      // Lookup provider 1
      await lookupPO.lookup({type: 'type1', qualifier: {key: 'a'}});
      await expect(lookupPO.getLookedUpProviderIds()).toEqual([provider1Id]);

      // Lookup provider 2
      await lookupPO.lookup({type: 'type2', qualifier: {key: 'b'}});
      await expect(lookupPO.getLookedUpProviderIds()).toEqual([provider2Id]);

      // Lookup provider 3
      await lookupPO.lookup({type: 'type3', qualifier: {key: 'c'}});
      await expect(lookupPO.getLookedUpProviderIds()).toEqual([provider3Id]);

      // Lookup provider 4
      await lookupPO.lookup({type: 'type1', qualifier: {key: 'd'}});
      await expect(lookupPO.getLookedUpProviderIds()).toEqual([provider4Id]);

      // Lookup provider 5
      await lookupPO.lookup({type: 'type2', qualifier: {key: 'e'}});
      await expect(lookupPO.getLookedUpProviderIds()).toEqual([provider5Id]);

      // Lookup provider 6
      await lookupPO.lookup({type: 'type3', qualifier: {key: 'f'}});
      await expect(lookupPO.getLookedUpProviderIds()).toEqual([provider6Id]);
    });

    it('should allow to look up public capabilities from other apps for which the requesting app has declared an intention', async () => {
      const testingAppPO = new TestingAppPO();
      const pagePOs = await testingAppPO.navigateTo({
        providerRegistrator_app1: {useClass: RegisterCapabilityProvidersPagePO, origin: TestingAppOrigins.APP_1},
        intentionRegistrator_app2: {useClass: RegisterIntentionsPagePO, origin: TestingAppOrigins.APP_2},
        lookup_app2: {useClass: LookupCapabilityProvidersPagePO, origin: TestingAppOrigins.APP_2},
      }, {queryParams: new Map().set('manifestClassifier', 'blank').set('activatorApiDisabled', true)});
      const providerRegistratorApp1PO = pagePOs.get<RegisterCapabilityProvidersPagePO>('providerRegistrator_app1');
      const intentionRegistratorApp2PO = pagePOs.get<RegisterIntentionsPagePO>('intentionRegistrator_app2');
      const lookupApp2PO = pagePOs.get<LookupCapabilityProvidersPagePO>('lookup_app2');

      // Register a public provider in 'app-1'
      const publicProviderApp1Id = await providerRegistratorApp1PO.registerProvider({type: 'type', qualifier: {key: 'value'}, private: false});

      // Register the intention in 'app-2' for that capability
      await intentionRegistratorApp2PO.registerIntention({type: 'type', qualifier: {key: 'value'}});

      // Lookup the provider from 'app-2'
      await lookupApp2PO.lookup();
      await expect(lookupApp2PO.getLookedUpProviderIds()).toEqual([publicProviderApp1Id]);

      await lookupApp2PO.lookup({appSymbolicName: 'app-1'});
      await expect(lookupApp2PO.getLookedUpProviderIds()).toEqual([publicProviderApp1Id]);
    });

    it('should not allow to look up private capabilities from other apps for which the requesting app has declared an intention', async () => {
      const testingAppPO = new TestingAppPO();
      const pagePOs = await testingAppPO.navigateTo({
        providerRegistrator_app1: {useClass: RegisterCapabilityProvidersPagePO, origin: TestingAppOrigins.APP_1},
        intentionRegistrator_app2: {useClass: RegisterIntentionsPagePO, origin: TestingAppOrigins.APP_2},
        lookup_app2: {useClass: LookupCapabilityProvidersPagePO, origin: TestingAppOrigins.APP_2},
      }, {queryParams: new Map().set('manifestClassifier', 'blank').set('activatorApiDisabled', true)});
      const providerRegistratorApp1PO = pagePOs.get<RegisterCapabilityProvidersPagePO>('providerRegistrator_app1');
      const intentionRegistratorApp2PO = pagePOs.get<RegisterIntentionsPagePO>('intentionRegistrator_app2');
      const lookupApp2PO = pagePOs.get<LookupCapabilityProvidersPagePO>('lookup_app2');

      // Register a private provider in 'app-1'
      await providerRegistratorApp1PO.registerProvider({type: 'type', qualifier: {key: 'value'}, private: true});

      // Register the intention in 'app-2' for that capability
      await intentionRegistratorApp2PO.registerIntention({type: 'type', qualifier: {key: 'value'}});

      // Lookup the provider from 'app-2'
      await lookupApp2PO.lookup();
      await expect(lookupApp2PO.getLookedUpProviderIds()).toEqual([]);
    });

    it('should not allow to look up public capabilities from other apps for which the requesting app has not declared an intention', async () => {
      const testingAppPO = new TestingAppPO();
      const pagePOs = await testingAppPO.navigateTo({
        providerRegistrator_app1: {useClass: RegisterCapabilityProvidersPagePO, origin: TestingAppOrigins.APP_1},
        lookup_app2: {useClass: LookupCapabilityProvidersPagePO, origin: TestingAppOrigins.APP_2},
      }, {queryParams: new Map().set('manifestClassifier', 'blank').set('activatorApiDisabled', true)});
      const providerRegistratorApp1PO = pagePOs.get<RegisterCapabilityProvidersPagePO>('providerRegistrator_app1');
      const lookupApp2PO = pagePOs.get<LookupCapabilityProvidersPagePO>('lookup_app2');

      // Register a public provider in 'app-1'
      await providerRegistratorApp1PO.registerProvider({type: 'type', qualifier: {key: 'value'}, private: false});

      // Lookup the provider from 'app-2'
      await lookupApp2PO.lookup();
      await expect(lookupApp2PO.getLookedUpProviderIds()).toEqual([]);
    });

    it('should allow observing capabilities', async () => {
      const testingAppPO = new TestingAppPO();
      const pagePOs = await testingAppPO.navigateTo({
        registrator: RegisterCapabilityProvidersPagePO,
        lookup: LookupCapabilityProvidersPagePO,
      }, {queryParams: new Map().set('manifestClassifier', 'blank').set('activatorApiDisabled', true)});
      const registratorPO = pagePOs.get<RegisterCapabilityProvidersPagePO>('registrator');
      const lookupPO = pagePOs.get<LookupCapabilityProvidersPagePO>('lookup');
      await lookupPO.lookup(); // do a single lookup

      // Register a provider
      const provider1Id = await registratorPO.registerProvider({type: 'type1', qualifier: {key: 'a'}, private: true});
      await expect(lookupPO.getLookedUpProviderIds()).toEqual([provider1Id]);

      // Register a provider
      const provider2Id = await registratorPO.registerProvider({type: 'type2', qualifier: {key: 'b'}, private: true});
      await expect(lookupPO.getLookedUpProviderIds()).toEqual(jasmine.arrayWithExactContents([provider1Id, provider2Id]));

      // Register a provider
      const provider3Id = await registratorPO.registerProvider({type: 'type3', qualifier: {key: 'c'}, private: true});
      await expect(lookupPO.getLookedUpProviderIds()).toEqual(jasmine.arrayWithExactContents([provider1Id, provider2Id, provider3Id]));

      // Unregister a provider3Id
      await registratorPO.unregisterProvider({id: provider3Id});
      await expect(lookupPO.getLookedUpProviderIds()).toEqual(jasmine.arrayWithExactContents([provider1Id, provider2Id]));

      // Unregister a provider2Id
      await registratorPO.unregisterProvider({id: provider2Id});
      await expect(lookupPO.getLookedUpProviderIds()).toEqual([provider1Id]);

      // Unregister a provider1Id
      await registratorPO.unregisterProvider({id: provider1Id});
      await expect(lookupPO.getLookedUpProviderIds()).toEqual([]);
    });
  });

  describe('Register intentions', () => {

    it('should allow to register an intention if the API to manage intentions is enabled for the requesting application', async () => {
      const testingAppPO = new TestingAppPO();
      const pagePOs = await testingAppPO.navigateTo({
        registrator: {useClass: RegisterIntentionsPagePO, origin: TestingAppOrigins.APP_3},
        lookup: {useClass: LookupIntentionsPagePO, origin: TestingAppOrigins.APP_3},
      }, {queryParams: new Map().set('manifestClassifier', 'blank').set('activatorApiDisabled', true)});
      const registratorPO = pagePOs.get<RegisterIntentionsPagePO>('registrator');
      const lookupPO = pagePOs.get<LookupIntentionsPagePO>('lookup');

      // Register the intention
      const intentionId = await registratorPO.registerIntention({type: 'type', qualifier: {key: 'value'}});

      // Verify registration
      await lookupPO.lookup();
      await expect(lookupPO.getLookedUpIntentionIds()).toEqual([intentionId]);
    });

    it('should not allow to register an intention if the API to manage intentions is disabled for the requesting application', async () => {
      const testingAppPO = new TestingAppPO();
      const pagePOs = await testingAppPO.navigateTo({
        registrator: {useClass: RegisterIntentionsPagePO, origin: TestingAppOrigins.APP_4},
      }, {queryParams: new Map().set('manifestClassifier', 'blank').set('intentionRegisterApiDisabled', 'app-4').set('activatorApiDisabled', true)});
      const registratorPO = pagePOs.get<RegisterIntentionsPagePO>('registrator');

      // Try to register the intention
      await expectToBeRejectedWithError(registratorPO.registerIntention({type: 'type', qualifier: {key: 'value'}}), /IntentionRegisterError/);
    });
  });

  describe('Unregister intentions', () => {

    it('should not allow to unregister an intention if the API to manage intentions is disabled for the requesting application', async () => {
      const testingAppPO = new TestingAppPO();
      const pagePOs = await testingAppPO.navigateTo({
        registrator: {useClass: RegisterIntentionsPagePO, origin: TestingAppOrigins.APP_4},
      }, {queryParams: new Map().set('manifestClassifier', 'blank').set('intentionRegisterApiDisabled', 'app-4').set('activatorApiDisabled', true)});
      const registratorPO = pagePOs.get<RegisterIntentionsPagePO>('registrator');

      // Try to unregister an intention
      await expectToBeRejectedWithError(registratorPO.unregisterIntentions({type: 'type', qualifier: {key: 'value'}}), /IntentionRegisterError/);
    });

    it('should allow to unregister an intention by id', async () => {
      const testingAppPO = new TestingAppPO();
      const pagePOs = await testingAppPO.navigateTo({
        registrator: RegisterIntentionsPagePO,
        lookup: LookupIntentionsPagePO,
      }, {queryParams: new Map().set('manifestClassifier', 'blank').set('activatorApiDisabled', true)});
      const registratorPO = pagePOs.get<RegisterIntentionsPagePO>('registrator');
      const lookupPO = pagePOs.get<LookupIntentionsPagePO>('lookup');

      // Register intentions
      const intention1Id = await registratorPO.registerIntention({type: 'type', qualifier: {key: 'value1'}});
      const intention2Id = await registratorPO.registerIntention({type: 'type', qualifier: {key: 'value2'}});
      await lookupPO.lookup();
      await expect(lookupPO.getLookedUpIntentionIds()).toEqual(jasmine.arrayWithExactContents([intention1Id, intention2Id]));

      // Unregister intention1Id
      await registratorPO.unregisterIntentions({id: intention1Id});
      await expect(lookupPO.getLookedUpIntentionIds()).toEqual([intention2Id]);

      // Unregister intention2Id
      await registratorPO.unregisterIntentions({id: intention2Id});
      await expect(lookupPO.getLookedUpIntentionIds()).toEqual([]);
    });

    it('should allow to unregister an intention by type', async () => {
      const testingAppPO = new TestingAppPO();
      const pagePOs = await testingAppPO.navigateTo({
        registrator: RegisterIntentionsPagePO,
        lookup: LookupIntentionsPagePO,
      }, {queryParams: new Map().set('manifestClassifier', 'blank').set('activatorApiDisabled', true)});
      const registratorPO = pagePOs.get<RegisterIntentionsPagePO>('registrator');
      const lookupPO = pagePOs.get<LookupIntentionsPagePO>('lookup');

      // Register intentions
      const intention1Id = await registratorPO.registerIntention({type: 'type1', qualifier: {key: 'value1'}});
      const intention2Id = await registratorPO.registerIntention({type: 'type1', qualifier: {key: 'value2'}});
      const intention3Id = await registratorPO.registerIntention({type: 'type2', qualifier: {key: 'value1'}});
      const intention4Id = await registratorPO.registerIntention({type: 'type2', qualifier: {key: 'value2'}});
      await lookupPO.lookup();
      await expect(lookupPO.getLookedUpIntentionIds()).toEqual(jasmine.arrayWithExactContents([intention1Id, intention2Id, intention3Id, intention4Id]));

      // Unregister by 'type1'
      await registratorPO.unregisterIntentions({type: 'type1'});
      await expect(lookupPO.getLookedUpIntentionIds()).toEqual(jasmine.arrayWithExactContents([intention3Id, intention4Id]));

      // Unregister by 'type2'
      await registratorPO.unregisterIntentions({type: 'type2'});
      await expect(lookupPO.getLookedUpIntentionIds()).toEqual([]);
    });

    it('should allow to unregister an intention by qualifier', async () => {
      const testingAppPO = new TestingAppPO();
      const pagePOs = await testingAppPO.navigateTo({
        registrator: RegisterIntentionsPagePO,
        lookup: LookupIntentionsPagePO,
      }, {queryParams: new Map().set('manifestClassifier', 'blank').set('activatorApiDisabled', true)});
      const registratorPO = pagePOs.get<RegisterIntentionsPagePO>('registrator');
      const lookupPO = pagePOs.get<LookupIntentionsPagePO>('lookup');

      // Register intentions
      const intention1Id = await registratorPO.registerIntention({type: 'type1', qualifier: undefined});
      const intention2Id = await registratorPO.registerIntention({type: 'type2', qualifier: {}});
      const intention3Id = await registratorPO.registerIntention({type: 'type3', qualifier: {key: 'a'}});
      const intention4Id = await registratorPO.registerIntention({type: 'type4', qualifier: {key: 'b'}});
      const intention5Id = await registratorPO.registerIntention({type: 'type5', qualifier: {key: 'c'}});
      const intention6Id = await registratorPO.registerIntention({type: 'type6', qualifier: {key: 'c'}});
      const intention7Id = await registratorPO.registerIntention({type: 'type7', qualifier: {key: 'd'}});
      await lookupPO.lookup();
      await expect(lookupPO.getLookedUpIntentionIds()).toEqual(jasmine.arrayWithExactContents([intention1Id, intention2Id, intention3Id, intention4Id, intention5Id, intention6Id, intention7Id]));

      // Unregister by qualifier {}
      await registratorPO.unregisterIntentions({qualifier: {}});
      await expect(lookupPO.getLookedUpIntentionIds()).toEqual(jasmine.arrayWithExactContents([intention3Id, intention4Id, intention5Id, intention6Id, intention7Id]));

      // Unregister by qualifier {key: 'a'}
      await registratorPO.unregisterIntentions({qualifier: {key: 'a'}});
      await expect(lookupPO.getLookedUpIntentionIds()).toEqual(jasmine.arrayWithExactContents([intention4Id, intention5Id, intention6Id, intention7Id]));

      // Unregister by qualifier {key: 'b'}
      await registratorPO.unregisterIntentions({qualifier: {key: 'b'}});
      await expect(lookupPO.getLookedUpIntentionIds()).toEqual(jasmine.arrayWithExactContents([intention5Id, intention6Id, intention7Id]));

      // Unregister by qualifier {key: 'c'}
      await registratorPO.unregisterIntentions({qualifier: {key: 'c'}});
      await expect(lookupPO.getLookedUpIntentionIds()).toEqual([intention7Id]);

      // Unregister by qualifier {key: 'd'}
      await registratorPO.unregisterIntentions({qualifier: {key: 'd'}});
      await expect(lookupPO.getLookedUpIntentionIds()).toEqual([]);
    });

    it('should allow to unregister an intention by type and qualifier', async () => {
      const testingAppPO = new TestingAppPO();
      const pagePOs = await testingAppPO.navigateTo({
        registrator: RegisterIntentionsPagePO,
        lookup: LookupIntentionsPagePO,
      }, {queryParams: new Map().set('manifestClassifier', 'blank').set('activatorApiDisabled', true)});
      const registratorPO = pagePOs.get<RegisterIntentionsPagePO>('registrator');
      const lookupPO = pagePOs.get<LookupIntentionsPagePO>('lookup');

      // Register intentions
      const intention1Id = await registratorPO.registerIntention({type: 'type1', qualifier: {key: 'a'}});
      const intention2Id = await registratorPO.registerIntention({type: 'type1', qualifier: {key: 'b'}});
      const intention3Id = await registratorPO.registerIntention({type: 'type2', qualifier: {key: 'a'}});
      const intention4Id = await registratorPO.registerIntention({type: 'type2', qualifier: {key: 'b'}});
      const intention5Id = await registratorPO.registerIntention({type: 'type3', qualifier: {key: 'a'}});
      const intention6Id = await registratorPO.registerIntention({type: 'type3', qualifier: {key: 'b'}});
      await lookupPO.lookup();
      await expect(lookupPO.getLookedUpIntentionIds()).toEqual(jasmine.arrayWithExactContents([intention1Id, intention2Id, intention3Id, intention4Id, intention5Id, intention6Id]));

      // Unregister by type 'type1' and qualifier {key: 'a'}
      await registratorPO.unregisterIntentions({type: 'type1', qualifier: {key: 'a'}});
      await expect(lookupPO.getLookedUpIntentionIds()).toEqual(jasmine.arrayWithExactContents([intention2Id, intention3Id, intention4Id, intention5Id, intention6Id]));

      // Unregister by type 'type1' and qualifier {key: 'b'}
      await registratorPO.unregisterIntentions({type: 'type1', qualifier: {key: 'b'}});
      await expect(lookupPO.getLookedUpIntentionIds()).toEqual(jasmine.arrayWithExactContents([intention3Id, intention4Id, intention5Id, intention6Id]));

      // Unregister by type 'type2' and qualifier {key: 'a'}
      await registratorPO.unregisterIntentions({type: 'type2', qualifier: {key: 'a'}});
      await expect(lookupPO.getLookedUpIntentionIds()).toEqual(jasmine.arrayWithExactContents([intention4Id, intention5Id, intention6Id]));

      // Unregister by type 'type2' and qualifier {key: 'b'}
      await registratorPO.unregisterIntentions({type: 'type2', qualifier: {key: 'b'}});
      await expect(lookupPO.getLookedUpIntentionIds()).toEqual(jasmine.arrayWithExactContents([intention5Id, intention6Id]));

      // Unregister by type 'type3' and qualifier {key: 'a'}
      await registratorPO.unregisterIntentions({type: 'type3', qualifier: {key: 'a'}});
      await expect(lookupPO.getLookedUpIntentionIds()).toEqual([intention6Id]);

      // Unregister by type 'type3' and qualifier {key: 'b'}
      await registratorPO.unregisterIntentions({type: 'type3', qualifier: {key: 'b'}});
      await expect(lookupPO.getLookedUpIntentionIds()).toEqual([]);
    });

    it('should not allow to unregister intentions from other applications', async () => {
      const testingAppPO = new TestingAppPO();
      const pagePOs = await testingAppPO.navigateTo({
        registrator_app2: {useClass: RegisterIntentionsPagePO, origin: TestingAppOrigins.APP_2},
        registrator_app3: {useClass: RegisterIntentionsPagePO, origin: TestingAppOrigins.APP_3},
        lookup_app2: {useClass: LookupIntentionsPagePO, origin: TestingAppOrigins.APP_2},
        lookup_app3: {useClass: LookupIntentionsPagePO, origin: TestingAppOrigins.APP_3},
      }, {queryParams: new Map().set('manifestClassifier', 'blank').set('activatorApiDisabled', true)});
      const registratorApp2PO = pagePOs.get<RegisterIntentionsPagePO>('registrator_app2');
      const registratorApp3PO = pagePOs.get<RegisterIntentionsPagePO>('registrator_app3');
      const lookupApp2PO = pagePOs.get<LookupIntentionsPagePO>('lookup_app2');

      // Register intentions
      const intentionApp2Id = await registratorApp2PO.registerIntention({type: 'type', qualifier: {key: 'value'}});
      const intentionApp3Id = await registratorApp3PO.registerIntention({type: 'type', qualifier: {key: 'value'}});

      await lookupApp2PO.lookup();
      await expect(lookupApp2PO.getLookedUpIntentionIds()).toEqual([intentionApp2Id, intentionApp3Id]);

      // Unregister the intention in 'app-2'
      await registratorApp2PO.unregisterIntentions({type: 'type', qualifier: {key: 'value'}});
      await registratorApp2PO.unregisterIntentions({type: 'type', qualifier: {key: 'value'}, appSymbolicName: 'app-2'});
      await registratorApp2PO.unregisterIntentions({type: 'type', qualifier: {key: 'value'}, appSymbolicName: 'app-3'});
      await expect(lookupApp2PO.getLookedUpIntentionIds()).toEqual([intentionApp3Id]);

      // Unregister the intention in 'app-3'
      await registratorApp3PO.unregisterIntentions({type: 'type', qualifier: {key: 'value'}});
      await registratorApp3PO.unregisterIntentions({type: 'type', qualifier: {key: 'value'}, appSymbolicName: 'app-2'});
      await registratorApp3PO.unregisterIntentions({type: 'type', qualifier: {key: 'value'}, appSymbolicName: 'app-3'});
      await expect(lookupApp2PO.getLookedUpIntentionIds()).toEqual([]);
      await expect(lookupApp2PO.getLookedUpIntentionIds()).toEqual([]);
    });
  });

  describe('Lookup intentions', () => {

    it('should allow to look up intentions of the requesting application', async () => {
      const testingAppPO = new TestingAppPO();
      const pagePOs = await testingAppPO.navigateTo({
        registrator_app1: {useClass: RegisterIntentionsPagePO, origin: TestingAppOrigins.APP_1},
        registrator_app2: {useClass: RegisterIntentionsPagePO, origin: TestingAppOrigins.APP_3},
        lookup_app1: {useClass: LookupIntentionsPagePO, origin: TestingAppOrigins.APP_1},
      }, {queryParams: new Map().set('manifestClassifier', 'blank').set('activatorApiDisabled', true)});
      const registratorApp1PO = pagePOs.get<RegisterIntentionsPagePO>('registrator_app1');
      const registratorApp2PO = pagePOs.get<RegisterIntentionsPagePO>('registrator_app2');
      const lookupApp1PO = pagePOs.get<LookupIntentionsPagePO>('lookup_app1');

      // Register intentions in 'app-1'
      const intention1Id = await registratorApp1PO.registerIntention({type: 'type1', qualifier: {key: 'a'}});
      const intention2Id = await registratorApp1PO.registerIntention({type: 'type1', qualifier: {key: 'b'}});
      const intention3Id = await registratorApp1PO.registerIntention({type: 'type1', qualifier: {key: 'c'}});

      // Register intentions in 'app-2'
      await registratorApp2PO.registerIntention({type: 'type2', qualifier: {key: 'a'}});
      await registratorApp2PO.registerIntention({type: 'type2', qualifier: {key: 'b'}});
      await registratorApp2PO.registerIntention({type: 'type2', qualifier: {key: 'c'}});

      // Verify the lookup when setting the app explicitly via filter
      await lookupApp1PO.lookup({appSymbolicName: 'app-1'});
      await expect(lookupApp1PO.getLookedUpIntentionIds()).toEqual(jasmine.arrayWithExactContents([intention1Id, intention2Id, intention3Id]));
    });

    it('should allow to look up intentions by id', async () => {
      const testingAppPO = new TestingAppPO();
      const pagePOs = await testingAppPO.navigateTo({
        registrator: RegisterIntentionsPagePO,
        lookup: LookupIntentionsPagePO,
      }, {queryParams: new Map().set('manifestClassifier', 'blank').set('activatorApiDisabled', true)});
      const registratorPO = pagePOs.get<RegisterIntentionsPagePO>('registrator');
      const lookupPO = pagePOs.get<LookupIntentionsPagePO>('lookup');

      // Register intentions
      const intention1Id = await registratorPO.registerIntention({type: 'type1', qualifier: {key: 'a'}});
      const intention2Id = await registratorPO.registerIntention({type: 'type2', qualifier: {key: 'b'}});
      const intention3Id = await registratorPO.registerIntention({type: 'type3', qualifier: {key: 'c'}});

      // Lookup intention 1
      await lookupPO.lookup({id: intention1Id});
      await expect(lookupPO.getLookedUpIntentionIds()).toEqual([intention1Id]);

      // Lookup intention 2
      await lookupPO.lookup({id: intention2Id});
      await expect(lookupPO.getLookedUpIntentionIds()).toEqual([intention2Id]);

      // Lookup intention 3
      await lookupPO.lookup({id: intention3Id});
      await expect(lookupPO.getLookedUpIntentionIds()).toEqual([intention3Id]);
    });

    it('should allow to look up intentions by type', async () => {
      const testingAppPO = new TestingAppPO();
      const pagePOs = await testingAppPO.navigateTo({
        registrator: RegisterIntentionsPagePO,
        lookup: LookupIntentionsPagePO,
      }, {queryParams: new Map().set('manifestClassifier', 'blank').set('activatorApiDisabled', true)});
      const registratorPO = pagePOs.get<RegisterIntentionsPagePO>('registrator');
      const lookupPO = pagePOs.get<LookupIntentionsPagePO>('lookup');

      // Register intentions
      const intention1Id = await registratorPO.registerIntention({type: 'type1', qualifier: {key: 'a'}});
      const intention2Id = await registratorPO.registerIntention({type: 'type2', qualifier: {key: 'b'}});
      const intention3Id = await registratorPO.registerIntention({type: 'type3', qualifier: {key: 'c'}});

      // Lookup intention 1
      await lookupPO.lookup({type: 'type1'});
      await expect(lookupPO.getLookedUpIntentionIds()).toEqual([intention1Id]);

      // Lookup intention 2
      await lookupPO.lookup({type: 'type2'});
      await expect(lookupPO.getLookedUpIntentionIds()).toEqual([intention2Id]);

      // Lookup intention 3
      await lookupPO.lookup({type: 'type3'});
      await expect(lookupPO.getLookedUpIntentionIds()).toEqual([intention3Id]);
    });

    it('should allow to look up intentions by qualifier', async () => {
      const testingAppPO = new TestingAppPO();
      const pagePOs = await testingAppPO.navigateTo({
        registrator: RegisterIntentionsPagePO,
        lookup: LookupIntentionsPagePO,
      }, {queryParams: new Map().set('manifestClassifier', 'blank').set('activatorApiDisabled', true)});
      const registratorPO = pagePOs.get<RegisterIntentionsPagePO>('registrator');
      const lookupPO = pagePOs.get<LookupIntentionsPagePO>('lookup');

      // Register intentions
      const intention1Id = await registratorPO.registerIntention({type: 'type1', qualifier: {key: 'a'}});
      const intention2Id = await registratorPO.registerIntention({type: 'type2', qualifier: {key: 'b'}});
      const intention3Id = await registratorPO.registerIntention({type: 'type3', qualifier: {key: 'c'}});

      // Lookup intention 1
      await lookupPO.lookup({qualifier: {key: 'a'}});
      await expect(lookupPO.getLookedUpIntentionIds()).toEqual([intention1Id]);

      // Lookup intention 2
      await lookupPO.lookup({qualifier: {key: 'b'}});
      await expect(lookupPO.getLookedUpIntentionIds()).toEqual([intention2Id]);

      // Lookup intention 3
      await lookupPO.lookup({qualifier: {key: 'c'}});
      await expect(lookupPO.getLookedUpIntentionIds()).toEqual([intention3Id]);
    });

    it('should allow to look up intentions by type and qualifier', async () => {
      const testingAppPO = new TestingAppPO();
      const pagePOs = await testingAppPO.navigateTo({
        registrator: RegisterIntentionsPagePO,
        lookup: LookupIntentionsPagePO,
      }, {queryParams: new Map().set('manifestClassifier', 'blank').set('activatorApiDisabled', true)});
      const registratorPO = pagePOs.get<RegisterIntentionsPagePO>('registrator');
      const lookupPO = pagePOs.get<LookupIntentionsPagePO>('lookup');

      // Register intentions
      const intention1Id = await registratorPO.registerIntention({type: 'type1', qualifier: {key: 'a'}});
      const intention2Id = await registratorPO.registerIntention({type: 'type2', qualifier: {key: 'b'}});
      const intention3Id = await registratorPO.registerIntention({type: 'type3', qualifier: {key: 'c'}});
      const intention4Id = await registratorPO.registerIntention({type: 'type1', qualifier: {key: 'd'}});
      const intention5Id = await registratorPO.registerIntention({type: 'type2', qualifier: {key: 'e'}});
      const intention6Id = await registratorPO.registerIntention({type: 'type3', qualifier: {key: 'f'}});

      // Lookup intention 1
      await lookupPO.lookup({type: 'type1', qualifier: {key: 'a'}});
      await expect(lookupPO.getLookedUpIntentionIds()).toEqual([intention1Id]);

      // Lookup intention 2
      await lookupPO.lookup({type: 'type2', qualifier: {key: 'b'}});
      await expect(lookupPO.getLookedUpIntentionIds()).toEqual([intention2Id]);

      // Lookup intention 3
      await lookupPO.lookup({type: 'type3', qualifier: {key: 'c'}});
      await expect(lookupPO.getLookedUpIntentionIds()).toEqual([intention3Id]);

      // Lookup intention 4
      await lookupPO.lookup({type: 'type1', qualifier: {key: 'd'}});
      await expect(lookupPO.getLookedUpIntentionIds()).toEqual([intention4Id]);

      // Lookup intention 5
      await lookupPO.lookup({type: 'type2', qualifier: {key: 'e'}});
      await expect(lookupPO.getLookedUpIntentionIds()).toEqual([intention5Id]);

      // Lookup intention 6
      await lookupPO.lookup({type: 'type3', qualifier: {key: 'f'}});
      await expect(lookupPO.getLookedUpIntentionIds()).toEqual([intention6Id]);
    });

    it('should allow to look up intentions from other apps', async () => {
      const testingAppPO = new TestingAppPO();
      const pagePOs = await testingAppPO.navigateTo({
        registrator_app1: {useClass: RegisterIntentionsPagePO, origin: TestingAppOrigins.APP_1},
        lookup_app2: {useClass: LookupIntentionsPagePO, origin: TestingAppOrigins.APP_2},
      }, {queryParams: new Map().set('manifestClassifier', 'blank').set('activatorApiDisabled', true)});
      const registratorApp1PO = pagePOs.get<RegisterIntentionsPagePO>('registrator_app1');
      const lookupApp2PO = pagePOs.get<LookupIntentionsPagePO>('lookup_app2');

      // Register an intention in 'app-1'
      const intentionApp1Id = await registratorApp1PO.registerIntention({type: 'type', qualifier: {key: 'value'}});

      // Lookup the intention from 'app-2'
      await lookupApp2PO.lookup();
      await expect(lookupApp2PO.getLookedUpIntentionIds()).toEqual([intentionApp1Id]);

      await lookupApp2PO.lookup({appSymbolicName: 'app-1'});
      await expect(lookupApp2PO.getLookedUpIntentionIds()).toEqual([intentionApp1Id]);
    });

    it('should allow observing intentions', async () => {
      const testingAppPO = new TestingAppPO();
      const pagePOs = await testingAppPO.navigateTo({
        registrator: RegisterIntentionsPagePO,
        lookup: LookupIntentionsPagePO,
      }, {queryParams: new Map().set('manifestClassifier', 'blank').set('activatorApiDisabled', true)});
      const registratorPO = pagePOs.get<RegisterIntentionsPagePO>('registrator');
      const lookupPO = pagePOs.get<LookupIntentionsPagePO>('lookup');
      await lookupPO.lookup(); // do a single lookup

      // Register a intention
      const intention1Id = await registratorPO.registerIntention({type: 'type1', qualifier: {key: 'a'}});
      await expect(lookupPO.getLookedUpIntentionIds()).toEqual([intention1Id]);

      // Register a intention
      const intention2Id = await registratorPO.registerIntention({type: 'type2', qualifier: {key: 'b'}});
      await expect(lookupPO.getLookedUpIntentionIds()).toEqual(jasmine.arrayWithExactContents([intention1Id, intention2Id]));

      // Register a intention
      const intention3Id = await registratorPO.registerIntention({type: 'type3', qualifier: {key: 'c'}});
      await expect(lookupPO.getLookedUpIntentionIds()).toEqual(jasmine.arrayWithExactContents([intention1Id, intention2Id, intention3Id]));

      // Unregister a intention3Id
      await registratorPO.unregisterIntentions({id: intention3Id});
      await expect(lookupPO.getLookedUpIntentionIds()).toEqual(jasmine.arrayWithExactContents([intention1Id, intention2Id]));

      // Unregister a intention2Id
      await registratorPO.unregisterIntentions({id: intention2Id});
      await expect(lookupPO.getLookedUpIntentionIds()).toEqual([intention1Id]);

      // Unregister a intention1Id
      await registratorPO.unregisterIntentions({id: intention1Id});
      await expect(lookupPO.getLookedUpIntentionIds()).toEqual([]);
    });
  });
});

