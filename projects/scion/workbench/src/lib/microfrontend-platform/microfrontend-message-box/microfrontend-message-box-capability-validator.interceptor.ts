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
import {TEXT_MESSAGE_BOX_CAPABILITY_IDENTITY, TEXT_MESSAGE_BOX_CAPABILITY_IDENTITY_PROPERTY} from '../microfrontend-host-message-box/text-message/text-message.component';
import {Objects} from '../../common/objects.util';

/**
 * Asserts message box capabilities to have required properties.
 */
@Injectable(/* DO NOT provide via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
export class MicrofrontendMessageBoxCapabilityValidator implements CapabilityInterceptor {

  public async intercept(capability: Capability): Promise<Capability> {
    if (capability.type !== WorkbenchCapabilities.MessageBox) {
      return capability;
    }

    const messageBoxCapability = capability as Partial<WorkbenchMessageBoxCapability>;

    // Assert capability other than the built-in text messsage box capability to have a qualifier.
    if (!isBuiltInTextMessageBoxCapability(messageBoxCapability) && !Object.keys(messageBoxCapability.qualifier ?? {}).length) {
      throw Error(`[NullQualifierError] MessageBox capability requires a qualifier [capability=${JSON.stringify(messageBoxCapability)}]`);
    }

    // Assert capability to have a "properties" section.
    if (!messageBoxCapability.properties) {
      throw Error(`[NullPropertiesError] MessageBox capability requires a "properties" section [application="${messageBoxCapability.metadata!.appSymbolicName}", capability="${Objects.toMatrixNotation(messageBoxCapability.qualifier)}"]`);
    }

    // Assert capability to have a path.
    const path = messageBoxCapability.properties.path as unknown;
    if (path === undefined || path === null) {
      throw Error(`[NullPathError] MessageBox capability requires a path to the microfrontend in its properties [application="${messageBoxCapability.metadata!.appSymbolicName}", capability="${Objects.toMatrixNotation(messageBoxCapability.qualifier)}"]`);
    }

    return capability;
  }
}

function isBuiltInTextMessageBoxCapability(capability: Partial<WorkbenchMessageBoxCapability>): boolean {
  return capability.properties?.[TEXT_MESSAGE_BOX_CAPABILITY_IDENTITY_PROPERTY] === TEXT_MESSAGE_BOX_CAPABILITY_IDENTITY;
}
