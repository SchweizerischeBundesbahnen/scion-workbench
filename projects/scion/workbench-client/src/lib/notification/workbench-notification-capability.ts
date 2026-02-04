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
 * A notification is a closable message displayed in the upper-right corner that disappears after a few seconds unless hovered or focused.
 * It informs about system events, task completion, or errors. Severity indicates importance or urgency.
 *
 * Notifications can be grouped. Only the most recent notification within a group is displayed.
 *
 * The microfrontend can inject the `WorkbenchNotification` handle (and `ActivatedMicrofrontend` if a host microfrontend) to interact with the notification or access parameters.
 *
 * An explicit height must be defined in {@link WorkbenchNotificationCapability.properties.size} unless the notification is provided by the host app, which resizes to fit the content.
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
   * Qualifies the notification. The qualifier is required for a notification.
   *
   * @inheritDoc
   */
  qualifier: Qualifier;
  /**
   * Specifies parameters required by the notification.
   *
   * Parameters can be read in the microfrontend by injecting the {@link WorkbenchNotification} handle (or `ActivatedMicrofrontend` if a host microfrontend).
   * Parameters can also be referenced in the path using the colon syntax.
   *
   * @inheritDoc
   */
  params?: ParamDefinition[];
  /**
   * @inheritDoc
   */
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
     * Specifies the size of the notification, required if the notification is provided by an application other than the workbench host application.
     */
    size?: WorkbenchNotificationSize;
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
   * Specifies the height of the notification, required if the notification is provided by an application other than the workbench host application.
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
