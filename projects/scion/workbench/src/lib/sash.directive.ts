/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Directive, EventEmitter, HostBinding, HostListener, Inject, Input, OnChanges, OnDestroy, Output, SimpleChanges} from '@angular/core';
import {fromEvent, Subject} from 'rxjs';
import {DOCUMENT} from '@angular/common';
import {first, takeUntil} from 'rxjs/operators';

/**
 * Provides functionality to sash the host element.
 */
@Directive({
  selector: '[wbSash]',
})
export class SashDirective implements OnDestroy, OnChanges {

  private _destroy$ = new Subject<void>();
  private _mousePosition: number | undefined;

  @Input('wbSash')
  public wbDirection: 'vertical' | 'horizontal' = 'horizontal';

  @Output()
  public wbSashStart = new EventEmitter<void>(false);

  @Output()
  public wbSashChange = new EventEmitter<number>(false);

  @Output()
  public wbSashEnd = new EventEmitter<void>(false);

  @Output()
  public wbSashReset = new EventEmitter<void>(false);

  @HostBinding('style.cursor')
  public cursor!: string;

  constructor(@Inject(DOCUMENT) private _document: Document) {
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.cursor = this.wbDirection === 'vertical' ? 'ew-resize' : 'ns-resize';
  }

  @HostListener('dblclick')
  public onDoubleClick(): void {
    this.wbSashReset.emit();
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
    const mousemoveListener = fromEvent<MouseEvent>(this._document, 'mousemove')
      .pipe(takeUntil(this._destroy$))
      .subscribe((mousemoveEvent: MouseEvent) => {
        mousemoveEvent.preventDefault();
        const mousePosition = this.extractMousePosition(mousemoveEvent);
        const delta = mousePosition - this._mousePosition!;
        this._mousePosition = mousePosition;
        this.wbSashChange.emit(delta);
      });

    // Listen for 'mouseup' events
    fromEvent(this._document, 'mouseup')
      .pipe(
        first(),
        takeUntil(this._destroy$),
      )
      .subscribe(() => {
        mousemoveListener.unsubscribe();
        this._mousePosition = undefined;
        this._document.body.style.cursor = oldCursor;
        this.wbSashEnd.next();
      });

    this.wbSashStart.next();
  }

  public extractMousePosition(event: MouseEvent): number {
    return this.wbDirection === 'vertical' ? event.pageX : event.pageY;
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
