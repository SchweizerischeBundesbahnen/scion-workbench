/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {assertNotInReactiveContext, computed, EnvironmentProviders, inject, Injectable, isSignal, makeEnvironmentProviders, Signal, signal} from '@angular/core';
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
   * Tracks specified capability, returning a signal with requested capability or `undefined` if not found.
   *
   * Method must not be called in a reactive context.
   */
  public capability<T extends Capability = Capability>(capabilityId: Signal<string> | string): Signal<T | undefined> {
    assertNotInReactiveContext(this.capability, 'Call ManifestObjectCache.computeCapability() in a non-reactive (non-tracking) context, such as within the untracked() function.');

    const id = isSignal(capabilityId) ? capabilityId : signal(capabilityId);
    return computed(
      () => this.capabilities().get(id()) as T | undefined,
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
