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
import {WorkbenchMessageBoxOptions} from './workbench-message-box.options';
import {Translatable} from '../text/workbench-text-provider.model';

/**
 * Displays a microfrontend in a message box.
 *
 * A message box is a standardized dialog for presenting a message to the user, such as an info, warning or alert,
 * or for prompting the user for confirmation.
 *
 * A microfrontend provided as a `messagebox` capability can be opened in a message box. The qualifier differentiates between different
 * message box capabilities. Declaring an intention allows for opening public message box capabilities of other applications.
 *
 * Displayed on top of other content, a modal message box blocks interaction with other parts of the application.
 *
 * ## Modality
 * A message box can be context-modal or application-modal. Context-modal blocks a specific part of the application, as specified by the context;
 * application-modal blocks the workbench or browser viewport, based on global workbench settings.
 *
 * ## Context
 * A message box can be bound to a context (e.g., part or view), defaulting to the calling context.
 * The message box is displayed only if the context is visible and closes when the context is disposed.
 *
 * ## Positioning
 * A message box is opened in the center of its context, if any, unless opened from the peripheral area.
 *
 * ## Stacking
 * Message boxes are stacked per modality, with only the topmost message box in each stack being interactive.
 *
 * @category MessageBox
 * @see WorkbenchMessageBoxCapability
 */
export abstract class WorkbenchMessageBoxService {

  /**
   * Displays the specified message in a message box.
   *
   * By default, the message box is modal to the calling context. Specify a different modality in {@link WorkbenchMessageBoxOptions.modality}.
   *
   * This method requires the intention `{"type": "messagebox"}`.
   *
   * @param message - Specifies the text to display, if any.
   *                  Can be text or a translation key. A translation key starts with the percent symbol (`%`) and may include parameters in matrix notation for text interpolation.
   * @param options - Controls the appearance and behavior of the message box.
   * @returns Promise that resolves to the key of the action button that the user clicked to close the message box,
   *          or that rejects if the message box couldn't be opened, e.g., because of missing the intention.
   */
  public abstract open(message: Translatable | null, options?: WorkbenchMessageBoxOptions): Promise<string>;

  /**
   * Opens the microfrontend of a `messagebox` capability in a workbench message box based on the given qualifier and options.
   *
   * By default, the message box is modal to the calling context. Specify a different modality in {@link WorkbenchMessageBoxOptions.modality}.
   *
   * @param qualifier - Identifies the `messagebox` capability that provides the microfrontend to open in a message box.
   * @param options - Controls the appearance and behavior of the message box.
   * @returns Promise that resolves to the key of the action button that the user clicked to close the message box,
   *          or that rejects if the message box couldn't be opened, e.g., because of missing the intention or because no `messagebox`
   *          capability was found matching the qualifier and is visible to the application.
   *
   * @see WorkbenchMessageBoxCapability
   * @see WorkbenchMessageBox
   */
  public abstract open(qualifier: Qualifier, options?: WorkbenchMessageBoxOptions): Promise<string>;
}
