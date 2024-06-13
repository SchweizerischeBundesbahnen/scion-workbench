/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ElementRef, inject, Injector, StaticProvider, Type, ViewContainerRef} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {PopupOrigin} from './popup.origin';
import {Arrays} from '@scion/toolkit/util';
import {WorkbenchDialogRegistry} from '../dialog/workbench-dialog.registry';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {map} from 'rxjs/operators';
import {ɵDestroyRef} from '../common/ɵdestroy-ref';
import {ɵWorkbenchDialog} from '../dialog/ɵworkbench-dialog';
import {Blockable} from '../glass-pane/blockable';
import {ViewId} from '../view/workbench-view.model';
import {UUID} from '@scion/toolkit/uuid';

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
  public abstract readonly id?: string;
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
   * Provides information about the context in which this popup was opened.
   */
  public abstract readonly referrer: PopupReferrer;

  /**
   * CSS classes associated with the popup.
   */
  public abstract readonly cssClasses: string[];

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
export class ɵPopup<T = unknown> implements Popup<T>, Blockable {
  /**
   * Unique identity of this popup.
   */
  public readonly id: string;
  public readonly destroyRef = new ɵDestroyRef();
  public readonly cssClasses: string[];

  /**
   * Indicates whether this popup is blocked by dialog(s) that overlay it.
   */
  public readonly blockedBy$ = new BehaviorSubject<ɵWorkbenchDialog | null>(null);
  public result: unknown | ɵPopupErrorResult | undefined;

  constructor(private _config: PopupConfig, public readonly referrer: PopupReferrer) {
    this.id = this._config.id ?? UUID.randomUUID();
    this.cssClasses = Arrays.coerce(this._config.cssClass);
    this.blockWhenDialogOpened();
  }

  /**
   * Blocks this popup when a dialog overlays it.
   */
  private blockWhenDialogOpened(): void {
    const workbenchDialogRegistry = inject(WorkbenchDialogRegistry);
    const initialTop = workbenchDialogRegistry.top({viewId: this.referrer.viewId});

    workbenchDialogRegistry.top$({viewId: this.referrer.viewId})
      .pipe(
        map(top => top === initialTop ? null : top),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(this.blockedBy$);
  }

  /** @inheritDoc */
  public close<R = any>(result?: R | undefined): void {
    this.result = result;
    this.destroy();
  }

  /** @inheritDoc */
  public closeWithError(error: Error | string): void {
    this.result = new ɵPopupErrorResult(error);
    this.destroy();
  }

  /** @inheritDoc */
  public get input(): T | undefined {
    return this._config.input;
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
   * Destroys this dialog and associated resources.
   */
  public destroy(): void {
    this.destroyRef.destroy();
  }
}

/**
 * @internal
 */
export class ɵPopupErrorResult {

  constructor(public error: string | Error) {
  }
}

/**
 * Information about the context in which a popup was opened.
 */
export interface PopupReferrer {
  /**
   * Identity of the view if opened in the context of a view.
   */
  viewId?: ViewId;
}
