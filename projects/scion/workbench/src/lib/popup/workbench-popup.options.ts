/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ElementRef, Injector, Provider} from '@angular/core';
import {Observable} from 'rxjs';
import {PopupOrigin} from './popup.origin';
import {DialogId, PartId, PopupId, ViewId} from '../workbench.identifiers';

/**
 * Controls the appearance and behavior of a popup.
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
  anchor: ElementRef<Element> | Element | PopupOrigin | Observable<PopupOrigin>;

  /**
   * Controls where to align the popup relative to the popup anchor, unless there is not enough space available in that area. Defaults to `north`.
   */
  align?: 'east' | 'west' | 'north' | 'south';

  /**
   * Specifies data to pass to the popup component. Inputs are available as input properties in the popup component.
   *
   * @example - Reading inputs in the component
   * ```ts
   * public someInput = input.required<string>();
   * ```
   */
  inputs?: {[name: string]: unknown};

  /**
   * Controls when to close the popup.
   */
  closeStrategy?: CloseStrategy;

  /**
   * Specifies the preferred popup size. Defaults to the content's intrinsic size, constrained by min and max size, if set.
   *
   * @deprecated since version 21.0.0-beta.1. Popup size should be set by the popup component. To migrate, inject `WorkbenchPopup` into the popup component and set the size via the `WorkbenchPopup.size` property. Marked for removal in version 22.
   */
  size?: {
    minHeight?: string;
    height?: string;
    maxHeight?: string;
    minWidth?: string;
    width?: string;
    maxWidth?: string;
  };

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
  context?: ViewId | PartId | DialogId | PopupId | Context | null;

  /**
   * Specifies the injector for the instantiation of the popup, giving control over the objects available
   * for injection in the popup component. Defaults to the application's root injector.
   *
   * @example - Creating an injector with a DI token
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
   * Specifies providers available for injection in the popup component.
   *
   * Providers can inject {@link WorkbenchPopup} to interact with the popup.
   */
  providers?: Provider[];

  /**
   * Specifies the identity of the popup. Defaults to a UUID.
   *
   * @internal
   */
  id?: PopupId;
}

/**
 * Specifies when to close the popup.
 */
export interface CloseStrategy {
  /**
   * Controls if to close the popup on focus loss, returning the result set via {@link WorkbenchPopup#setResult} to the popup opener.
   * Defaults to `true`.
   */
  onFocusLost?: boolean;
  /**
   * Controls if to close the popup when pressing escape. Defaults to `true`.
   *
   * No return value will be returned to the popup opener.
   */
  onEscape?: boolean;
}

/**
 * @deprecated since version 20.0.0-beta.9. Set view id directly. Migrate `{context: {viewId: 'view.x'}}` to `{context: 'view.x'}`. Marked for removal in version 22.
 */
interface Context {
  /**
   * @deprecated since version 20.0.0-beta.9. Set view id directly. Migrate `{context: {viewId: 'view.x'}}` to `{context: 'view.x'}`. Marked for removal in version 22.
   */
  viewId?: ViewId | null;
}
