/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Translatable} from '../text/workbench-text-provider.model';

/**
 * Controls the appearance and behavior of a notification.
 *
 * @category Notification
 */
export interface WorkbenchNotificationOptions {

  /**
   * Specifies the title of the notification.
   *
   * Can be text or a translation key. A translation key starts with the percent symbol (`%`) and may include parameters in matrix notation for text interpolation.
   */
  title?: Translatable;

  /**
   * Passes data to the notification.
   *
   * The notification can declare mandatory and optional parameters. No additional parameters are allowed. Refer to the documentation of the capability for more information.
   */
  params?: Map<string, unknown> | {[param: string]: unknown};

  /**
   * Specifies the severity of the notification. Defaults to `info`.
   */
  severity?: 'info' | 'warn' | 'error';

  /**
   * Controls how long to display the notification.
   *
   * Can be a duration alias, or milliseconds.
   */
  duration?: 'short' | 'medium' | 'long' | 'infinite' | number;

  /**
   * Specifies the group to which the notification belongs. Only the most recent notification within a group is displayed.
   */
  group?: string;

  /**
   * Specifies CSS class(es) to add to the notification, e.g., to locate the notification in tests.
   */
  cssClass?: string | string[];
}
