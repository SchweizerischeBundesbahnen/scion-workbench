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
import {WorkbenchCapabilities, WorkbenchPerspectiveCapabilityV2} from '@scion/workbench-client';
import {Objects} from '../../common/objects.util';

/**
 * Asserts perspective capabilities to have required properties.
 */
@Injectable(/* DO NOT provide via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
export class MicrofrontendPerspectiveCapabilityValidatorV2 implements CapabilityInterceptor {

  public async intercept(capability: Capability): Promise<Capability> {
    if (capability.type !== WorkbenchCapabilities.PerspectiveV2) {
      return capability;
    }

    const perspectiveCapability = capability as Partial<WorkbenchPerspectiveCapabilityV2>;
    // Assert the perspective capability to have a qualifier.
    if (!Object.keys(perspectiveCapability.qualifier ?? {}).length) {
      throw Error(`[PerspectiveDefinitionError] Perspective capability requires a qualifier [capability=${JSON.stringify(perspectiveCapability)}]`);
    }

    // Assert the perspective capability to have a "properties" section.
    if (!perspectiveCapability.properties) {
      throw Error(`[PerspectiveDefinitionError] Perspective capability requires a "properties" section [application="${perspectiveCapability.metadata!.appSymbolicName}", capability="${Objects.toMatrixNotation(perspectiveCapability.qualifier)}"]`);
    }

    // Assert the perspective capability to have parts.
    if (!perspectiveCapability.properties.parts as unknown) {
      throw Error(`[PerspectiveDefinitionError] Perspective capability requires a "parts" property [application="${perspectiveCapability.metadata!.appSymbolicName}", capability="${Objects.toMatrixNotation(perspectiveCapability.qualifier)}"]`);
    }

    // TODO [ACTIVITY]
    // Validate:
    // - main area has no views
    //   const isMainAreaPart = partRef.id === MAIN_AREA || partRef.id === 'main-area';
    //   if (isMainAreaPart && partCapability.properties.views?.length) {
    //     throw Error(`[PerspectiveDefinitionError] Views not allowed in the main area part. Ignoring views added to the main area part in perspective '${Objects.toMatrixNotation(perspectiveCapability.qualifier)}' from app '${perspectiveCapability.metadata!.appSymbolicName}'.`);
    //   }
    // - initial part required (first part in array, no position)
    // - other parts have position
    // - unique IDS
    // - Probibit wildcard qualifier for parts and views -> qualifier must be explicit
    // - Position property values

    // // Assert the perspective capability to define parts.
    // if (!perspectiveCapability.properties.layout.length) {
    //   throw Error(`[PerspectiveDefinitionError] Perspective capability requires parts [application="${perspectiveCapability.metadata!.appSymbolicName}", capability="${Objects.toMatrixNotation(perspectiveCapability.qualifier)}"]`);
    // }
    //
    // // Assert no views to be added to the main area.
    // if (perspectiveCapability.properties.layout.find(part => part.id === MAIN_AREA)?.views?.length) {
    //   throw Error(`[PerspectiveDefinitionError] Perspective capability cannot add views to the main area [application="${perspectiveCapability.metadata!.appSymbolicName}", capability="${Objects.toMatrixNotation(perspectiveCapability.qualifier)}"]`);
    // }

    return capability;
  }
}
