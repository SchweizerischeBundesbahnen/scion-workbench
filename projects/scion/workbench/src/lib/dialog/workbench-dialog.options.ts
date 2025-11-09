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
import {DialogId, PartId, PopupId, ViewId} from '../workbench.identifiers';

/**
 * Controls the appearance and behavior of a dialog.
 */
export interface WorkbenchDialogOptions {

  /**
   * Optional data to pass to the dialog component. Inputs are available as input properties in the dialog component.
   *
   * **Example:**
   * ```ts
   * public someInput = input.required<string>();
   * ```
   */
  inputs?: {[name: string]: unknown};

  /**
   * Controls which area of the application to block by the dialog. Defaults to `context`.
   *
   * One of:
   * - `context`: Blocks a specific part of the application, as specified in {@link context}, defaulting to the calling context.
   * - `application`: Blocks the workbench or browser viewport, based on {@link WorkbenchConfig.dialog.modalityScope}.
   * - `view`: Deprecated. Same as `context`. Will be removed in version 22.
   */
  modality?: 'context' | 'application' | ViewModality;

  /**
   * Binds the dialog to a context (e.g., a part or view). Defaults to the calling context.
   *
   * The dialog is displayed only if the context is visible and closes when the context is disposed.
   * The dialog is opened in the center of its context, if any, unless opened from the peripheral area.
   *
   * Set to `null` to open the dialog outside a context.
   */
  context?: ViewId | PartId | DialogId | PopupId | Context | null;

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
}

/**
 * @deprecated since version 20.0.0-beta.9. Renamed to `context`. Will be removed in version 22.
 */
type ViewModality = 'view';

/**
 * @deprecated since version 20.0.0-beta.9. Set view id directly. Migrate `{context: {viewId: 'view.x'}}` to `{context: 'view.x'}`. Marked for removal in version 22.
 */
interface Context {
  /**
   * @deprecated since version 20.0.0-beta.9. Set view id directly. Migrate `{context: {viewId: 'view.x'}}` to `{context: 'view.x'}`. Marked for removal in version 22.
   */
  viewId?: ViewId | null;
}
