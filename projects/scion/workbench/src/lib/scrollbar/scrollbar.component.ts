/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { DOCUMENT } from '@angular/common';
import { Component, DoCheck, ElementRef, EventEmitter, HostBinding, Inject, Input, OnDestroy, Output } from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { first, skipWhile, takeUntil } from 'rxjs/operators';

export enum ScrollDirection {
  Horizontal, Vertical
}

@Component({
  selector: 'wb-scrollbar',
  templateUrl: './scrollbar.component.html',
  styleUrls: ['./scrollbar.component.scss']
})
export class ScrollbarComponent implements OnDestroy, DoCheck {

  private static readonly MIN_THUMB_SIZE = 20;

  private _destroy$ = new Subject<void>();

  private _viewportSize: number;
  private _viewportClientSize: number;
  private _trackSize: number;
  private _thumbPosition: number;
  private _thumbSize: number;
  private _dragPosition: number = null;

  @HostBinding('class.overflow')
  public overflow: boolean;

  @Input()
  public direction = ScrollDirection.Vertical;

  @Input()
  public viewport: HTMLElement;

  @Output()
  public scroll = new EventEmitter<void>(true);

  @HostBinding('class.vertical')
  public get vertical(): boolean {
    return this.direction === ScrollDirection.Vertical;
  }

  @HostBinding('class.horizontal')
  public get horizontal(): boolean {
    return this.direction === ScrollDirection.Horizontal;
  }

  @HostBinding('class.scrolling')
  public get scrolling(): boolean {
    return this._dragPosition !== null;
  }

  constructor(private _host: ElementRef, @Inject(DOCUMENT) private _document: any) {
    fromEvent(window, 'resize')
      .pipe(
        skipWhile(() => !this.viewport),
        takeUntil(this._destroy$)
      )
      .subscribe(() => {
        this.computeScrollProperties();
      });
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }

  public onTouchStart(event: TouchEvent): void {
    event.preventDefault();
    this._dragPosition = this.vertical ? event.touches[0].pageY : event.touches[0].pageX;
  }

  public onTouchMove(event: TouchEvent): void {
    event.preventDefault();
    this.onDragTo(this.vertical ? event.touches[0].pageY : event.touches[0].pageX);
  }

  public onTouchEnd(event: TouchEvent): void {
    event.preventDefault();
    this._dragPosition = null;
  }

  public get thumbTop(): number {
    return this.vertical && this._thumbPosition;
  }

  public get thumbLeft(): number {
    return this.horizontal && this._thumbPosition;
  }

  public get thumbHeight(): number {
    return this.vertical && this._thumbSize;
  }

  public get thumbWidth(): number {
    return this.horizontal && this._thumbSize;
  }

  public onMouseDown(event: MouseEvent): void {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    this._dragPosition = this.extractMousePosition(event);

    // Listen for 'mousemove' events
    const mousemoveListener = fromEvent(this._document, 'mousemove')
      .pipe(
        takeUntil(this._destroy$)
      )
      .subscribe((mousemoveEvent: MouseEvent) => {
        mousemoveEvent.preventDefault();
        this.onDragTo(this.extractMousePosition(mousemoveEvent));
      });

    // Listen for 'mouseup' events
    fromEvent(this._document, 'mouseup')
      .pipe(
        first(),
        takeUntil(this._destroy$)
      )
      .subscribe(() => {
        mousemoveListener.unsubscribe();
        this._dragPosition = null;
      });
  }

  private onDragTo(dragPositionPx: number): void {
    const deltaScrollbarPx = dragPositionPx - this._dragPosition;
    const deltaRatio = deltaScrollbarPx / (this._trackSize);
    const deltaViewportPx = deltaRatio * this._viewportClientSize;
    this._dragPosition = dragPositionPx;

    if (this.vertical) {
      this.viewport.scrollTop += deltaViewportPx;
    } else {
      this.viewport.scrollLeft += deltaViewportPx;
    }
    this.scroll.emit();
  }

  private extractMousePosition(event: MouseEvent): number {
    return this.vertical ? event.pageY : event.pageX;
  }

  public ngDoCheck(): void {
    this.computeScrollProperties();
  }

  private computeScrollProperties(): void {
    let changed = false;

    const vertical = this.vertical;

    this._viewportSize = vertical ? this.viewport.clientHeight : this.viewport.clientWidth;
    this._viewportClientSize = vertical ? this.viewport.scrollHeight : this.viewport.scrollWidth;

    // compute if scrollbar is required
    const overflow = (this._viewportClientSize > this._viewportSize);
    changed = changed || (this.overflow !== overflow);
    this.overflow = overflow;

    if (overflow) {
      // determine track size
      const trackElement = this._host.nativeElement;
      this._trackSize = trackElement && (this.vertical ? trackElement.clientHeight : trackElement.clientWidth) || 0;

      // compute thumb size
      const thumbSizeRatio = this._viewportSize / this._viewportClientSize;
      const thumbSize = Math.max(ScrollbarComponent.MIN_THUMB_SIZE, this._trackSize * thumbSizeRatio);
      changed = changed || (this._thumbSize !== thumbSize);
      this._thumbSize = thumbSize;

      // compute thumb position
      const scrollTop = vertical ? this.viewport.scrollTop : this.viewport.scrollLeft;
      const scrollTopMax = this._viewportClientSize - this._viewportSize;
      const thumbPositionRatio = scrollTop / scrollTopMax;

      const thumbPosition = thumbPositionRatio * (this._trackSize - this._thumbSize);
      changed = changed || this._thumbPosition !== thumbPosition;
      this._thumbPosition = thumbPosition;
    }

    if (changed) {
      this.scroll.emit();
    }
  }
}
