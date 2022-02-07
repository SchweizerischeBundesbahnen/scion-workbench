/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Directive, EventEmitter, HostBinding, HostListener, Inject, OnDestroy, Output} from '@angular/core';
import {fromEvent, Subject} from 'rxjs';
import {DOCUMENT} from '@angular/common';
import {first, takeUntil} from 'rxjs/operators';

/**
 * Allows moving the host element while holding down the primary mouse button, e.g. to move a message box.
 */
@Directive({selector: '[wbMove]'})
export class MoveDirective implements OnDestroy {

  private _destroy$ = new Subject<void>();
  private _x = 0;
  private _y = 0;

  @Output()
  public wbMoveStart = new EventEmitter<void>();

  @Output()
  public wbMove = new EventEmitter<MoveDelta>();

  @Output()
  public wbMoveEnd = new EventEmitter<void>();

  @HostBinding('style.cursor')
  public cursor = 'move';

  constructor(@Inject(DOCUMENT) private _document: any) {
  }

  @HostListener('mousedown', ['$event'])
  public onMouseDown(event: MouseEvent): void {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault(); // prevent drag and drop
    this._x = event.pageX;
    this._y = event.pageY;

    // Apply cursor on document level to prevent flickering while sashing
    const oldCursor = this._document.body.style.cursor;
    this._document.body.style.cursor = this.cursor;

    // Listen for 'mousemove' events
    const mousemoveListener = fromEvent<MouseEvent>(this._document, 'mousemove')
      .pipe(takeUntil(this._destroy$))
      .subscribe((mousemoveEvent: MouseEvent) => {
        mousemoveEvent.preventDefault(); // prevent drag and drop

        const deltaX = mousemoveEvent.pageX - this._x;
        const deltaY = mousemoveEvent.pageY - this._y;
        this._x = mousemoveEvent.pageX;
        this._y = mousemoveEvent.pageY;
        this.wbMove.emit({deltaX, deltaY});
      });

    // Listen for 'mouseup' events
    fromEvent(this._document, 'mouseup')
      .pipe(
        first(),
        takeUntil(this._destroy$),
      )
      .subscribe(() => {
        mousemoveListener.unsubscribe();
        this._document.body.style.cursor = oldCursor;
        this.wbMoveEnd.next();
      });

    this.wbMoveStart.next();
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}

export interface MoveDelta {
  deltaX: number;
  deltaY: number;
}
