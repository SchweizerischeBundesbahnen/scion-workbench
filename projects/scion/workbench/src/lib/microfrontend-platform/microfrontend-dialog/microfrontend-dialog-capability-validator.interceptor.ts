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
import {WorkbenchCapabilities, WorkbenchDialogCapability, WorkbenchDialogSize} from '@scion/workbench-client';
import {Objects} from '@scion/toolkit/util';
import {Microfrontends} from '../common/microfrontend.util';

/**
 * Asserts dialog capabilities to have required properties.
 */
@Injectable(/* DO NOT provide via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
export class MicrofrontendDialogCapabilityValidator implements CapabilityInterceptor {

  public async intercept(capability: Capability): Promise<Capability> {
    if (capability.type !== WorkbenchCapabilities.Dialog) {
      return capability;
    }

    const dialogCapability = capability as Partial<WorkbenchDialogCapability>;
    // Assert the dialog capability to have a qualifier.
    if (!Object.keys(dialogCapability.qualifier ?? {}).length) {
      throw Error(`[DialogDefinitionError] Dialog capability requires a qualifier [app=${app(dialogCapability)}, dialog=${qualifier(dialogCapability)}]`);
    }

    // Assert the dialog capability to have properties.
    if (!dialogCapability.properties) {
      throw Error(`[DialogDefinitionError] Dialog capability requires properties [app=${app(dialogCapability)}, dialog=${qualifier(dialogCapability)}]`);
    }

    // Assert the dialog capability to have a path, unless provided by the host application.
    this.assertPath(dialogCapability);

    // Assert the dialog capability to have a height and width, unless provided by the host application.
    this.assertSize(dialogCapability);

    // Assert host dialog capabilities not to define the "showSplash" property.
    if (Microfrontends.isHostProvider(capability) && dialogCapability.properties.showSplash !== undefined) {
      throw Error(`[DialogDefinitionError] Property "showSplash" not supported for dialog capabilities of the host application [app=${app(dialogCapability)}, dialog=${qualifier(dialogCapability)}]`);
    }

    return capability;
  }

  private assertPath(capability: Partial<WorkbenchDialogCapability>): void {
    const path = capability.properties?.path as string | undefined | null;

    if (Microfrontends.isHostProvider(capability)) {
      if (path !== '') {
        throw Error(`[DialogDefinitionError] Dialog capabilities of the host application require an empty path. [app=${app(capability)}, dialog=${qualifier(capability)}]. Change the path '${path}' to empty and add 'canMatchWorkbenchDialogCapability(${JSON.stringify(capability.qualifier)})' guard to the route.\n\nExample:\nCapability: { type: 'dialog', qualifier: ${JSON.stringify(capability.qualifier)}, properties: {path: ''} }\nRoute: { path: '', canMatch: [canMatchWorkbenchDialogCapability(${JSON.stringify(capability.qualifier)})], component: DialogComponent }`);
      }
    }
    else {
      if (path === null || path == undefined) {
        throw Error(`[DialogDefinitionError] Dialog capabilities require a path. [app=${app(capability)}, dialog=${qualifier(capability)}]`);
      }
    }
  }

  private assertSize(capability: Partial<WorkbenchDialogCapability>): void {
    if (Microfrontends.isHostProvider(capability)) {
      return;
    }

    const size = capability.properties?.size as Partial<WorkbenchDialogSize> | undefined;
    if (!size?.width || !size.height) {
      throw Error(`[DialogDefinitionError] Dialog capability requires the 'size' property with a width and a height [app=${app(capability)}, dialog=${qualifier(capability)}]`);
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
