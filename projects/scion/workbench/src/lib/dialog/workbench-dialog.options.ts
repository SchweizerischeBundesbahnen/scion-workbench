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
 * Controls how to open a dialog.
 */
export interface WorkbenchDialogOptions {

  /**
   * Optional data to pass to the dialog component. Inputs are available as input properties in the dialog component.
   *
   * **Example:**
   * ```ts
   * @Input()
   * public someInput: string;
   * ```
   */
  inputs?: {[name: string]: unknown};

  /**
   * Controls which area of the application to block by the dialog.
   *
   * - **Application-modal:**
   *   Use to block the workbench, or the browser's viewport if configured in {@link WorkbenchConfig.dialog.modalityScope}.
   *
   * - **View-modal:**
   *   Use to block only the contextual view of the dialog, allowing the user to interact with other views.
   *   This is the default if opening the dialog in the context of a view.
   */
  modality?: 'application' | 'view';

  /**
   * Sets the injector for the instantiation of the dialog component, giving control over the objects available
   * for injection into the dialog component. If not specified, uses the application's root injector, or the view's
   * injector if opened in the context of a view.
   *
   * **Example:**
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
   * Specifies CSS class(es) to add to the dialog, e.g., to locate the dialog in tests.
   */
  cssClass?: string | string[];

  /**
   * Controls whether to animate the opening of the dialog. Defaults to `false`.
   */
  animate?: boolean;

  /**
   * Specifies the context in which to open the dialog.
   */
  context?: {
    /**
     * Controls which view to block when opening a dialog view-modal.
     *
     * By default, if opening the dialog in the context of a view, that view is used as the contextual view.
     */
    viewId?: ViewId;
  };
}
