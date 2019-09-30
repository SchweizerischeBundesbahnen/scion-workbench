/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { concat, fromEvent, Observable, Observer, of, ReplaySubject, Subject, TeardownLogic } from 'rxjs';
import { map, multicast, refCount, switchMap, takeUntil, tap } from 'rxjs/operators';
import { Injectable, InjectionToken, Injector } from '@angular/core';

/**
 * CSS class added to the HTML <object> element emitting resize events if not using the native {ResizeObserver}.
 */
const SYNTH_RESIZE_OBSERVABLE_OBJECT_MARKER = 'synth-resize-observable';

/**
 * DI injection token to control if to use the native {ResizeObserver} by default.
 * If not provided, the native resize observable is used, unless explicitly set via options object when creating the resize observable.
 *
 * This flag is only evaluated if the user agent supports {ResizeObserver}.
 */
export const USE_NATIVE_RESIZE_OBSERVER = new InjectionToken<boolean>('USE_NATIVE_RESIZE_OBSERVER');

/**
 * Allows observing the dimension of an element.
 *
 * Uses {ResizeObserver} if supported by the user agent [1], or falls back to listening for resize events on a hidden HTML <object> element.
 * The HTML <object> element provides a nested browsing context with a separate window allowing to listen for resize events natively.
 *
 * The HTML <object> element is aligned with the target's bounds, thus requires the element to define a positioning context.
 * If not positioned, the element is changed to be positioned relative.
 *
 * The implementation is based on a blog post published in `backalleycoder.com` [2].
 *
 * ---
 * [1] https://wicg.github.io/ResizeObserver/
 * [2] http://www.backalleycoder.com/2013/03/18/cross-browser-event-based-element-resize-detection/
 */
@Injectable({providedIn: 'root'})
export class SciDimensionService {

  /**
   * @internal
   */
  public _objectObservableRegistry = new Map<HTMLElement, Observable<SciDimension>>();

  constructor(private _injector: Injector) {
  }

  /**
   * Upon subscription, it emits the element's dimension, and then continuously emits when the dimension of the element changes. It never completes.
   *
   * @param target
   *        HTMLElement to observe its dimension.
   * @param options
   *        - useNativeResizeObserver: boolean
   *          Flag to control if to use {ResizeObserver} to listen natively for element dimension changes, if supported by the user agent.
   *          By default, this flag is enabled.
   */
  public dimension$(target: HTMLElement, options?: { useNativeResizeObserver?: boolean }): Observable<SciDimension> {
    options = {
      useNativeResizeObserver: this._injector.get(USE_NATIVE_RESIZE_OBSERVER, true),
      ...options,
    };

    if (options.useNativeResizeObserver && supportsNativeResizeObserver()) {
      return createNativeResizeObservable$(target);
    }

    // Check if there is already allocated a <HTML> object element to listen for resize events.
    if (this._objectObservableRegistry.has(target)) {
      return this._objectObservableRegistry.get(target);
    }

    // Allocate the <HTML> object element and multicast its resize events to the subscribers.
    const disposeFn = (): void => {
      this._objectObservableRegistry.delete(target);
    };
    const dimension$ = createObjectResizeObservable$(target, disposeFn)
      .pipe(
        // We use `multicast(() => new ReplaySubject<SciDimension>(1)), refCount())` instead of 'share' or 'shareReplay' operator.
        // It is like the RxJS 'share' operator but with a {ReplaySubject} instead. Unlike the RxJS 'shareReplay' operator,
        // it unsubscribes from the source observable once the last subscriber unsubscribes, which is crucial to dispose the HTML <object> element.
        multicast(() => new ReplaySubject<SciDimension>(1)),
        refCount(),
      );
    this._objectObservableRegistry.set(target, dimension$);
    return dimension$;
  }

  /**
   * Returns 'true' if the given element is used to observe an element's size.
   */
  public isSynthResizeObservableObject(element: HTMLElement): boolean {
    return element instanceof HTMLObjectElement && element.classList.contains(SYNTH_RESIZE_OBSERVABLE_OBJECT_MARKER);
  }
}

function createNativeResizeObservable$(target: HTMLElement): Observable<SciDimension> {
  return new Observable((observer: Observer<SciDimension>): TeardownLogic => {
    const resizeObserver = new window['ResizeObserver'](() => observer.next(captureElementDimension(target))); // tslint:disable-line:typedef
    resizeObserver.observe(target);

    // emit the current dimension once the browser is about to repaint
    requestAnimationFrame(() => observer.next(captureElementDimension(target)));

    return (): void => {
      resizeObserver.disconnect();
    };
  });
}

function createObjectResizeObservable$(target: HTMLElement, onDisposeFn: () => void): Observable<SciDimension> {
  return new Observable((observer: Observer<SciDimension>): TeardownLogic => {
    const destroy$ = new Subject<void>();

    // create an <object> element to have a nested browsing context with a separate window to listen for resize events
    const objectElement: HTMLObjectElement = document.createElement('object');
    objectElement.type = 'text/html';
    objectElement.data = 'about:blank';
    objectElement.classList.add(SYNTH_RESIZE_OBSERVABLE_OBJECT_MARKER);
    setStyle(objectElement, {
      display: 'block',
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      width: '100%',
      height: '100%',
      'pointer-events': 'none',
    });

    // Wait until the element is attached to the DOM, so that its window can be accessed.
    fromEvent(objectElement, 'load')
      .pipe(
        tap(() => ensureHostElementPositioned(target)),
        switchMap(() => concat(of(undefined) /* emit the dimension upon subscription */, fromEvent(objectElement.contentWindow, 'resize') /* emit on size change */)),
        map((): SciDimension => captureElementDimension(target)),
        takeUntil(destroy$),
      )
      .subscribe(observer);

    target.appendChild(objectElement);

    return (): void => {
      destroy$.next();
      target.removeChild(objectElement);
      onDisposeFn();
    };
  });
}

export function captureElementDimension(element: HTMLElement): SciDimension {
  return {
    clientWidth: element.clientWidth,
    offsetWidth: element.offsetWidth,
    clientHeight: element.clientHeight,
    offsetHeight: element.offsetHeight,
    element,
  };
}

function ensureHostElementPositioned(element: HTMLElement): void {
  if (getComputedStyle(element).position === 'static') {
    element.style.position = 'relative';
  }
}

function supportsNativeResizeObserver(): boolean {
  return !!window['ResizeObserver'];
}

/**
 * Applies the given style(s) to the given element.
 */
function setStyle(element: HTMLElement, style: { [style: string]: any }): void {
  Object.keys(style).forEach(key => element.style[key] = style[key]);
}

export interface SciDimension {
  offsetWidth: number;
  offsetHeight: number;
  clientWidth: number;
  clientHeight: number;
  element: HTMLElement;
}
