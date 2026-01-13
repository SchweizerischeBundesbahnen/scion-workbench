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
import {Beans} from '@scion/toolkit/bean-manager';
import {ObserveCaptor} from '@scion/toolkit/testing';
import {toObservable} from '@angular/core/rxjs-interop';
import {Injector, signal} from '@angular/core';

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
    expect(TestBed.inject(ManifestObjectCache).capability(capabilityId)()).toEqual(await lookupCapability(capabilityId));

    // Test capability not to be found.
    expect(TestBed.inject(ManifestObjectCache).capability('xyz')()).toBeUndefined();
  });

  it('should track capability', async () => {
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
          return {...capability, metadata: {...capability.metadata!, id: capability.type}};
        }
      }(),
      multi: true,
    });

    const captor = new ObserveCaptor<Capability | undefined, string | undefined>(capability => capability?.metadata!.id);

    // Observe capability 'testee-1'.
    const observedCapability = signal('testee-1');
    toObservable(TestBed.inject(ManifestObjectCache).capability(observedCapability), {injector: TestBed.inject(Injector)}).subscribe(captor);

    // Expect capability 'testee-1' not to be found.
    await captor.waitUntilEmitCount(1);
    expect(captor.getValues()).toEqual([
      undefined,
    ]);

    // Register capability 'testee-1'.
    await TestBed.inject(ManifestService).registerCapability({type: 'testee-1'});

    // Expect capability 'testee-1' to be found.
    await captor.waitUntilEmitCount(2);
    expect(captor.getValues()).toEqual([
      undefined,
      'testee-1',
    ]);

    // Observe capability 'testee-2'.
    observedCapability.set('testee-2');

    // Expect capability 'testee-2' not to be found.
    await captor.waitUntilEmitCount(3);
    expect(captor.getValues()).toEqual([
      undefined,
      'testee-1',
      undefined,
    ]);

    // Register capability 'testee-2'.
    await TestBed.inject(ManifestService).registerCapability({type: 'testee-2'});

    // Expect capability 'testee-2' to be found.
    await captor.waitUntilEmitCount(4);
    expect(captor.getValues()).toEqual([
      undefined,
      'testee-1',
      undefined,
      'testee-2',
    ]);

    // Register capability 'testee-3'.
    await TestBed.inject(ManifestService).registerCapability({type: 'testee-3'});

    // Expect no emission.
    await Promise.resolve();
    expect(captor.getValues()).toEqual([
      undefined,
      'testee-1',
      undefined,
      'testee-2',
    ]);

    // Unregister capability 'testee-2'.
    await TestBed.inject(ManifestService).unregisterCapabilities({type: 'testee-2'});

    // Expect capability 'testee-2' not to be found.
    await captor.waitUntilEmitCount(5);
    expect(captor.getValues()).toEqual([
      undefined,
      'testee-1',
      undefined,
      'testee-2',
      undefined,
    ]);
  });
});

/**
 * Looks up a capability using {@link ManifestService}.
 */
async function lookupCapability(id: string): Promise<Capability> {
  return (await firstValueFrom(TestBed.inject(ManifestService).lookupCapabilities$({id})))[0]!;
}
