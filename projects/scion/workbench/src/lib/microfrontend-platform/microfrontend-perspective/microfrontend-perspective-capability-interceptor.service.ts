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
import {WorkbenchCapabilities, WorkbenchPerspectiveCapability} from '@scion/workbench-client';
import {createStableIdentifier} from '../../common/capability.util';

@Injectable()
export class MicrofrontendPerspectiveCapabilityInterceptor implements CapabilityInterceptor {

  public async intercept(capability: Capability): Promise<Capability> {
    if (capability.type !== WorkbenchCapabilities.Perspective) {
      return capability;
    }

    const perspectiveCapability = capability as WorkbenchPerspectiveCapability;
    // Assert the perspective capability to have a qualifier set.
    if (!perspectiveCapability.qualifier || !Object.keys(perspectiveCapability.qualifier).length) {
      throw Error(`[NullQualifierError] Perspective capability requires a qualifier [capability=${JSON.stringify(perspectiveCapability)}]`);
    }

    perspectiveCapability.properties?.parts.forEach(part => {
      // Assert the parts to have an id set.
      if (!part.id) {
        throw Error(`[NullPartIdError] Perspective capability requires parts to have an id [capability=${JSON.stringify(perspectiveCapability)}]`);
      }
    });

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
