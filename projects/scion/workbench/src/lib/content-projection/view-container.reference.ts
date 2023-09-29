/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {InjectionToken, ViewContainerRef} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

/**
 * Handle holding a reference to a DOM location.
 */
export class ViewContainerReference {

  private _ref$ = new BehaviorSubject<ViewContainerRef | undefined>(undefined);

  /**
   * Sets the given {@link ViewContainerRef}.
   */
  public set(vcr: ViewContainerRef): void {
    this._ref$.next(vcr);
  }

  /**
   * Unsets the reference.
   */
  public unset(): void {
    this._ref$.next(undefined);
  }

  /**
   * Returns the {@link ViewContainerRef}. If not set, by default, throws an error unless setting the `orElseUndefined` option.
   */
  public ref(): ViewContainerRef;
  public ref(options: {orElse: undefined}): ViewContainerRef | undefined;
  public ref(options?: {orElse: undefined}): ViewContainerRef | undefined {
    if (!this._ref$.value && !options) {
      throw Error('[NullViewContainerReference] ViewContainer not set.');
    }
    return this._ref$.value;
  }

  /**
   * Emits the {@link ViewContainerRef}, or undefined if not set.
   *
   * Upon subscription, emits the current reference (or `undefined` if not set), and then continues to emit each time the reference changes.
   * The observable never completes.
   */
  public get ref$(): Observable<ViewContainerRef | undefined> {
    return this._ref$;
  }
}

/**
 * DI token to inject the DOM location where to attach iframes.
 */
export const IFRAME_HOST = new InjectionToken<ViewContainerReference>('IFRAME_HOST', {
  providedIn: 'root',
  factory: () => new ViewContainerReference(),
});

/**
 * DI token to inject the DOM location where to attach view-modal message boxes.
 */
export const VIEW_MODAL_MESSAGE_BOX_HOST = new InjectionToken<ViewContainerReference>('VIEW_MODAL_MESSAGE_BOX_HOST', {
  providedIn: 'root',
  factory: () => new ViewContainerReference(),
});

/**
 * DI token to inject the DOM location where to attach the visual placeholder when dragging a view over a valid drop zone.
 */
export const VIEW_DROP_PLACEHOLDER_HOST = new InjectionToken<ViewContainerReference>('VIEW_DROP_PLACEHOLDER_HOST', {
  providedIn: 'root',
  factory: () => new ViewContainerReference(),
});

/**
 * DI token to inject the DOM location of the {@link WorkbenchComponent} HTML element.
 */
export const WORKBENCH_ELEMENT_REF = new InjectionToken<ViewContainerReference>('WORKBENCH_ELEMENT_REF', {
  providedIn: 'root',
  factory: () => new ViewContainerReference(),
});
