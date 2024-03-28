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
import {Crypto} from '@scion/toolkit/crypto';

/**
 * Assigns each view capability a stable identifer required for persistent navigation.
 */
@Injectable(/* DO NOT PROVIDE via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
export class MicrofrontendViewCapabilityIdAssigner implements CapabilityInterceptor {

  public async intercept(capability: Capability): Promise<Capability> {
    if (capability.type !== WorkbenchCapabilities.View) {
      return capability;
    }

    const stableIdentifier = await createStableViewIdentifier(capability);
    return {
      ...capability,
      metadata: {...capability.metadata!, id: stableIdentifier},
    };
  }
}

/**
 * Creates a stable identifier for given view capability.
 */
async function createStableViewIdentifier(capability: Capability): Promise<string> {
  const qualifier = capability.qualifier!;
  const vendor = capability.metadata!.appSymbolicName;

  // Create identifier consisting of vendor and sorted qualifier entries.
  const identifier = Object.keys(qualifier)
    .sort()
    .reduce(
      (acc, qualifierKey) => acc.concat(qualifierKey).concat(`${qualifier[qualifierKey]}`),
      [vendor],
    )
    .join(';');

  // Hash the identifier.
  const identifierHash = await Crypto.digest(identifier);
  // Use the first 7 digits of the hash.
  return identifierHash.substring(0, 7);
}
