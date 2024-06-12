/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Capability, CapabilityInterceptor} from '@scion/microfrontend-platform';
import {Injectable} from '@angular/core';
import {WorkbenchCapabilities} from '@scion/workbench-client';
import {Microfrontends} from '../common/microfrontend.util';

/**
 * Assigns each perspective capability a stable identifer required for XXX.
 */
@Injectable(/* DO NOT PROVIDE via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
export class MicrofrontendPerspectiveCapabilityIdAssigner implements CapabilityInterceptor {

  public async intercept(capability: Capability): Promise<Capability> {
    if (capability.type !== WorkbenchCapabilities.Perspective) {
      return capability;
    }

    const stableIdentifier = await Microfrontends.createStableIdentifier(capability);
    return {
      ...capability,
      metadata: {...capability.metadata!, id: stableIdentifier},
    };
  }
}
