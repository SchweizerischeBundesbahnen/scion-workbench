/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Capability, CapabilityInterceptor} from '@scion/microfrontend-platform';
import {Microfrontends} from './common/microfrontend.util';
import {inject, InjectionToken} from '@angular/core';

/**
 * DI token to register capability types to assign a stable identity.
 */
export const STABLE_CAPABILITY_ID = new InjectionToken<string[]>('STABLE_ID_CAPABILITY_TYPE');

/**
 * Assigns capabilities contained in {@link STABLE_CAPABILITY_ID} DI token a stable identifer.
 */
export class StableCapabilityIdAssigner implements CapabilityInterceptor {

  private readonly _types = new Set(inject(STABLE_CAPABILITY_ID, {optional: true}) ?? []);

  public async intercept(capability: Capability): Promise<Capability> {
    if (!this._types.has(capability.type)) {
      return capability;
    }

    return {
      ...capability,
      metadata: {
        ...capability.metadata!,
        id: await Microfrontends.createStableIdentifier(capability),
      },
    };
  }
}
