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
import {WorkbenchCapabilities} from '@scion/workbench-client';
import {Injectable} from '@angular/core';

/**
 * Assigns perspective and view capabilities a stable identifer based on the qualifier and application.
 */
@Injectable(/* DO NOT provide via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
export class StableCapabilityIdAssigner implements CapabilityInterceptor {

  private readonly _types = new Set<string>()
    .add(WorkbenchCapabilities.Perspective)
    .add(WorkbenchCapabilities.View);

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
