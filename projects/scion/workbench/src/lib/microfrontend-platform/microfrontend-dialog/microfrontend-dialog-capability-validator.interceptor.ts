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
import {WorkbenchCapabilities, WorkbenchDialogCapability, WorkbenchDialogSize} from '@scion/workbench-client';
import {Beans} from '@scion/toolkit/bean-manager';
import {Objects} from '../../common/objects.util';

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
      throw Error(`[NullQualifierError] Dialog capability requires a qualifier [capability=${JSON.stringify(dialogCapability)}]`);
    }

    // Assert the dialog capability to have a "properties" section.
    if (!dialogCapability.properties) {
      throw Error(`[NullPropertiesError] Dialog capability requires a "properties" section [application="${dialogCapability.metadata!.appSymbolicName}", capability="${Objects.toMatrixNotation(dialogCapability.qualifier)}"]`);
    }

    // Assert the dialog capability to have a path.
    const path = dialogCapability.properties.path as unknown;
    if (path === undefined || path === null) {
      throw Error(`[NullPathError] Dialog capability requires a path to the microfrontend in its properties [application="${dialogCapability.metadata!.appSymbolicName}", capability="${Objects.toMatrixNotation(dialogCapability.qualifier)}"]`);
    }

    // Assert the dialog capability to have a height and width, unless provided by the host application.
    this.assertSize(dialogCapability);

    return capability;
  }

  private assertSize(capability: Partial<WorkbenchDialogCapability>): void {
    const isHostProvider = capability.metadata!.appSymbolicName === Beans.get(APP_IDENTITY);
    if (isHostProvider) {
      return;
    }

    const size = capability.properties?.size as Partial<WorkbenchDialogSize> | undefined;
    if (!size?.width || !size.height) {
      throw Error(`[NullSizeError] Dialog capability requires width and height in its size properties [application="${capability.metadata!.appSymbolicName}", capability="${Objects.toMatrixNotation(capability.qualifier)}"]`);
    }
  }
}
