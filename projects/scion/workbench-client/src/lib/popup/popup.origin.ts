/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

/**
 * Represents a point on the page or view, optionally with a dimension, where a workbench popup should be attached.
 *
 * @category Popup
 */
export type PopupOrigin = (Point | TopLeftPoint | TopRightPoint | BottomLeftPoint | BottomRightPoint) & {
  width?: number;
  height?: number;
  /**
   * Specifies if the coordinate is relative to the context (e.g., part or view) or page viewport. Defaults to `context`.
   *
   * If relative to the viewport and bound to a context, the popup is still constrained by the context's bounds.
   *
   * @internal
   */
  relativeTo?: 'context' | 'viewport';
};

/**
 * Coordinate relative to the "x/y" corner of the view or page viewport.
 *
 * @category Popup
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Coordinate relative to the "top/left" corner of the view or page viewport.
 *
 * This is equivalent to passing a "x/y" coordinate as {@link Point}.
 *
 * @category Popup
 */
export interface TopLeftPoint {
  top: number;
  left: number;
}

/**
 * Coordinate relative to the "top/right" corner of the view or page viewport.
 *
 * @category Popup
 */
export interface TopRightPoint {
  top: number;
  right: number;
}

/**
 * Coordinate relative to the "bottom/left" corner of the view or page viewport.
 *
 * @category Popup
 */
export interface BottomLeftPoint {
  bottom: number;
  left: number;
}

/**
 * Coordinate relative to the "bottom/right" corner of the view or page viewport.
 *
 * @category Popup
 */
export interface BottomRightPoint {
  bottom: number;
  right: number;
}
