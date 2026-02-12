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
import {WorkbenchCapabilities, WorkbenchPopupCapability} from '@scion/workbench-client';
import {Objects} from '@scion/toolkit/util';
import {Microfrontends} from '../common/microfrontend.util';

/**
 * Asserts popup capabilities to have required properties.
 */
@Injectable(/* DO NOT provide via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
export class MicrofrontendPopupCapabilityValidator implements CapabilityInterceptor {

  public async intercept(capability: Capability): Promise<Capability> {
    if (capability.type !== WorkbenchCapabilities.Popup) {
      return capability;
    }

    const popupCapability = capability as Partial<WorkbenchPopupCapability>;
    // Assert the popup capability to have a qualifier.
    if (!Object.keys(popupCapability.qualifier ?? {}).length) {
      throw Error(`[PopupDefinitionError] Popup capability requires a qualifier [app=${app(popupCapability)}, popup=${qualifier(popupCapability)}]`);
    }

    // Assert the popup capability to have properties.
    if (!popupCapability.properties) {
      throw Error(`[PopupDefinitionError] Popup capability requires properties [app=${app(popupCapability)}, popup=${qualifier(popupCapability)}]`);
    }

    // Assert the popup capability to have a path, unless provided by the host application.
    this.assertPath(popupCapability);

    // Assert host popup capabilities not to define the "showSplash" property.
    if (Microfrontends.isHostProvider(capability) && popupCapability.properties.showSplash !== undefined) {
      throw Error(`[PopupDefinitionError] Property "showSplash" not supported for popup capabilities of the host application [app=${app(popupCapability)}, popup=${qualifier(popupCapability)}]`);
    }

    return capability;
  }

  private assertPath(capability: Partial<WorkbenchPopupCapability>): void {
    const path = capability.properties?.path as string | undefined | null;

    if (Microfrontends.isHostProvider(capability)) {
      if (path !== '') {
        throw Error(`[PopupDefinitionError] Popup capabilities of the host application require an empty path. [app=${app(capability)}, popup=${qualifier(capability)}]. Change the path '${path}' to empty and add 'canMatchWorkbenchPopupCapability(${JSON.stringify(capability.qualifier)})' guard to the route.\n\nExample:\nCapability: { type: 'popup', qualifier: ${JSON.stringify(capability.qualifier)}, properties: {path: ''} }\nRoute: { path: '', canMatch: [canMatchWorkbenchPopupCapability(${JSON.stringify(capability.qualifier)})], component: PopupComponent }`);
      }
    }
    else {
      if (path === null || path == undefined) {
        throw Error(`[PopupDefinitionError] Popup capabilities require a path. [app=${app(capability)}, popup=${qualifier(capability)}]`);
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
