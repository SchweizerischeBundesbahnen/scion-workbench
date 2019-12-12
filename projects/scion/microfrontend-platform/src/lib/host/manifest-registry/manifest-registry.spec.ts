// /*
//  * Copyright (c) 2018-2019 Swiss Federal Railways
//  *
//  * This program and the accompanying materials are made
//  * available under the terms of the Eclipse Public License 2.0
//  * which is available at https://www.eclipse.org/legal/epl-2.0/
//  *
//  *  SPDX-License-Identifier: EPL-2.0
//  */
//
// describe('ManifestRegistry', () => { // TODO refactor tests; test over message bus or implement as e2e Protractor tests
//
//   beforeEach(async () => {
//     await MicrofrontendPlatform.destroy();
//     await MicrofrontendPlatform.startPlatform(() => {
//       Beans.register(PlatformMessageClient, {useClass: NullMessageClient});
//     });
//   });
//
//   afterEach(async () => await MicrofrontendPlatform.destroy());
//
//   describe('get capability provider by id', () => {
//     it('should return provider of given id', async () => {
//       const manifestRegistry = new ManifestRegistry();
//       const providerId = manifestRegistry.registerCapabilityProvider('app', {type: 'type'});
//
//       const result = toPromise(manifestRegistry.getCapabilityProvider$(providerId).pipe(map(provider => provider.metadata.id)));
//
//       await expectAsync(result).toBeResolvedTo(providerId);
//     });
//
//     it('should return undefined when provider is deleted', async () => {
//       const manifestRegistry = new ManifestRegistry();
//       const providerId = manifestRegistry.registerCapabilityProvider('app', {type: 'type'});
//
//       const result = toPromise(manifestRegistry.getCapabilityProvider$(providerId), {take: 2});
//       manifestRegistry.unregisterCapabilityProvider('app', {type: 'type', qualifier: {}});
//
//       await expectAsync(result).toBeResolvedTo(undefined);
//     });
//   });
//
//   describe('get providers by type', () => {
//
//     it('should return providers without qualifier', async () => {
//       const manifestRegistry = new ManifestRegistry();
//       const providerId = manifestRegistry.registerCapabilityProvider('app', {type: 'type'});
//       manifestRegistry.registerCapabilityProvider('app', {type: 'type', qualifier: {entity: '*'}});
//
//       const result = toPromise(manifestRegistry.getCapabilityProvidersByType$('type').pipe(pluckArray(provider => provider.metadata.id)));
//       await expectAsync(result).toBeResolvedTo([providerId]);
//     });
//
//     it('should return providers matching the given qualifier', async () => {
//       const manifestRegistry = new ManifestRegistry();
//       manifestRegistry.registerCapabilityProvider('app', {type: 'type'});
//       const providerId = manifestRegistry.registerCapabilityProvider('app', {type: 'type', qualifier: {entity: '*'}});
//
//       const result = toPromise(manifestRegistry.getCapabilityProvidersByType$('type', {entity: 'person'}).pipe(pluckArray(provider => provider.metadata.id)));
//
//       await expectAsync(result).toBeResolvedTo([providerId]);
//     });
//
//     it('should return providers after adding new provider', async () => {
//       const manifestRegistry = new ManifestRegistry();
//
//       const result = toPromise(manifestRegistry.getCapabilityProvidersByType$('type', {'*': '*'}).pipe(pluckArray(provider => provider.metadata.id)), {take: 3});
//       const provider1Id = manifestRegistry.registerCapabilityProvider('app', {type: 'type', qualifier: {}});
//       const provider2Id = manifestRegistry.registerCapabilityProvider('app', {type: 'type', qualifier: {entity: '*'}});
//
//       await expectAsync(result).toBeResolvedTo([provider1Id, provider2Id]);
//     });
//
//     it('should return providers after removing provider', async () => {
//       const manifestRegistry = new ManifestRegistry();
//       manifestRegistry.registerCapabilityProvider('app', {type: 'type'});
//
//       const result = toPromise(manifestRegistry.getCapabilityProvidersByType$('type'), {take: 2});
//       manifestRegistry.unregisterCapabilityProvider('app', {type: 'type', qualifier: {}});
//
//       await expectAsync(result).toBeResolvedTo([]);
//     });
//   });
//
//   describe('get providers by application', () => {
//
//     it('should return providers without qualifier', async () => {
//       const manifestRegistry = new ManifestRegistry();
//       const providerId = manifestRegistry.registerCapabilityProvider('app', {type: 'type'});
//       manifestRegistry.registerCapabilityProvider('app', {type: 'type', qualifier: {entity: '*'}});
//
//       const result = toPromise(manifestRegistry.getCapabilityProvidersByApplication$('app').pipe(pluckArray(provider => provider.metadata.id)));
//
//       await expectAsync(result).toBeResolvedTo([providerId]);
//     });
//
//     it('should return providers matching the given qualifier', async () => {
//       const manifestRegistry = new ManifestRegistry();
//       manifestRegistry.registerCapabilityProvider('app', {type: 'type'});
//       const providerId = manifestRegistry.registerCapabilityProvider('app', {type: 'type', qualifier: {entity: '*'}});
//
//       const result = toPromise(manifestRegistry.getCapabilityProvidersByApplication$('app', {entity: 'person'}).pipe(pluckArray(provider => provider.metadata.id)));
//
//       await expectAsync(result).toBeResolvedTo([providerId]);
//     });
//
//     it('should return providers after adding new provider', async () => {
//       const manifestRegistry = new ManifestRegistry();
//
//       const result = toPromise(manifestRegistry.getCapabilityProvidersByApplication$('app', {'*': '*'}).pipe(pluckArray(provider => provider.metadata.id)), {take: 3});
//       const provider1Id = manifestRegistry.registerCapabilityProvider('app', {type: 'type', qualifier: {}});
//       const provider2Id = manifestRegistry.registerCapabilityProvider('app', {type: 'type', qualifier: {entity: '*'}});
//
//       await expectAsync(result).toBeResolvedTo([provider1Id, provider2Id]);
//     });
//
//     it('should return providers after removing provider', async () => {
//       const manifestRegistry = new ManifestRegistry();
//       manifestRegistry.registerCapabilityProvider('app', {type: 'type'});
//
//       const result = toPromise(manifestRegistry.getCapabilityProvidersByApplication$('app'), {take: 2});
//       manifestRegistry.unregisterCapabilityProvider('app', {type: 'type', qualifier: {}});
//
//       await expectAsync(result).toBeResolvedTo([]);
//     });
//   });
//
//   describe('get providers matching intent', () => {
//
//     it('should return providers with empty qualifier', () => {
//       const manifestRegistry = new ManifestRegistry();
//       const providerId = manifestRegistry.registerCapabilityProvider('app', {type: 'type'});
//       manifestRegistry.registerCapabilityProvider('app', {type: 'type', qualifier: {entity: '*'}});
//
//       const applicationRegistrySpy = jasmine.createSpyObj(ApplicationRegistry.name, ['isScopeCheckDisabled']);
//       applicationRegistrySpy.isScopeCheckDisabled.and.returnValue(false);
//       Beans.register(ApplicationRegistry, {useValue: applicationRegistrySpy});
//
//       const result = manifestRegistry.getCapabilityProvidersByIntent('app', {type: 'type', qualifier: {}}).map(provider => provider.metadata.id);
//
//       expect(result).toEqual([providerId]);
//     });
//
//     it('should return providers matching the given qualifier', () => {
//       const manifestRegistry = new ManifestRegistry();
//       manifestRegistry.registerCapabilityProvider('app', {type: 'type'});
//       const providerId = manifestRegistry.registerCapabilityProvider('app', {type: 'type', qualifier: {entity: '*'}});
//
//       const applicationRegistrySpy = jasmine.createSpyObj(ApplicationRegistry.name, ['isScopeCheckDisabled']);
//       applicationRegistrySpy.isScopeCheckDisabled.and.returnValue(false);
//       Beans.register(ApplicationRegistry, {useValue: applicationRegistrySpy});
//
//       const result = manifestRegistry.getCapabilityProvidersByIntent('app', {type: 'type', qualifier: {entity: 'person'}}).map(provider => provider.metadata.id);
//
//       expect(result).toEqual([providerId]);
//     });
//
//     it('should return public providers of other application', () => {
//       const manifestRegistry = new ManifestRegistry();
//       const provider1Id = manifestRegistry.registerCapabilityProvider('app1', {type: 'type', private: false});
//       const provider2Id = manifestRegistry.registerCapabilityProvider('app2', {type: 'type', private: false});
//
//       const applicationRegistrySpy = jasmine.createSpyObj(ApplicationRegistry.name, ['isScopeCheckDisabled']);
//       applicationRegistrySpy.isScopeCheckDisabled.withArgs('app3').and.returnValue(false);
//       Beans.register(ApplicationRegistry, {useValue: applicationRegistrySpy});
//
//       const result = manifestRegistry.getCapabilityProvidersByIntent('app3', {type: 'type', qualifier: {}}).map(provider => provider.metadata.id);
//
//       expect(result).toEqual([provider1Id, provider2Id]);
//     });
//
//     it('should not return private providers', () => {
//       const manifestRegistry = new ManifestRegistry();
//       manifestRegistry.registerCapabilityProvider('app1', {type: 'type', private: true});
//       manifestRegistry.registerCapabilityProvider('app2', {type: 'type', private: true});
//
//       const applicationRegistrySpy = jasmine.createSpyObj(ApplicationRegistry.name, ['isScopeCheckDisabled']);
//       applicationRegistrySpy.isScopeCheckDisabled.withArgs('app3').and.returnValue(false);
//       Beans.register(ApplicationRegistry, {useValue: applicationRegistrySpy});
//
//       const result = manifestRegistry.getCapabilityProvidersByIntent('app3', {type: 'type', qualifier: {}});
//
//       expect(result).toEqual([]);
//     });
//
//     it('should return private providers if scope check disabled', () => {
//       const manifestRegistry = new ManifestRegistry();
//       const provider1Id = manifestRegistry.registerCapabilityProvider('app1', {type: 'type', private: true});
//       const provider2Id = manifestRegistry.registerCapabilityProvider('app2', {type: 'type', private: true});
//
//       const applicationRegistrySpy = jasmine.createSpyObj(ApplicationRegistry.name, ['isScopeCheckDisabled']);
//       applicationRegistrySpy.isScopeCheckDisabled.withArgs('app3').and.returnValue(true);
//       Beans.register(ApplicationRegistry, {useValue: applicationRegistrySpy});
//
//       const result = manifestRegistry.getCapabilityProvidersByIntent('app3', {type: 'type', qualifier: {}}).map(provider => provider.metadata.id);
//
//       expect(result).toEqual([provider1Id, provider2Id]);
//     });
//   });
//
//   describe('get intent by id', () => {
//     it('should return intent of given id', async () => {
//       const manifestRegistry = new ManifestRegistry();
//       const intentId = manifestRegistry.registerIntention('app', {type: 'type'});
//
//       const result = toPromise(manifestRegistry.getIntention$(intentId).pipe(map(intent => intent.metadata.id)));
//
//       await expectAsync(result).toBeResolvedTo(intentId);
//     });
//
//     it('should return undefined when intent is deleted', async () => {
//       const manifestRegistry = new ManifestRegistry();
//       const intentId = manifestRegistry.registerIntention('app', {type: 'type'});
//
//       const result = toPromise(manifestRegistry.getIntention$(intentId), {take: 2});
//       manifestRegistry.unregisterIntention('app', {type: 'type', qualifier: {}});
//
//       await expectAsync(result).toBeResolvedTo(undefined);
//     });
//   });
//
//   describe('get intents by application', () => {
//
//     it('should return intents without qualifier', async () => {
//       const manifestRegistry = new ManifestRegistry();
//       const intentId = manifestRegistry.registerIntention('app', {type: 'type'});
//       manifestRegistry.registerIntention('app', {type: 'type', qualifier: {entity: '*'}});
//
//       const result = toPromise(manifestRegistry.getIntentionsByApplication$('app', {}).pipe(pluckArray(intent => intent.metadata.id)));
//
//       await expectAsync(result).toBeResolvedTo([intentId]);
//     });
//
//     it('should return intents matching the given qualifier', async () => {
//       const manifestRegistry = new ManifestRegistry();
//       manifestRegistry.registerIntention('app', {type: 'type'});
//       const intentId = manifestRegistry.registerIntention('app', {type: 'type', qualifier: {entity: '*'}});
//
//       const result = toPromise(manifestRegistry.getIntentionsByApplication$('app', {entity: 'person'}).pipe(pluckArray(intent => intent.metadata.id)));
//
//       await expectAsync(result).toBeResolvedTo([intentId]);
//     });
//
//     it('should return intents after adding new intent', async () => {
//       const manifestRegistry = new ManifestRegistry();
//
//       const result = toPromise(manifestRegistry.getIntentionsByApplication$('app', {'*': '*'}).pipe(pluckArray(intent => intent.metadata.id)), {take: 3});
//       const intent1Id = manifestRegistry.registerIntention('app', {type: 'type', qualifier: {}});
//       const intent2Id = manifestRegistry.registerIntention('app', {type: 'type', qualifier: {entity: '*'}});
//
//       await expectAsync(result).toBeResolvedTo([intent1Id, intent2Id]);
//     });
//
//     it('should return intents after removing intent', async () => {
//       const manifestRegistry = new ManifestRegistry();
//       manifestRegistry.registerIntention('app', {type: 'type'});
//
//       const result = toPromise(manifestRegistry.getIntentionsByApplication$('app', {}), {take: 2});
//       manifestRegistry.unregisterIntention('app', {type: 'type', qualifier: {}});
//
//       await expectAsync(result).toBeResolvedTo([]);
//     });
//   });
//
//   describe('check if application has registered intent', () => {
//
//     it('should return true when specific qualifier matches', () => {
//       const manifestRegistry = new ManifestRegistry();
//       manifestRegistry.registerIntention('app', {type: 'type'});
//       manifestRegistry.registerIntention('app', {type: 'type', qualifier: {entity: '*'}});
//
//       expect(manifestRegistry.hasIntention('app', {type: 'type', qualifier: {}})).toBeTruthy();
//       expect(manifestRegistry.hasIntention('app', {type: 'type', qualifier: {entity: 'person'}})).toBeTruthy();
//     });
//
//     it('should return false for `AnyQualifier`', () => {
//       const manifestRegistry = new ManifestRegistry();
//       manifestRegistry.registerIntention('app', {type: 'type'});
//       manifestRegistry.registerIntention('app', {type: 'type', qualifier: {entity: '*'}});
//
//       expect(manifestRegistry.hasIntention('app', {type: 'type', qualifier: {'*': '*'}})).toBeFalsy();
//     });
//
//     it('should return false for non-matching specific qualifier', () => {
//       const manifestRegistry = new ManifestRegistry();
//       manifestRegistry.registerIntention('app', {type: 'type'});
//       manifestRegistry.registerIntention('app', {type: 'type', qualifier: {entity: '*'}});
//
//       expect(manifestRegistry.hasIntention('app', {type: 'type', qualifier: {type: 'user'}})).toBeFalsy();
//     });
//   });
//
//   describe('check registration and unregistration of providers', () => {
//
//     it('should add implicit intent on provider registration', async () => {
//       const manifestRegistry = new ManifestRegistry();
//       const provider1 = {type: 'type', qualifier: {}};
//       const provider2 = {type: 'type', qualifier: {entity: '*'}};
//
//       const provider1Id = manifestRegistry.registerCapabilityProvider('app', provider1);
//       const provider2Id = manifestRegistry.registerCapabilityProvider('app', provider2);
//       const providerResult = toPromise(manifestRegistry.getCapabilityProvidersByType$('type', {'*': '*'}).pipe(pluckArray(provider => provider.metadata.id)));
//       const intentResult = await toPromise(manifestRegistry.getIntentionsByApplication$('app', {'*': '*'}));
//
//       await expectAsync(providerResult).toBeResolvedTo([provider1Id, provider2Id]);
//       expect(intentResult.length).toBe(2);
//       expect(intentResult[0]).toEqual(jasmine.objectContaining(provider1));
//       expect(intentResult[1]).toEqual(jasmine.objectContaining(provider2));
//     });
//
//     it('should unregister implicit intents on provider unregistration', async () => {
//       const manifestRegistry = new ManifestRegistry();
//       manifestRegistry.registerCapabilityProvider('app', {type: 'type'});
//
//       manifestRegistry.unregisterCapabilityProvider('app', {type: 'type', qualifier: {}});
//       const providerResult = toPromise(manifestRegistry.getCapabilityProvidersByType$('type', {'*': '*'}));
//       const intentResult = toPromise(manifestRegistry.getIntentionsByApplication$('app', {'*': '*'}));
//
//       await expectAsync(providerResult).toBeResolvedTo([]);
//       await expectAsync(intentResult).toBeResolvedTo([]);
//     });
//
//     it('should not unregister non-implicit intents on provider unregistration', async () => {
//       const manifestRegistry = new ManifestRegistry();
//       manifestRegistry.registerCapabilityProvider('app', {type: 'type'});
//       const intentId = manifestRegistry.registerIntention('app', {type: 'type'});
//
//       manifestRegistry.unregisterCapabilityProvider('app', {type: 'type', qualifier: {}});
//       const providerResult = toPromise(manifestRegistry.getCapabilityProvidersByType$('type', {'*': '*'}));
//       const intentResult = toPromise(manifestRegistry.getIntentionsByApplication$('app', {'*': '*'}).pipe(pluckArray(intent => intent.metadata.id)));
//
//       await expectAsync(providerResult).toBeResolvedTo([]);
//       await expectAsync(intentResult).toBeResolvedTo([intentId]);
//     });
//   });
// });
//
// function toPromise<T>(observable$: Observable<T>, options?: { take: number }): Promise<T> {
//   const _take = options ? options.take : 1;
//   return observable$.pipe(take(_take)).toPromise();
// }
