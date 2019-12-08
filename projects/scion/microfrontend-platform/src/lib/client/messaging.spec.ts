/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Beans } from '../bean-manager';
import { PlatformMessageClient } from '../host/platform-message-client';
import { first, mapTo, publishReplay, reduce, take, timeoutWith } from 'rxjs/operators';
import { ConnectableObservable, Observable, throwError } from 'rxjs';
import { IntentMessage, TopicMessage } from '../messaging.model';
import { MessageClient } from './message-client';
import { Logger } from '../logger';
import { ManifestRegistry } from '../host/manifest.registry';
import { ApplicationConfig } from '../host/platform-config';
import { PLATFORM_SYMBOLIC_NAME } from '../host/platform.constants';
import { serveManifest, expectToBeRejectedWithError } from '../spec.util.spec';
import { MicrofrontendPlatform } from '../microfrontend-platform';
import { Objects } from '@scion/toolkit/util';
import Spy = jasmine.Spy;

/**
 * Tests most important and fundamental features of the messaging facility with a single client, the host-app, only.
 *
 * More advanced and deeper testing with having multiple, cross-origin clients connected, is done end-to-end with Protractor against the testing app.
 *
 * See `messaging.e2e-spec.ts` for end-to-end tests.
 */
describe('Messaging', () => {

  beforeEach(async () => await MicrofrontendPlatform.destroy());
  afterEach(async () => await MicrofrontendPlatform.destroy());

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
    const manifestUrl = serveManifest({name: 'Host Application'});
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

    const ping$ = Beans.get(PlatformMessageClient).request$<string>('some-topic', 'ping');
    const actual = collectToPromise(ping$, {take: 1, timeout: 1000});

    await expectAsync(actual).toBeResolvedTo(['PING']);
  });

  it('should reject a client connect attempt if the app is not registered', async () => {
    const manifestUrl = serveManifest({name: 'Trusted Client'});
    const registeredApps: ApplicationConfig[] = [{symbolicName: 'trusted-client', manifestUrl: manifestUrl}];
    await MicrofrontendPlatform.forHost(registeredApps, {symbolicName: 'untrusted-client'});

    const expected = '[MessageClientConnectError] Client connect attempt rejected by the message broker: Unknown client. [app=\'untrusted-client\'] [code: \'refused:rejected\']';
    await expectAsync(Beans.get(MessageClient).publish$('some-topic').toPromise()).toBeRejectedWith(expected);
  });

  it('should reject a client connect attempt if the app is not trusted (wrong origin)', async () => {
    const loggerSpy = jasmine.createSpyObj(Logger.name, ['error', 'info']);
    Beans.register(Logger, {useValue: loggerSpy});

    const manifestUrl = serveManifest({name: 'Trusted Client', baseUrl: 'http://not-karma-testrunner-origin'});
    const registeredApps: ApplicationConfig[] = [{symbolicName: 'client', manifestUrl: manifestUrl}];
    const logCapturePromise = waitUntilInvoked(loggerSpy.error, 1000);

    await MicrofrontendPlatform.forHost(registeredApps, {symbolicName: 'client'});

    await expectAsync(logCapturePromise).toBeResolved('\'Logger.error\' not invoked within 1s');
    await expect(loggerSpy.error.calls.mostRecent().args[0]).toMatch(/\[MessageClientConnectError] Client connect attempt blocked by the message broker: Wrong origin.*\[code: 'refused:blocked']/);
  });

  it('should log an error if the message broker cannot be discovered', async () => {
    const loggerSpy = jasmine.createSpyObj(Logger.name, ['error', 'info']);
    Beans.register(Logger, {useValue: loggerSpy});
    const logCapturePromise = waitUntilInvoked(loggerSpy.error, 1000);

    await MicrofrontendPlatform.forClient({symbolicName: 'client-app', messaging: {brokerDiscoverTimeout: 250}});

    await expectAsync(logCapturePromise).toBeResolved();
    await expect(loggerSpy.error).toHaveBeenCalledWith('[BrokerDiscoverTimeoutError] Message broker not discovered within the 250ms timeout. Messages cannot be published or received.');
  });

  it('should throw an error when publishing a message and if the message broker is not discovered', async () => {
    await MicrofrontendPlatform.forClient({symbolicName: 'client-app', messaging: {brokerDiscoverTimeout: 250}});
    await expectToBeRejectedWithError(Beans.get(MessageClient).publish$('some-topic').toPromise(), /BrokerDiscoverTimeoutError/);
  });

  describe('should maintain separate registries for the platform and the host client app', () => {

    it('should dispatch an intent only to the platform message client', async () => {
      const manifestUrl = serveManifest({name: 'Host Application'});
      const registeredApps: ApplicationConfig[] = [{symbolicName: 'host-app', manifestUrl: manifestUrl}];
      await MicrofrontendPlatform.forHost(registeredApps, {symbolicName: 'host-app', messaging: {brokerDiscoverTimeout: 250}});

      // Register a platform capability. Intents should not be received by the host-app message client.
      Beans.get(ManifestRegistry).registerCapability(PLATFORM_SYMBOLIC_NAME, [{type: 'some-platform-capability'}]);
      const intentsReceivedByPlatformMessageClient = collectToPromise(Beans.get(PlatformMessageClient).handleIntent$(), {take: 1, timeout: 500});
      const intentsReceivedByHostMessageClient = collectToPromise(Beans.get(MessageClient).handleIntent$(), {take: 1, timeout: 500});

      // Issue the intent via platform message client.
      await Beans.get(PlatformMessageClient).issueIntent$({type: 'some-platform-capability'}).subscribe();

      // Verify host-app message client not receiving the intent.
      await expectAsync(intentsReceivedByPlatformMessageClient).toBeResolved();
      await expectAsync(intentsReceivedByHostMessageClient).toBeRejected();

      // Verify host-app message client not allowed to issue the intent.
      await expectToBeRejectedWithError(Beans.get(MessageClient).issueIntent$({type: 'some-platform-capability'}).toPromise(), /NotQualifiedError/);
    });

    it('should dispatch an intent only to the host-app message client', async () => {
      const manifestUrl = serveManifest({name: 'Host Application'});
      const registeredApps: ApplicationConfig[] = [{symbolicName: 'host-app', manifestUrl: manifestUrl}];
      await MicrofrontendPlatform.forHost(registeredApps, {symbolicName: 'host-app', messaging: {brokerDiscoverTimeout: 250}});

      // Register a host-app capability. Intents should not be received by the platform message client.
      Beans.get(ManifestRegistry).registerCapability('host-app', [{type: 'some-host-app-capability'}]);
      const intentsReceivedByPlatformMessageClient = collectToPromise(Beans.get(PlatformMessageClient).handleIntent$(), {take: 1, timeout: 500});
      const intentsReceivedByHostMessageClient = collectToPromise(Beans.get(MessageClient).handleIntent$(), {take: 1, timeout: 500});

      // Issue the intent via host-app message client.
      await Beans.get(MessageClient).issueIntent$({type: 'some-host-app-capability'}).subscribe();

      // Verify platform message client not receiving the intent.
      await expectAsync(intentsReceivedByPlatformMessageClient).toBeRejected();
      await expectAsync(intentsReceivedByHostMessageClient).toBeResolved();

      // Verify platform message client not allowed to issue the intent.
      await expectToBeRejectedWithError(Beans.get(PlatformMessageClient).issueIntent$({type: 'some-host-app-capability'}).toPromise(), /NotQualifiedError/);
    });
  });

  it('should allow multiple subscriptions to the same topic in the same client', async () => {
    const manifestUrl = serveManifest({name: 'Host Application'});
    const registeredApps: ApplicationConfig[] = [{symbolicName: 'host-app', manifestUrl: manifestUrl}];
    await MicrofrontendPlatform.forHost(registeredApps, {symbolicName: 'host-app', messaging: {brokerDiscoverTimeout: 250, deliveryTimeout: 250}});

    const receiver1$ = Beans.get(MessageClient).observe$<string>('topic').pipe(publishReplay(1)) as ConnectableObservable<TopicMessage<string>>;
    const receiver2$ = Beans.get(MessageClient).observe$<string>('topic').pipe(publishReplay(1)) as ConnectableObservable<TopicMessage<string>>;
    const receiver3$ = Beans.get(MessageClient).observe$<string>('topic').pipe(publishReplay(1)) as ConnectableObservable<TopicMessage<string>>;

    const subscription1 = receiver1$.connect();
    const subscription2 = receiver2$.connect();
    const subscription3 = receiver3$.connect();

    // publish 'message 1a'
    await Beans.get(MessageClient).publish$('topic', 'message 1a', {retain: true}).toPromise();
    await expectAsync(waitUntilMessageReceived(receiver1$, {payload: 'message 1a', timeout: 250})).toBeResolved();
    await expectAsync(waitUntilMessageReceived(receiver2$, {payload: 'message 1a', timeout: 250})).toBeResolved();
    await expectAsync(waitUntilMessageReceived(receiver3$, {payload: 'message 1a', timeout: 250})).toBeResolved();

    // publish 'message 1b'
    await Beans.get(MessageClient).publish$('topic', 'message 1b', {retain: true}).toPromise();
    await expectAsync(waitUntilMessageReceived(receiver1$, {payload: 'message 1b', timeout: 250})).toBeResolved();
    await expectAsync(waitUntilMessageReceived(receiver2$, {payload: 'message 1b', timeout: 250})).toBeResolved();
    await expectAsync(waitUntilMessageReceived(receiver3$, {payload: 'message 1b', timeout: 250})).toBeResolved();

    // unsubscribe observable 1
    subscription1.unsubscribe();

    // publish 'message 2a'
    await Beans.get(MessageClient).publish$('topic', 'message 2a', {retain: true}).toPromise();
    await expectAsync(waitUntilMessageReceived(receiver1$, {payload: 'message 1b', timeout: 250})).toBeResolved();
    await expectAsync(waitUntilMessageReceived(receiver2$, {payload: 'message 2a', timeout: 250})).toBeResolved();
    await expectAsync(waitUntilMessageReceived(receiver3$, {payload: 'message 2a', timeout: 250})).toBeResolved();

    // publish 'message 2b'
    await Beans.get(MessageClient).publish$('topic', 'message 2b', {retain: true}).toPromise();
    await expectAsync(waitUntilMessageReceived(receiver1$, {payload: 'message 1b', timeout: 250})).toBeResolved();
    await expectAsync(waitUntilMessageReceived(receiver2$, {payload: 'message 2b', timeout: 250})).toBeResolved();
    await expectAsync(waitUntilMessageReceived(receiver3$, {payload: 'message 2b', timeout: 250})).toBeResolved();

    // unsubscribe observable 2
    subscription2.unsubscribe();

    // publish 'message 3a'
    await Beans.get(MessageClient).publish$('topic', 'message 3a', {retain: true}).toPromise();
    await expectAsync(waitUntilMessageReceived(receiver1$, {payload: 'message 1b', timeout: 250})).toBeResolved();
    await expectAsync(waitUntilMessageReceived(receiver2$, {payload: 'message 2b', timeout: 250})).toBeResolved();
    await expectAsync(waitUntilMessageReceived(receiver3$, {payload: 'message 3a', timeout: 250})).toBeResolved();

    // publish 'message 3b'
    await Beans.get(MessageClient).publish$('topic', 'message 3b', {retain: true}).toPromise();
    await expectAsync(waitUntilMessageReceived(receiver1$, {payload: 'message 1b', timeout: 250})).toBeResolved();
    await expectAsync(waitUntilMessageReceived(receiver2$, {payload: 'message 2b', timeout: 250})).toBeResolved();
    await expectAsync(waitUntilMessageReceived(receiver3$, {payload: 'message 3b', timeout: 250})).toBeResolved();

    // unsubscribe observable 3
    subscription3.unsubscribe();

    // publish 'message 4a'
    await Beans.get(MessageClient).publish$('topic', 'message 4a', {retain: true}).toPromise();
    await expectAsync(waitUntilMessageReceived(receiver1$, {payload: 'message 1b', timeout: 250})).toBeResolved();
    await expectAsync(waitUntilMessageReceived(receiver2$, {payload: 'message 2b', timeout: 250})).toBeResolved();
    await expectAsync(waitUntilMessageReceived(receiver3$, {payload: 'message 3b', timeout: 250})).toBeResolved();

    // publish 'message 4b'
    await Beans.get(MessageClient).publish$('topic', 'message 4b', {retain: true}).toPromise();
    await expectAsync(waitUntilMessageReceived(receiver1$, {payload: 'message 1b', timeout: 250})).toBeResolved();
    await expectAsync(waitUntilMessageReceived(receiver2$, {payload: 'message 2b', timeout: 250})).toBeResolved();
    await expectAsync(waitUntilMessageReceived(receiver3$, {payload: 'message 3b', timeout: 250})).toBeResolved();
  });

  it('should allow multiple subscriptions to the same intent in the same client', async () => {
    const manifestUrl = serveManifest({name: 'Host Application', capabilities: [{type: 'xyz'}]});
    const registeredApps: ApplicationConfig[] = [{symbolicName: 'host-app', manifestUrl: manifestUrl}];
    await MicrofrontendPlatform.forHost(registeredApps, {symbolicName: 'host-app', messaging: {brokerDiscoverTimeout: 250, deliveryTimeout: 250}});

    const receiver1$ = Beans.get(MessageClient).handleIntent$<string>().pipe(publishReplay(1)) as ConnectableObservable<IntentMessage<string>>;
    const receiver2$ = Beans.get(MessageClient).handleIntent$<string>().pipe(publishReplay(1)) as ConnectableObservable<IntentMessage<string>>;
    const receiver3$ = Beans.get(MessageClient).handleIntent$<string>().pipe(publishReplay(1)) as ConnectableObservable<IntentMessage<string>>;

    const subscription1 = receiver1$.connect();
    const subscription2 = receiver2$.connect();
    const subscription3 = receiver3$.connect();

    // issue 'intent 1a'
    await Beans.get(MessageClient).issueIntent$({type: 'xyz'}, 'intent 1a').toPromise();
    await expectAsync(waitUntilMessageReceived(receiver1$, {payload: 'intent 1a', timeout: 250})).toBeResolved();
    await expectAsync(waitUntilMessageReceived(receiver2$, {payload: 'intent 1a', timeout: 250})).toBeResolved();
    await expectAsync(waitUntilMessageReceived(receiver3$, {payload: 'intent 1a', timeout: 250})).toBeResolved();

    // issue 'intent 1b'
    await Beans.get(MessageClient).issueIntent$({type: 'xyz'}, 'intent 1b').toPromise();
    await expectAsync(waitUntilMessageReceived(receiver1$, {payload: 'intent 1b', timeout: 250})).toBeResolved();
    await expectAsync(waitUntilMessageReceived(receiver2$, {payload: 'intent 1b', timeout: 250})).toBeResolved();
    await expectAsync(waitUntilMessageReceived(receiver3$, {payload: 'intent 1b', timeout: 250})).toBeResolved();

    // unsubscribe observable 1
    subscription1.unsubscribe();

    // issue 'intent 2a'
    await Beans.get(MessageClient).issueIntent$({type: 'xyz'}, 'intent 2a').toPromise();
    await expectAsync(waitUntilMessageReceived(receiver1$, {payload: 'intent 1b', timeout: 250})).toBeResolved();
    await expectAsync(waitUntilMessageReceived(receiver2$, {payload: 'intent 2a', timeout: 250})).toBeResolved();
    await expectAsync(waitUntilMessageReceived(receiver3$, {payload: 'intent 2a', timeout: 250})).toBeResolved();

    // issue 'intent 2b'
    await Beans.get(MessageClient).issueIntent$({type: 'xyz'}, 'intent 2b').toPromise();
    await expectAsync(waitUntilMessageReceived(receiver1$, {payload: 'intent 1b', timeout: 250})).toBeResolved();
    await expectAsync(waitUntilMessageReceived(receiver2$, {payload: 'intent 2b', timeout: 250})).toBeResolved();
    await expectAsync(waitUntilMessageReceived(receiver3$, {payload: 'intent 2b', timeout: 250})).toBeResolved();

    // unsubscribe observable 2
    subscription2.unsubscribe();

    // issue 'intent 3a'
    await Beans.get(MessageClient).issueIntent$({type: 'xyz'}, 'intent 3a').toPromise();
    await expectAsync(waitUntilMessageReceived(receiver1$, {payload: 'intent 1b', timeout: 250})).toBeResolved();
    await expectAsync(waitUntilMessageReceived(receiver2$, {payload: 'intent 2b', timeout: 250})).toBeResolved();
    await expectAsync(waitUntilMessageReceived(receiver3$, {payload: 'intent 3a', timeout: 250})).toBeResolved();

    // issue 'intent 3b'
    await Beans.get(MessageClient).issueIntent$({type: 'xyz'}, 'intent 3b').toPromise();
    await expectAsync(waitUntilMessageReceived(receiver1$, {payload: 'intent 1b', timeout: 250})).toBeResolved();
    await expectAsync(waitUntilMessageReceived(receiver2$, {payload: 'intent 2b', timeout: 250})).toBeResolved();
    await expectAsync(waitUntilMessageReceived(receiver3$, {payload: 'intent 3b', timeout: 250})).toBeResolved();

    // unsubscribe observable 3
    subscription3.unsubscribe();

    // issue 'intent 4a'
    await Beans.get(MessageClient).issueIntent$({type: 'xyz'}, 'intent 4a').toPromise();
    await expectAsync(waitUntilMessageReceived(receiver1$, {payload: 'intent 1b', timeout: 250})).toBeResolved();
    await expectAsync(waitUntilMessageReceived(receiver2$, {payload: 'intent 2b', timeout: 250})).toBeResolved();
    await expectAsync(waitUntilMessageReceived(receiver3$, {payload: 'intent 3b', timeout: 250})).toBeResolved();

    // issue 'intent 4b'
    await Beans.get(MessageClient).issueIntent$({type: 'xyz'}, 'intent 4b').toPromise();
    await expectAsync(waitUntilMessageReceived(receiver1$, {payload: 'intent 1b', timeout: 250})).toBeResolved();
    await expectAsync(waitUntilMessageReceived(receiver2$, {payload: 'intent 2b', timeout: 250})).toBeResolved();
    await expectAsync(waitUntilMessageReceived(receiver3$, {payload: 'intent 3b', timeout: 250})).toBeResolved();
  });

  it('should receive a message once regardless of the number of subscribers in the same client', async () => {
    const manifestUrl = serveManifest({name: 'Host Application'});
    const registeredApps: ApplicationConfig[] = [{symbolicName: 'host-app', manifestUrl: manifestUrl}];
    await MicrofrontendPlatform.forHost(registeredApps, {symbolicName: 'host-app', messaging: {brokerDiscoverTimeout: 250, deliveryTimeout: 250}});

    // Register two receivers
    Beans.get(MessageClient).observe$<string>('topic').subscribe();
    Beans.get(MessageClient).observe$<string>('topic').subscribe();

    // Register the test receiver
    const receiver = collectToPromise(Beans.get(MessageClient).observe$<string>('topic'), {take: 2, timeout: 250});

    // publish 'message 1'
    await Beans.get(MessageClient).publish$('topic', 'message 1').toPromise();
    // publish 'message 2'
    await Beans.get(MessageClient).publish$('topic', 'message 2').toPromise();

    // expect only the two message to be dispatched
    await expectAsync(receiver).toBeResolvedTo(['message 1', 'message 2']);
  });

  it('should receive an intent once regardless of the number of subscribers in the same client', async () => {
    const manifestUrl = serveManifest({name: 'Host Application', capabilities: [{type: 'xyz'}]});
    const registeredApps: ApplicationConfig[] = [{symbolicName: 'host-app', manifestUrl: manifestUrl}];
    await MicrofrontendPlatform.forHost(registeredApps, {symbolicName: 'host-app', messaging: {brokerDiscoverTimeout: 250, deliveryTimeout: 250}});

    // Register two intent handlers
    Beans.get(MessageClient).handleIntent$<string>().subscribe();
    Beans.get(MessageClient).handleIntent$<string>().subscribe();

    // Register the test intent handler
    const receiver = collectToPromise(Beans.get(MessageClient).handleIntent$<string>(), {take: 2, timeout: 250});

    // issue 'intent 1'
    await Beans.get(MessageClient).issueIntent$({type: 'xyz'}, 'intent 1').toPromise();
    // issue 'intent 2'
    await Beans.get(MessageClient).issueIntent$({type: 'xyz'}, 'intent 2').toPromise();

    // expect only the two intents to be dispatched
    await expectAsync(receiver).toBeResolvedTo(['intent 1', 'intent 2']);
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

/**
 * Waits until a message with the given payload is received.
 */
async function waitUntilMessageReceived(observable$: Observable<TopicMessage<any> | IntentMessage<any>>, waitUntil: { payload: any, timeout: number }): Promise<void> {
  await observable$
    .pipe(
      first(msg => Objects.isEqual(msg.payload, waitUntil.payload)),
      timeoutWith(new Date(Date.now() + waitUntil.timeout), throwError('[SpecTimeoutError] Timeout elapsed.')),
    )
    .toPromise();
}
