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

/**
 * Allows observing the dimension of an element. Upon subscription, it emits the element's dimension, and then continuously
 * emits when the dimension of the element changes. It never completes.
 *
 * Uses {ResizeObserver} [1] if supported by the user agent [2], or falls back to listening for resize events on a hidden HTML <object> element.
 * The HTML <object> element provides a nested browsing context with a separate window allowing to listen for resize events natively.
 * The HTML <object> element is aligned with the target's bounds, thus requires the element to define a positioning context. If not positioned,
 * the element is changed to be positioned relative. The implementation is based on a blog post published in `backalleycoder.com` [3].
 *
 * You can control if to use the native {ResizeObserver} by default by setting the global flag {@link FromDimension.defaults.useNativeResizeObserver} to `true`.
 * If not set, the native resize observable is used, unless not supported by the user agent or explicitly set via options object when creating the resize observable.
 *
 * ## Note:
 * Web Performance Working Group is working on a W3C recommendation for natively observing changes to Element’s size [1].
 * The Web API draft is still work in progress and support limited to Google Chrome and Opera [2].
 *
 * ## Links:
 * [1] https://wicg.github.io/ResizeObserver/
 * [2] https://caniuse.com/#feat=resizeobserver
 * [3] http://www.backalleycoder.com/2013/03/18/cross-browser-event-based-element-resize-detection/
 *
 * @param  target - HTMLElement to observe its dimension.
 * @param  options - Controls how to listen for dimension changes:
 *         <p>
 *         <ul>
 *           <li>**`useNativeResizeObserver`**\
 *               Flag to control if to use {ResizeObserver} to listen natively for element dimension changes, if supported by the user agent.
 *               By default, this flag is enabled.
 *           </li>
 *         </ul>
 */
export function fromDimension$(target: HTMLElement, options?: { useNativeResizeObserver?: boolean }): Observable<Dimension> {
  options = {
    useNativeResizeObserver: FromDimension.defaults.useNativeResizeObserver,
    ...options,
  };

  if (options.useNativeResizeObserver && supportsNativeResizeObserver()) {
    return createNativeResizeObservable$(target);
  }

  // Check if there is already allocated a <HTML> object element to listen for resize events.
  const registry = FromDimension.objectObservableRegistry;
  if (registry.has(target)) {
    return registry.get(target);
  }

  // Allocate the <HTML> object element and multicast its resize events to the subscribers.
  const disposeFn = (): void => {
    registry.delete(target);
  };
  const dimension$ = createObjectResizeObservable$(target, disposeFn)
    .pipe(
      // We use `multicast(() => new ReplaySubject<SciDimension>(1)), refCount())` instead of 'share' or 'shareReplay' operator.
      // It is like the RxJS 'share' operator but with a {ReplaySubject} instead. Unlike the RxJS 'shareReplay' operator,
      // it unsubscribes from the source observable once the last subscriber unsubscribes, which is crucial to dispose the HTML <object> element.
      multicast(() => new ReplaySubject<Dimension>(1)),
      refCount(),
    );
  registry.set(target, dimension$);
  return dimension$;
}

function createNativeResizeObservable$(target: HTMLElement): Observable<Dimension> {
  return new Observable((observer: Observer<Dimension>): TeardownLogic => {
    const resizeObserver = new window['ResizeObserver'](() => observer.next(FromDimension.captureElementDimension(target))); // tslint:disable-line:typedef
    resizeObserver.observe(target);

    // emit the current dimension once the browser is about to repaint
    requestAnimationFrame(() => observer.next(FromDimension.captureElementDimension(target)));

    return (): void => {
      resizeObserver.disconnect();
    };
  });
}

function createObjectResizeObservable$(target: HTMLElement, onDisposeFn: () => void): Observable<Dimension> {
  return new Observable((observer: Observer<Dimension>): TeardownLogic => {
    const destroy$ = new Subject<void>();

    // create an <object> element to have a nested browsing context with a separate window to listen for resize events
    const objectElement: HTMLObjectElement = document.createElement('object');
    objectElement.type = 'text/html';
    objectElement.data = 'about:blank';
    objectElement.classList.add(FromDimension.SYNTH_ELEMENT_MARKER);
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
        map((): Dimension => FromDimension.captureElementDimension(target)),
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

/**
 * Represents the dimension of an element.
 */
export interface Dimension {
  offsetWidth: number;
  offsetHeight: number;
  clientWidth: number;
  clientHeight: number;
  element: HTMLElement;
}

export namespace FromDimension {
  /**
   * Allows you to globally control how element size changes are detected.
   */
  export const defaults = {
    /**
     * Flag to control if to use the native {ResizeObserver}, which is by default.
     * This flag is only evaluated if the user agent supports {ResizeObserver}.
     */
    useNativeResizeObserver: true,
  };

  /** @internal */
  export const objectObservableRegistry = new Map<HTMLElement, Observable<Dimension>>();

  /** @internal */
  export const SYNTH_ELEMENT_MARKER = 'synth-resize-observable';

  /**
   * Returns 'true' if the given element is used to observe an element's size.
   */
  export function isSynthResizeObservableObject(element: HTMLElement): boolean {
    return element instanceof HTMLObjectElement && element.classList.contains(FromDimension.SYNTH_ELEMENT_MARKER);
  }

  /**
   * Captures the dimension of the given element.
   */
  export function captureElementDimension(element: HTMLElement): Dimension {
    return {
      clientWidth: element.clientWidth,
      offsetWidth: element.offsetWidth,
      clientHeight: element.clientHeight,
      offsetHeight: element.offsetHeight,
      element,
    };
  }
}

