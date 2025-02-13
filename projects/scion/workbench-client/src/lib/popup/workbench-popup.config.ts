/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Observable} from 'rxjs';
import {Dictionary} from '@scion/toolkit/util';
import {PopupOrigin} from './popup.origin';
import {ViewId} from '../view/workbench-view';

/**
 * Configures the popup to display a microfrontend in a workbench popup using {@link WorkbenchPopupService}.
 *
 * @category Popup
 */
export interface WorkbenchPopupConfig {
  /**
   * Controls where to open the popup.
   *
   * Can be an HTML element or coordinates:
   * - Using an element: The popup opens and sticks to the element.
   * - Using coordinates: The popup opens and sticks relative to the view or page bounds.
   *
   * Supported coordinate pairs:
   * - x/y: Relative to the top/left corner of the view or page.
   * - top/left: Same as x/y.
   * - top/right: Relative to the top/right corner.
   * - bottom/left: Relative to the bottom/left corner.
   * - bottom/right: Relative to the bottom/right corner.
   *
   * Coordinates can be updated using an Observable. The popup displays when the Observable emits the first coordinate.
   */
  anchor: Element | PopupOrigin | Observable<PopupOrigin>;
  /**
   * Passes data to the popup.
   *
   * The popup can declare mandatory and optional parameters. No additional parameters are allowed. Refer to the documentation of the capability for more information.
   */
  params?: Map<string, any> | Dictionary;
  /**
   * Hint where to align the popup relative to the popup anchor, unless there is not enough space available in that area. By default,
   * if not specified, the popup opens north of the anchor.
   */
  align?: 'east' | 'west' | 'north' | 'south';
  /**
   * Controls when to close the popup.
   */
  closeStrategy?: CloseStrategy;
  /**
   * Specifies CSS class(es) to add to the popup, e.g., to locate the popup in tests.
   */
  cssClass?: string | string[];
  /**
   * Specifies the context in which to open the popup.
   */
  context?: {
    /**
     * Specifies the view the popup belongs to.
     *
     * Binds the popup to the lifecycle of a view so that it displays only if the view is active and closes when the view is closed.
     *
     * By default, if opening the popup in the context of a view, that view is used as the popup's contextual view.
     * If you set the view id to `null`, the popup will open without referring to the contextual view.
     */
    viewId?: ViewId | null;
  };
}

/**
 * Specifies when to close the popup.
 *
 * @category Popup
 */
export interface CloseStrategy {
  /**
   * Controls if to close the popup on focus loss, returning the result set via {@link Popup#setResult} to the popup opener.
   * Defaults to `true`.
   */
  onFocusLost?: boolean;
  /**
   * Controls if to close the popup when pressing escape. Defaults to `true`.
   * No return value will be passed to the popup opener.
   */
  onEscape?: boolean;
}
