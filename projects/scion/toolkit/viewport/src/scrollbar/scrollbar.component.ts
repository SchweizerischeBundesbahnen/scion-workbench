/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, HostBinding, Inject, Input, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { concat, EMPTY, fromEvent, merge, of, Subject, timer } from 'rxjs';
import { debounceTime, first, map, startWith, switchMap, takeUntil, takeWhile, withLatestFrom } from 'rxjs/operators';
import { SciDimensionService, SciMutationService } from '@scion/toolkit/dimension';

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
export class SciScrollbarComponent implements OnDestroy {

  private _destroy$ = new Subject<void>();
  private _viewport: HTMLElement;
  private _viewportRefChange$ = new Subject<void>();
  private _lastDragPosition: number = null;

  private _overflow: boolean;
  private _thumbSizeFr: number;
  private _thumbPositionFr: number;

  @ViewChild('thumb_handle', {static: true})
  public thumbElement: ElementRef<HTMLDivElement>;

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

  /**
   * The viewport to provide scrollbars for.
   */
  @Input('viewport') // tslint:disable-line:no-input-rename
  public set setViewport(viewport: HTMLElement) {
    this._viewport = viewport;
    this.onViewportRefChange(viewport);
  }

  constructor(private _host: ElementRef<HTMLElement>,
              @Inject(DOCUMENT) private _document: any,
              private _zone: NgZone,
              private _dimensionService: SciDimensionService,
              private _mutationService: SciMutationService) {
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
    this.scrollWhileMouseDown(this.toViewportPanPx(signum * this.getThumbSize()), event);
  }

  /**
   * Projects the given scrollbar scroll pixels into viewport scroll pixels.
   */
  private toViewportPanPx(scrollbarPanPx: number): number {
    const thumbSize = this.getThumbSize();
    const trackSize = this.getTrackSize();

    const scrollRangePx = trackSize - thumbSize;
    const scrollRatio = scrollbarPanPx / scrollRangePx;
    return scrollRatio * (this.getViewportClientSize() - this.getViewportSize());
  }

  /**
   * Moves the viewport client by the specified numbers of pixels.
   */
  private moveViewportClient(viewportPanPx: number): void {
    if (this.vertical) {
      this._viewport.scrollTop += viewportPanPx;
    }
    else {
      this._viewport.scrollLeft += viewportPanPx;
    }
  }

  /**
   * Indicates if the content overflows.
   */
  public get overflow(): boolean {
    return this._overflow;
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

  private onViewportRefChange(viewport: HTMLElement): void {
    this._viewportRefChange$.next();
    this.render();

    if (!viewport) {
      return;
    }

    this._zone.runOutsideAngular(() => {
      // update the scroll position on scroll or viewport dimension change
      merge(this._dimensionService.dimension$(viewport), fromEvent(viewport, 'scroll', {passive: true}))
        .pipe(takeUntil(merge(this._destroy$, this._viewportRefChange$)))
        .subscribe(() => this.render());

      // update the scroll position on viewport client change
      const viewportChildListChange$ = this._mutationService.mutation$(viewport, {subtree: false, childList: true, attributeFilter: []}); // listen for addition or removal of child nodes
      concat(of(null), viewportChildListChange$)
        .pipe(
          map(() => this.getChildList(viewport)),
          // create a single observable which emits when the dimension or a style property of a child element changes
          switchMap(children => children.reduce((acc$, child) => merge(
            acc$,
            // element dimension change
            this._dimensionService.dimension$(child),
            // style mutation (i.e. some transformations change the scroll position without necessarily triggering a dimension change, e.g., 'scale' or 'translate' used for virtual scrolling)
            this._mutationService.mutation$(child, {subtree: false, childList: false, attributeFilter: ['style']}),
          ), EMPTY)),
          takeUntil(merge(this._destroy$, this._viewportRefChange$)),
        )
        .subscribe(() => this.render());
    });
  }

  /**
   * Renders the scrollbar based on 'scrollTop'/'scrollLeft' and 'scrollHeight'/'scrollWidth` of the viewport.
   */
  public render(): void {
    const viewportSize = this.getViewportSize();
    const viewportClientSize = this.getViewportClientSize();

    // compute if viewport client overflows, the thumb size and thumb position
    const prevOverflow = this._overflow;
    const prevThumbSizeFr = this._thumbSizeFr;
    const prevThumbPositionFr = this._thumbPositionFr;

    this._overflow = (viewportClientSize > viewportSize);
    if (this._overflow) {
      const scrollTop = this.getScrollStart();

      this._thumbSizeFr = viewportSize / viewportClientSize;
      this._thumbPositionFr = scrollTop / viewportClientSize;
    }

    if (this._overflow !== prevOverflow || this._thumbSizeFr !== prevThumbSizeFr || this._thumbPositionFr !== prevThumbPositionFr) {
      if (this._overflow && !prevOverflow) {
        this._host.nativeElement.classList.add('overflow');
      }
      else if (!this._overflow && prevOverflow) {
        this._host.nativeElement.classList.remove('overflow');
      }

      this.setCssVariable('--thumbPositionFr', this._thumbPositionFr);
      this.setCssVariable('--thumbSizeFr', this._thumbSizeFr);
    }
  }

  private getViewportSize(): number {
    return this._viewport ? (this.vertical ? this._viewport.clientHeight : this._viewport.clientWidth) : 0;
  }

  private getViewportClientSize(): number {
    return this._viewport ? (this.vertical ? this._viewport.scrollHeight : this._viewport.scrollWidth) : 0;
  }

  private getScrollStart(): number {
    return this._viewport ? (this.vertical ? this._viewport.scrollTop : this._viewport.scrollLeft) : 0;
  }

  private getThumbSize(): number {
    const thumbElement = this.thumbElement.nativeElement;
    return this.vertical ? thumbElement.clientHeight : thumbElement.clientWidth;
  }

  private getTrackSize(): number {
    const trackElement = this._host.nativeElement;
    return this.vertical ? trackElement.clientHeight : trackElement.clientWidth;
  }

  private setCssVariable(key: string, value: any): void {
    this._host.nativeElement.style.setProperty(key, value);
  }

  private getChildList(viewport: HTMLElement): HTMLElement[] {
    return Array.from(viewport.children)
      .filter(child => child instanceof HTMLElement)
      .map(child => child as HTMLElement)
      .filter(child => !this._dimensionService.isSynthResizeObservableObject(child));
  }
}
