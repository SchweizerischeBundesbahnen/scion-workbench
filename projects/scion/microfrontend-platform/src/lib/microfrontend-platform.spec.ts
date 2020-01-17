/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { AbstractType, BeanInfo, Beans, Type } from './bean-manager';
import { MicrofrontendPlatform } from './microfrontend-platform';
import { MessageClient, NullMessageClient } from './client/message-client';
import { PlatformState, PlatformStates } from './platform-state';
import { ApplicationConfig } from './host/platform-config';
import { HostPlatformState } from './client/host-platform-state';
import { serveManifest } from './spec.util.spec';
import { PlatformMessageClient } from './host/platform-message-client';

describe('MicrofrontendPlatform', () => {

  beforeEach(async () => await MicrofrontendPlatform.destroy());
  afterEach(async () => await MicrofrontendPlatform.destroy());

  it('should report that the app is running standalone when the host platform is not found', async () => {
    await MicrofrontendPlatform.forClient({symbolicName: 'client-app', messaging: {brokerDiscoverTimeout: 250}});
    await expect(await MicrofrontendPlatform.isRunningStandalone()).toBe(true);
  });

  it('should report that the app is running standalone when the client platform is not started', async () => {
    await expect(await MicrofrontendPlatform.isRunningStandalone()).toBe(true);
  });

  it('should report that the app is running as part of the platform when connected to the host platform', async () => {
    const manifestUrl = serveManifest({name: 'Host Application'});
    const registeredApps: ApplicationConfig[] = [{symbolicName: 'host-app', manifestUrl: manifestUrl}];
    await MicrofrontendPlatform.forHost(registeredApps, {symbolicName: 'host-app', messaging: {brokerDiscoverTimeout: 250}});
    await expect(await MicrofrontendPlatform.isRunningStandalone()).toBe(false);
  });

  it('should enter state \'started\' when started', async () => {
    Beans.register(MessageClient, {useClass: NullMessageClient});
    await expectAsync(MicrofrontendPlatform.forClient({symbolicName: 'A'})).toBeResolved();
    expect(Beans.get(PlatformState).state).toEqual(PlatformStates.Started);
  });

  it('should reject starting the client platform multiple times', async () => {
    Beans.register(MessageClient, {useClass: NullMessageClient});
    await expectAsync(MicrofrontendPlatform.forClient({symbolicName: 'A'})).toBeResolved();

    try {
      await MicrofrontendPlatform.forClient({symbolicName: 'A'});
      fail('expected \'MicrofrontendPlatform.forClient()\' to error');
    }
    catch (error) {
      await expect(error.message).toMatch(/\[PlatformStateError] Failed to enter platform state \[prevState=Started, newState=Starting]/);
    }
  });

  it('should reject starting the host platform multiple times', async () => {
    await expectAsync(MicrofrontendPlatform.forHost([])).toBeResolved();

    try {
      await MicrofrontendPlatform.forHost([]);
      fail('expected \'MicrofrontendPlatform.forHost()\' to error');
    }
    catch (error) {
      await expect(error.message).toMatch(/\[PlatformStateError] Failed to enter platform state \[prevState=Started, newState=Starting]/);
    }
  });

  it('should allow clients to wait until the host platform started', async () => {
    const manifestUrl = serveManifest({name: 'Host Application'});
    const registeredApps: ApplicationConfig[] = [{symbolicName: 'host-app', manifestUrl: manifestUrl}];
    await MicrofrontendPlatform.forHost(registeredApps, {symbolicName: 'host-app', messaging: {brokerDiscoverTimeout: 250, deliveryTimeout: 250}});

    await expectAsync(Beans.get(HostPlatformState).whenStarted()).toBeResolved();
  });

  it('should register the `MessageClient` as alias for `PlatformMessageClient` when starting the host platform without app', async () => {
    await MicrofrontendPlatform.forHost([]);

    expect(getBeanInfo(MessageClient)).toEqual(jasmine.objectContaining({useExisting: PlatformMessageClient}));
    expect(Beans.get(MessageClient)).toBe(Beans.get(PlatformMessageClient));
  });

  it('should not register the `MessageClient` as alias for `PlatformMessageClient` when starting the host platform with an app', async () => {
    const manifestUrl = serveManifest({name: 'Host Application'});
    const registeredApps: ApplicationConfig[] = [{symbolicName: 'host-app', manifestUrl: manifestUrl}];
    await MicrofrontendPlatform.forHost(registeredApps, {symbolicName: 'host-app', messaging: {brokerDiscoverTimeout: 250, deliveryTimeout: 250}});

    expect(getBeanInfo(MessageClient)).toEqual(jasmine.objectContaining({eager: true, destroyPhase: PlatformStates.Stopped}));
    expect(getBeanInfo(PlatformMessageClient)).toEqual(jasmine.objectContaining({eager: true, destroyPhase: PlatformStates.Stopped}));
    expect(Beans.get(MessageClient)).not.toBe(Beans.get(PlatformMessageClient));
  });
});

function getBeanInfo<T>(symbol: Type<T | any> | AbstractType<T | any>): BeanInfo<T> {
  return Array.from(Beans.getBeanInfo<T>(symbol) || new Set())[0];
}
