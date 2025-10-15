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
import {RelativeTo, WorkbenchCapabilities, WorkbenchPartRef, WorkbenchPerspectiveCapability} from '@scion/workbench-client';
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

    const perspectiveCapability = capability as Partial<WorkbenchPerspectiveCapability>;
    // Assert the perspective capability to have a qualifier.
    if (!Object.keys(perspectiveCapability.qualifier ?? {}).length) {
      throw Error(`[PerspectiveDefinitionError] Perspective capability requires a qualifier [app=${app(perspectiveCapability)}, perspective=${JSON.stringify(perspectiveCapability)}]`);
    }

    // Assert the perspective capability to have properties.
    if (!perspectiveCapability.properties) {
      throw Error(`[PerspectiveDefinitionError] Perspective capability requires properties [app=${app(perspectiveCapability)}, perspective=${qualifier(perspectiveCapability)}]`);
    }

    // Assert the perspective capability to have parts.
    if (!perspectiveCapability.properties.parts as unknown) {
      throw Error(`[PerspectiveDefinitionError] Perspective capability requires the 'parts' property [app=${app(perspectiveCapability)}, perspective=${qualifier(perspectiveCapability)}]`);
    }

    // Assert parts to have an id.
    const parts = perspectiveCapability.properties.parts as Partial<WorkbenchPartRef>[];
    parts.forEach((part, index) => {
      if (!part.id) {
        throw Error(`[PerspectiveDefinitionError] Missing required 'id' property of part at index '${index}' [app=${app(perspectiveCapability)}, perspective=${qualifier(perspectiveCapability)}]`);
      }
    });

    // Assert unique part ids.
    if (new Set(parts.map(part => part.id)).size !== parts.length) {
      throw Error(`[PerspectiveDefinitionError] Parts of perspective must have a unique id [app=${app(perspectiveCapability)}, perspective=${qualifier(perspectiveCapability)}]`);
    }

    // Assert the perspective capability to have an initial part.
    const [initialPart, ...otherParts] = parts;
    if (!initialPart) {
      throw Error(`[PerspectiveDefinitionError] Perspective capability requires an initial part [app=${app(perspectiveCapability)}, perspective=${qualifier(perspectiveCapability)}]`);
    }

    // Assert initial part not to be positioned.
    if (initialPart.position) {
      throw Error(`[PerspectiveDefinitionError] Initial part '${initialPart.id}' of perspective must not have the 'position' property [app=${app(perspectiveCapability)}, perspective=${qualifier(perspectiveCapability)}]`);
    }

    // Assert other parts to be positioned.
    otherParts.forEach(part => {
      if (!part.position) {
        throw Error(`[PerspectiveDefinitionError] Missing required 'position' property in part '${part.id}' [app=${app(perspectiveCapability)}, perspective=${qualifier(perspectiveCapability)}]`);
      }
      if (typeof part.position === 'string' && !dockingAreas.has(part.position)) {
        throw Error(`[PerspectiveDefinitionError] Illegal position in docked part '${part.id}': '${part.position}'. Must be one of [${[...dockingAreas].join(',')}] [app=${app(perspectiveCapability)}, perspective=${qualifier(perspectiveCapability)}]`);
      }
      if (typeof part.position === 'object' && !(part.position as Partial<RelativeTo>).align) {
        throw Error(`[PerspectiveDefinitionError] Missing required 'align' property in part '${part.id}': { position: { align: 'left|right|top|bottom' } } [app=${app(perspectiveCapability)}, perspective=${qualifier(perspectiveCapability)}]`);
      }
      if (typeof part.position === 'object' && !align.has(part.position.align)) {
        throw Error(`[PerspectiveDefinitionError] Illegal alignment of part '${part.id}': '${part.position.align}'. Must be one of [${[...align].join(',')}] [app=${app(perspectiveCapability)}, perspective=${qualifier(perspectiveCapability)}]`);
      }
      if (typeof part.position === 'object' && part.position.relativeTo && !parts.some(otherPart => otherPart.id === (part.position as RelativeTo).relativeTo)) {
        throw Error(`[PerspectiveDefinitionError] Illegal part '${part.position.relativeTo}' referenced in 'relativeTo' of part '${part.id}'. Part not found. [app=${app(perspectiveCapability)}, perspective=${qualifier(perspectiveCapability)}]`);
      }
    });

    // Assert parts to have a qualifier.
    parts.forEach(part => {
      if (!Object.keys(part.qualifier ?? {}).length) {
        throw Error(`[PerspectiveDefinitionError] Missing required qualifier for part '${part.id}' [app=${app(perspectiveCapability)}, perspective=${qualifier(perspectiveCapability)}]`);
      }
      if (Object.entries(part.qualifier!).some(([key, value]) => key === '*' || value === '*')) {
        throw Error(`[PerspectiveDefinitionError] Qualifier for part '${part.id}' must be explicit and not contain wildcards: '${Objects.toMatrixNotation(part.qualifier)}' [app=${app(perspectiveCapability)}, perspective=${qualifier(perspectiveCapability)}]`);
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

const dockingAreas = new Set()
  .add('left-top')
  .add('left-bottom')
  .add('right-top')
  .add('right-bottom')
  .add('bottom-left')
  .add('bottom-right');

const align = new Set()
  .add('left')
  .add('right')
  .add('top')
  .add('bottom');
