/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {DestroyRef, Directive, EventEmitter, HostBinding, HostListener, Inject, Output} from '@angular/core';
import {fromEvent} from 'rxjs';
import {DOCUMENT} from '@angular/common';
import {first} from 'rxjs/operators';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

/**
 * Allows moving the host element while holding down the primary mouse button, e.g. to move a message box.
 */
@Directive({selector: '[wbMove]', standalone: true})
export class MoveDirective {

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

  constructor(@Inject(DOCUMENT) private _document: Document, private _destroyRef: DestroyRef) {
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
      .pipe(takeUntilDestroyed(this._destroyRef))
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
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe(() => {
        mousemoveListener.unsubscribe();
        this._document.body.style.cursor = oldCursor;
        this.wbMoveEnd.next();
      });

    this.wbMoveStart.next();
  }
}

export interface MoveDelta {
  deltaX: number;
  deltaY: number;
}
