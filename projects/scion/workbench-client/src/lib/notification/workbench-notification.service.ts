/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Qualifier} from '@scion/microfrontend-platform';
import {WorkbenchNotificationConfig} from './workbench-notification.config';
import {Translatable} from '../text/workbench-text-provider.model';
import {WorkbenchNotificationOptions} from './workbench-notification.options';

/**
 * Shows a notification.
 *
 * A notification is a closable message displayed in the upper-right corner that disappears after a few seconds unless hovered.
 * It informs about system events, task completion or errors. The severity indicates importance or urgency.
 *
 * Notifications can be grouped. Only the most recent notification within a group is displayed.
 *
 * A microfrontend provided as a `notification` capability can be opened in a notification. The qualifier differentiates between different
 * notification capabilities. Declaring an intention allows for opening public notification capabilities of other applications.
 *
 * @see WorkbenchNotificationCapability
 * @category Notification
 */
export abstract class WorkbenchNotificationService {

  /**
   * Displays the specified message as workbench notification.
   *
   * This method requires the intention `{"type": "notification"}`.
   *
   * @param message - Specifies the text to display.
   *                  Can be text or a translation key. A translation key starts with the percent symbol (`%`) and may include parameters in matrix notation for text interpolation.
   * @param options - Controls the appearance and behavior of the notification.
   * @returns Promise that resolves when the notification is displayed, or that rejects otherwise, e.g., because of missing the intention.
   */
  public abstract show(message: Translatable, options?: WorkbenchNotificationOptions): Promise<void>;

  /**
   * Displays the microfrontend of a `notification` capability as workbench notification based on the given qualifier and options.
   *
   * @param qualifier - Identifies the `notification` capability that provides the microfrontend to show as workbench notification.
   * @param options - Controls the appearance and behavior of the notification.
   * @returns Promise that resolves when the notification is displayed, or that rejects otherwise, e.g., because of missing the intention
   *          or because no `notification` capability was found matching the qualifier and is visible to the application.
   *
   * @see WorkbenchMessageBoxCapability
   * @see WorkbenchMessageBox
   */
  public abstract show(qualifier: Qualifier, options?: WorkbenchNotificationOptions): Promise<void>;

  /**
   * Displays the specified message as workbench notification.
   *
   * @param notification - Configures content and appearance of the notification.
   * @param qualifier - Identifies the `notification` capability that provides the microfrontend to show as workbench notification.
   * @returns Promise that resolves when the notification is displayed or that rejects if the intention is missing or no matching `notification` capability is found.
   *
   * @deprecated since version 1.0.0-beta.36. Pass text or qualifier as first argument. Marked for removal.
   */
  public abstract show(notification: WorkbenchNotificationConfig, qualifier?: Qualifier): Promise<void>;
}
