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
import { MessageBroker } from './host/message-broker';
import { ManifestRegistry } from './host/manifest.registry';
import { ApplicationRegistry } from './host/application.registry';

describe('MicrofrontendPlatform', () => {

  beforeEach(async () => await MicrofrontendPlatform.destroy());
  afterEach(async () => await MicrofrontendPlatform.destroy());

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
    Beans.register(MessageClient, {useClass: NullMessageClient});
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

  it('should register platform beans of the host platform correctly', async () => {
    await MicrofrontendPlatform.forHost([]);

    // MessageBroker
    expect(getBeanInfo(MessageBroker)).toEqual(jasmine.objectContaining({eager: true, multi: false, destroyPhase: PlatformStates.Stopped}));
    // PlatformMessageClient
    expect(getBeanInfo(PlatformMessageClient)).toEqual(jasmine.objectContaining({eager: true, multi: false, destroyPhase: PlatformStates.Stopped}));
    // MessageClient
    expect(getBeanInfo(MessageClient)).toBeUndefined();
    // ManifestRegistry
    expect(getBeanInfo(ManifestRegistry)).toEqual(jasmine.objectContaining({eager: true, multi: false, destroyPhase: PlatformStates.Stopped}));
    // ApplicationRegistry
    expect(getBeanInfo(ApplicationRegistry)).toEqual(jasmine.objectContaining({eager: true, multi: false, destroyPhase: PlatformStates.Stopped}));
  });

  it('should register platform beans of the client platform correctly', async () => {
    const manifestUrl = serveManifest({name: 'Host Application'});
    const registeredApps: ApplicationConfig[] = [{symbolicName: 'host-app', manifestUrl: manifestUrl}];
    await MicrofrontendPlatform.forHost(registeredApps, {symbolicName: 'host-app', messaging: {brokerDiscoverTimeout: 250, deliveryTimeout: 250}});

    // MessageBroker
    expect(getBeanInfo(MessageBroker)).toEqual(jasmine.objectContaining({eager: true, multi: false, destroyPhase: PlatformStates.Stopped}));
    // PlatformMessageClient
    expect(getBeanInfo(PlatformMessageClient)).toEqual(jasmine.objectContaining({eager: true, multi: false, destroyPhase: PlatformStates.Stopped}));
    // MessageClient
    expect(getBeanInfo(PlatformMessageClient)).toEqual(jasmine.objectContaining({eager: true, multi: false, destroyPhase: PlatformStates.Stopped}));
    // ManifestRegistry
    expect(getBeanInfo(ManifestRegistry)).toEqual(jasmine.objectContaining({eager: true, multi: false, destroyPhase: PlatformStates.Stopped}));
    // ApplicationRegistry
    expect(getBeanInfo(ApplicationRegistry)).toEqual(jasmine.objectContaining({eager: true, multi: false, destroyPhase: PlatformStates.Stopped}));
  });
});

function getBeanInfo<T>(symbol: Type<T | any> | AbstractType<T | any>): BeanInfo<T> {
  return Array.from(Beans.getBeanInfo<T>(symbol) || new Set())[0];
}
