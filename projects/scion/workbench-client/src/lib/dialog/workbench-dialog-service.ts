/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {IntentClient, mapToBody, Qualifier, RequestError} from '@scion/microfrontend-platform';
import {WorkbenchCapabilities} from '../workbench-capabilities.enum';
import {Beans} from '@scion/toolkit/bean-manager';
import {firstValueFrom} from 'rxjs';
import {WorkbenchDialogOptions} from './workbench-dialog.options';
import {Maps} from '@scion/toolkit/util';
import {WorkbenchView} from '../view/workbench-view';

/**
 * Displays a microfrontend in a modal dialog.
 *
 * A dialog is a visual element for focused interaction with the user, such as prompting the user for input or confirming actions.
 * The user can move or resize a dialog.
 *
 * Displayed on top of other content, a dialog blocks interaction with other parts of the application.
 *
 * ## Modality
 * A dialog can be view-modal or application-modal.
 *
 * A view-modal dialog blocks only a specific view, allowing the user to interact with other views. An application-modal dialog blocks
 * the workbench, or the browser's viewport if configured in the workbench host application.
 *
 * ## Dialog Stack
 * Multiple dialogs are stacked, and only the topmost dialog in each modality stack can be interacted with.
 *
 * ## Dialog Header
 * The dialog displays the title and a close button in the header.
 *
 * ## Dialog Content
 * The microfrontend providing the dialog content can inject the {@link WorkbenchDialog} handle to interact with the dialog, such as setting the title or closing the dialog.
 *
 * The content of the dialog typically consists of a body and a footer. The width and height of the dialog must be specified in the capability.
 *
 * The body should be wrapped in a viewport to display scrollbars if the content overflows.
 *
 * The footer typically contains action buttons for interacting with the dialog and should not grow or shrink dynamically.
 * If using a flex-container the footer should be set to `flex: none`.
 */
export class WorkbenchDialogService {

  /**
   * Opens a microfrontend in a workbench dialog based on the given qualifier and options.
   *
   * By default, the calling context determines the modality of the dialog. If the dialog is opened from a view, only this view is blocked.
   * To open the dialog with a different modality, specify the modality in {@link WorkbenchDialogOptions.modality}.
   *
   * @param qualifier - Identifies the dialog capability that provides the microfrontend to be displayed in a dialog.
   * @param options - Controls how to open a dialog.
   * @returns Promise that resolves to the dialog result, if any, or that rejects if the dialog couldn't be opened or was closed with an error.
   */
  public async open<T>(qualifier: Qualifier, options?: WorkbenchDialogOptions): Promise<T | undefined> {
    try {
      const intent = {type: WorkbenchCapabilities.Dialog, qualifier, params: Maps.coerce(options?.params)};
      const body: WorkbenchDialogOptions = {
        ...options,
        context: {viewId: options?.context?.viewId ?? Beans.opt(WorkbenchView)?.id},
        params: undefined, // passed via intent
      };
      const closeResult$ = Beans.get(IntentClient).request$<T>(intent, body).pipe(mapToBody());
      return await firstValueFrom(closeResult$, {defaultValue: undefined});
    }
    catch (error) {
      throw (error instanceof RequestError ? error.message : error);
    }
  }
}


