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
import {Microfrontends} from '../common/microfrontend.util';

/**
 * Asserts view capabilities to have required properties and assigns each view capability a stable identifer required for persistent navigation.
 */
@Injectable(/* DO NOT PROVIDE via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
export class MicrofrontendViewCapabilityValidator implements CapabilityInterceptor {

  public async intercept(capability: Capability): Promise<Capability> {
    if (capability.type !== WorkbenchCapabilities.View) {
      return capability;
    }

    const viewCapability = capability as WorkbenchViewCapability;
    // Assert the view capability to have a qualifier set.
    if (!viewCapability.qualifier || !Object.keys(viewCapability.qualifier).length) {
      throw Error(`[NullQualifierError] View capability requires a qualifier [capability=${JSON.stringify(viewCapability)}]`);
    }

    // Assert the view capability to have a path set.
    const path = viewCapability.properties?.path;
    if (path === undefined || path === null) {
      throw Error(`[NullPathError] View capability requires a path to the microfrontend in its properties [capability=${JSON.stringify(viewCapability)}]`);
    }

    if (Microfrontends.isHostProvider(viewCapability)) {
      this.validateHostCapability(viewCapability);
    }

    return capability;
  }

  private validateHostCapability(hostCapability: WorkbenchViewCapability): void {
    if (hostCapability.properties.title) {
      throw Error(`[UnsupportedCapabilityProperty] Host view capability must not define the "title" property. Set the title via route data or the view handle instead. [capability=${JSON.stringify(hostCapability)}]`);
    }
    if (hostCapability.properties.heading) {
      throw Error(`[UnsupportedCapabilityProperty] Host view capability must not define the "heading" property. Set the heading via route data or the view handle instead. [capability=${JSON.stringify(hostCapability)}]`);
    }
    if (hostCapability.properties.closable) {
      throw Error(`[UnsupportedCapabilityProperty] Host view capability must not define "closable" property. Set the heading via route data or the view handle instead. [capability=${JSON.stringify(hostCapability)}]`);
    }
    if (hostCapability.properties.cssClass) {
      throw Error(`[UnsupportedCapabilityProperty] Host view capability must not define the "cssClass" property. Set the CSS class(es) via route data or the view handle instead. [capability=${JSON.stringify(hostCapability)}]`);
    }
    if (hostCapability.properties.showSplash) {
      throw Error(`[UnsupportedCapabilityProperty] Host view capability must not define the "showSplash" property. [capability=${JSON.stringify(hostCapability)}]`);
    }
  }
}
