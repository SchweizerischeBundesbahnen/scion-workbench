/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {APP_IDENTITY, Capability, CapabilityInterceptor} from '@scion/microfrontend-platform';
import {Injectable} from '@angular/core';
import {WorkbenchCapabilities, WorkbenchDialogCapability} from '@scion/workbench-client';
import {Beans} from '@scion/toolkit/bean-manager';

/**
 * Asserts dialog capabilities to have required properties.
 */
@Injectable(/* DO NOT PROVIDE via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
export class MicrofrontendDialogCapabilityValidator implements CapabilityInterceptor {

  public async intercept(capability: Capability): Promise<Capability> {
    if (capability.type !== WorkbenchCapabilities.Dialog) {
      return capability;
    }

    const dialogCapability = capability as WorkbenchDialogCapability;
    // Assert the dialog capability to have a qualifier.
    if (!dialogCapability.qualifier || !Object.keys(dialogCapability.qualifier).length) {
      throw Error(`[NullQualifierError] Dialog capability requires a qualifier [capability=${JSON.stringify(dialogCapability)}]`);
    }

    // Assert the dialog capability to have a path.
    const path = dialogCapability.properties?.path;
    if (path === undefined || path === null) {
      throw Error(`[NullPathError] Dialog capability requires a path to the microfrontend in its properties [capability=${JSON.stringify(dialogCapability)}]`);
    }

    // Assert the dialog capability to have a height and width, unless provided by the host application.
    this.assertSize(dialogCapability);

    return dialogCapability;
  }

  private assertSize(capability: WorkbenchDialogCapability): void {
    const isHostProvider = capability.metadata!.appSymbolicName === Beans.get(APP_IDENTITY);
    if (isHostProvider) {
      return;
    }

    const size = capability.properties?.size;
    if (!size?.width || !size?.height) {
      throw Error(`[NullSizeError] Dialog capability requires width and height in its size properties [capability=${JSON.stringify(capability)}]`);
    }
  }
}
