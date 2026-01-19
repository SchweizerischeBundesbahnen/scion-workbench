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
 * Displays a microfrontend in a dialog.
 *
 * A dialog is a visual element for focused interaction with the user, such as prompting the user for input or confirming actions.
 * The user can move and resize a dialog.
 *
 * A microfrontend provided as a `dialog` capability can be opened in a dialog. The qualifier differentiates between different
 * dialog capabilities. Declaring an intention allows for opening public dialog capabilities of other applications.
 *
 * Displayed on top of other content, a modal dialog blocks interaction with other parts of the application.
 *
 * ## Modality
 * A dialog can be context-modal or application-modal. Context-modal blocks a specific part of the application, as specified by the context;
 * application-modal blocks the workbench or browser viewport, based on global workbench settings.
 *
 * ## Context
 * A dialog can be bound to a context (e.g., part or view), defaulting to the calling context.
 * The dialog is displayed only if the context is visible and closes when the context is disposed.
 *
 * ## Positioning
 * A dialog is opened in the center of its context, if any, unless opened from the peripheral area.
 *
 * ## Stacking
 * Dialogs are stacked per modality, with only the topmost dialog in each stack being interactive.
 *
 * @category Dialog
 * @see WorkbenchDialogCapability
 */
export abstract class WorkbenchDialogService {

  /**
   * Opens the microfrontend of a `dialog` capability in a workbench dialog based on the given qualifier and options.
   *
   * By default, the dialog is modal to the calling context. Specify a different modality in {@link WorkbenchDialogOptions.modality}.
   *
   * @param qualifier - Identifies the dialog capability that provides the microfrontend to open in a dialog.
   * @param options - Controls the appearance and behavior of the dialog.
   * @returns Promise that resolves to the dialog result, if any, or that rejects if the dialog was closed with an error or couldn't be opened,
   *          e.g., because of missing the intention or because no `dialog` capability was found matching the qualifier and is visible to the application.
   *
   * @see WorkbenchDialogCapability
   * @see WorkbenchDialog
   */
  public abstract open<R>(qualifier: Qualifier, options?: WorkbenchDialogOptions): Promise<R | undefined>;
}
