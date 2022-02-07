/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {IntentClient, mapToBody, Qualifier, RequestError} from '@scion/microfrontend-platform';
import {WorkbenchNotificationConfig} from './workbench-notification.config';
import {Beans} from '@scion/toolkit/bean-manager';
import {WorkbenchCapabilities} from '../workbench-capabilities.enum';
import {Maps} from '@scion/toolkit/util';
import {catchError} from 'rxjs/operators';
import {throwError} from 'rxjs';

/**
 * Allows displaying a notification to the user.
 *
 * A notification is a closable message that appears in the top right corner and disappears automatically after a few seconds.
 * It informs the user of a system event, e.g., that a task has been completed or an error has occurred.
 *
 * Multiple notifications are stacked vertically. Notifications can be grouped. For each group, only the last notification is
 * displayed at any given time.
 *
 * The built-in notification supports the display of a plain text message and is available as 'notification' capability without a qualifier.
 * Other notification capabilities can be contributed in the host app, e.g., to display structured content or to provide out-of-the-box
 * notification templates. The use of a qualifier distinguishes different notification providers.
 *
 * Applications need to declare an intention in their application manifest for displaying a notification to the user, as illustrated below:
 *
 * ```json
 * {
 *   "intentions": [
 *     { "type": "notification" }
 *   ]
 * }
 * ```
 *
 * @see WorkbenchNotificationCapability
 * @category Notification
 */
export class WorkbenchNotificationService {

  /**
   * Presents the user with a notification that is displayed in the top right corner based on the given qualifier.
   *
   * The qualifier identifies the provider to display the notification. The build-in notification to display a plain text message requires
   * no qualifier.
   *
   * @param  notification - Configures the content and appearance of the notification.
   * @param  qualifier - Identifies the notification provider.
   *
   * @return Promise that resolves when displaying the notification, or that rejects if displaying the notification failed, e.g., if missing
   *         the notification intention, or because no notification provider could be found that provides a notification under the specified
   *         qualifier.
   */
  public show(notification: string | WorkbenchNotificationConfig, qualifier?: Qualifier): Promise<void> {
    const config: WorkbenchNotificationConfig = typeof notification === 'string' ? {content: notification} : notification;
    const params = Maps.coerce(config.params);

    return Beans.get(IntentClient).request$<void>({type: WorkbenchCapabilities.Notification, qualifier, params}, config)
      .pipe(
        mapToBody(),
        catchError(error => throwError(error instanceof RequestError ? error.message : error)),
      )
      .toPromise();
  }
}
