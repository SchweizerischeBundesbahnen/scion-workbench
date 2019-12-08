/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Beans } from './bean-manager';
import { MicrofrontendPlatform } from './microfrontend-platform';
import { MessageClient, NullMessageClient } from './client/message-client';
import { PlatformState, PlatformStates } from './platform-state';
import { ApplicationConfig } from './host/platform-config';
import { HostPlatformState } from './client/host-platform-state';
import { createManifestURL } from './spec.util.spec';

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
    const manifestUrl = createManifestURL({name: 'Host Application'});
    const registeredApps: ApplicationConfig[] = [{symbolicName: 'host-app', manifestUrl: manifestUrl}];
    await MicrofrontendPlatform.forHost(registeredApps, {symbolicName: 'host-app', messaging: {brokerDiscoverTimeout: 250, deliveryTimeout: 100000}});

    await expectAsync(Beans.get(HostPlatformState).whenStarted()).toBeResolved();
  });
});
