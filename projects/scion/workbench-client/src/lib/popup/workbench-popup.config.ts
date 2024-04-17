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
   * Provide either a coordinate or an element to serve as the popup anchor. The align setting can be used to control
   * the region where to open the popup relative to the anchor.
   *
   * If you use an element as the popup anchor, the popup also moves when the anchor element moves. If you use a coordinate
   * and open the popup in the context of a view, the popup opens relative to the bounds of that view. Otherwise, it
   * is positioned relative to the page viewport. If you move or resize the view or the page, the popup will also be moved
   * depending on the pair of coordinates used.
   *
   * The following coordinate pairs are supported:
   * - x/y: relative to the "top/left" corner of the view or page viewport
   * - top/left: equivalent to passing a "x/y" coordinate
   * - top/right: relative to the "top/right" corner of the view or page viewport
   * - bottom/left: relative to the "bottom/left" corner of the view or page viewport
   * - bottom/right: relative to the "bottom/right" corner of the view or page viewport
   *
   * Positioning the popup using coordinates allows to pass an Observable to update the popup position. Note that the popup
   * will not display until the Observable emits the first coordinate.
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
   * If `true`, which is by default, will close the popup on focus loss.
   * No return value will be passed to the popup opener.
   */
  onFocusLost?: boolean;
  /**
   * If `true`, which is by default, will close the popup when the user
   * hits the escape key. No return value will be passed to the popup
   * opener.
   */
  onEscape?: boolean;
}
