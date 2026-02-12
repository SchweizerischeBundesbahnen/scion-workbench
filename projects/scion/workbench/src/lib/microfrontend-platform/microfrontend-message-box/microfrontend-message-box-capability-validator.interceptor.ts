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
import {Objects} from '@scion/toolkit/util';
import {Microfrontends} from '../common/microfrontend.util';

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
      throw Error(`[MessageBoxDefinitionError] MessageBox capability requires a qualifier [app=${app(messageBoxCapability)}, messagebox=${qualifier(messageBoxCapability)}]`);
    }

    // Assert capability to have properties.
    if (!messageBoxCapability.properties) {
      throw Error(`[MessageBoxDefinitionError] MessageBox capability requires properties [app=${app(messageBoxCapability)}, messagebox=${qualifier(messageBoxCapability)}]`);
    }

    // Assert the messagebox capability to have a path, unless provided by the host application.
    this.assertPath(messageBoxCapability);

    // Assert host dialog capabilities not to define the "showSplash" property.
    if (Microfrontends.isHostProvider(capability) && messageBoxCapability.properties.showSplash !== undefined) {
      throw Error(`[MessageBoxDefinitionError] Property "showSplash" not supported for messagebox capabilities of the host application [app=${app(messageBoxCapability)}, messagebox=${qualifier(messageBoxCapability)}]`);
    }

    return capability;
  }

  private assertPath(capability: Partial<WorkbenchMessageBoxCapability>): void {
    const path = capability.properties?.path as string | undefined | null;

    if (Microfrontends.isHostProvider(capability)) {
      if (path !== '') {
        throw Error(`[MessageBoxDefinitionError] Messagebox capabilities of the host application require an empty path. [app=${app(capability)}, messagebox=${qualifier(capability)}]. Change the path '${path}' to empty and add 'canMatchWorkbenchMessageBoxCapability(${JSON.stringify(capability.qualifier)})' guard to the route.\n\nExample:\nCapability: { type: 'messagebox', qualifier: ${JSON.stringify(capability.qualifier)}, properties: {path: ''} }\nRoute: { path: '', canMatch: [canMatchWorkbenchMessageBoxCapability(${JSON.stringify(capability.qualifier)})], component: MessageComponent }`);
      }
    }
    else {
      if (path === null || path == undefined) {
        throw Error(`[MessageBoxDefinitionError] MessageBox capabilities require a path. [app=${app(capability)}, messagebox=${qualifier(capability)}]`);
      }
    }
  }
}

function isBuiltInTextMessageBoxCapability(capability: Partial<WorkbenchMessageBoxCapability>): boolean {
  return capability.properties?.[TEXT_MESSAGE_BOX_CAPABILITY_IDENTITY_PROPERTY] === TEXT_MESSAGE_BOX_CAPABILITY_IDENTITY;
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
