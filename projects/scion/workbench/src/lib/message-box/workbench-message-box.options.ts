/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import {Injector} from '@angular/core';
import {ViewId} from '../view/workbench-view.model';

/**
 * Controls the appearance and behavior of a message box.
 */
export interface WorkbenchMessageBoxOptions {

  /**
   * Specifies the title of the message box.
   */
  title?: string;

  /**
   * Defines buttons of the message box. If not set, an OK button is displayed by default.
   *
   * Each property in the object literal represents a button, with the property value used as the button label.
   * Clicking a button closes the message box and returns the property key to the message box opener.
   *
   * A button with the key 'cancel' is also assigned the Escape keystroke.
   *
   * **Example:**
   * ```ts
   * {
   *   yes: 'Yes',
   *   no: 'No',
   *   cancel: 'Cancel',
   * }
   * ```
   */
  actions?: {[key: string]: string};

  /**
   * Specifies the severity of the message. Default is `info`.
   */
  severity?: 'info' | 'warn' | 'error';

  /**
   * Controls which area of the application to block by the message box.
   *
   * - **Application-modal:**
   *   Use to block the workbench, or the browser's viewport if configured in {@link WorkbenchConfig.dialog.modalityScope}.
   *
   * - **View-modal:**
   *   Use to block only the contextual view of the message box, allowing the user to interact with other views.
   *   This is the default if opening the message box in the context of a view.
   */
  modality?: 'application' | 'view';

  /**
   * Specifies if the user can select text displayed in the message box. Default is `false`.
   */
  contentSelectable?: boolean;

  /**
   * Specifies data available as input properties in the message component.
   *
   * This property only applies to a message box opened with a component, not a plain text message.
   *
   * ```ts
   * public someInput = input.required<string>();
   * ```
   */
  inputs?: {[name: string]: unknown};

  /**
   * Specifies the injector for the instantiation of the message component.
   *
   * This property only applies to a message box opened with a component, not a plain text message.
   *
   * A custom injector gives control over the objects available for injection into the message component. If not specified, uses the
   * application's root injector, or the view's injector if opened in the context of a view.
   *
   * ```ts
   * Injector.create({
   *   parent: ...,
   *   providers: [
   *    {provide: <TOKEN>, useValue: <VALUE>}
   *   ],
   * })
   * ```
   */
  injector?: Injector;

  /**
   * Specifies CSS class(es) to add to the message box, e.g., to locate the message box in tests.
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
    viewId?: ViewId;
  };
}
