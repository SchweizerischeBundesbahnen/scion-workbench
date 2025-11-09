/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ElementRef, Injector, StaticProvider, Type, ViewContainerRef} from '@angular/core';
import {Observable} from 'rxjs';
import {PopupOrigin} from './popup.origin';
import {DialogId, PartId, PopupId, ViewId} from '../workbench.identifiers';

/**
 * Controls the appearance and behavior of a popup.
 */
export abstract class PopupConfig {
  /**
   * Specifies the unique identity of the popup. Defaults to a UUID.
   *
   * @internal
   */
  public abstract readonly id?: PopupId;
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
  public abstract readonly anchor: ElementRef<Element> | Element | PopupOrigin | Observable<PopupOrigin>;
  /**
   * Specifies the component to display in the popup.
   *
   * In the component, you can inject the popup handle {@link WorkbenchPopup} to interact with the popup, such as to close it
   * or obtain its input data.
   */
  public abstract readonly component: Type<any>;
  /**
   * Instructs Angular how to construct the component. In most cases, construct options need not to be set.
   */
  public readonly componentConstructOptions?: {
    /**
     * Sets the injector for the instantiation of the popup component, giving you control over the objects available
     * for injection into the popup component. If not specified, uses the application's root injector, or the view's
     * injector if opened in the context of a view.
     *
     * ```ts
     * Injector.create({
     *   parent: ...,
     *   providers: [
     *    {provide: <DiToken>, useValue: <value>}
     *   ],
     * })
     * ```
     */
    injector?: Injector;
    /**
     * Specifies providers to be registered with the popup injector. Unlike providers that are registered via a separate {@link injector},
     * passed providers are registered in the same injector as the popup handle itself, allowing for dependency injection of the popup handle.
     */
    providers?: StaticProvider[];
    /**
     * Sets the component's attachment point in Angular's logical component tree (not the DOM tree used for rendering), effecting when
     * Angular checks the component for changes during a change detection cycle. If not set, inserts the component at the top level
     * in the component tree.
     */
    viewContainerRef?: ViewContainerRef;
  };
  /**
   * Hint where to align the popup relative to the popup anchor, unless there is not enough space available in that area. By default,
   * if not specified, the popup opens north of the anchor.
   */
  public readonly align?: 'east' | 'west' | 'north' | 'south';
  /**
   * Optional data to pass to the popup component. In the component, you can inject the popup handle {@link WorkbenchPopup} to read input data.
   */
  public readonly input?: any;
  /**
   * Controls when to close the popup.
   */
  public readonly closeStrategy?: CloseStrategy;
  /**
   * Specifies the preferred popup size. If not specified, the popup adjusts its size to the content size.
   */
  public readonly size?: PopupSize;
  /**
   * Specifies CSS class(es) to add to the popup, e.g., to locate the popup in tests.
   */
  public readonly cssClass?: string | string[];
  /**
   * Binds the popup to a context (e.g., a part or view). Defaults to the calling context.
   *
   * The popup is displayed only if the context is visible and closes when the context is disposed.
   *
   * Set to `null` to open the popup outside a context.
   */
  public abstract context?: ViewId | PartId | DialogId | PopupId | Context | null;
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
   * No return value will be passed to the popup opener.
   */
  onEscape?: boolean;
}

/**
 * Represents the preferred popup size as specified by the popup opener.
 */
export interface PopupSize {
  /**
   * Specifies the min-height of the popup.
   */
  minHeight?: string;
  /**
   * Specifies the height of the popup.
   */
  height?: string;
  /**
   * Specifies the max-height of the popup.
   */
  maxHeight?: string;
  /**
   * Specifies the min-width of the popup.
   */
  minWidth?: string;
  /**
   * Specifies the width of the popup.
   */
  width?: string;
  /**
   * Specifies the max-width of the popup.
   */
  maxWidth?: string;
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
