/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {IntentClient, mapToBody, Qualifier, RequestError} from '@scion/microfrontend-platform';
import {WorkbenchMessageBoxConfig} from './workbench-message-box.config';
import {Beans} from '@scion/toolkit/bean-manager';
import {Maps} from '@scion/toolkit/util';
import {WorkbenchView} from '../view/workbench-view';
import {WorkbenchCapabilities} from '../workbench-capabilities.enum';
import {lastValueFrom} from 'rxjs';

/**
 * Allows displaying a message to the user in a workbench message box.
 *
 * A message box is a modal dialog box that an application can use to display a message to the user. It typically contains a text
 * message and one or more buttons.
 *
 * The workbench supports the following two modality types:
 *
 * - **Application-modal:**
 *   An application-modal message box blocks the entire workbench. The user cannot switch between views, close or open views,
 *   or arrange views in the workbench layout.
 *
 * - **View-modal:**
 *   A view-modal message box blocks only the view in which it was opened. In contrast to application-modal message boxes, the user
 *   can interact with other views, close them or open new views, or arrange them any other way. A view-modal message box sticks to
 *   its view; that is, it is displayed only when the view is visible. By default, if opening the message box in the context of a
 *   view, it is opened as a view-modal message box. If opened outside a view, setting the modality to 'view' has no effect.
 *
 * The built-in message box supports the display of a plain text message and is available as 'messagebox' capability without a qualifier.
 * Other message box capabilities can be contributed in the host app, e.g., to display structured content or to provide out-of-the-box
 * message templates. The use of a qualifier distinguishes different message box providers.
 *
 * Applications need to declare an intention in their application manifest for displaying a message box to the user, as illustrated below:
 *
 * ```json
 * {
 *   "intentions": [
 *     { "type": "messagebox" }
 *   ]
 * }
 * ```
 *
 * Unlike views, message boxes are not part of the persistent workbench navigation, meaning that message boxes do not survive a page reload.
 *
 * @see WorkbenchMessageBoxCapability
 * @category MessageBox
 */
export class WorkbenchMessageBoxService {

  /**
   * Presents the user with a message that is displayed in a message box based on the given qualifier.
   *
   * The qualifier identifies the provider to display the message box. The build-in message box to display a plain text message requires
   * no qualifier.
   *
   * By default, when the message box is opened in the context of a workbench view, it is opened as a view-modal message box.
   *
   * @param  message - Configures the content and appearance of the message.
   * @param  qualifier - Identifies the message box provider.
   *
   * @return Promise that resolves to the key of the action button that the user pressed to close the message box.
   *         Depending on the message box provider, additional data may be included, such as user's input when prompting the user to
   *         enter data. The Promise rejects if opening the message box failed, e.g., if missing the message box intention, or because
   *         no message box provider could be found that provides a message box under the specified qualifier.
   */
  public async open<R = string>(message: string | WorkbenchMessageBoxConfig, qualifier?: Qualifier): Promise<R> {
    const config: WorkbenchMessageBoxConfig = typeof message === 'string' ? {content: message} : message;
    const params = Maps.coerce(config.params);

    config.context = {
      ...config.context,
      viewId: config.context?.viewId ?? Beans.opt(WorkbenchView)?.id,
    };
    const openMessageBox$ = Beans.get(IntentClient).request$<R>({type: WorkbenchCapabilities.MessageBox, qualifier, params}, config);
    try {
      return await lastValueFrom(openMessageBox$.pipe(mapToBody()));
    }
    catch (error) {
      throw (error instanceof RequestError ? error.message : error);
    }
  }
}
