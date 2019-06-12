/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { fromEvent, merge, Subject } from 'rxjs';
import { auditTime, filter, takeUntil } from 'rxjs/operators';

/**
 * Indicates that the primary mouse button is pressed (usually left).
 */
const PRIMARY_MOUSE_BUTTON = 1;

/**
 * Installs dispatching of the mouse events 'mousemove' (if pressed the primary mouse button) and 'mouseup'
 * between the application window and the given target window.
 *
 * Communication is based on `postMessage` and `onmessage` to safely propagate events cross-origin.
 *
 * Events are dispatched as synthetic events via document event dispatcher of the target window.
 * A 'mousemove' event with the primary mouse button pressed is dispatched as 'sci-mousemove' event
 * and a 'mouseup' event as 'sci-mouseup' event. Properties dispatched are `screenX` and `screenY`.
 *
 * Mouse event dispatching is fundamental if using custom scrollbars in combination with iframes. It provides
 * continued delivery of mouse events even when the cursor goes past the boundary of the iframe boundary.
 *
 * @param targetWindow
 *        A reference to the window to dispatch mouse events
 * @param targetOrigin
 *        Specifies what the origin of `targetWindow` must be for the events to be,
 *        either as the literal string "*" (indicating no preference) or as a URI.
 * @param options to configure mouse dispatching.
 * @return handle to uninstall mouse dispatching
 */
export function installMouseDispatcher(targetWindow: Window, targetOrigin: string, options?: Options): SciMouseDispatcher {
  const destroy$ = new Subject<void>();

  // Dispatch native mouse events to the target window
  const mousemoveThrottleTime = options && options.mousemoveThrottleTime || 20;
  merge(
    fromEvent<MouseEvent>(document, 'mousemove').pipe(filter(event => event.buttons === PRIMARY_MOUSE_BUTTON), auditTime(mousemoveThrottleTime)),
    fromEvent<MouseEvent>(document, 'mouseup'),
  )
    .pipe(takeUntil(destroy$))
    .subscribe((event: MouseEvent) => {
      targetWindow.postMessage({
        type: `sci-${event.type}`,
        screenX: event.screenX,
        screenY: event.screenY,
      }, targetOrigin);
    });

  // Dispatch synthetic mouse events to the target window (unless emitted itself)
  merge(
    fromEvent<SciMouseEvent>(document, 'sci-mousemove'),
    fromEvent<SciMouseEvent>(document, 'sci-mouseup'),
  )
    .pipe(
      filter((event: SciMouseEvent) => event.source !== targetWindow),
      takeUntil(destroy$),
    )
    .subscribe((event: SciMouseEvent) => {
      targetWindow.postMessage({
        type: event.type,
        screenX: event.screenX,
        screenY: event.screenY,
      }, targetOrigin);
    });

  // Dispatch synthetic mouse events received from the target window to this document's event bus
  fromEvent<MessageEvent>(window, 'message')
    .pipe(takeUntil(destroy$))
    .subscribe((messageEvent: MessageEvent) => {
      if (messageEvent.source !== targetWindow) {
        return;
      }

      if (targetOrigin !== '*' && messageEvent.origin !== targetOrigin) {
        throw Error(`[OriginError] Message of illegal origin received [expected=${targetOrigin}, actual=${messageEvent.origin}]`);
      }

      const mouseEvent = parseSyntheticMouseEvent(messageEvent);
      mouseEvent && document.dispatchEvent(mouseEvent);
    });

  return {
    dispose: (): void => destroy$.next(),
  };
}

function parseSyntheticMouseEvent(messageEvent: MessageEvent): Event & SciMouseEvent | null {
  const event: SciMouseEvent = messageEvent.data;
  if (isNullOrUndefined(event) || typeof event !== 'object') {
    return null;
  }
  if (isNullOrUndefined(event.type) || !event.type.startsWith('sci-mouse')) {
    return null;
  }
  if (isNullOrUndefined(event.screenX)) {
    return null;
  }
  if (isNullOrUndefined(event.screenY)) {
    return null;
  }

  const syntheticMouseEvent: any = new Event(event.type);
  syntheticMouseEvent.screenX = event.screenX;
  syntheticMouseEvent.screenY = event.screenY;
  syntheticMouseEvent.source = messageEvent.source;
  return syntheticMouseEvent;
}

function isNullOrUndefined(value: any): boolean {
  return value === null || value === undefined;
}

/**
 * Synthetic mouse event dispatched from another window.
 */
export interface SciMouseEvent {
  type: 'sci-mousemove' | 'sci-mouseup';
  screenX: number;
  screenY: number;
  source?: Window;
}

/**
 * Dispatches mouse events between the application window and another cross-origin window.
 */
export interface SciMouseDispatcher {
  /**
   * Invoke to uninstall mouse dispatching.
   */
  dispose(): void;
}

/**
 * Options to configure mouse dispatching.
 */
export interface Options {

  /**
   * Sets the throttling duration [ms] to debounce event dispatching of 'mousemove' events.
   * By default, 20ms is used.
   */
  mousemoveThrottleTime?: number;
}
