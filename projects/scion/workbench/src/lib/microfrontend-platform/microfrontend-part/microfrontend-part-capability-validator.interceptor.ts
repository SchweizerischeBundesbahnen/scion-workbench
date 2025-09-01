/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Capability, CapabilityInterceptor} from '@scion/microfrontend-platform';
import {Injectable} from '@angular/core';
import {WorkbenchCapabilities, WorkbenchPartCapability} from '@scion/workbench-client';

/**
 * Asserts part capabilities to have required properties.
 */
@Injectable(/* DO NOT provide via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
export class MicrofrontendPartCapabilityValidator implements CapabilityInterceptor {

  public async intercept(capability: Capability): Promise<Capability> {
    if (capability.type !== WorkbenchCapabilities.Part) {
      return capability;
    }

    const partCapability = capability as Partial<WorkbenchPartCapability>;
    // Assert the part capability to have a qualifier.
    if (!Object.keys(partCapability.qualifier ?? {}).length) {
      throw Error(`[NullQualifierError] Part capability requires a qualifier [capability=${JSON.stringify(partCapability)}]`);
    }

    return capability;
  }
}
