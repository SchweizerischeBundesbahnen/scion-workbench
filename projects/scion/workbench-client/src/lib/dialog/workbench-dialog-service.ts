/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Qualifier} from '@scion/microfrontend-platform';
import {WorkbenchDialogOptions} from './workbench-dialog.options';

/**
 * Displays a microfrontend in a modal dialog.
 *
 * A dialog is a visual element for focused interaction with the user, such as prompting the user for input or confirming actions.
 * The user can move or resize a dialog.
 *
 * A microfrontend provided as a `dialog` capability can be opened in a dialog. The qualifier differentiates between different
 * dialog capabilities. An application can open the public dialog capabilities of other applications if it manifests a respective
 * intention.
 *
 * Displayed on top of other content, a dialog blocks interaction with other parts of the application. Multiple dialogs are stacked,
 * and only the topmost dialog in each modality stack can be interacted with.
 *
 * A dialog can be view-modal or application-modal. A view-modal dialog blocks only a specific view, allowing the user to interact
 * with other views. An application-modal dialog blocks the workbench, or the browser's viewport if configured in the workbench
 * host application.
 *
 * @category Dialog
 * @see WorkbenchDialogCapability
 */
export abstract class WorkbenchDialogService {

  /**
   * Opens the microfrontend of a `dialog` capability in a workbench dialog based on the given qualifier and options.
   *
   * By default, the calling context determines the modality of the dialog. If the dialog is opened from a view, only this view is blocked.
   * To open the dialog with a different modality, specify the modality in {@link WorkbenchDialogOptions.modality}.
   *
   * @param qualifier - Identifies the dialog capability that provides the microfrontend to open in a dialog.
   * @param options - Controls how to open the dialog.
   * @returns Promise that resolves to the dialog result, if any, or that rejects if the dialog was closed with an error or couldn't be opened,
   *          e.g., because of missing the intention or because no `dialog` capability matching the qualifier and visible to the application
   *          was found.
   *
   * @see WorkbenchDialogCapability
   * @see WorkbenchDialog
   */
  public abstract open<R>(qualifier: Qualifier, options?: WorkbenchDialogOptions): Promise<R | undefined>;
}
