/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Capability, CapabilityInterceptor} from '@scion/microfrontend-platform';
import {Injectable} from '@angular/core';
import {WorkbenchCapabilities, WorkbenchNotificationCapability} from '@scion/workbench-client';
import {Microfrontends} from '../common/microfrontend.util';
import {TEXT_NOTIFICATION_CAPABILITY_IDENTITY, TEXT_NOTIFICATION_CAPABILITY_IDENTITY_PROPERTY} from '../microfrontend-host-notification/notification-text-message/notification-text-message.component';
import {WorkbenchNotificationSize} from '../../notification/workbench-notification.model';
import {Objects} from '@scion/toolkit/util';

/**
 * Asserts notification capabilities to have required properties.
 */
@Injectable(/* DO NOT provide via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
export class MicrofrontendNotificationCapabilityValidator implements CapabilityInterceptor {

  public async intercept(capability: Capability): Promise<Capability> {
    if (capability.type !== WorkbenchCapabilities.Notification) {
      return capability;
    }

    const notificationCapability = capability as Partial<WorkbenchNotificationCapability>;

    // Assert capability other than the built-in text notification capability to have a qualifier.
    if (!isBuiltinNotificationCapability(notificationCapability) && !Object.keys(notificationCapability.qualifier ?? {}).length) {
      throw Error(`[NotificationDefinitionError] Notification capability requires a qualifier [app=${app(notificationCapability)}, notification=${qualifier(notificationCapability)}]`);
    }

    // Assert capability to have properties.
    if (!notificationCapability.properties) {
      throw Error(`[NotificationDefinitionError] Notification capability requires properties [app=${app(notificationCapability)}, notification=${qualifier(notificationCapability)}]`);
    }

    // Assert the notification capability to have a path, unless provided by the host application.
    this.assertPath(notificationCapability);

    // Assert the notification capability to have a height, unless provided by the host application.
    this.assertSize(notificationCapability);

    // Assert host notification capabilities not to define the "showSplash" property.
    if (Microfrontends.isHostProvider(capability) && notificationCapability.properties.showSplash !== undefined) {
      throw Error(`[NotificationDefinitionError] Property "showSplash" not supported for notification capabilities of the host application [app=${app(notificationCapability)}, notification=${qualifier(notificationCapability)}]`);
    }

    return capability;
  }

  private assertPath(capability: Partial<WorkbenchNotificationCapability>): void {
    const path = capability.properties?.path as string | undefined | null;

    if (Microfrontends.isHostProvider(capability)) {
      if (path !== '') {
        throw Error(`[NotificationDefinitionError] Notification capabilities of the host application require an empty path. [app=${app(capability)}, notification=${qualifier(capability)}]. Change the path '${path}' to empty and add 'canMatchWorkbenchNotificationCapability(${JSON.stringify(capability.qualifier)})' guard to the route.\n\nExample:\nCapability: { type: 'notification', qualifier: ${JSON.stringify(capability.qualifier)}, properties: {path: ''} }\nRoute: { path: '', canMatch: [canMatchWorkbenchNotificationCapability(${JSON.stringify(capability.qualifier)})], component: NotificationComponent }`);
      }
    }
    else {
      if (path === null || path == undefined) {
        throw Error(`[NotificationDefinitionError] Notification capabilities require a path. [app=${app(capability)}, notification=${qualifier(capability)}]`);
      }
    }
  }

  private assertSize(capability: Partial<WorkbenchNotificationCapability>): void {
    if (Microfrontends.isHostProvider(capability)) {
      return;
    }

    const size = capability.properties?.size as Partial<WorkbenchNotificationSize> | undefined;
    if (!size?.height) {
      throw Error(`[NotificationDefinitionError] Notification capability requires the 'size' property with a height [app=${app(capability)}, notification=${qualifier(capability)}]`);
    }
  }
}

function isBuiltinNotificationCapability(capability: Partial<WorkbenchNotificationCapability>): boolean {
  return capability.properties?.[TEXT_NOTIFICATION_CAPABILITY_IDENTITY_PROPERTY] === TEXT_NOTIFICATION_CAPABILITY_IDENTITY;
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
