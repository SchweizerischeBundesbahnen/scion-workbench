/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Directive, EventEmitter, HostBinding, HostListener, Inject, Input, NgZone, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { fromEvent, merge, Subject } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';
import { EventPosition } from './splitter.directive';
import { tapFirst } from '@scion/toolkit/operators';

/**
 * Visual element to resize sashes.
 *
 * @dynamic ignore 'strictMetadataEmit' errors due to the usage of {@link Document} as ambient type for DI.
 */
@Directive({selector: '[sciSplitter]', exportAs: 'sciSplitter'})
export class SciSplitterDirective implements OnChanges, OnDestroy {

  private _destroy$ = new Subject<void>();

  @HostBinding('class.moving')
  public moving: boolean;

  @Input('sciSplitterVertical') // tslint:disable-line:no-input-rename
  public vertical: boolean;

  /**
   * Emits when starting to move the splitter.
   */
  @Output('sciSplitterStart') // tslint:disable-line:no-output-rename
  public start = new EventEmitter<number>();

  /**
   * Emits the delta in pixel when the splitter is moved.
   * The event is emitted outside of the Angular zone.
   */
  @Output('sciSplitterMove') // tslint:disable-line:no-output-rename
  public move = new EventEmitter<SplitterMoveEvent>();

  /**
   * Emits when ending to move the splitter.
   */
  @Output('sciSplitterEnd') // tslint:disable-line:no-output-rename
  public end = new EventEmitter<number>();

  /**
   * Emits when to reset the splitter position.
   */
  @Output('sciSplitterReset') // tslint:disable-line:no-output-rename
  public reset = new EventEmitter<void>();

  @HostBinding('style.cursor')
  public sashCursor: string;

  constructor(private _zone: NgZone, @Inject(DOCUMENT) private _document: Document) {
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.sashCursor = this.vertical ? 'ew-resize' : 'ns-resize';
  }

  @HostListener('dblclick')
  public onDoubleClick(): void {
    this.reset.emit();
  }

  @HostListener('touchstart', ['$event'])
  public onTouchStart(event: TouchEvent): void {
    this.installMoveListener({
        startEvent: event,
        moveEventNames: ['touchmove'],
        endEventNames: ['touchend', 'touchcancel'],
        eventPositionFn: (touchEvent: TouchEvent): EventPosition => {
          const touch: Touch = touchEvent.touches[0];
          if (this.vertical) {
            return {screenPos: touch.screenX, clientPos: touch.clientX, pagePos: touch.pageX};
          }
          else {
            return {screenPos: touch.screenY, clientPos: touch.clientY, pagePos: touch.pageY};
          }
        },
      },
    );
  }

  @HostListener('mousedown', ['$event'])
  public onMouseDown(event: MouseEvent): void {
    if (event.button !== 0) {
      return;
    }

    this.installMoveListener({
        startEvent: event,
        moveEventNames: ['mousemove', 'sci-mousemove'],
        endEventNames: ['mouseup', 'sci-mouseup'],
        eventPositionFn: (mouseEvent: MouseEvent): EventPosition => {
          if (this.vertical) {
            return {screenPos: mouseEvent.screenX, clientPos: mouseEvent.clientX, pagePos: mouseEvent.pageX};
          }
          else {
            return {screenPos: mouseEvent.screenY, clientPos: mouseEvent.clientY, pagePos: mouseEvent.pageY};
          }
        },
      },
    );
  }

  private installMoveListener(config: { startEvent: Event, moveEventNames: string[], endEventNames: string[], eventPositionFn: (event: Event) => EventPosition }): void {
    const startEvent = config.startEvent;

    startEvent.preventDefault();

    this._zone.runOutsideAngular(() => {
      // install listeners on document level to allow dragging outside of the sash box.
      const moveEvent$ = merge(...config.moveEventNames.map(eventName => fromEvent(this._document, eventName)));
      const endEvent$ = merge(...config.endEventNames.map(eventName => fromEvent(this._document, eventName)));
      let lastClientPos = config.eventPositionFn(startEvent).clientPos;

      // Apply cursor on document level to prevent flickering while moving the splitter
      const oldDocumentCursor = this._document.body.style.cursor;
      this._document.body.style.cursor = this.sashCursor;

      // Listen for 'move' events until stop moving the splitter
      moveEvent$
        .pipe(
          tapFirst(() => this._zone.run(() => {
            this.moving = true;
            this.start.next();
          })),
          takeUntil(merge(endEvent$, this._destroy$)),
        )
        .subscribe((moveEvent: Event) => {
          const eventPos = config.eventPositionFn(moveEvent);
          const newClientPos = eventPos.clientPos;
          const delta = newClientPos - lastClientPos;
          lastClientPos = newClientPos;

          this.move.emit({delta: delta, position: eventPos});
        });

      // Listen for 'end' events; call 'stop propagation' to not close overlays
      endEvent$
        .pipe(first(), takeUntil(this._destroy$))
        .subscribe((endEvent: Event) => {
          endEvent.stopPropagation();
          this._document.body.style.cursor = oldDocumentCursor;
          this.moving && this._zone.run(() => {
            this.end.next();
            this.moving = false;
          });
        });
    });
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}

export interface EventPosition {
  clientPos: number;
  pagePos: number;
  screenPos: number;
}

export interface SplitterMoveEvent {
  delta: number;
  position: EventPosition;
}
