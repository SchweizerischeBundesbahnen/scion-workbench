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
export class MicrofrontendPerspectiveCapabilityValidator implements CapabilityInterceptor {

  public async intercept(capability: Capability): Promise<Capability> {
    if (capability.type !== WorkbenchCapabilities.Perspective) {
      return capability;
    }

    const perspectiveCapability = capability as Partial<WorkbenchPerspectiveCapabilityV2>;
    // Assert the perspective capability to have a qualifier.
    if (!Object.keys(perspectiveCapability.qualifier ?? {}).length) {
      throw Error(`[PerspectiveDefinitionError] Perspective capability requires a qualifier [app=${app(perspectiveCapability)}, perspective=${JSON.stringify(perspectiveCapability)}]`);
    }

    // Assert the perspective capability to have a properties section.
    if (!perspectiveCapability.properties) {
      throw Error(`[PerspectiveDefinitionError] Perspective capability requires a 'properties' section [app=${app(perspectiveCapability)}, perspective=${qualifier(perspectiveCapability)}]`);
    }

    // Assert the perspective capability to have parts.
    if (!perspectiveCapability.properties.parts as unknown) {
      throw Error(`[PerspectiveDefinitionError] Perspective capability requires the 'parts' property [app=${app(perspectiveCapability)}, perspective=${qualifier(perspectiveCapability)}]`);
    }

    // Assert the perspective capability to have an initial part.
    const [initialPart, ...parts] = perspectiveCapability.properties.parts;
    if (!initialPart as unknown) {
      throw Error(`[PerspectiveDefinitionError] Perspective capability requires an initial part [app=${app(perspectiveCapability)}, perspective=${qualifier(perspectiveCapability)}]`);
    }

    // Assert unique part ids.
    const distinctPartIds = new Set(perspectiveCapability.properties.parts.map(part => part.id));
    if (distinctPartIds.size !== perspectiveCapability.properties.parts.length) {
      throw Error(`[PerspectiveDefinitionError] Parts of perspective must have a unique id [app=${app(perspectiveCapability)}, perspective=${qualifier(perspectiveCapability)}]`);
    }

    // Assert initial part not to be a docked part.
    if ('position' in initialPart as unknown) {
      throw Error(`[PerspectiveDefinitionError] Initial part '${initialPart.id}' of perspective must not have the 'position' property [app=${app(perspectiveCapability)}, perspective=${qualifier(perspectiveCapability)}]`);
    }

    // Assert other parts to have the position property.
    parts.forEach(part => {
      if (!('position' in part as unknown)) {
        throw Error(`[PerspectiveDefinitionError] Part '${part.id}' requires the 'position' property [app=${app(perspectiveCapability)}, perspective=${qualifier(perspectiveCapability)}]`);
      }
    });

    return capability;
  }
}

/**
 * Returns the qualifier as string.
 */
function qualifier(capability: Partial<Capability>): string {
  return Objects.toMatrixNotation(capability.qualifier);
}

/**
 * Returns the app symbolic name.
 */
function app(capability: Partial<Capability>): string {
  return capability.metadata!.appSymbolicName;
}
