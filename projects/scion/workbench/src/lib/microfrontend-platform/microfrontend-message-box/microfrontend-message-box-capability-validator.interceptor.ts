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
import {WorkbenchCapabilities, WorkbenchMessageBoxCapability} from '@scion/workbench-client';

/**
 * Validates that message box capabilities have the required properties before registering them in the workbench.
 */
@Injectable(/* DO NOT PROVIDE via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
export class MicrofrontendMessageBoxCapabilityValidator implements CapabilityInterceptor {

  public async intercept(capability: Capability): Promise<Capability> {
    if (capability.type !== WorkbenchCapabilities.MessageBox) {
      return capability;
    }

    const messageBoxCapability = capability as WorkbenchMessageBoxCapability;

    // Validate that the message box capability has a path set.
    const path = messageBoxCapability.properties?.path;
    if (path === undefined || path === null) {
      throw Error(`[NullPathError] MessageBox capability requires a path to the microfrontend in its properties [capability=${JSON.stringify(messageBoxCapability)}]`);
    }

    return messageBoxCapability;
  }
}
