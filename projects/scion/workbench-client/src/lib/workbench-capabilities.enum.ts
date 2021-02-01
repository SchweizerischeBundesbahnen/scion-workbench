/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

/**
 * Built-in workbench capabilities.
 */
export enum WorkbenchCapabilities {
  /**
   * Allows contributing a microfrontend for display in workbench view.
   *
   * A view is a visual workbench component for displaying content stacked or arranged side by side in the workbench layout.
   */
  View = 'view',
  /**
   * Allows contributing a microfrontend for display in workbench popup.
   *
   * A popup is a visual workbench component for displaying content above other content.
   */
  Popup = 'popup',
  /**
   * Allows contributing a message box provider in the host app.
   *
   * A message box is a modal dialog box that an application can use to display a message to the user. It typically contains a text
   * message and one or more buttons.
   */
  MessageBox = 'messagebox',
  /**
   * Allows contributing a notification provider in the host app.
   *
   * A notification is a closable message that appears in the top right corner and disappears automatically after a few seconds.
   * It informs the user of a system event, e.g., that a task has been completed or an error has occurred.
   */
  Notification = 'notification',
}
