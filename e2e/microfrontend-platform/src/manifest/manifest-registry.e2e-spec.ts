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
      });
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
      });
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
      });
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
      });
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
      });
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
        registrator_4201: {useClass: RegisterCapabilityProvidersPagePO, origin: TestingAppOrigins.LOCALHOST_4201},
        registrator_4202: {useClass: RegisterCapabilityProvidersPagePO, origin: TestingAppOrigins.LOCALHOST_4202},
        lookup_4201: {useClass: LookupCapabilityProvidersPagePO, origin: TestingAppOrigins.LOCALHOST_4201},
        lookup_4202: {useClass: LookupCapabilityProvidersPagePO, origin: TestingAppOrigins.LOCALHOST_4202},
      });
      const registrator4201PO = pagePOs.get<RegisterCapabilityProvidersPagePO>('registrator_4201');
      const registrator4202PO = pagePOs.get<RegisterCapabilityProvidersPagePO>('registrator_4202');
      const lookup4201PO = pagePOs.get<LookupCapabilityProvidersPagePO>('lookup_4201');
      const lookup4202PO = pagePOs.get<LookupCapabilityProvidersPagePO>('lookup_4202');

      // Register providers
      const provider4201Id = await registrator4201PO.registerProvider({type: 'type', qualifier: {key: 'value'}, private: false});
      const provider4202Id = await registrator4202PO.registerProvider({type: 'type', qualifier: {key: 'value'}, private: false});

      await lookup4201PO.lookup();
      await expect(lookup4201PO.getLookedUpProviderIds()).toEqual([provider4201Id]);
      await lookup4202PO.lookup();
      await expect(lookup4202PO.getLookedUpProviderIds()).toEqual([provider4202Id]);

      // Unregister the provider in 'app-4201'
      await registrator4201PO.unregisterProvider({type: 'type', qualifier: {key: 'value'}});
      await registrator4201PO.unregisterProvider({type: 'type', qualifier: {key: 'value'}, appSymbolicName: 'app-4201'});
      await registrator4201PO.unregisterProvider({type: 'type', qualifier: {key: 'value'}, appSymbolicName: 'app-4202'});
      await expect(lookup4201PO.getLookedUpProviderIds()).toEqual([]);
      await expect(lookup4202PO.getLookedUpProviderIds()).toEqual([provider4202Id]);

      // Unregister the provider in 'app-4202'
      await registrator4202PO.unregisterProvider({type: 'type', qualifier: {key: 'value'}});
      await registrator4202PO.unregisterProvider({type: 'type', qualifier: {key: 'value'}, appSymbolicName: 'app-4201'});
      await registrator4202PO.unregisterProvider({type: 'type', qualifier: {key: 'value'}, appSymbolicName: 'app-4202'});
      await expect(lookup4201PO.getLookedUpProviderIds()).toEqual([]);
      await expect(lookup4202PO.getLookedUpProviderIds()).toEqual([]);
    });
  });

  describe('Lookup capability providers', () => {

    it('should allow to look up capabilities of the requesting application', async () => {
      const testingAppPO = new TestingAppPO();
      const pagePOs = await testingAppPO.navigateTo({
        registrator_4200: {useClass: RegisterCapabilityProvidersPagePO, origin: TestingAppOrigins.LOCALHOST_4200},
        registrator_4201: {useClass: RegisterCapabilityProvidersPagePO, origin: TestingAppOrigins.LOCALHOST_4202},
        lookup_4200: {useClass: LookupCapabilityProvidersPagePO, origin: TestingAppOrigins.LOCALHOST_4200},
      });
      const registrator4200PO = pagePOs.get<RegisterCapabilityProvidersPagePO>('registrator_4200');
      const registrator4201PO = pagePOs.get<RegisterCapabilityProvidersPagePO>('registrator_4201');
      const lookup4200PO = pagePOs.get<LookupCapabilityProvidersPagePO>('lookup_4200');

      // Register providers in 'app-4200'
      const provider1Id = await registrator4200PO.registerProvider({type: 'type1', qualifier: {key: 'a'}, private: false});
      const provider2Id = await registrator4200PO.registerProvider({type: 'type1', qualifier: {key: 'b'}, private: false});
      const provider3Id = await registrator4200PO.registerProvider({type: 'type1', qualifier: {key: 'c'}, private: false});

      // Register providers in 'app-4201'
      await registrator4201PO.registerProvider({type: 'type2', qualifier: {key: 'a'}, private: false});
      await registrator4201PO.registerProvider({type: 'type2', qualifier: {key: 'b'}, private: false});
      await registrator4201PO.registerProvider({type: 'type2', qualifier: {key: 'c'}, private: false});

      // Verify the lookup when setting the app explicitly via filter
      await lookup4200PO.lookup({appSymbolicName: 'app-4200'});
      await expect(lookup4200PO.getLookedUpProviderIds()).toEqual(jasmine.arrayWithExactContents([provider1Id, provider2Id, provider3Id]));
    });

    it('should allow to look up capabilities by id', async () => {
      const testingAppPO = new TestingAppPO();
      const pagePOs = await testingAppPO.navigateTo({
        registrator: RegisterCapabilityProvidersPagePO,
        lookup: LookupCapabilityProvidersPagePO,
      });
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
      });
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
      });
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
      });
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
        providerRegistrator_4200: {useClass: RegisterCapabilityProvidersPagePO, origin: TestingAppOrigins.LOCALHOST_4200},
        intentionRegistrator_4201: {useClass: RegisterIntentionsPagePO, origin: TestingAppOrigins.LOCALHOST_4201},
        lookup_4201: {useClass: LookupCapabilityProvidersPagePO, origin: TestingAppOrigins.LOCALHOST_4201},
      });
      const providerRegistrator4200PO = pagePOs.get<RegisterCapabilityProvidersPagePO>('providerRegistrator_4200');
      const intentionRegistrator4201PO = pagePOs.get<RegisterIntentionsPagePO>('intentionRegistrator_4201');
      const lookup4201PO = pagePOs.get<LookupCapabilityProvidersPagePO>('lookup_4201');

      // Register a public provider in 'app-4200'
      const publicProvider4200Id = await providerRegistrator4200PO.registerProvider({type: 'type', qualifier: {key: 'value'}, private: false});

      // Register the intention in 'app-4201' for that capability
      await intentionRegistrator4201PO.registerIntention({type: 'type', qualifier: {key: 'value'}});

      // Lookup the provider from 'app-4201'
      await lookup4201PO.lookup();
      await expect(lookup4201PO.getLookedUpProviderIds()).toEqual([publicProvider4200Id]);

      await lookup4201PO.lookup({appSymbolicName: 'app-4200'});
      await expect(lookup4201PO.getLookedUpProviderIds()).toEqual([publicProvider4200Id]);
    });

    it('should not allow to look up private capabilities from other apps for which the requesting app has declared an intention', async () => {
      const testingAppPO = new TestingAppPO();
      const pagePOs = await testingAppPO.navigateTo({
        providerRegistrator_4200: {useClass: RegisterCapabilityProvidersPagePO, origin: TestingAppOrigins.LOCALHOST_4200},
        intentionRegistrator_4201: {useClass: RegisterIntentionsPagePO, origin: TestingAppOrigins.LOCALHOST_4201},
        lookup_4201: {useClass: LookupCapabilityProvidersPagePO, origin: TestingAppOrigins.LOCALHOST_4201},
      });
      const providerRegistrator4200PO = pagePOs.get<RegisterCapabilityProvidersPagePO>('providerRegistrator_4200');
      const intentionRegistrator4201PO = pagePOs.get<RegisterIntentionsPagePO>('intentionRegistrator_4201');
      const lookup4201PO = pagePOs.get<LookupCapabilityProvidersPagePO>('lookup_4201');

      // Register a private provider in 'app-4200'
      await providerRegistrator4200PO.registerProvider({type: 'type', qualifier: {key: 'value'}, private: true});

      // Register the intention in 'app-4201' for that capability
      await intentionRegistrator4201PO.registerIntention({type: 'type', qualifier: {key: 'value'}});

      // Lookup the provider from 'app-4201'
      await lookup4201PO.lookup();
      await expect(lookup4201PO.getLookedUpProviderIds()).toEqual([]);
    });

    it('should not allow to look up public capabilities from other apps for which the requesting app has not declared an intention', async () => {
      const testingAppPO = new TestingAppPO();
      const pagePOs = await testingAppPO.navigateTo({
        providerRegistrator_4200: {useClass: RegisterCapabilityProvidersPagePO, origin: TestingAppOrigins.LOCALHOST_4200},
        lookup_4201: {useClass: LookupCapabilityProvidersPagePO, origin: TestingAppOrigins.LOCALHOST_4201},
      });
      const providerRegistrator4200PO = pagePOs.get<RegisterCapabilityProvidersPagePO>('providerRegistrator_4200');
      const lookup4201PO = pagePOs.get<LookupCapabilityProvidersPagePO>('lookup_4201');

      // Register a public provider in 'app-4200'
      await providerRegistrator4200PO.registerProvider({type: 'type', qualifier: {key: 'value'}, private: false});

      // Lookup the provider from 'app-4201'
      await lookup4201PO.lookup();
      await expect(lookup4201PO.getLookedUpProviderIds()).toEqual([]);
    });

    it('should allow observing capabilities', async () => {
      const testingAppPO = new TestingAppPO();
      const pagePOs = await testingAppPO.navigateTo({
        registrator: RegisterCapabilityProvidersPagePO,
        lookup: LookupCapabilityProvidersPagePO,
      });
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
        registrator: {useClass: RegisterIntentionsPagePO, origin: TestingAppOrigins.LOCALHOST_4202},
        lookup: {useClass: LookupIntentionsPagePO, origin: TestingAppOrigins.LOCALHOST_4202},
      });
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
        registrator: {useClass: RegisterIntentionsPagePO, origin: TestingAppOrigins.LOCALHOST_4203},
      }, {queryParams: new Map().set('intentionRegisterApiDisabled', 'app-4203')});
      const registratorPO = pagePOs.get<RegisterIntentionsPagePO>('registrator');

      // Try to register the intention
      await expectToBeRejectedWithError(registratorPO.registerIntention({type: 'type', qualifier: {key: 'value'}}), /IntentionRegisterError/);
    });
  });

  describe('Unregister intentions', () => {

    it('should not allow to unregister an intention if the API to manage intentions is disabled for the requesting application', async () => {
      const testingAppPO = new TestingAppPO();
      const pagePOs = await testingAppPO.navigateTo({
        registrator: {useClass: RegisterIntentionsPagePO, origin: TestingAppOrigins.LOCALHOST_4203},
      }, {queryParams: new Map().set('intentionRegisterApiDisabled', 'app-4203')});
      const registratorPO = pagePOs.get<RegisterIntentionsPagePO>('registrator');

      // Try to unregister an intention
      await expectToBeRejectedWithError(registratorPO.unregisterIntentions({type: 'type', qualifier: {key: 'value'}}), /IntentionRegisterError/);
    });

    it('should allow to unregister an intention by id', async () => {
      const testingAppPO = new TestingAppPO();
      const pagePOs = await testingAppPO.navigateTo({
        registrator: RegisterIntentionsPagePO,
        lookup: LookupIntentionsPagePO,
      });
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
      });
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
      });
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
      });
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
        registrator_4201: {useClass: RegisterIntentionsPagePO, origin: TestingAppOrigins.LOCALHOST_4201},
        registrator_4202: {useClass: RegisterIntentionsPagePO, origin: TestingAppOrigins.LOCALHOST_4202},
        lookup_4201: {useClass: LookupIntentionsPagePO, origin: TestingAppOrigins.LOCALHOST_4201},
        lookup_4202: {useClass: LookupIntentionsPagePO, origin: TestingAppOrigins.LOCALHOST_4202},
      });
      const registrator4201PO = pagePOs.get<RegisterIntentionsPagePO>('registrator_4201');
      const registrator4202PO = pagePOs.get<RegisterIntentionsPagePO>('registrator_4202');
      const lookup4201PO = pagePOs.get<LookupIntentionsPagePO>('lookup_4201');

      // Register intentions
      const intention4201Id = await registrator4201PO.registerIntention({type: 'type', qualifier: {key: 'value'}});
      const intention4202Id = await registrator4202PO.registerIntention({type: 'type', qualifier: {key: 'value'}});

      await lookup4201PO.lookup();
      await expect(lookup4201PO.getLookedUpIntentionIds()).toEqual([intention4201Id, intention4202Id]);

      // Unregister the intention in 'app-4201'
      await registrator4201PO.unregisterIntentions({type: 'type', qualifier: {key: 'value'}});
      await registrator4201PO.unregisterIntentions({type: 'type', qualifier: {key: 'value'}, appSymbolicName: 'app-4201'});
      await registrator4201PO.unregisterIntentions({type: 'type', qualifier: {key: 'value'}, appSymbolicName: 'app-4202'});
      await expect(lookup4201PO.getLookedUpIntentionIds()).toEqual([intention4202Id]);

      // Unregister the intention in 'app-4202'
      await registrator4202PO.unregisterIntentions({type: 'type', qualifier: {key: 'value'}});
      await registrator4202PO.unregisterIntentions({type: 'type', qualifier: {key: 'value'}, appSymbolicName: 'app-4201'});
      await registrator4202PO.unregisterIntentions({type: 'type', qualifier: {key: 'value'}, appSymbolicName: 'app-4202'});
      await expect(lookup4201PO.getLookedUpIntentionIds()).toEqual([]);
      await expect(lookup4201PO.getLookedUpIntentionIds()).toEqual([]);
    });
  });

  describe('Lookup intentions', () => {

    it('should allow to look up intentions of the requesting application', async () => {
      const testingAppPO = new TestingAppPO();
      const pagePOs = await testingAppPO.navigateTo({
        registrator_4200: {useClass: RegisterIntentionsPagePO, origin: TestingAppOrigins.LOCALHOST_4200},
        registrator_4201: {useClass: RegisterIntentionsPagePO, origin: TestingAppOrigins.LOCALHOST_4202},
        lookup_4200: {useClass: LookupIntentionsPagePO, origin: TestingAppOrigins.LOCALHOST_4200},
      });
      const registrator4200PO = pagePOs.get<RegisterIntentionsPagePO>('registrator_4200');
      const registrator4201PO = pagePOs.get<RegisterIntentionsPagePO>('registrator_4201');
      const lookup4200PO = pagePOs.get<LookupIntentionsPagePO>('lookup_4200');

      // Register intentions in 'app-4200'
      const intention1Id = await registrator4200PO.registerIntention({type: 'type1', qualifier: {key: 'a'}});
      const intention2Id = await registrator4200PO.registerIntention({type: 'type1', qualifier: {key: 'b'}});
      const intention3Id = await registrator4200PO.registerIntention({type: 'type1', qualifier: {key: 'c'}});

      // Register intentions in 'app-4201'
      await registrator4201PO.registerIntention({type: 'type2', qualifier: {key: 'a'}});
      await registrator4201PO.registerIntention({type: 'type2', qualifier: {key: 'b'}});
      await registrator4201PO.registerIntention({type: 'type2', qualifier: {key: 'c'}});

      // Verify the lookup when setting the app explicitly via filter
      await lookup4200PO.lookup({appSymbolicName: 'app-4200'});
      await expect(lookup4200PO.getLookedUpIntentionIds()).toEqual(jasmine.arrayWithExactContents([intention1Id, intention2Id, intention3Id]));
    });

    it('should allow to look up intentions by id', async () => {
      const testingAppPO = new TestingAppPO();
      const pagePOs = await testingAppPO.navigateTo({
        registrator: RegisterIntentionsPagePO,
        lookup: LookupIntentionsPagePO,
      });
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
      });
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
      });
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
      });
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
        registrator_4200: {useClass: RegisterIntentionsPagePO, origin: TestingAppOrigins.LOCALHOST_4200},
        lookup_4201: {useClass: LookupIntentionsPagePO, origin: TestingAppOrigins.LOCALHOST_4201},
      });
      const registrator4200PO = pagePOs.get<RegisterIntentionsPagePO>('registrator_4200');
      const lookup4201PO = pagePOs.get<LookupIntentionsPagePO>('lookup_4201');

      // Register an intention in 'app-4200'
      const intention4200Id = await registrator4200PO.registerIntention({type: 'type', qualifier: {key: 'value'}});

      // Lookup the intention from 'app-4201'
      await lookup4201PO.lookup();
      await expect(lookup4201PO.getLookedUpIntentionIds()).toEqual([intention4200Id]);

      await lookup4201PO.lookup({appSymbolicName: 'app-4200'});
      await expect(lookup4201PO.getLookedUpIntentionIds()).toEqual([intention4200Id]);
    });

    it('should allow observing intentions', async () => {
      const testingAppPO = new TestingAppPO();
      const pagePOs = await testingAppPO.navigateTo({
        registrator: RegisterIntentionsPagePO,
        lookup: LookupIntentionsPagePO,
      });
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

