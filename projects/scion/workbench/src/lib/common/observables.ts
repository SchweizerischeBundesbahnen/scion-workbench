/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {fromEvent, Observable, race} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ɵDestroyRef} from './ɵdestroy-ref';

/**
 * Makes the given handle "movable" for the user to move it by mouse or touch gesture.
 *
 * The returned Observable emits when start moving the handle, while moving it, and when stop moving the handle.
 * The Observable never completes.
 */
export function fromMoveHandle$(handle: HTMLElement): Observable<HandleMoveEvent> {
  return new Observable<HandleMoveEvent>(observer => {
    const destroyRef = new ɵDestroyRef();
    const document = handle.ownerDocument;

    // Subscribe for mousedown events.
    fromEvent<MouseEvent>(handle, 'mousedown')
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe((event: MouseEvent) => onMouseDown(event));

    // Subscribe for touch start events.
    fromEvent<TouchEvent>(handle, 'touchstart')
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe((event: TouchEvent) => onTouchStart(event));

    return () => destroyRef.destroy();

    function onMouseDown(mouseDownEvent: MouseEvent): void {
      if (mouseDownEvent.button !== 0) { // 0 = main button pressed, usually the left button
        return;
      }
      observer.next({type: 'mousestart', mouseEvent: mouseDownEvent});

      // Subscribe for 'mousemove' events
      const mouseMoveSubscription = fromEvent<MouseEvent>(document, 'mousemove')
        .pipe(takeUntilDestroyed(destroyRef))
        .subscribe((mouseMoveEvent: MouseEvent) => {
          observer.next({type: 'mousemove', mouseEvent: mouseMoveEvent});
        });

      // Subscribe for 'mouseup' events
      fromEvent<MouseEvent>(document, 'mouseup', {once: true})
        .pipe(takeUntilDestroyed(destroyRef))
        .subscribe((mouseUpEvent: MouseEvent) => {
          mouseMoveSubscription.unsubscribe();
          observer.next({type: 'mouseend', mouseEvent: mouseUpEvent});
        });
    }

    function onTouchStart(touchStartEvent: TouchEvent): void {
      observer.next({type: 'touchstart', touchEvent: touchStartEvent});

      // Subscribe for 'touchmove' events
      const touchMoveSubscription = fromEvent<TouchEvent>(document, 'touchmove')
        .pipe(takeUntilDestroyed(destroyRef))
        .subscribe((touchMoveEvent: TouchEvent) => {
          observer.next({type: 'touchmove', touchEvent: touchMoveEvent});
        });

      // Subscribe for 'touchend' and 'touchcancel' events
      race(fromEvent<TouchEvent>(document, 'touchend', {once: true}), fromEvent<TouchEvent>(document, 'touchcancel', {once: true}))
        .pipe(takeUntilDestroyed(destroyRef))
        .subscribe((touchEndEvent: TouchEvent) => {
          touchMoveSubscription.unsubscribe();
          observer.next({type: 'touchend', touchEvent: touchEndEvent});
        });
    }
  });
}

/**
 * Event emitted when moving the handle by mouse.
 */
export interface MouseMoveEvent {
  type: 'mousestart' | 'mousemove' | 'mouseend';
  mouseEvent: MouseEvent;
}

/**
 * Event emitted when moving the handle by touch gesture.
 */
export interface TouchMoveEvent {
  type: 'touchstart' | 'touchmove' | 'touchend';
  touchEvent: TouchEvent;
}

/**
 * Event emitted when moving the handle.
 */
export type HandleMoveEvent = MouseMoveEvent | TouchMoveEvent;
