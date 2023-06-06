/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Dictionary} from '@scion/toolkit/util';

/**
 * Configures the content and appearance of a message presented to the user in the form of a message box.
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
 *   view, it is opened as a view-modal message box. When opened outside of a view, setting the modality to 'view' has no effect.
 *
 * @category MessageBox
 */
export interface WorkbenchMessageBoxConfig {

  /**
   * Specifies the title of the message box.
   */
  title?: string;

  /**
   * Specifies the content to be displayed in the message box.
   *
   * The content may differ per message box provider, as dermined by the qualifier. For example, the built-in message box expects a
   * text message in form of a string literal. Refer to the documentation of the message box capability provider for more information.
   */
  content?: any;

  /**
   * Allows passing data to the message box. The message box provider can declare mandatory and optional parameters.
   * No additional parameters may be included. Refer to the documentation of the message box capability provider for more information.
   */
  params?: Map<string, any> | Dictionary;

  /**
   * Defines the actions that will be displayed to the user in the form of buttons to close the message box.
   *
   * When the user closes the message box, the key of the closing action will be returned to the message box opener.
   * The value of an action is used as the display text of the button.
   *
   * If not specifying actions, an 'OK' action button is displayed by default. Note that the provider of the message box can also specify
   * actions. Then, provided actions will be ignored. Refer to the documentation of the message box capability provider for more information.
   */
  actions?: {
    [key: string]: string;
  };

  /**
   * Specifies the severity of the message. Defaults to `info`.
   */
  severity?: 'info' | 'warn' | 'error';

  /**
   * Controls which areas of the application to block by the message box.
   *
   * - **Application-modal:**
   *   An application-modal message box blocks the entire workbench. The user cannot switch between views, close or open views,
   *   or arrange views in the workbench layout.
   *
   * - **View-modal:**
   *   A view-modal message box blocks only the view in which it was opened. In contrast to application-modal message boxes, the user
   *   can interact with other views, close them or open new views, or arrange them any other way. A view-modal message box sticks to
   *   its view; that is, it is displayed only when the view is visible. By default, if opening the message box in the context of a
   *   view, it is opened as a view-modal message box. When opened outside of a view, setting the modality to 'view' has no effect.
   */
  modality?: 'application' | 'view';

  /**
   * Specifies if the user can select text displayed in the message box. Defaults to `false`.
   */
  contentSelectable?: boolean;

  /**
   * Specifies CSS class(es) to be added to the message box, useful in end-to-end tests for locating the message box.
   */
  cssClass?: string | string[];

  /**
   * Specifies the context in which to open the message box.
   */
  context?: {
    /**
     * Allows controlling which view to block when opening a view-modal message box.
     *
     * By default, if opening the message box in the context of a view, that view is used as the contextual view.
     */
    viewId?: string;
  };
}
