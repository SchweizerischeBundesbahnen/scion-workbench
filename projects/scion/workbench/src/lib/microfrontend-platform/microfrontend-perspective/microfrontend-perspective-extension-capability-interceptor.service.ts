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
import {WorkbenchCapabilities, WorkbenchPerspectiveExtensionCapability} from '@scion/workbench-client';

/**
 * Asserts perspective extension capabilities to have required properties.
 */
@Injectable(/* DO NOT PROVIDE via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
export class MicrofrontendPerspectiveExtensionCapabilityInterceptor implements CapabilityInterceptor {

  public async intercept(capability: Capability): Promise<Capability> {
    if (capability.type !== WorkbenchCapabilities.PerspectiveExtension) {
      return capability;
    }
    const perspectiveExtensionCapability = capability as WorkbenchPerspectiveExtensionCapability;
    // Assert the perspective extension capability to have a perspective qualifier set.
    const perspectiveQualifier = perspectiveExtensionCapability.properties?.perspective;
    if (!perspectiveQualifier) {
      throw Error(`[NullQualifierError] Perspective Extension capability requires a perspective qualifier [capability=${JSON.stringify(perspectiveExtensionCapability)}]`);
    }

    perspectiveExtensionCapability.properties?.views.forEach(view => {
      // Assert the views to have qualifier set.
      if (!view.qualifier) {
        throw Error(`[NullQualifierError] Perspective Extension capability requires views to have qualifier [capability=${JSON.stringify(perspectiveExtensionCapability)}]`);
      }
      // Assert the views to have partId set.
      if (!view.partId) {
        throw Error(`[NullPartIdError] Perspective Extension capability requires views to have partId [capability=${JSON.stringify(perspectiveExtensionCapability)}]`);
      }
    });

    return capability;
  }
}
