/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

/**
 * Built-in workbench capabilities.
 */
export enum WorkbenchCapabilities {
  /**
   * Contributes a microfrontend for display in workbench view.
   *
   * A view is a visual workbench element for displaying content stacked or side-by-side.
   */
  View = 'view',
  /**
   * Contributes a perspective to the workbench.
   *
   * A perspective is a named arrangement of views. Different perspectives provide a different perspective on the application.
   */
  Perspective = 'perspective',
  /**
   * Contributes a microfrontend for display in workbench popup.
   *
   * A popup is a visual workbench component for displaying content above other content.
   */
  Popup = 'popup',
  /**
   * Contributes a microfrontend for display in workbench dialog.
   *
   * A dialog is a visual element for focused interaction with the user, such as prompting the user for input or confirming actions.
   */
  Dialog = 'dialog',
  /**
   * Contributes a message box in the host app.
   *
   * A message box is a standardized dialog for presenting a message to the user, such as an info, warning or alert,
   * or for prompting the user for confirmation.
   */
  MessageBox = 'messagebox',
  /**
   * Contributes a notification in the host app.
   *
   * A notification appears in the upper-right corner and disappears automatically after a few seconds.
   * It informs the user of a system event, e.g., that a task has been completed or an error has occurred.
   */
  Notification = 'notification',
}
