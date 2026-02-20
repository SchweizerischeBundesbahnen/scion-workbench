/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Observable} from 'rxjs';
import {PopupOrigin} from './popup.origin';
import {DialogId, NotificationId, PartId, PopupId, ViewId} from '../workbench.identifiers';

/**
 * Controls the appearance and behavior of a popup.
 *
 * @category Popup
 */
export interface WorkbenchPopupOptions {
  /**
   * Controls where to open the popup.
   *
   * Can be an HTML element or a coordinate. The coordinate is relative to the {@link context}, defaulting to the calling context.
   *
   * Supported coordinate pairs:
   * - x/y: Relative to the top/left corner of the context.
   * - top/left: Same as x/y.
   * - top/right: Relative to the top/right corner of the context.
   * - bottom/left: Relative to the bottom/left corner of the context.
   * - bottom/right: Relative to the bottom/right corner of the context.
   *
   * Passing an Observable allows for updating the coordinate.
   */
  anchor: Element | PopupOrigin | Observable<PopupOrigin>;
  /**
   * Controls where to align the popup relative to the popup anchor, unless there is not enough space available in that area. Defaults to `north`.
   */
  align?: 'east' | 'west' | 'north' | 'south';
  /**
   * Passes data to the popup.
   *
   * The popup can declare mandatory and optional parameters. No additional parameters are allowed. Refer to the documentation of the capability for more information.
   */
  params?: Map<string, unknown> | {[param: string]: unknown};
  /**
   * Controls when to close the popup.
   */
  closeStrategy?: CloseStrategy;
  /**
   * Specifies CSS class(es) to add to the popup, e.g., to locate the popup in tests.
   */
  cssClass?: string | string[];
  /**
   * Binds the popup to a context (e.g., part or view). Defaults to the calling context.
   *
   * The popup is displayed only if the context is visible and closes when the context is disposed.
   *
   * Set to `null` to open the popup outside a context.
   */
  context?: ViewId | PartId | DialogId | PopupId | NotificationId | Context | null;
}

/**
 * @deprecated since version 1.0.0-beta.34. Set view id directly. Migrate `{context: {viewId: 'view.x'}}` to `{context: 'view.x'}`. Marked for removal.
 */
interface Context {
  /**
   * @deprecated since version 1.0.0-beta.34. Set view id directly. Migrate `{context: {viewId: 'view.x'}}` to `{context: 'view.x'}`. Marked for removal.
   */
  viewId?: ViewId | null;
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
