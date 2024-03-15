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

/**
 * Displays a microfrontend in a message box.
 *
 * A message box is a standardized dialog for presenting a message to the user, such as an info, warning or alert,
 * or for prompting the user for confirmation.
 *
 * A microfrontend provided as a `messagebox` capability can be opened in a message box. The qualifier differentiates between different
 * message box capabilities. An application can open the public message box capabilities of other applications if it manifests a respective
 * intention.
 *
 * Displayed on top of other content, a message box blocks interaction with other parts of the application. Multiple message boxes are stacked,
 * and only the topmost message box in each modality stack can be interacted with.
 *
 * A message box can be view-modal or application-modal. A view-modal message box blocks only a specific view, allowing the user to interact
 * with other views. An application-modal message box blocks the workbench, or the browser's viewport if configured in the workbench
 * host application.
 *
 * @category MessageBox
 * @see WorkbenchMessageBoxCapability
 */
export abstract class WorkbenchMessageBoxService {

  /**
   * Displays the specified message in a message box.
   *
   * By default, the calling context determines the modality of the message box. If the message box is opened from a view, only this view is blocked.
   * To open the message box with a different modality, specify the modality in {@link WorkbenchMessageBoxOptions.modality}.
   *
   * **This API requires the following intention: `{"type": "messagebox"}`**
   *
   * @param message - Specifies the text to display.
   * @param options - Controls the appearance and behavior of the message box.
   * @returns Promise that resolves to the key of the action button that the user clicked to close the message box,
   *          or that rejects if the message box couldn't be opened, e.g., because of missing the intention.
   */
  public abstract open(message: string, options?: WorkbenchMessageBoxOptions): Promise<string>;

  /**
   * Opens the microfrontend of a `messagebox` capability in a workbench message box based on the given qualifier and options.
   *
   * By default, the calling context determines the modality of the message box. If the message box is opened from a view, only this view is blocked.
   * To open the message box with a different modality, specify the modality in {@link WorkbenchMessageBoxOptions.modality}.
   *
   * @param qualifier - Identifies the `messagebox` capability that provides the microfrontend to open in a message box.
   * @param options - Controls the appearance and behavior of the message box.
   * @returns Promise that resolves to the key of the action button that the user clicked to close the message box,
   *          or that rejects if the message box couldn't be opened, e.g., because of missing the intention or because no `messagebox`
   *          capability matching the qualifier and visible to the application was found.
   *
   * @see WorkbenchMessageBoxCapability
   * @see WorkbenchMessageBox
   */
  public abstract open(qualifier: Qualifier, options?: WorkbenchMessageBoxOptions): Promise<string>;
}
