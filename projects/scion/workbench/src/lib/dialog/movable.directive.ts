/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {DestroyRef, Directive, ElementRef, EventEmitter, inject, Input, OnInit, Output} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {DOCUMENT} from '@angular/common';
import {WorkbenchLayoutService} from '../layout/workbench-layout.service';
import {getCssTranslation} from '../common/dom.util';
import {fromMoveHandle$, HandleMoveEvent} from '../common/observables';

/**
 * Enables moving the host element via mouse or touch gesture.
 *
 * This directive makes the specified handle 'movable', emitting an event
 * when moving it. The host must apply the changed position by updating
 * respective DOM properties.
 */
@Directive({selector: '[wbMovable]', standalone: true})
export class MovableDirective implements OnInit {

  private readonly _document = inject<Document>(DOCUMENT);
  private readonly _host: HTMLElement;

  private _x = 0;
  private _y = 0;

  @Input({alias: 'wbHandle', required: true}) // eslint-disable-line @angular-eslint/no-input-rename
  public wbHandleElement!: HTMLElement;

  @Output('wbMovableMove') // eslint-disable-line @angular-eslint/no-output-rename
  public wbMove = new EventEmitter<WbMoveEvent>();

  constructor(host: ElementRef<HTMLElement>,
              private _destroyRef: DestroyRef,
              private _workbenchLayoutService: WorkbenchLayoutService) {
    this._host = host.nativeElement;
  }

  public ngOnInit(): void {
    this.wbHandleElement.style.setProperty('cursor', 'move');
    this.makeHandleMovable();
  }

  /**
   * Method invoked when start moving the handle.
   */
  private onMoveStart(event: MouseEvent | Touch): void {
    this._workbenchLayoutService.signalMoving(true);
    this._x = event.clientX;
    this._y = event.clientY;
  }

  /**
   * Method invoked while moving the handle.
   */
  private onMove(event: MouseEvent | Touch): void {
    const translation = getComputedTranslation(this._host);
    const deltaX = event.clientX - this._x;
    const deltaY = event.clientY - this._y;

    this._x = event.clientX;
    this._y = event.clientY;

    this.wbMove.emit({
      translateX: translation.translateX + deltaX,
      translateY: translation.translateY + deltaY,
    });
  }

  /**
   * Method invoked when end moving the handle.
   */
  private onMoveEnd(): void {
    this._workbenchLayoutService.signalMoving(false);
  }

  private makeHandleMovable(): void {
    let prevBodyCursor: string | undefined;

    fromMoveHandle$(this.wbHandleElement)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((event: HandleMoveEvent) => {
        switch (event.type) {
          case 'mousestart': {
            // Apply cursor on document level to prevent flickering while moving the handle.
            prevBodyCursor = this._document.body.style.cursor;
            this._document.body.style.cursor = 'move';
            this.onMoveStart(event.mouseEvent);
            break;
          }
          case 'touchstart': {
            this.onMoveStart(event.touchEvent?.touches[0]);
            break;
          }
          case 'mousemove': {
            this.onMove(event.mouseEvent);
            break;
          }
          case 'touchmove': {
            this.onMove(event.touchEvent.touches[0]);
            break;
          }
          case 'mouseend': {
            this._document.body.style.cursor = prevBodyCursor!;
            this.onMoveEnd();
            break;
          }
          case 'touchend': {
            this.onMoveEnd();
            break;
          }
        }
      });
  }
}

/**
 * Event emitted when moving the handle.
 */
export interface WbMoveEvent {
  /**
   * Specifies the new horizontal translation of the host.
   */
  translateX: number;
  /**
   * Specifies the new vertical translation of the host.
   */
  translateY: number;
}

/**
 * Reads the current CSS translation of given element.
 */
function getComputedTranslation(element: HTMLElement): {translateX: number; translateY: number} {
  const {translateX, translateY} = getCssTranslation(element);
  return {
    translateX: translateX === 'none' ? 0 : parseInt(translateX, 10),
    translateY: translateY === 'none' ? 0 : parseInt(translateY, 10),
  };
}
