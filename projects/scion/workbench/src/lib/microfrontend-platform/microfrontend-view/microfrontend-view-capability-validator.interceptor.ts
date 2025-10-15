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
import {WorkbenchCapabilities, WorkbenchViewCapability} from '@scion/workbench-client';
import {Objects} from '../../common/objects.util';

/**
 * Asserts view capabilities to have required properties.
 */
@Injectable(/* DO NOT provide via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
export class MicrofrontendViewCapabilityValidator implements CapabilityInterceptor {

  public async intercept(capability: Capability): Promise<Capability> {
    if (capability.type !== WorkbenchCapabilities.View) {
      return capability;
    }

    const viewCapability = capability as Partial<WorkbenchViewCapability>;
    // Assert the view capability to have a qualifier.
    if (!Object.keys(viewCapability.qualifier ?? {}).length) {
      throw Error(`[ViewDefinitionError] View capability requires a qualifier [app=${app(viewCapability)}, view=${qualifier(viewCapability)}]`);
    }

    // Assert the view capability to have properties.
    if (!viewCapability.properties) {
      throw Error(`[ViewDefinitionError] View capability requires properties [app=${app(viewCapability)}, view=${qualifier(viewCapability)}]`);
    }

    // Assert the view capability to have a path set.
    const path = viewCapability.properties.path as unknown;
    if (path === undefined || path === null) {
      throw Error(`[ViewDefinitionError] View capability requires the 'path' property [app=${app(viewCapability)}, view=${qualifier(viewCapability)}]`);
    }

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
