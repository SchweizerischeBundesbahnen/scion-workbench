/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {inject, Injectable} from '@angular/core';
import {NotificationConfig} from './notification.config';
import {Translatable} from '../text/workbench-text-provider.model';
import {LEGACY_NOTIFICATION_INPUT} from './ɵnotification';
import {ɵWorkbenchNotificationService} from './ɵworkbench-notification.service';
import {prune} from '../common/prune.util';

/**
 * Shows a notification.
 *
 * A notification is a closable message displayed in the upper-right corner that disappears after a few seconds unless hovered or focused.
 * It informs about system events, task completion, or errors. Severity indicates importance or urgency.
 *
 * Notifications can be grouped. Only the most recent notification within a group is displayed.
 *
 * Content can be plain text or structured. Pressing Escape closes the notification.
 *
 * @deprecated since version 21.0.0-beta.1. Use `WorkbenchNotificationService` to show notifications. Marked for removal in version 22.
 */
@Injectable({providedIn: 'root'})
export class NotificationService {

  private readonly _notificationService = inject(ɵWorkbenchNotificationService);

  /**
   * Displays the specified text or component as workbench notification.
   *
   * @param notification - Configures content and appearance of the notification.
   *
   * @deprecated since version 21.0.0-beta.1. Use `WorkbenchNotificationService` to show notifications. Marked for removal in version 22.
   */
  public notify(notification: Translatable | NotificationConfig): void {
    if (typeof notification === 'string') {
      this._notificationService.show(notification);
    }
    else {
      this._notificationService.show(notification.content, prune({
        title: notification.title,
        injector: notification.componentConstructOptions?.injector,
        inputs: {[LEGACY_NOTIFICATION_INPUT]: notification.componentInput},
        severity: notification.severity,
        duration: migrateDuration(notification),
        group: notification.group,
        groupInputReduceFn: migrateGroupInputReduceFn(notification),
        cssClass: notification.cssClass,
      }));
    }
  }
}

function migrateDuration(config: NotificationConfig): 'short' | 'medium' | 'long' | 'infinite' | number | undefined {
  if (typeof config.duration === 'number') {
    return config.duration * 1000;
  }
  return config.duration;
}

function migrateGroupInputReduceFn(config: NotificationConfig): ((prevInput: {[name: string]: unknown}, currInput: {[name: string]: unknown}) => {[name: string]: unknown}) | undefined {
  if (!config.groupInputReduceFn) {
    return undefined;
  }

  return (prevInput, currInput) => {
    const result = config.groupInputReduceFn!(prevInput[LEGACY_NOTIFICATION_INPUT], currInput[LEGACY_NOTIFICATION_INPUT]) as unknown;
    return {[LEGACY_NOTIFICATION_INPUT]: result};
  };
}
