/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {DialogId, NotificationId, PartId, PopupId, ViewId} from '../workbench.identifiers';

/**
 * Controls the appearance and behavior of a dialog.
 *
 * @category Dialog
 */
export interface WorkbenchDialogOptions {
  /**
   * Passes data to the dialog.
   *
   * The dialog can declare mandatory and optional parameters. No additional parameters are allowed. Refer to the documentation of the capability for more information.
   */
  params?: Map<string, unknown> | {[param: string]: unknown};
  /**
   * Controls which area of the application to block by the dialog. Defaults to `context`.
   *
   * One of:
   * - 'none': Non-blocking dialog.
   * - `context`: Blocks a specific part of the application, as specified in {@link context}, defaulting to the calling context.
   * - `application`: Blocks the workbench or browser viewport, based on global workbench settings.
   */
  modality?: 'none' | 'context' | 'application';
  /**
   * Binds the dialog to a context (e.g., part or view). Defaults to the calling context.
   *
   * The dialog is displayed only if the context is visible and closes when the context is disposed.
   * The dialog is opened in the center of its context, if any, unless opened from the peripheral area.
   *
   * Set to `null` to open the dialog outside a context.
   */
  context?: ViewId | PartId | DialogId | PopupId | NotificationId | null;
  /**
   * Controls whether to animate the opening of the dialog. Defaults is `false`.
   */
  animate?: boolean;
  /**
   * Specifies CSS class(es) to add to the dialog, e.g., to locate the dialog in tests.
   */
  cssClass?: string | string[];
}
