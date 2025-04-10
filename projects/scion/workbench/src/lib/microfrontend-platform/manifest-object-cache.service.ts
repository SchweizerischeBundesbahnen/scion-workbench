/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {EnvironmentProviders, inject, Injectable, makeEnvironmentProviders} from '@angular/core';
import {Capability, ManifestService} from '@scion/microfrontend-platform';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {BehaviorSubject, Observable} from 'rxjs';
import {distinctUntilChanged, map, startWith} from 'rxjs/operators';
import {tapFirst} from '@scion/toolkit/operators';
import {provideMicrofrontendPlatformInitializer} from './microfrontend-platform-initializer.provider';

@Injectable(/* DO NOT provide via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
export class ManifestObjectCache {

  private readonly _manifestService = inject(ManifestService);
  private readonly _capabilities$ = new BehaviorSubject(new Map<string, Capability>());

  public async init(): Promise<void> {
    return new Promise<void>(resolve => {
      this._manifestService.lookupCapabilities$()
        .pipe(
          tapFirst(() => resolve()),
          takeUntilDestroyed(),
        )
        .subscribe(capabilities => {
          this._capabilities$.next(capabilities.reduce((acc, capability) => acc.set(capability.metadata!.id, capability), new Map<string, Capability>()));
        });
    });
  }

  /**
   * Tests if given capability exists.
   */
  public hasCapability(capabilityId: string): boolean {
    return this._capabilities$.value.has(capabilityId);
  }

  /**
   * Returns the specified capability. If not found, by default, throws an error unless setting the `orElseNull` option.
   */
  public getCapability<T extends Capability = Capability>(capabilityId: string): T;
  public getCapability<T extends Capability = Capability>(capabilityId: string, options: {orElse: null}): T | null;
  public getCapability<T extends Capability = Capability>(capabilityId: string, options?: {orElse: null}): T | null {
    const capability = this._capabilities$.value.get(capabilityId) as T | undefined;
    if (!capability && !options) {
      throw Error(`[NullCapabilityError] No capability found with id '${capabilityId}'.`);
    }
    return capability ?? null;
  }

  /**
   * Looks up specified capability.
   *
   * Upon subscription, emits the requested capability, and then emits continuously when it changes. It never completes.
   */
  public observeCapability$<T extends Capability = Capability>(capabilityId: string): Observable<T | null> {
    return this._capabilities$
      .pipe(
        startWith(undefined as void),
        map(() => this.getCapability<T>(capabilityId, {orElse: null})),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
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
