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
import {Objects} from '../../common/objects.util';

/**
 * Asserts popup capabilities to have required properties.
 */
@Injectable(/* DO NOT provide via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
export class MicrofrontendPopupCapabilityValidator implements CapabilityInterceptor {

  public async intercept(capability: Capability): Promise<Capability> {
    if (capability.type !== WorkbenchCapabilities.Popup) {
      return capability;
    }

    const popupCapability = capability as Partial<WorkbenchPopupCapability>;
    // Assert the popup capability to have a qualifier set.
    if (!Object.keys(popupCapability.qualifier ?? {}).length) {
      throw Error(`[NullQualifierError] Popup capability requires a qualifier [capability=${JSON.stringify(popupCapability)}]`);
    }

    // Assert the popup capability to have a "properties" section.
    if (!popupCapability.properties) {
      throw Error(`[NullPropertiesError] Popup capability requires a "properties" section [application="${popupCapability.metadata!.appSymbolicName}", capability="${Objects.toMatrixNotation(popupCapability.qualifier)}"]`);
    }

    // Assert the popup capability to have a path set.
    const path = popupCapability.properties.path as unknown;
    if (path === undefined || path === null) {
      throw Error(`[NullPathError] Popup capability requires a path to the microfrontend in its properties [application="${popupCapability.metadata!.appSymbolicName}", capability="${Objects.toMatrixNotation(popupCapability.qualifier)}"]`);
    }

    return capability;
  }
}
