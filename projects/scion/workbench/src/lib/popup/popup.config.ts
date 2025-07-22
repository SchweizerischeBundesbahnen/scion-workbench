/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {assertNotInReactiveContext, ElementRef, EnvironmentInjector, inject, Injector, StaticProvider, Type, ViewContainerRef} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {PopupOrigin} from './popup.origin';
import {Arrays} from '@scion/toolkit/util';
import {WorkbenchDialogRegistry} from '../dialog/workbench-dialog.registry';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {map} from 'rxjs/operators';
import {ɵWorkbenchDialog} from '../dialog/ɵworkbench-dialog';
import {Blockable} from '../glass-pane/blockable';
import {ɵWorkbenchView} from '../view/ɵworkbench-view.model';
import {PopupId, ViewId} from '../workbench.identifiers';

/**
 * Configures the content to be displayed in a popup.
 *
 * A popup is a visual workbench component for displaying content above other content. It is positioned relative to an anchor,
 * which can be either a page coordinate (x/y) or an HTML element. When using an element as the popup anchor, the popup also
 * moves when the anchor element moves.
 */
export abstract class PopupConfig {
  /**
   * Specifies the unique identity of the popup. If not specified, assigns the popup a UUID.
   *
   * @internal
   */
  public abstract readonly id?: PopupId;
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
   * Specifies the preferred popup size. If not specified, the popup adjusts its size to the content size.
   */
  public readonly size?: PopupSize;
  /**
   * Specifies CSS class(es) to add to the popup, e.g., to locate the popup in tests.
   */
  public readonly cssClass?: string | string[];
  /**
   * Specifies the context in which to open the popup.
   */
  public readonly context?: {
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
export abstract class Popup<T = unknown, R = unknown> {

  /**
   * Input data as passed by the popup opener when opened the popup, or `undefined` if not passed.
   */
  public abstract readonly input: T | undefined;

  /**
   * Preferred popup size as specified by the popup opener, or `undefined` if not set.
   */
  public abstract readonly size: PopupSize | undefined;

  /**
   * CSS classes associated with the popup.
   */
  public abstract readonly cssClasses: string[];

  /**
   * Sets a result that will be passed to the popup opener when the popup is closed on focus loss {@link CloseStrategy#onFocusLost}.
   */
  public abstract setResult(result?: R): void;

  /**
   * Closes the popup. Optionally, pass a result or an error to the popup opener.
   */
  public abstract close(result?: R | Error): void;
}

/**
 * @internal
 */
export class ɵPopup<T = unknown, R = unknown> implements Popup<T, R>, Blockable {

  private readonly _popupEnvironmentInjector = inject(EnvironmentInjector);
  private readonly _context = {
    view: inject(ɵWorkbenchView, {optional: true}),
  };

  public readonly cssClasses: string[];

  /**
   * Indicates whether this popup is blocked by dialog(s) that overlay it.
   */
  public readonly blockedBy$ = new BehaviorSubject<ɵWorkbenchDialog | null>(null);
  public result: R | Error | undefined;

  constructor(public id: PopupId, private _config: PopupConfig) {
    this.cssClasses = Arrays.coerce(this._config.cssClass);
    this.blockWhenDialogOpened();
  }

  /**
   * Blocks this popup when a dialog overlays it.
   */
  private blockWhenDialogOpened(): void {
    const workbenchDialogRegistry = inject(WorkbenchDialogRegistry);
    const initialTop = workbenchDialogRegistry.top({viewId: this._context.view?.id});

    workbenchDialogRegistry.top$({viewId: this._context.view?.id})
      .pipe(
        map(top => top === initialTop ? null : top),
        takeUntilDestroyed(),
      )
      .subscribe(this.blockedBy$);
  }

  /** @inheritDoc */
  public setResult(result?: R): void {
    this.result = result;
  }

  /** @inheritDoc */
  public close(result?: R | Error): void {
    assertNotInReactiveContext(this.close, 'Call WorkbenchPopup.close() in a non-reactive (non-tracking) context, such as within the untracked() function.');
    this.result = result;
    this.destroy();
  }

  /** @inheritDoc */
  public get input(): T | undefined {
    return this._config.input as T | undefined;
  }

  /** @inheritDoc */
  public get size(): PopupSize | undefined {
    return this._config.size;
  }

  public get component(): Type<any> {
    return this._config.component;
  }

  public get viewContainerRef(): ViewContainerRef | undefined {
    return this._config.componentConstructOptions?.viewContainerRef;
  }

  /**
   * Reference to the handle's injector. The injector will be destroyed when closing the popup.
   */
  public get injector(): Injector {
    return this._popupEnvironmentInjector;
  }

  /**
   * Destroys this popup and associated resources.
   */
  public destroy(): void {
    this._popupEnvironmentInjector.destroy();
  }
}
