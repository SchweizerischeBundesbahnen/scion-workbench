/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
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

@Injectable()
export class MicrofrontendPerspectiveCapabilityInterceptor implements CapabilityInterceptor {

  public async intercept(capability: Capability): Promise<Capability> {
    if (capability.type !== WorkbenchCapabilities.Perspective) {
      return capability;
    }

    // Assert the view capability to have a qualifier set.
    if (!capability.qualifier || !Object.keys(capability.qualifier).length) {
      throw Error(`[NullQualifierError] Perspective capability requires a qualifier [capability=${JSON.stringify(capability)}]`);
    }

    // Set a stable identifier required for persistent navigation.
    return {
      ...capability,
      metadata: {
        ...capability.metadata!,
        id: await createStableIdentifier(capability),
      },
    };
  }
}

/**
 * TODO make util copy paste from MicrofrontendViewCapabilityInterceptor
 */
async function createStableIdentifier(capability: Capability): Promise<string> {
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
