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
import {Microfrontends} from '../common/microfrontend.util';

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

    // Assert the view capability to have a path, unless provided by the host application.
    this.assertPath(viewCapability);

    // Assert host view capabilities not to define the "lazy" property.
    if (Microfrontends.isHostProvider(capability) && viewCapability.properties.lazy !== undefined) {
      throw Error(`[ViewDefinitionError] Property "lazy" not supported for view capabilities of the host application [app=${app(viewCapability)}, view=${qualifier(viewCapability)}]`);
    }

    // Assert host view capabilities not to define the "showSplash" property.
    if (Microfrontends.isHostProvider(capability) && viewCapability.properties.showSplash !== undefined) {
      throw Error(`[ViewDefinitionError] Property "showSplash" not supported for view capabilities of the host application [app=${app(viewCapability)}, view=${qualifier(viewCapability)}]`);
    }

    return capability;
  }

  private assertPath(capability: Partial<WorkbenchViewCapability>): void {
    const path = capability.properties?.path as string | undefined | null;

    if (Microfrontends.isHostProvider(capability)) {
      if (path !== '') {
        throw Error(`[ViewDefinitionError] View capabilities of the host application require an empty path. [app=${app(capability)}, view=${qualifier(capability)}]. Change the path '${path}' to empty and add 'canMatchWorkbenchViewCapability(${JSON.stringify(capability.qualifier)})' guard to the route.\n\nExample:\nCapability: { type: 'view', qualifier: ${JSON.stringify(capability.qualifier)}, properties: {path: ''} }\nRoute: { path: '', canMatch: [canMatchWorkbenchViewCapability(${JSON.stringify(capability.qualifier)})], component: ViewComponent }`);
      }
    }
    else {
      if (path === null || path == undefined) {
        throw Error(`[ViewDefinitionError] View capabilities require a path. [app=${app(capability)}, view=${qualifier(capability)}]`);
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
