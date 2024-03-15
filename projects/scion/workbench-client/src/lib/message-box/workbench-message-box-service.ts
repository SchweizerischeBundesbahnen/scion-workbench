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
import {WorkbenchMessageBoxOptions} from './workbench-message-box.options';
import {Beans} from '@scion/toolkit/bean-manager';
import {Maps} from '@scion/toolkit/util';
import {WorkbenchView} from '../view/workbench-view';
import {WorkbenchCapabilities} from '../workbench-capabilities.enum';
import {lastValueFrom} from 'rxjs';
import {MESSAGE_BOX_CONTENT_PARAM} from './workbench-message-box-capability';

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
   * TODO
   */
  public async open<R = string>(message: string | Qualifier, options?: WorkbenchMessageBoxOptions): Promise<R> {
    const qualifier = typeof message === 'string' ? {} : message;
    const params = typeof message === 'string' ? new Map().set(MESSAGE_BOX_CONTENT_PARAM, message) : Maps.coerce(options?.params);
    const intent = {type: WorkbenchCapabilities.MessageBox, qualifier, params};
    const body: WorkbenchMessageBoxOptions = {
      ...options,
      context: {viewId: options?.context?.viewId ?? Beans.opt(WorkbenchView)?.id},
      params: undefined, // passed via intent
    };

    const closeResult$ = Beans.get(IntentClient).request$<R>(intent, body);
    try {
      return await lastValueFrom(closeResult$.pipe(mapToBody()));
    }
    catch (error) {
      throw (error instanceof RequestError ? error.message : error);
    }
  }
}
