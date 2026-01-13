/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {assertNotInReactiveContext, computed, EnvironmentProviders, inject, Injectable, makeEnvironmentProviders, Signal, signal, untracked} from '@angular/core';
import {Capability, ManifestService} from '@scion/microfrontend-platform';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {tapFirst} from '@scion/toolkit/operators';
import {provideMicrofrontendPlatformInitializer} from './microfrontend-platform-initializer';
import {map} from 'rxjs/operators';

@Injectable(/* DO NOT provide via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
export class ManifestObjectCache {

  public readonly capabilities = signal(new Map<string, Capability>());

  public async init(): Promise<void> {
    const manifestService = inject(ManifestService);

    return new Promise<void>(resolve => {
      manifestService.lookupCapabilities$()
        .pipe(
          map(capabilities => capabilities.reduce((acc, capability) => acc.set(capability.metadata!.id, capability), new Map<string, Capability>())),
          tapFirst(() => resolve()),
          takeUntilDestroyed(),
        )
        .subscribe(capabilities => {
          this.capabilities.set(capabilities);
        });
    });
  }

  /**
   * Returns the specified capability. If not found, by default, throws an error unless setting the `orElseNull` option.
   */
  public getCapability<T extends Capability = Capability>(capabilityId: string): T;
  public getCapability<T extends Capability = Capability>(capabilityId: string, options: {orElse: null}): T | null;
  public getCapability<T extends Capability = Capability>(capabilityId: string, options?: {orElse: null}): T | null {
    const capability = untracked(() => this.capabilities().get(capabilityId) as T | undefined);
    if (!capability && !options) {
      throw Error(`[NullCapabilityError] No capability found with id '${capabilityId}'.`);
    }
    return capability ?? null;
  }

  /**
   * Gets the specified capability, or `undefined` if not found.
   *
   * Method must not be called in a reactive context.
   */
  public observeCapability<T extends Capability = Capability>(capabilityId: Signal<string>): Signal<T | undefined> {
    assertNotInReactiveContext(this.observeCapability, 'Call ManifestObjectCache.computeCapability() in a non-reactive (non-tracking) context, such as within the untracked() function.');

    return computed(
      () => this.capabilities().get(capabilityId()) as T | undefined,
      {equal: (a, b) => a?.metadata!.id === b?.metadata!.id},
    );
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
