/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {inject, signal, Signal, untracked} from '@angular/core';
import {Capability} from '@scion/microfrontend-platform';
import {ManifestObjectCache} from '../manifest-object-cache.service';
import {rootEffect} from '../../common/rxjs-interop.util';

export abstract class MicrofrontendHostContext {
  public abstract readonly params: Signal<Map<string, unknown>>;
  public abstract readonly capabilityId: Signal<string>;
  public abstract readonly capability?: Signal<Capability | undefined>;
  public abstract init?: () => void;
}

export function createMicrofrontendHostContext(capabilityId: Signal<string>, params: Signal<Map<string, unknown>>, options?: {initializerFn: () => void}): MicrofrontendHostContext {
  return {
    capabilityId,
    params,
    capability: computeCapability(capabilityId),
    init: options?.initializerFn,
  }
}

function computeCapability(capabilityId: Signal<string>): Signal<Capability | undefined> {
  const manifestObjectCache = inject(ManifestObjectCache);

  // Run as root effect to run even if the parent component is detached from change detection (e.g., if the part is not visible).
  const sig = signal<Capability | undefined>(manifestObjectCache.getCapability(capabilityId()));

  rootEffect(onCleanup => {
    const cid = capabilityId();

    untracked(() => {
      const subscription = manifestObjectCache.observeCapability$(cid).subscribe(capability => {
        sig.set(capability ?? undefined);
      });
      onCleanup(() => subscription.unsubscribe());
    });
  });

  return sig;
}
