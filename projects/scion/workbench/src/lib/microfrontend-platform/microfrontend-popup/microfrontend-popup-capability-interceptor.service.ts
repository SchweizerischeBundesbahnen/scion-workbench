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
import {WorkbenchCapabilities, WorkbenchPopupCapability} from '@scion/workbench-client';

/**
 * Asserts popup capabilities to have required properties.
 */
@Injectable()
export class MicrofrontendPopupCapabilityInterceptor implements CapabilityInterceptor {

  public async intercept(capability: Capability): Promise<Capability> {
    if (capability.type !== WorkbenchCapabilities.Popup) {
      return capability;
    }

    const popupCapability = capability as WorkbenchPopupCapability;
    // Assert the popup capability to have a qualifier set.
    if (!popupCapability.qualifier || !Object.keys(popupCapability.qualifier).length) {
      throw Error(`[NullQualifierError] Popup capability requires a qualifier [capability=${JSON.stringify(popupCapability)}]`);
    }

    // Assert the popup capability to have a path set.
    const path = popupCapability.properties?.path;
    if (path === undefined || path === null) {
      throw Error(`[NullPathError] Popup capability requires a path to the microfrontend in its properties [capability=${JSON.stringify(popupCapability)}]`);
    }

    return popupCapability;
  }
}
