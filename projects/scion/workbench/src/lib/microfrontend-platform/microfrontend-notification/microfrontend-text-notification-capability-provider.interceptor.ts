/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable} from '@angular/core';
import {HostManifestInterceptor, Manifest} from '@scion/microfrontend-platform';
import {eNOTIFICATION_MESSAGE_PARAM, WorkbenchCapabilities, WorkbenchNotificationCapability} from '@scion/workbench-client';
import {TEXT_NOTIFICATION_CAPABILITY_IDENTITY, TEXT_NOTIFICATION_CAPABILITY_IDENTITY_PROPERTY} from '../microfrontend-host-notification/notification-text-message/notification-text-message.component';

/**
 * Intercepts the host manifest, registering the built-in text notification capability.
 */
@Injectable(/* DO NOT provide via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
export class MicrofrontendTextNotificationCapabilityProvider implements HostManifestInterceptor {

  public intercept(hostManifest: Manifest): void {
    hostManifest.capabilities = [
      ...hostManifest.capabilities ?? [],
      provideBuiltInTextNotificationCapability(),
    ];
  }
}

/**
 * Provides the built-in notification capability to display text.
 *
 * @see MicrofrontendNotificationIntentHandler
 */
function provideBuiltInTextNotificationCapability(): WorkbenchNotificationCapability {
  return {
    type: WorkbenchCapabilities.Notification,
    qualifier: {},
    params: [
      {
        name: eNOTIFICATION_MESSAGE_PARAM,
        required: false,
        description: 'Text to display in the notification.',
      },
    ],
    properties: {
      path: '',
      [TEXT_NOTIFICATION_CAPABILITY_IDENTITY_PROPERTY]: TEXT_NOTIFICATION_CAPABILITY_IDENTITY,
    },
    private: false,
    description: 'Displays a text notification.',
  };
}
