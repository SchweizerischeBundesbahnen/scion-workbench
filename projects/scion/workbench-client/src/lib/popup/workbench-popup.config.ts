/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {Observable} from 'rxjs';
import {Dictionary} from '@scion/toolkit/util';

/**
 * Configures the popup to display a microfrontend in a workbench popup using {@link WorkbenchPopupService}.
 *
 * @category Popup
 */
export interface WorkbenchPopupConfig {
  /**
   * Specifies where to open the popup.
   *
   * Provide either an exact page coordinate (x/y) or an element to serve as the popup anchor. If you use
   * an element as the popup anchor, the popup also moves when the anchor element moves. If you position the
   * popup using page coordinates, consider passing an Observable to re-position the popup after it is created.
   * If passing coordinates via an Observable, the popup will not display until the Observable emits the first coordinate.
   *
   * The align setting can be used to further control where the popup opens relative to its anchor.
   */
  anchor: Element | PopupOrigin | Observable<PopupOrigin>;
  /**
   * Allows passing data to the popup microfrontend. The popup provider can declare mandatory and optional parameters.
   * No additional parameters may be included. Refer to the documentation of the popup capability provider for more information.
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

/**
 * Represents a point on the page, optionally with a dimension, where a workbench popup should be attached.
 *
 * @category Popup
 */
export interface PopupOrigin {
  x: number;
  y: number;
  width?: number;
  height?: number;
}
