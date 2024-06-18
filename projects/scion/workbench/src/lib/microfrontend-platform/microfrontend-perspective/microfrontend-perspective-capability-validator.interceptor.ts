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
import {WorkbenchCapabilities, WorkbenchPerspectiveCapability} from '@scion/workbench-client';
import {Objects} from '../../common/objects.util';
import {MAIN_AREA} from '../../layout/workbench-layout';

/**
 * Asserts perspective capabilities to have required properties.
 */
@Injectable(/* DO NOT PROVIDE via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
export class MicrofrontendPerspectiveCapabilityValidator implements CapabilityInterceptor {

  public async intercept(capability: Capability): Promise<Capability> {
    if (capability.type !== WorkbenchCapabilities.Perspective) {
      return capability;
    }

    const perspectiveCapability = capability as WorkbenchPerspectiveCapability;
    // Assert the perspective capability to have a qualifier set.
    if (!Object.keys(perspectiveCapability.qualifier ?? {}).length) {
      throw Error(`[NullQualifierError] Perspective capability requires a qualifier [capability=${JSON.stringify(perspectiveCapability)}]`);
    }

    // Assert the perspective capability to have a layout set.
    if (!perspectiveCapability.properties?.layout) {
      throw Error(`[NullLayoutError] Perspective capability requires a layout [application="${perspectiveCapability.metadata!.appSymbolicName}", capability="${Objects.toMatrixNotation(perspectiveCapability.qualifier)}"]`);
    }

    // Assert the perspective capability to define parts.
    if (!perspectiveCapability.properties.layout.length) {
      throw Error(`[NullLayoutError] Perspective capability requires parts [application="${perspectiveCapability.metadata!.appSymbolicName}", capability="${Objects.toMatrixNotation(perspectiveCapability.qualifier)}"]`);
    }

    // Assert no views to be added to the main area.
    if (perspectiveCapability.properties.layout.find(part => part.id === MAIN_AREA)?.views?.length) {
      throw Error(`[PerspectiveLayoutError] Perspective capability cannot add views to the main area [application="${perspectiveCapability.metadata!.appSymbolicName}", capability="${Objects.toMatrixNotation(perspectiveCapability.qualifier)}"]`);
    }

    return capability;
  }
}
