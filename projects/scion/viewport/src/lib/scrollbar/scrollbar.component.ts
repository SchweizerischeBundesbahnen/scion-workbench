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
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostBinding, Inject, Input, NgZone, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { fromEvent, merge, Observable, of, Subject, timer } from 'rxjs';
import { debounceTime, distinctUntilChanged, first, map, mapTo, startWith, takeUntil, takeWhile, withLatestFrom } from 'rxjs/operators';

/**
 * Renders a vertical or horizontal scrollbar.
 *
 * The scrollbar features the following functionality:
 * - allows to move the thumb by mouse or touch
 * - enlarges the thumb if the mouse pointer is near the thumb
 * - allows paging on mousedown on the scroll track
 */
@Component({
  selector: 'sci-scrollbar',
  templateUrl: './scrollbar.component.html',
  styleUrls: ['./scrollbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SciScrollbarComponent implements OnChanges, OnDestroy {

  private _destroy$ = new Subject<void>();
  private _viewportRefChange$ = new Subject<void>();
  private _viewportSize: number;
  private _viewportClientSize: number;
  private _lastDragPosition: number = null;

  public thumbSizeFr: number;
  public thumbPositionFr: number;

  @ViewChild('thumb_handle')
  public thumbElement: ElementRef<HTMLDivElement>;

  @HostBinding('class.overflow')
  public overflow: boolean;

  @HostBinding('class.vertical')
  public get vertical(): boolean {
    return this.direction === 'vscroll';
  }

  @HostBinding('class.horizontal')
  public get horizontal(): boolean {
    return this.direction === 'hscroll';
  }

  @HostBinding('class.scrolling')
  public get scrolling(): boolean {
    return this._lastDragPosition !== null;
  }

  @Input()
  public direction: 'vscroll' | 'hscroll';

  @Input()
  public viewport: HTMLElement;

  constructor(private _host: ElementRef, @Inject(DOCUMENT) private _document: any, private _cd: ChangeDetectorRef, private _zone: NgZone) {
  }

  public ngOnChanges(changes: SimpleChanges): void {
    changes['viewport'] && this.onViewportRefChange();
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }

  public onTouchStart(event: TouchEvent): void {
    event.preventDefault();
    this._lastDragPosition = this.vertical ? event.touches[0].screenY : event.touches[0].screenX;
  }

  public onTouchMove(event: TouchEvent): void {
    event.preventDefault();

    const newDragPositionPx = this.vertical ? event.touches[0].screenY : event.touches[0].screenX;
    const scrollbarPanPx = newDragPositionPx - this._lastDragPosition;
    const viewportPanPx = this.toViewportPanPx(scrollbarPanPx);
    this._lastDragPosition = newDragPositionPx;
    this.moveViewportClient(viewportPanPx);
  }

  public onTouchEnd(event: TouchEvent): void {
    event.preventDefault();
    this._lastDragPosition = null;
  }

  public onMouseDown(event: MouseEvent): void {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    this._lastDragPosition = this.vertical ? event.screenY : event.screenX;

    // Listen for 'mousemove' events
    this._zone.runOutsideAngular(() => {
      const mousemoveListener = merge(fromEvent(this._document, 'mousemove'), fromEvent(this._document, 'sci-mousemove'))
        .pipe(takeUntil(this._destroy$))
        .subscribe((mousemoveEvent: MouseEvent) => {
          mousemoveEvent.preventDefault();

          const newDragPositionPx = this.vertical ? mousemoveEvent.screenY : mousemoveEvent.screenX;
          const scrollbarPanPx = newDragPositionPx - this._lastDragPosition;
          const viewportPanPx = this.toViewportPanPx(scrollbarPanPx);
          this._lastDragPosition = newDragPositionPx;
          this.moveViewportClient(viewportPanPx);
        });

      // Listen for 'mouseup' events; use 'capture phase' and 'stop propagation' to not close overlays
      merge(fromEvent(this._document, 'mouseup', {capture: true}), fromEvent(this._document, 'sci-mouseup'))
        .pipe(first(), takeUntil(this._destroy$))
        .subscribe((mouseupEvent: MouseEvent) => {
          mouseupEvent.stopPropagation();
          mousemoveListener.unsubscribe();
          this._lastDragPosition = null;
        });
    });
  }

  public onScrollTrackMouseDown(event: MouseEvent, direction: 'up' | 'down'): void {
    const signum = (direction === 'up' ? -1 : +1);
    const thumb = this.thumbElement.nativeElement;
    const thumbLengthPx = (this.horizontal ? thumb.clientWidth : thumb.clientHeight);
    this.scrollWhileMouseDown(this.toViewportPanPx(signum * thumbLengthPx), event);
  }

  /**
   * Projects the given scrollbar scroll pixels into viewport scroll pixels.
   */
  private toViewportPanPx(scrollbarPanPx: number): number {
    const thumbElement = this.thumbElement.nativeElement;
    const thumbSize = this.vertical ? thumbElement.clientHeight : thumbElement.clientWidth;

    const trackElement = this._host.nativeElement;
    const trackSize = this.vertical ? trackElement.clientHeight : trackElement.clientWidth;

    const scrollRangePx = trackSize - thumbSize;
    const scrollRatio = scrollbarPanPx / scrollRangePx;
    return scrollRatio * (this._viewportClientSize - this._viewportSize);
  }

  /**
   * Moves the viewport client by the specified numbers of pixels.
   */
  private moveViewportClient(viewportPanPx: number): void {
    if (this.vertical) {
      this.viewport.scrollTop += viewportPanPx;
    }
    else {
      this.viewport.scrollLeft += viewportPanPx;
    }
  }

  /**
   * Scrolls continuously while holding the mouse pressed, or until the mouse leaves the scrolltrack.
   */
  private scrollWhileMouseDown(viewportScrollPx: number, mousedownEvent: MouseEvent): void {
    const scrollTrackElement = mousedownEvent.target;

    // scroll continously every 50ms after an initial delay of 250ms
    timer(250, 50)
      .pipe(
        // continue chain with latest mouse event
        withLatestFrom(merge(of(mousedownEvent), fromEvent(scrollTrackElement, 'mousemove')), (tick, event) => event),
        // start immediately
        startWith(mousedownEvent),
        // stop scrolling on mouseout or mouseup
        takeUntil(merge(fromEvent(scrollTrackElement, 'mouseout'), fromEvent(scrollTrackElement, 'mouseup'))),
        // stop scrolling if the thumb hits the mouse pointer position
        takeWhile((event: MouseEvent) => scrollTrackElement === this._document.elementFromPoint(event.clientX, event.clientY)),
        debounceTime(10),
      )
      .subscribe(() => {
        this.moveViewportClient(viewportScrollPx);
      });
  }

  private onViewportRefChange(): void {
    this._viewportRefChange$.next();

    this.viewport && this._zone.runOutsideAngular(() => {
      merge(fromEvent(this.viewport, 'scroll'), this.dimensionChange$(this.viewport))
        .pipe(takeUntil(merge(this._destroy$, this._viewportRefChange$)))
        .subscribe(() => {
          this.computeScrollProperties();
        });
    });
  }

  /**
   * Emits when the dimension of viewport or viewport-client changes.
   *
   * This is a workaround until it is possible to listen for element dimension changes natively.
   * @see https://wicg.github.io/ResizeObserver/
   */
  private dimensionChange$(viewport: HTMLElement): Observable<void> {
    return merge(
      this._zone.onUnstable, // When the Angular zone gets instable the dimension of the viewport or viewport-client might have changed.
      fromEvent(window, 'resize'), // However, when resizing the window, the Angular zone is not necessarily involved.
    )
      .pipe(
        map(() => ({viewportWidth: viewport.clientWidth, viewportHeight: viewport.clientHeight, scrollWidth: viewport.scrollWidth, scrollHeight: viewport.scrollHeight})),
        distinctUntilChanged((a, b) => {
          return a.scrollHeight === b.scrollHeight &&
            a.scrollWidth === b.scrollWidth &&
            a.viewportHeight === b.viewportHeight &&
            a.viewportWidth === b.viewportWidth;
        }),
        mapTo(undefined),
      );
  }

  private computeScrollProperties(): void {
    const vertical = this.vertical;

    this._viewportSize = vertical ? this.viewport.clientHeight : this.viewport.clientWidth;
    this._viewportClientSize = vertical ? this.viewport.scrollHeight : this.viewport.scrollWidth;

    // compute if viewport client overflows, the thumb size and thumb position
    const prevOverflow = this.overflow;
    const prevThumbSizeFr = this.thumbSizeFr;
    const prevThumbPositionFr = this.thumbPositionFr;

    this.overflow = (this._viewportClientSize > this._viewportSize);
    if (this.overflow) {
      const scrollTop = vertical ? this.viewport.scrollTop : this.viewport.scrollLeft;

      this.thumbSizeFr = this._viewportSize / this._viewportClientSize;
      this.thumbPositionFr = scrollTop / this._viewportClientSize;
    }

    if (this.overflow !== prevOverflow || this.thumbSizeFr !== prevThumbSizeFr || this.thumbPositionFr !== prevThumbPositionFr) {
      this._zone.run(() => this._cd.markForCheck());
    }
  }
}

