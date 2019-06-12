/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Directive, EventEmitter, HostBinding, HostListener, Inject, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { first, takeUntil } from 'rxjs/operators';

/**
 * Allows the host element to be used as splitter in a sash box.
 *
 * Emits delta pixels when the host element is moved.
 *
 */
@Directive({
  selector: '[sciSash]',
})
export class SciSashDirective implements OnDestroy, OnChanges {

  private _destroy$ = new Subject<void>();
  private _mousePosition: number;

  @Input('sciSash') // tslint:disable-line:no-input-rename
  public direction: 'vertical' | 'horizontal';

  @Output('sciSashStart') // tslint:disable-line:no-output-rename
  public sashStart = new EventEmitter<void>();

  @Output('sciSashChange') // tslint:disable-line:no-output-rename
  public sashChange = new EventEmitter<number>();

  @Output('sciSashEnd') // tslint:disable-line:no-output-rename
  public sashEnd = new EventEmitter<void>();

  @Output('sciSashReset') // tslint:disable-line:no-output-rename
  public sashReset = new EventEmitter<void>();

  @HostBinding('style.cursor')
  public cursor: string;

  constructor(@Inject(DOCUMENT) private _document: any) {
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.cursor = this.direction === 'vertical' ? 'ew-resize' : 'ns-resize';
  }

  @HostListener('dblclick')
  public onDoubleClick(): void {
    this.sashReset.emit();
  }

  @HostListener('mousedown', ['$event'])
  public onMouseDown(event: MouseEvent): void {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    this._mousePosition = this.extractMousePosition(event);

    // Apply cursor on document level to prevent flickering while sashing
    const oldCursor = this._document.body.style.cursor;
    this._document.body.style.cursor = this.cursor;

    // Listen for 'mousemove' events
    const mousemoveListener = fromEvent(this._document, 'mousemove')
      .pipe(
        takeUntil(this._destroy$),
      )
      .subscribe((mousemoveEvent: MouseEvent) => {
        mousemoveEvent.preventDefault();
        const mousePosition = this.extractMousePosition(mousemoveEvent);
        const delta = mousePosition - this._mousePosition;
        this._mousePosition = mousePosition;
        this.sashChange.emit(delta);
      });

    // Listen for 'mouseup' events
    fromEvent(this._document, 'mouseup')
      .pipe(
        first(),
        takeUntil(this._destroy$),
      )
      .subscribe(() => {
        mousemoveListener.unsubscribe();
        this._mousePosition = null;
        this._document.body.style.cursor = oldCursor;
        this.sashEnd.next();
      });

    this.sashStart.next();
  }

  public extractMousePosition(event: MouseEvent): number {
    return this.direction === 'vertical' ? event.pageX : event.pageY;
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
