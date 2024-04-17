/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Dictionary} from '@scion/toolkit/util';

/**
 * Configures the content and appearance of a notification presented to the user.
 *
 * A notification is a closable message that appears in the upper-right corner and disappears automatically after a few seconds.
 * It informs the user of a system event, e.g., that a task has been completed or an error has occurred.
 *
 * Multiple notifications are stacked vertically. Notifications can be grouped. For each group, only the last notification is
 * displayed at any given time.
 *
 * @category Notification
 */
export interface WorkbenchNotificationConfig {

  /**
   * Specifies the title of the notification.
   */
  title?: string;

  /**
   * Specifies the content to be displayed in the notification.
   *
   * The content may differ per notification provider, as dermined by the qualifier. For example, the built-in notification expects a
   * text message in form of a string literal. Refer to the documentation of the notification capability provider for more information.
   */
  content?: any;

  /**
   * Passes data to the notification.
   *
   * The notification can declare mandatory and optional parameters. No additional parameters are allowed. Refer to the documentation of the capability for more information.
   */
  params?: Map<string, any> | Dictionary;

  /**
   * Specifies the severity of the notification. Defaults to `info`.
   */
  severity?: 'info' | 'warn' | 'error';

  /**
   * Specifies the timeout after which to close the notification automatically. Defaults to `medium`.
   * Can be either a duration alias, or a number in seconds.
   */
  duration?: 'short' | 'medium' | 'long' | 'infinite' | number;

  /**
   * Specifies the group which this notification belongs to.
   * If specified, the notification will replace any previously displayed notification of the same group.
   */
  group?: string;

  /**
   * Specifies CSS class(es) to add to the notification, e.g., to locate the notification in tests.
   */
  cssClass?: string | string[];
}
