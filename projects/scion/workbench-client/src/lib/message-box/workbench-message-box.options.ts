/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {DialogId, PartId, PopupId, ViewId} from '../workbench.identifiers';
import {Translatable} from '../text/workbench-text-provider.model';

/**
 * Controls the appearance and behavior of a message box.
 *
 * @category MessageBox
 */
export interface WorkbenchMessageBoxOptions {

  /**
   * Specifies the title of the message box.
   *
   * Can be text or a translation key. A translation key starts with the percent symbol (`%`) and may include parameters in matrix notation for text interpolation.
   */
  title?: Translatable;

  /**
   * Defines buttons of the message box. If not set, an OK button is displayed by default.
   *
   * Each property in the object literal represents a button, with the property value used as the button label.
   * The label can be text or a translation key. A translation key starts with the percent symbol (`%`) and may include parameters in matrix notation for text interpolation.
   *
   * Clicking a button closes the message box and returns the property key to the message box opener.
   *
   * A button with the key 'cancel' is also assigned the Escape keystroke.
   *
   * **Example:**
   * ```ts
   * {
   *   yes: 'Yes',
   *   no: 'No',
   *   cancel: 'Cancel',
   * }
   * ```
   */
  actions?: {
    [key: string]: Translatable;
  };

  /**
   * Specifies the severity of the message. Defaults to `info`.
   */
  severity?: 'info' | 'warn' | 'error';

  /**
   * Controls which area of the application to block by the message box. Defaults to `context`.
   *
   * One of:
   * - 'none': Non-blocking message box.
   * - `context`: Blocks a specific part of the application, as specified in {@link context}, defaulting to the calling context.
   * - `application`: Blocks the workbench or browser viewport, based on global workbench settings.
   * - `view`: Deprecated. Same as `context`. Marked for removal.
   */
  modality?: 'none' | 'context' | 'application' | ViewModality;

  /**
   * Binds the message box to a context (e.g., part or view). Defaults to the calling context.
   *
   * The message box is displayed only if the context is visible and closes when the context is disposed.
   * The message box is opened in the center of its context, if any, unless opened from the peripheral area.
   *
   * Set to `null` to open the message box outside a context.
   */
  context?: ViewId | PartId | DialogId | PopupId | Context | null;

  /**
   * Specifies if the user can select text displayed in the message box. Defaults to `false`.
   */
  contentSelectable?: boolean;

  /**
   * Passes data to the message box.
   *
   * The message box can declare mandatory and optional parameters. No additional parameters are allowed. Refer to the documentation of the capability for more information.
   */
  params?: Map<string, unknown> | {[param: string]: unknown};

  /**
   * Specifies CSS class(es) to add to the message box, e.g., to locate the message box in tests.
   */
  cssClass?: string | string[];
}

/**
 * @deprecated since version 1.0.0-beta.34. Renamed to `context`. Marked for removal.
 */
type ViewModality = 'view';

/**
 * @deprecated since version 1.0.0-beta.34. Set view id directly. Migrate `{context: {viewId: 'view.x'}}` to `{context: 'view.x'}`. Marked for removal.
 */
interface Context {
  /**
   * @deprecated since version 1.0.0-beta.34. Set view id directly. Migrate `{context: {viewId: 'view.x'}}` to `{context: 'view.x'}`. Marked for removal.
   */
  viewId?: ViewId | null;
}
