/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { MicrofrontendPlatform } from '../microfrontend-platform';
import { Beans } from '../bean-manager';
import { PlatformMessageClient } from '../host/platform-message-client';
import { first, mapTo, reduce, take, timeoutWith } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { IntentMessage, TopicMessage } from '../messaging.model';
import { MessageClient } from './message-client';
import { Logger } from '../logger';
import { HttpClient } from '../host/http-client';
import { ApplicationManifest } from '../platform.model';
import { ManifestRegistry } from '../host/manifest.registry';
import { ApplicationConfig } from '../host/platform-config';
import { PLATFORM_SYMBOLIC_NAME } from '../host/platform.constants';
import { expectToBeRejectedWithError } from '../spec.util.spec';
import Spy = jasmine.Spy;

describe('PlatformMessageClient and HostAppMessageClient', () => {

  afterEach(() => MicrofrontendPlatform.destroy());

  it('should allow publishing messages to a topic', async () => {
    await MicrofrontendPlatform.forHost([]);

    const message$ = Beans.get(PlatformMessageClient).observe$<string>('some-topic');
    const actual = collectToPromise(message$, {take: 3, timeout: 1000});

    Beans.get(PlatformMessageClient).publish$('some-topic', 'A').subscribe();
    Beans.get(PlatformMessageClient).publish$('some-topic', 'B').subscribe();
    Beans.get(PlatformMessageClient).publish$('some-topic', 'C').subscribe();

    await expectAsync(actual).toBeResolvedTo(['A', 'B', 'C']);
  });

  it('should transport a topic message to both, the platform client and the host client, respectively', async () => {
    const manifestUrl = createManifestURL({name: 'Host Application'});
    const registeredApps: ApplicationConfig[] = [{symbolicName: 'host-app', manifestUrl: manifestUrl}];
    await MicrofrontendPlatform.forHost(registeredApps, {symbolicName: 'host-app'});

    const messagesReceivedByPlatformMessageClient = collectToPromise(Beans.get(PlatformMessageClient).observe$('some-topic'), {take: 2, timeout: 500});
    const messagesReceivedByHostMessageClient = collectToPromise(Beans.get(MessageClient).observe$('some-topic'), {take: 2, timeout: 500});

    await expectAsync(waitUntilSubscriberCount('some-topic', 2, {timeout: 1000})).toBeResolved();
    await Beans.get(PlatformMessageClient).publish$('some-topic', 'A').subscribe();
    await Beans.get(MessageClient).publish$('some-topic', 'B').subscribe();

    await expectAsync(messagesReceivedByPlatformMessageClient).toBeResolvedTo(['A', 'B']);
    await expectAsync(messagesReceivedByHostMessageClient).toBeResolvedTo(['A', 'B']);
  });

  it('should allow receiving replies for a message', async () => {
    await MicrofrontendPlatform.forHost([]);

    Beans.get(PlatformMessageClient).observe$<string>('some-topic').subscribe(msg => {
      Beans.get(PlatformMessageClient).publish$(msg.replyTo, msg.payload.toUpperCase()).subscribe();
    });

    const ping$ = Beans.get(PlatformMessageClient).requestReply$<string>('some-topic', 'ping');
    const actual = collectToPromise(ping$, {take: 1, timeout: 1000});

    await expectAsync(actual).toBeResolvedTo(['PING']);
  });

  it('should reject a client connect attempt if the app is not trusted (not registered)', async () => {
    const manifestUrl = createManifestURL({name: 'Trusted Client'});
    const registeredApps: ApplicationConfig[] = [{symbolicName: 'trusted-client', manifestUrl: manifestUrl}];
    await MicrofrontendPlatform.forHost(registeredApps, {symbolicName: 'untrusted-client'});

    const expected = '[MessageClientConnectError] Client connect attempt rejected by the message broker: Client not registered as trusted application. [app=\'untrusted-client\']';
    await expectAsync(Beans.get(MessageClient).publish$('some-topic').toPromise()).toBeRejectedWith(expected);
  });

  it('should reject a client connect attempt if the app is not trusted (wrong origin)', async () => {
    const loggerSpy = jasmine.createSpyObj(Logger.name, ['error']);
    Beans.register(Logger, {useValue: loggerSpy});

    const manifestUrl = createManifestURL({name: 'Trusted Client'}, {origin: 'http://trusted-origin.com'});
    const registeredApps: ApplicationConfig[] = [{symbolicName: 'client', manifestUrl: manifestUrl}];
    await MicrofrontendPlatform.forHost(registeredApps, {symbolicName: 'client'});
    await expectAsync(waitUntilInvoked(loggerSpy.error, 1000)).toBeResolved('\'Logger.error\' not invoked within 1s');
    await expect(loggerSpy.error.calls.mostRecent().args[0]).toMatch(/\[MessageClientConnectError] Client connect attempt blocked by the message broker: Wrong origin/);
  });

  it('should log an error if the message broker cannot be discovered', async () => {
    const loggerSpy = jasmine.createSpyObj(Logger.name, ['error']);
    Beans.register(Logger, {useValue: loggerSpy});

    await MicrofrontendPlatform.forClient({symbolicName: 'client-app', messaging: {brokerDiscoverTimeout: 250}});
    await expectAsync(waitUntilInvoked(loggerSpy.error, 1000)).toBeResolved();
    await expect(loggerSpy.error).toHaveBeenCalledWith('[BrokerDiscoverTimeoutError] Message broker not discovered within the 250ms timeout. Messages cannot be published or received.');
  });

  it('should throw an error when publishing a message and if the message broker is not discovered', async () => {
    await MicrofrontendPlatform.forClient({symbolicName: 'client-app', messaging: {brokerDiscoverTimeout: 250}});
    await expectToBeRejectedWithError(Beans.get(MessageClient).publish$('some-topic').toPromise(), /BrokerDiscoverTimeoutError/);
  });

  describe('should maintain separate registries for the platform and the host client app', () => {

    it('should dispatch an intent only to the platform message client', async () => {
      const manifestUrl = createManifestURL({name: 'Host Application'});
      const registeredApps: ApplicationConfig[] = [{symbolicName: 'host-app', manifestUrl: manifestUrl}];
      await MicrofrontendPlatform.forHost(registeredApps, {symbolicName: 'host-app', messaging: {brokerDiscoverTimeout: 250}});

      // Register a platform capability. Intents should not be received by the host-app message client.
      Beans.get(ManifestRegistry).registerCapability(PLATFORM_SYMBOLIC_NAME, [{type: 'some-platform-capability'}]);
      const intentsReceivedByPlatformMessageClient = collectToPromise(Beans.get(PlatformMessageClient).observe$(), {take: 1, timeout: 500});
      const intentsReceivedByHostMessageClient = collectToPromise(Beans.get(MessageClient).observe$(), {take: 1, timeout: 500});

      // Issue the intent via platform message client.
      await Beans.get(PlatformMessageClient).publish$({type: 'some-platform-capability'}).subscribe();

      // Verify host-app message client not receiving the intent.
      await expectAsync(intentsReceivedByPlatformMessageClient).toBeResolved();
      await expectAsync(intentsReceivedByHostMessageClient).toBeRejected();

      // Verify host-app message client not allowed to issue the intent.
      await expectToBeRejectedWithError(Beans.get(MessageClient).publish$({type: 'some-platform-capability'}).toPromise(), /NotQualifiedError/);
    });

    it('should dispatch an intent only to the host-app message client', async () => {
      const manifestUrl = createManifestURL({name: 'Host Application'});
      const registeredApps: ApplicationConfig[] = [{symbolicName: 'host-app', manifestUrl: manifestUrl}];
      await MicrofrontendPlatform.forHost(registeredApps, {symbolicName: 'host-app', messaging: {brokerDiscoverTimeout: 250}});

      // Register a host-app capability. Intents should not be received by the platform message client.
      Beans.get(ManifestRegistry).registerCapability('host-app', [{type: 'some-host-app-capability'}]);
      const intentsReceivedByPlatformMessageClient = collectToPromise(Beans.get(PlatformMessageClient).observe$(), {take: 1, timeout: 500});
      const intentsReceivedByHostMessageClient = collectToPromise(Beans.get(MessageClient).observe$(), {take: 1, timeout: 500});

      // Issue the intent via host-app message client.
      await Beans.get(MessageClient).publish$({type: 'some-host-app-capability'}).subscribe();

      // Verify platform message client not receiving the intent.
      await expectAsync(intentsReceivedByPlatformMessageClient).toBeRejected();
      await expectAsync(intentsReceivedByHostMessageClient).toBeResolved();

      // Verify platform message client not allowed to issue the intent.
      await expectToBeRejectedWithError(Beans.get(PlatformMessageClient).publish$({type: 'some-host-app-capability'}).toPromise(), /NotQualifiedError/);
    });
  });
});

/**
 * Subscribes to the given {@link Observable} and resolves to the emitted message payloads.
 */
function collectToPromise<T>(observable$: Observable<TopicMessage<T> | IntentMessage>, options: { take: number, timeout: number }): Promise<T[]> {
  return observable$
    .pipe(
      take(options.take),
      timeoutWith(new Date(Date.now() + options.timeout), throwError('[SpecTimeoutError] Timeout elapsed.')),
      reduce((acc, value) => acc.concat(value.payload), []),
    )
    .toPromise();
}

/**
 * Waits until the give Jasmin spy is invoked, or throws an error if not invoked within the specified timeout.
 */
function waitUntilInvoked(spy: Spy, timeout: number): Promise<void> {
  return new Promise((resolve, reject) => { // tslint:disable-line:typedef
    const timeoutHandle = setTimeout(() => reject('[SpecTimeoutError] Timeout elapsed.'), timeout);
    spy.and.callFake(() => {
      clearTimeout(timeoutHandle);
      resolve();
    });
  });
}

/**
 * Waits until the given number of subscribers are subscribed to the given topic, or throws an error otherwise.
 */
function waitUntilSubscriberCount(topic: string, expectedCount: number, options: { timeout: number }): Promise<void> {
  return Beans.get(MessageClient).subscriberCount$(topic)
    .pipe(
      first(count => count === expectedCount),
      timeoutWith(new Date(Date.now() + options.timeout), throwError('[SpecTimeoutError] Timeout elapsed.')),
      mapTo(undefined),
    )
    .toPromise();
}

/***
 * Serves the given manifest and returns the URL where the manifest is served. By default, it is served under the current origin.
 */
function createManifestURL(manifest: Partial<ApplicationManifest>, config?: { origin: string }): string {
  const manifestUrl = new URL('url', config && config.origin || window.location.origin).toString();
  const response: Partial<Response> = {
    ok: true,
    json: (): Promise<any> => Promise.resolve(manifest),
  };

  const httpClientSpy = jasmine.createSpyObj(HttpClient.name, ['fetch']);
  httpClientSpy.fetch.withArgs(manifestUrl).and.returnValue(response);
  Beans.register(HttpClient, {useValue: httpClientSpy});
  return manifestUrl;
}
