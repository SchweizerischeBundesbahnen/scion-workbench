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
import {WorkbenchCapabilities, WorkbenchPartCapability, WorkbenchViewRef} from '@scion/workbench-client';
import {Objects} from '../../common/objects.util';

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
      throw Error(`[PartDefinitionError] Part capability requires a qualifier [app=${app(partCapability)}, part=${JSON.stringify(partCapability)}]`);
    }

    // Assert docked part extras, if set.
    if (partCapability.properties?.extras) {
      if (!partCapability.properties.extras.icon) {
        throw Error(`[PartDefinitionError] Missing required 'icon' property in docked part extras [app=${app(partCapability)}, part=${qualifier(partCapability)}]`);
      }
      if (!partCapability.properties.extras.label) {
        throw Error(`[PartDefinitionError] Missing required 'label' property in docked part extras [app=${app(partCapability)}, part=${qualifier(partCapability)}]`);
      }
    }

    // Assert referenced views to have a qualifier.
    partCapability.properties?.views?.forEach((view: Partial<WorkbenchViewRef>) => {
      if (!Object.keys(view.qualifier ?? {}).length) {
        throw Error(`[PartDefinitionError] Missing required qualifier for view [app=${app(partCapability)}, part=${qualifier(partCapability)}]`);
      }
      if (Object.entries(view.qualifier!).some(([key, value]) => key === '*' || value === '*')) {
        throw Error(`[PartDefinitionError] View qualifier must be explicit and not contain wildcards: '${Objects.toMatrixNotation(view.qualifier)}' [app=${app(partCapability)}, part=${qualifier(partCapability)}]`);
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
