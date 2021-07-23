/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {ComponentFactoryResolver, ElementRef, Injector, StaticProvider, Type, ViewContainerRef} from '@angular/core';
import {Observable} from 'rxjs';

/**
 * Configures the content to be displayed in a popup.
 *
 * A popup is a visual workbench component for displaying content above other content. It is positioned relative to an anchor,
 * which can be either a page coordinate (x/y) or an HTML element. When using an element as the popup anchor, the popup also
 * moves when the anchor element moves.
 */
export abstract class PopupConfig {
  /**
   * Specifies where to open the popup.
   *
   * Provide either an exact screen coordinate (x/y) or an element to serve as the popup anchor. If you use
   * an element as the popup anchor, the popup also moves when the anchor element moves. If you position the
   * popup using screen coordinates, consider passing an Observable to re-position the popup after it is created.
   * If passing coordinates via an Observable, the popup will not display until the Observable emits the first coordinate.
   *
   * The align setting can be used to further control where the popup opens relative to its anchor.
   */
  public abstract readonly anchor: ElementRef<Element> | Element | PopupOrigin | Observable<PopupOrigin>;
  /**
   * Specifies the component to display in the popup.
   *
   * In the component, you can inject the popup handle {@link Popup} to interact with the popup, such as to close it
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
    /**
     * Sets the component factory for Angular to resolve the component for construction. Must be set if Angular cannot resolve the component.
     */
    componentFactoryResolver?: ComponentFactoryResolver | null;
  };
  /**
   * Hint where to align the popup relative to the popup anchor, unless there is not enough space available in that area. By default,
   * if not specified, the popup opens north of the anchor.
   */
  public readonly align?: 'east' | 'west' | 'north' | 'south';
  /**
   * Optional data to pass to the popup component. In the component, you can inject the popup handle {@link Popup} to read input data.
   */
  public readonly input?: any;
  /**
   * Controls when to close the popup.
   */
  public readonly closeStrategy?: CloseStrategy;
  /**
   * Specifies the context in which the popup is opened.
   */
  public readonly context?: {
    /**
     * Specifies the view from which the popup was opened.
     *
     * Allows sticking the popup to the lifecycle of a workbench view so that it is only displayed when the referenced view is the active view
     * in its viewpart, or closed when closing the view.
     *
     * By default, when opening the popup in the context of a view, that view is used as the popup's contextual view.
     */
    viewId?: string;
    /**
     * Specifies the microfrontend capability from which the popup was opened.
     */
    capabilityId?: string;
  };
  /**
   * Specifies the preferred popup size. If not specified, the popup adjusts its size to the content size.
   */
  public readonly size?: PopupSize;
  /**
   * Specifies CSS class(es) added to the popup overlay, e.g. used for e2e testing.
   */
  public readonly cssClass?: string | string[];
}

/**
 * Specifies when to close the popup.
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
 */
export interface PopupOrigin {
  x: number;
  y: number;
  width?: number;
  height?: number;
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
 * Represents a handle that a popup component can inject to interact with the popup, for example,
 * to read input data or the configured size, or to close the popup.
 */
export abstract class Popup<T = any> {

  /**
   * Input data as passed by the popup opener when opened the popup, or `undefined` if not passed.
   */
  public abstract readonly input: T | undefined;

  /**
   * Preferred popup size as specified by the popup opener, or `undefined` if not set.
   */
  public abstract readonly size: PopupSize | undefined;

  /**
   * Closes the popup. Optionally, pass a result to the popup opener.
   */
  public abstract close<R = any>(result?: R | undefined): void;

  /**
   * Closes the popup returning the given error to the popup opener.
   */
  public abstract closeWithError(error: Error | string): void;
}

/**
 * @internal
 */
export class ɵPopup implements Popup {

  private _closeResolveFn!: (result: any | undefined) => void;

  public readonly whenClose = new Promise<any | undefined>(resolve => this._closeResolveFn = resolve);

  constructor(public readonly input: any | undefined, public readonly size: PopupSize | undefined) {
  }

  /**
   * @inheritDoc
   */
  public close<R = any>(result?: R | undefined): void {
    this._closeResolveFn(result);
  }

  /**
   * @inheritDoc
   */
  public closeWithError(error: Error | string): void {
    this._closeResolveFn(new ɵPopupError(error));
  }
}

/**
 * @internal
 */
export class ɵPopupError {

  constructor(public error: string | Error) {
  }
}
