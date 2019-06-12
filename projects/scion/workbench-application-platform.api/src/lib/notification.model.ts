/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { IntentMessage, PlatformCapabilityTypes, Severity } from './core.model';

export type Duration = 'short' | 'medium' | 'long' | 'infinite';

/**
 * Intent message to show a notification.
 */
export interface NotificationIntentMessage extends IntentMessage {

  type: PlatformCapabilityTypes.Notification;
  payload: Notification;
}

/**
 * Represents a notification to be displayed to the user.
 */
export interface Notification {

  /**
   * Specifies the optional title.
   */
  title?: string;

  /**
   * Specifies the notification text.
   */
  text: string;

  /**
   * Specifies the optional severity.
   */
  severity?: Severity;

  /**
   * Specifies the optional timeout upon which to close this notification automatically.
   * If not specified, a 'short' timeout is used. Use 'infinite' to not close this notification automatically.
   */
  duration?: Duration;

  /**
   * Specifies the optional group which this notification belongs to.
   * If specified, this notification closes all notification of the same group before being presented.
   */
  group?: string;

  /**
   * Specifies CSS class(es) added to the <wb-notification> element, e.g. used for e2e testing.
   */
  cssClass?: string | string[];

  /**
   * Payload available in notification handler in the host application.
   */
  payload?: any;
}
