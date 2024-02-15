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
import {Injectable} from '@angular/core';
import {WorkbenchCapabilities, WorkbenchDialogCapability} from '@scion/workbench-client';

/**
 * Validates that dialog capabilities have the required properties before registering them in the workbench.
 */
@Injectable(/* DO NOT PROVIDE via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
export class MicrofrontendDialogCapabilityInterceptor implements CapabilityInterceptor {

  public async intercept(capability: Capability): Promise<Capability> {
    if (capability.type !== WorkbenchCapabilities.Dialog) {
      return capability;
    }

    const dialogCapability = capability as WorkbenchDialogCapability;
    // Validate that the dialog capability has a qualifier set.
    if (!dialogCapability.qualifier || !Object.keys(dialogCapability.qualifier).length) {
      throw Error(`[NullQualifierError] Dialog capability requires a qualifier [capability=${JSON.stringify(dialogCapability)}]`);
    }

    // Validate that the dialog capability has a path set.
    const path = dialogCapability.properties?.path;
    if (path === undefined || path === null) {
      throw Error(`[NullPathError] Dialog capability requires a path to the microfrontend in its properties [capability=${JSON.stringify(dialogCapability)}]`);
    }

    // Validate that the dialog capability has height and width set.
    const size = dialogCapability.properties?.size;
    if (!size?.width || !size?.height) {
      throw Error(`[NullSizeError] Dialog capability requires width and height in its size properties [capability=${JSON.stringify(dialogCapability)}]`);
    }

    return dialogCapability;
  }
}
