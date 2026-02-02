/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Capability, ParamDefinition, Qualifier} from '@scion/microfrontend-platform';
import {WorkbenchCapabilities} from '../workbench-capabilities.enum';

/**
 * Represents a microfrontend for display in a workbench notification.
 *
 * A notification is a closable message displayed in the upper-right corner that disappears after a few seconds unless hovered.
 * It informs about system events, task completion or errors. The severity indicates importance or urgency.
 *
 * Notifications can be grouped. Only the most recent notification within a group is displayed.
 *
 * The microfrontend can inject the `WorkbenchNotification` handle (and `ActivatedMicrofrontend` if a host microfrontend) to interact with the notification or access parameters.
 *
 * The width of the notification is fixed and set by `--sci-workbench-notification-width`.
 * The height of the notification does not automatically adapt to its content. Refer to {@link WorkbenchNotificationCapability.properties.size} for more information.
 *
 * @category Notification
 * @see WorkbenchNotification
 * @see WorkbenchNotificationService
 */
export interface WorkbenchNotificationCapability extends Capability {
  /**
   * @inheritDoc
   */
  type: WorkbenchCapabilities.Notification;
  /**
   * Qualifies this notification. The qualifier is required for a notification.
   *
   * @inheritDoc
   */
  qualifier: Qualifier;
  /**
   * Specifies parameters required by the notification.
   *
   * Parameters can be read in the microfrontend by injecting the {@link WorkbenchNotification} handle, or referenced in the path using the colon syntax.
   *
   * @inheritDoc
   */
  params?: ParamDefinition[];
  properties: {
    /**
     * Specifies the path to the microfrontend.
     *
     * The path is relative to the base URL given in the application manifest, or to the origin of the manifest file if no base URL is specified.
     *
     * Path segments can reference capability parameters using the colon syntax.
     *
     * ```json
     * {
     *   "params": [
     *     {"name": "id", "required": true}
     *   ],
     *   "properties": {
     *     "path": "products/:id", // `:id` references a capability parameter
     *   }
     * }
     * ```
     *
     * ### Empty Path Required if Host Capability
     * Notification capabilities of the host application require an empty path. In the route, use `canMatchWorkbenchNotificationCapability` guard to match the notification capability.
     *
     * @example - Route matching a notification capability with qualifier {notification: 'info'}
     * ```ts
     * import {Routes} from '@angular/router';
     * import {canMatchWorkbenchNotificationCapability} from '@scion/workbench';
     *
     * const routes: Routes = [
     *   {path: '', canMatch: [canMatchWorkbenchNotificationCapability({notification: 'info'})], component: InfoComponent},
     * ];
     * ```
     */
    path: string;
    /**
     * Specifies the size of this notification, required if this notification is provided by an application other than the workbench host application.
     */
    size?: WorkbenchNotificationSize;
    /**
     * Defines the resolver used to apply a reducer function to a group.
     *
     * @example - Message listener replying to reduce requests, concatting the inputs
     *
     * ```ts
     * import {Beans} from '@scion/toolkit/bean-manager';
     * import {MessageClient} from '@scion/microfrontend-platform';
     *
     * Beans.get(MessageClient).onMessage<{prevParams: Map<string, unknown>; currParams: Map<string, unknown>}>('notifications/reducer', request => {
     *   const currText = request.body?.currParams.get('text') ?? '';
     *   const prevText = request.body?.prevParams.get('text') ?? '';
     *   return new Map<string, unknown>().set('text', `${prevText}, ${currText}`);
     * });
     * ```
     */
    groupParamsReduceResolver?: string;
    /**
     * Instructs the workbench to show a splash, such as a skeleton or loading indicator, until the notification microfrontend signals readiness.
     *
     * By default, the workbench shows a loading indicator. A custom splash can be configured in the workbench host application.
     *
     * This property is not supported if a host microfrontend.
     *
     * @see WorkbenchNotification.signalReady
     */
    showSplash?: boolean;
    /**
     * Specifies CSS class(es) to add to the notification, e.g., to locate the notification in tests.
     */
    cssClass?: string | string[];
    /**
     * Arbitrary metadata associated with the capability.
     */
    [key: string]: unknown;
  };
}

/**
 * Specifies the notification size.
 */
export interface WorkbenchNotificationSize {
  /**
   * Specifies the height of the notification, required if this notification is provided by an application other than the workbench host application.
   */
  height?: string;
  /**
   * Specifies the minimum height of the notification.
   */
  minHeight?: string;
  /**
   * Specifies the maximum height of the notification.
   */
  maxHeight?: string;
}
