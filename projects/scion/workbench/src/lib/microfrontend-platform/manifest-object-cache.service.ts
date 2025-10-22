/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {computed, EnvironmentProviders, inject, Injectable, isSignal, makeEnvironmentProviders, Signal, signal} from '@angular/core';
import {Capability, ManifestService} from '@scion/microfrontend-platform';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {tapFirst} from '@scion/toolkit/operators';
import {provideMicrofrontendPlatformInitializer} from './microfrontend-platform-initializer.provider';

@Injectable(/* DO NOT provide via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
export class ManifestObjectCache {

  private readonly _manifestService = inject(ManifestService);
  private readonly _capabilities = signal(new Map<string, Capability>());

  public async init(): Promise<void> {
    return new Promise<void>(resolve => {
      this._manifestService.lookupCapabilities$()
        .pipe(
          tapFirst(() => resolve()),
          takeUntilDestroyed(),
        )
        .subscribe(capabilities => {
          this._capabilities.set(capabilities.reduce((acc, capability) => acc.set(capability.metadata!.id, capability), new Map<string, Capability>()));
        });
    });
  }

  /**
   * Tests if given capability exists.
   */
  public hasCapability(capabilityId: string): boolean {
    return this._capabilities().has(capabilityId);
  }

  /**
   * Returns the specified capability. If not found, by default, throws an error unless setting the `orElseNull` option.
   */
  public getCapability<T extends Capability = Capability>(capabilityId: string | Signal<string>): Signal<T | undefined> {
    const cid = isSignal(capabilityId) ? capabilityId : signal(capabilityId);
    return computed(() => this._capabilities().get(cid()) as T | undefined, {equal: (a, b) => a?.metadata!.id === b?.metadata!.id});
  }
}

/**
 * Provides cached access to manifest objects.
 */
export function provideManifestObjectCache(): EnvironmentProviders {
  return makeEnvironmentProviders([
    ManifestObjectCache,
    provideMicrofrontendPlatformInitializer(() => inject(ManifestObjectCache).init()),
  ]);
}
