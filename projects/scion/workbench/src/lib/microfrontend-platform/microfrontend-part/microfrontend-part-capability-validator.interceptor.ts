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
import {Microfrontends} from '../common/microfrontend.util';

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

    // Assert the path of the part capability.
    if (partCapability.properties?.path !== undefined) {
      this.assertPath(partCapability);
    }

    // Assert host part capabilities not to define the "showSplash" property.
    if (Microfrontends.isHostProvider(capability) && partCapability.properties?.showSplash !== undefined) {
      throw Error(`[PartDefinitionError] Property "showSplash" not supported for part capabilities of the host application [app=${app(partCapability)}, part=${qualifier(partCapability)}]`);
    }

    // Assert "showSplash" property not to be defined if part has no path.
    if (partCapability.properties?.path === undefined && partCapability.properties?.showSplash !== undefined) {
      throw Error(`[PartDefinitionError] Property "showSplash" only supported for part capabilities with a path [app=${app(partCapability)}, part=${qualifier(partCapability)}]`);
    }

    return capability;
  }

  private assertPath(capability: Partial<WorkbenchPartCapability>): void {
    const path = capability.properties?.path as string | null;

    if (Microfrontends.isHostProvider(capability)) {
      if (path === null || path.length) {
        throw Error(`[PartDefinitionError] Part capabilities of the host application require an empty path. [app=${app(capability)}, part=${qualifier(capability)}]. Change the path '${path}' to empty and add 'canMatchWorkbenchPartCapability(${JSON.stringify(capability.qualifier)})' guard to the route.\n\nExample:\nCapability: { type: 'part', qualifier: ${JSON.stringify(capability.qualifier)}, properties: {path: ''} }\nRoute: { path: '', canMatch: [canMatchWorkbenchPartCapability(${JSON.stringify(capability.qualifier)})], component: PartComponent }`);
      }
    }
    else {
      if (path === null) {
        throw Error(`[PartDefinitionError] Part capabilities require a path. [app=${app(capability)}, part=${qualifier(capability)}]`);
      }
    }
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
