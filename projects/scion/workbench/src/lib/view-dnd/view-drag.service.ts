/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Injectable, NgZone } from '@angular/core';
import { EMPTY, fromEvent, merge, Observable, Observer, of, Subject, TeardownLogic } from 'rxjs';
import { coerceArray } from '@angular/cdk/coercion';
import { filter, take, takeUntil } from 'rxjs/operators';
import { BroadcastChannelService } from '../broadcast-channel.service';
import { Defined } from '../defined.util';
import { UrlSegment } from '@angular/router';

/**
 * Events fired during view drag and drop operation.
 */
export type ViewDragEventType = 'dragenter' | 'dragover' | 'dragleave' | 'drop';
/**
 * Transfer type for dragging a view.
 */
export const VIEW_DRAG_TRANSFER_TYPE = 'workbench/view';
/**
 * The view move event is fired when a view is being moved.
 */
const VIEW_MOVE_EVENT_TYPE = 'workbench/view/move';
/**
 * The view dragstart event is fired when the user starts dragging a viewtab.
 */
const VIEW_DRAGSTART_EVENT_TYPE = 'workbench/view/dragstart';
/**
 * The view dragend event is fired when the user ends dragging a viewtab.
 */
const VIEW_DRAGEND_EVENT_TYPE = 'workbench/view/dragend';
/**
 * Key to register drag data in local storage during a view drag operation.
 */
const VIEW_DRAG_DATA_STORAGE_KEY = 'workbench/view-drag-data';

/**
 * Manages the drag & drop behavior when the user drags a view.
 */
@Injectable({providedIn: 'root'})
export class ViewDragService {

  /**
   * Indicates if this app is the drag source for the ongoing drag operation (if any).
   */
  private _isDragSource: boolean;

  constructor(private _broadcastChannel: BroadcastChannelService, private _zone: NgZone) {
    fromEvent(window, 'unload')
      .pipe(take(1))
      .subscribe(() => this.unsetViewDragData());
  }

  /**
   * Checks if the given event is a view drag event with the same origin.
   */
  public isViewDragEvent(event: DragEvent): boolean {
    return event.dataTransfer.types.includes(VIEW_DRAG_TRANSFER_TYPE) && this.getViewDragData() !== null;
  }

  /**
   * Allows listening natively for same-origin view drag events on the given target element.
   *
   * Following drag events are emitted:
   * - dragenter: when entering the target element while dragging a view tab
   * - dragover: when dragging a view tab over the target element, every few hundred milliseconds
   * - dragleave: when leaving the target element while dragging a view tab
   * - drop: when dropping a view tab on a valid drop target
   *
   * As by design of native drag and drop, the 'dragleave' event is not fired on drop action.
   * Therefore, always handle both events, 'dragleave' and 'drop' events, respectively.
   *
   * Unlike when registering natively an event listener for 'dragenter' or 'dragleave' events,
   * the observable does not emit 'dragenter' or 'dragleave' events when dragging over the target's child elements.
   */
  public viewDrag$(target: Element | Window, options?: ViewDragEventListenerOptions): Observable<DragEvent> {
    const emitOutsideAngular = Defined.orElse(options && options.emitOutsideAngular, false);

    const fromEvent$ = (eventName: ViewDragEventType): Observable<DragEvent> => {
      if (!options || !options.eventType || coerceArray(options.eventType).includes(eventName)) {
        return fromEvent<DragEvent>(target, eventName, options);
      }
      return EMPTY;
    };

    return new Observable((observer: Observer<DragEvent>): TeardownLogic => {
      const destroy$ = new Subject<void>();

      let dragEnterCount = 0;
      this._zone.runOutsideAngular(() => {
        merge(fromEvent$('dragenter'), fromEvent$('dragover'), fromEvent$('dragleave'), fromEvent$('drop'))
          .pipe(
            filter(event => this.isViewDragEvent(event)),
            filter((event: DragEvent) => {
              switch (event.type) {
                case 'dragenter': {
                  return (++dragEnterCount === 1);
                }
                case 'dragleave':
                case 'drop': {
                  return (--dragEnterCount === 0);
                }
                default:
                  return true;
              }
            }),
            takeUntil(destroy$),
          )
          .subscribe(event => {
            NgZone.assertNotInAngularZone();

            if (emitOutsideAngular) {
              observer.next(event);
            }
            else {
              this._zone.run(() => observer.next(event));
            }
          });
      });

      return (): void => destroy$.next();
    });
  }

  /**
   * Dispatches the given view move event to app instances of the same origin.
   */
  public dispatchViewMoveEvent(event: ViewMoveEvent): void {
    // Wait to dispatch the event until the drag operation finished, if any, because if the drag source element
    // is destroyed during the drag operation, e.g. if moved to another viewpart, the drag operation would not
    // ordinarily complete, meaning 'dragend' or 'dragleave' would not be called.
    const isDragging = this.getViewDragData() !== null;
    (isDragging ? this.viewDragEnd$ : of(undefined))
      .pipe(take(1))
      .subscribe(() => {
        this._broadcastChannel.postMessage(VIEW_MOVE_EVENT_TYPE, event);
      });
  }

  /**
   * Emits when the user moves a view. The event is received across app instances of the same origin.
   */
  public get viewMove$(): Observable<ViewMoveEvent> {
    return this._broadcastChannel.message$(VIEW_MOVE_EVENT_TYPE);
  }

  /**
   * Emits when the user starts dragging a viewtab. The event is received across app instances of the same origin.
   */
  public get viewDragStart$(): Observable<void> {
    return this._broadcastChannel.message$(VIEW_DRAGSTART_EVENT_TYPE);
  }

  /**
   * Emits when the user ends dragging a viewtab. The event is received across app instances of the same origin.
   */
  public get viewDragEnd$(): Observable<void> {
    return this._broadcastChannel.message$(VIEW_DRAGEND_EVENT_TYPE);
  }

  /**
   * Makes the given view drag data available to app instances of the same origin.
   *
   * Invoke this method inside 'dragstart' event handler of the element where the drag operation started.
   */
  public setViewDragData(viewDragData: ViewDragData): void {
    localStorage.setItem(VIEW_DRAG_DATA_STORAGE_KEY, JSON.stringify(viewDragData));
    this._isDragSource = true;
    this._broadcastChannel.postMessage(VIEW_DRAGSTART_EVENT_TYPE);
  }

  /**
   * Removes the view drag data.
   *
   * Invoke this method inside 'dragend' event handler of the element where the drag operation started.
   */
  public unsetViewDragData(): void {
    if (this._isDragSource) {
      localStorage.removeItem(VIEW_DRAG_DATA_STORAGE_KEY);
      this._isDragSource = false;
      this._broadcastChannel.postMessage(VIEW_DRAGEND_EVENT_TYPE);
    }
  }

  /**
   * Returns the view drag data of the ongoing view drag operation, if any, or `null` otherwise.
   */
  public getViewDragData(): ViewDragData | null {
    const viewDragData = localStorage.getItem(VIEW_DRAG_DATA_STORAGE_KEY);
    return viewDragData ? JSON.parse(viewDragData) : null;
  }
}

/**
 * Represents data of a view drag operation.
 */
export interface ViewDragData {
  /**
   * X-coordinate of the mouse pointer, relative to the view tab drag image.
   */
  viewTabPointerOffsetX: number;
  /**
   * Y-coordinate of the mouse pointer, relative to the view tab drag image.
   */
  viewTabPointerOffsetY: number;
  viewId: string;
  viewTitle: string;
  viewUrlSegments: UrlSegment[];
  viewHeading: string;
  viewClosable: boolean;
  viewDirty: boolean;
  partId: string;
  primaryPart: boolean;
  viewTabWidth: number;
  viewTabHeight: number;
  appInstanceId: string;
}

/**
 * Event emitted when moving a view.
 */
export interface ViewMoveEvent {
  source: {
    viewId: string;
    partId: string;
    primaryPart: boolean,
    viewUrlSegments: UrlSegment[],
    appInstanceId: string;
  };
  target: {
    partId: string;
    /** @internal */
    newPartId?: string;
    region?: 'north' | 'east' | 'south' | 'west' | 'center'; // TODO use position
    insertionIndex?: number;
    appInstanceId: string | 'new';
  };
}

export interface ViewDragEventListenerOptions extends EventListenerOptions {
  /**
   * Allows filtering for given drag event types.
   */
  eventType?: ViewDragEventType | ViewDragEventType[];
  /**
   * Controls if to emit the event outside of the Angular zone which, by default, is false.
   */
  emitOutsideAngular?: boolean;
}
