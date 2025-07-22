/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ViewId} from '../workbench.identifiers';

/**
 * Configures the dialog to display a microfrontend in a workbench dialog using {@link WorkbenchDialogService}.
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
   * Controls which area of the application to block by the dialog.
   *
   * - **Application-modal:**
   *   Use to block the workbench, or the browser's viewport if configured in the workbench host application.
   *
   * - **View-modal:**
   *   Use to block only the contextual view of the dialog, allowing the user to interact with other views.
   *   This is the default if opening the dialog in the context of a view.
   */
  modality?: 'application' | 'view';
  /**
   * Specifies the context in which to open the dialog.
   */
  context?: {
    /**
     * Controls which view to block when opening a dialog view-modal.
     *
     * By default, if opening the dialog in the context of a view, that view is used as the contextual view.
     */
    viewId?: ViewId;
  };
  /**
   * Controls whether to animate the opening of the dialog. Defaults is `false`.
   */
  animate?: boolean;
  /**
   * Specifies CSS class(es) to add to the dialog, e.g., to locate the dialog in tests.
   */
  cssClass?: string | string[];
}
