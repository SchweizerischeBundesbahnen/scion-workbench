/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { MessageBus } from './message-bus.service';
import { Service } from './metadata';
import { Platform } from './platform';
import { Notification, NotificationIntentMessage, PlatformCapabilityTypes, Qualifier } from '@scion/workbench-application-platform.api';

/**
 * Displays notifications to the user.
 */
export class NotificationService implements Service {

  /**
   * Pops up a notification.
   *
   * By default, and if no qualifier is specified, a default notification pops up.
   * To display a custom notification, provide the qualifier as expected by a
   * respective {IntentHandler} registered in the host application.
   */
  public notify(notification: Notification | string, qualifier?: Qualifier): void {
    const intentMessage: NotificationIntentMessage = {
      type: PlatformCapabilityTypes.Notification,
      qualifier: qualifier,
      payload: (typeof notification === 'string' ? ({text: notification}) : notification),
    };

    Platform.getService(MessageBus).postMessage({channel: 'intent', message: intentMessage});
  }

  public onDestroy(): void {
    // noop
  }
}
