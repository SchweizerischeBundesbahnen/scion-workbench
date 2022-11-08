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
import {WorkbenchCapabilities, WorkbenchViewCapability} from '@scion/workbench-client';
import {Crypto} from '@scion/toolkit/crypto';

/**
 * Asserts view capabilities to have required properties and assigns each view capability a stable identifer required for persistent navigation.
 */
@Injectable()
export class MicrofrontendViewCapabilityInterceptor implements CapabilityInterceptor {

  public async intercept(capability: Capability): Promise<Capability> {
    if (capability.type !== WorkbenchCapabilities.View) {
      return capability;
    }

    const viewCapability = capability as WorkbenchViewCapability;
    // Assert the view capability to have a qualifier set.
    if (!viewCapability.qualifier || !Object.keys(viewCapability.qualifier).length) {
      throw Error(`[NullQualifierError] View capability requires a qualifier [capability=${JSON.stringify(viewCapability)}]`);
    }

    // Assert the view capability to have a path set.
    const path = viewCapability.properties?.path;
    if (path === undefined || path === null) {
      throw Error(`[NullPathError] View capability requires a path to the microfrontend in its properties [capability=${JSON.stringify(viewCapability)}]`);
    }

    // Set a stable identifier required for persistent navigation.
    return {
      ...viewCapability,
      metadata: {
        ...viewCapability.metadata!,
        id: await createStableViewIdentifier(viewCapability),
      },
    };
  }
}

/**
 * Creates a stable identifier for given view capability.
 */
async function createStableViewIdentifier(capability: WorkbenchViewCapability): Promise<string> {
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
