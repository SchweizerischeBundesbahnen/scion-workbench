/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Directive, effect, ElementRef, inject, input, output, untracked} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {WorkbenchLayoutService} from '../layout/workbench-layout.service';
import {getCssTranslation} from '../common/dom.util';
import {fromMoveHandle$, HandleMoveEvent} from '../common/observables';
import {Disposable} from '../common/disposable';

/**
 * Enables moving the host element via mouse or touch gesture.
 *
 * This directive makes the specified handle 'movable', emitting an event
 * when moving it. The host must apply the changed position by updating
 * respective DOM properties.
 */
@Directive({selector: '[wbMovable]'})
export class MovableDirective {

  public readonly wbHandleElement = input.required<HTMLElement>({alias: 'wbHandle'});
  public readonly wbMove = output<WbMoveEvent>({alias: 'wbMovableMove'});

  private readonly _workbenchLayoutService = inject(WorkbenchLayoutService);
  private readonly _document = inject(DOCUMENT);
  private readonly _host = inject(ElementRef).nativeElement as HTMLElement;

  private _x = 0;
  private _y = 0;

  constructor() {
    this.installMoveHandle();
  }

  /**
   * Installs a handle for moving the element.
   */
  private installMoveHandle(): void {
    effect(onCleanup => {
      const element = this.wbHandleElement();
      const handle = untracked(() => this.createMoveHandle(element));
      onCleanup(() => handle.dispose());
    });
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

  private createMoveHandle(element: HTMLElement): Disposable {
    // Apply 'move' cursor.
    const prevHandleCursor = element.style.cursor;
    element.style.setProperty('cursor', 'move');

    // Subscribe to move events.
    let prevBodyCursor: string | undefined;
    const subscription = fromMoveHandle$(element)
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
            this.onMoveStart(event.touchEvent.touches[0]);
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

    return {
      dispose: () => {
        element.style.setProperty('cursor', prevHandleCursor);
        subscription.unsubscribe();
      },
    };
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
