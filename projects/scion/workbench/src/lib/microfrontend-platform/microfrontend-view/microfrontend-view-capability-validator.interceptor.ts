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
    // Assert the view capability to have a qualifier set.
    if (!Object.keys(viewCapability.qualifier ?? {}).length) {
      throw Error(`[NullQualifierError] View capability requires a qualifier [capability=${JSON.stringify(viewCapability)}]`);
    }

    // Assert the view capability to have a "properties" section.
    if (!viewCapability.properties) {
      throw Error(`[NullPropertiesError] View capability requires a "properties" section [application="${viewCapability.metadata!.appSymbolicName}", capability="${Objects.toMatrixNotation(viewCapability.qualifier)}"]`);
    }

    // Assert the view capability to have a path set.
    const path = viewCapability.properties.path as unknown;
    if (path === undefined || path === null) {
      throw Error(`[NullPathError] View capability requires a path to the microfrontend in its properties [application="${viewCapability.metadata!.appSymbolicName}", capability="${Objects.toMatrixNotation(viewCapability.qualifier)}"]`);
    }

    return capability;
  }
}
