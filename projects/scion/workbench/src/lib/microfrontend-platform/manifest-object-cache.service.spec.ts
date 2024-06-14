/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {TestBed} from '@angular/core/testing';
import {Capability, CapabilityInterceptor, ManifestService} from '@scion/microfrontend-platform';
import {provideWorkbenchForTest} from '../testing/workbench.provider';
import {ManifestObjectCache} from './manifest-object-cache.service';
import {firstValueFrom} from 'rxjs';
import {WorkbenchLauncher} from '../startup/workbench-launcher.service';
import {ObserveCaptor} from '@scion/toolkit/testing';
import {Beans} from '@scion/toolkit/bean-manager';

describe('ManifestObjectCache', () => {

  it('should get capability', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({microfrontendPlatform: {applications: []}}),
      ],
    });
    await TestBed.inject(WorkbenchLauncher).launch();

    // Register capability.
    const capabilityId = await TestBed.inject(ManifestService).registerCapability({type: 'testee'});

    // Test capability to be found.
    expect(TestBed.inject(ManifestObjectCache).getCapability(capabilityId)).toEqual(await lookupCapability(capabilityId));

    // Test capability not to be found.
    expect(TestBed.inject(ManifestObjectCache).getCapability('xyz', {orElse: null})).toBeNull();
    expect(() => TestBed.inject(ManifestObjectCache).getCapability('xyz')).toThrowError(/NullCapabilityError/);
  });

  it('should test if capability exists', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({microfrontendPlatform: {applications: []}}),
      ],
    });
    await TestBed.inject(WorkbenchLauncher).launch();

    // Register capability.
    const capabilityId = await TestBed.inject(ManifestService).registerCapability({type: 'testee'});

    // Wait until capability is available.
    await lookupCapability(capabilityId);

    // Test capability to be found.
    expect(TestBed.inject(ManifestObjectCache).hasCapability(capabilityId)).toBeTrue();

    // Test capability not to be found.
    expect(TestBed.inject(ManifestObjectCache).hasCapability('xyz')).toBeFalse();
  });

  it('should observe capability', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({microfrontendPlatform: {applications: []}}),
      ],
    });
    await TestBed.inject(WorkbenchLauncher).launch();

    // Assign stable capability id.
    Beans.register(CapabilityInterceptor, {
      useValue: new class implements CapabilityInterceptor {
        public async intercept(capability: Capability): Promise<Capability> {
          if (capability.type === 'testee') {
            return {...capability, metadata: {...capability.metadata!, id: 'testee'}};
          }
          return capability;
        }
      },
      multi: true,
    });

    // Observe capability.
    const captor = new ObserveCaptor<Capability | null, string | null>(capability => capability?.metadata!.id ?? null);
    TestBed.inject(ManifestObjectCache).observeCapability$('testee').subscribe(captor);

    // Expect no capability to be found.
    await captor.waitUntilEmitCount(1);
    expect(captor.getValues()).toEqual([
      null,
    ]);

    // Register capability.
    await TestBed.inject(ManifestService).registerCapability({type: 'testee'});
    // Expect capability to be found.
    await captor.waitUntilEmitCount(2);
    expect(captor.getValues()).toEqual([
      null,
      'testee',
    ]);

    // Unregister capability.
    await TestBed.inject(ManifestService).unregisterCapabilities({type: 'testee'});
    // Expect capability not to be found.
    await captor.waitUntilEmitCount(3);
    expect(captor.getValues()).toEqual([
      null,
      'testee',
      null,
    ]);
  });
});

/**
 * Looks up a capability using {@link ManifestService}.
 */
async function lookupCapability(id: string): Promise<Capability> {
  return (await firstValueFrom(TestBed.inject(ManifestService).lookupCapabilities$({id})))[0];
}
