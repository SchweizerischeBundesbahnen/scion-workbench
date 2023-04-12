/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable, NgZone, OnDestroy} from '@angular/core';
import {EMPTY, fromEvent, merge, Observable, Observer, of, Subject, TeardownLogic, zip} from 'rxjs';
import {filter, map, take, takeUntil} from 'rxjs/operators';
import {Arrays} from '@scion/toolkit/util';
import {UrlSegment} from '@angular/router';
import {WorkbenchBroadcastChannel} from '../workbench-broadcast-channel';
import {observeInside, subscribeInside} from '@scion/toolkit/operators';

/**
 * Events fired during view drag and drop operation.
 */
export type ViewDragEventType = 'dragstart' | 'dragend' | 'dragenter' | 'dragover' | 'dragleave' | 'drop';
/**
 * Transfer type for dragging a view.
 */
export const VIEW_DRAG_TRANSFER_TYPE = 'workbench/view';

/**
 * Manages the drag & drop behavior when the user drags a view.
 */
@Injectable()
export class ViewDragService implements OnDestroy {

  /**
   * Reference to the view drag data of the ongoing view drag operation, if any, or `null` otherwise.
   */
  private _viewDragData: ViewDragData | null = null;

  private _viewDragStartBroadcastChannel = new WorkbenchBroadcastChannel<ViewDragData>('workbench/view/dragstart');
  private _viewDragEndBroadcastChannel = new WorkbenchBroadcastChannel<void>('workbench/view/dragend');
  private _viewMoveBroadcastChannel = new WorkbenchBroadcastChannel<ViewMoveEvent>('workbench/view/move');

  private _destroy$ = new Subject<void>();

  /**
   * Emits when the user starts dragging a viewtab. The event is received across app instances of the same origin.
   */
  public readonly viewDragStart$: Observable<ViewDragData> = this._viewDragStartBroadcastChannel.observe$;

  /**
   * Emits when the user ends dragging a viewtab. The event is received across app instances of the same origin.
   */
  public readonly viewDragEnd$: Observable<void> = this._viewDragEndBroadcastChannel.observe$;

  /**
   * Emits when the user moves a view. The event is received across app instances of the same origin.
   */
  public readonly viewMove$: Observable<ViewMoveEvent> = this._viewMoveBroadcastChannel.observe$;

  constructor(private _zone: NgZone) {
    this.viewDragStart$
      .pipe(takeUntil(this._destroy$))
      .subscribe(viewDragData => {
        this._viewDragData = viewDragData;
      });
    this.viewDragEnd$
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        this._viewDragData = null;
      });
  }

  /**
   * Checks if the given event is a view drag event with the same origin.
   */
  public isViewDragEvent(event: DragEvent): boolean {
    return !!event.dataTransfer && event.dataTransfer.types.includes(VIEW_DRAG_TRANSFER_TYPE) && this.viewDragData !== null;
  }

  /**
   * Listens for same-origin view drag events on the given target element.
   *
   * Unlike when installing a "native" event handler for `dragenter` and/or `dragleave` events,
   * this observable does not emit when dragging over child elements of the target element.
   *
   * Following drag events are emitted:
   * - dragstart: when start dragging a view tab
   * - dragend: when end dragging a view tab
   * - dragenter: when entering the target element while dragging a view tab
   * - dragover: when dragging a view tab over the target element, every few hundred milliseconds
   * - dragleave: when leaving the target element while dragging a view tab
   * - drop: when dropping a view tab on a valid drop target
   *
   * As by design of native drag and drop, the `dragleave` event is not fired on drop action.
   * Therefore, always handle both events, `dragleave` and `drop` events, respectively.
   *
   * @param target - Specifies the element on which to subscribe for drag events.
   * @param options - Controls how to subscribe for drag events.
   *        @property eventType - Filters for specified drag events; defaults to any event.
   *        @property capture - Controls whether to subscribe for drag events in the capturing phase; defaults to `false`, i.e., `bubbling` phase.
   */
  public viewDrag$(target: Element | Window, options?: ViewDragEventListenerOptions): Observable<DragEvent> {
    const filteredEventTypes = new Set<string>(Arrays.coerce(options?.eventType));
    const isViewDragEvent = this.isViewDragEvent.bind(this);

    return new Observable((observer: Observer<DragEvent>): TeardownLogic => {
      const insideAngular = NgZone.isInAngularZone();

      const subscription = merge(
        shouldSubscribe('dragstart') ? dragstart$() : EMPTY,
        shouldSubscribe('dragend') ? dragend$() : EMPTY,
        shouldSubscribe('dragover') ? dragover$() : EMPTY,
        shouldSubscribe('dragenter') || shouldSubscribe('dragleave') || shouldSubscribe('drop') ? dragenterOrDragleaveOrDrop$() : EMPTY,
      )
        .pipe(
          subscribeInside(fn => this._zone.runOutsideAngular(fn)),
          observeInside(fn => insideAngular ? this._zone.run(fn) : this._zone.runOutsideAngular(fn)),
        )
        .subscribe(observer);

      return (): void => subscription.unsubscribe();
    });

    function dragstart$(): Observable<DragEvent> {
      return fromEvent<DragEvent>(target, 'dragstart', options ?? {})
        .pipe(filter(event => isViewDragEvent(event)));
    }

    function dragend$(): Observable<DragEvent> {
      // The `dragend` event does not contain a drag transfer type. To still filter view-related `dragend` events,
      // we combine `dragstart` and `dragend` events, i.e., when a view-related `dragstart` event occurs, we expect
      // the next `dragend` event to be view-related.
      return zip(
        fromEvent<DragEvent>(target, 'dragstart', options ?? {}).pipe(filter(event => isViewDragEvent(event))),
        fromEvent<DragEvent>(target, 'dragend', options ?? {}),
      ).pipe(map(([_, dragendEvent]) => dragendEvent));
    }

    function dragover$(): Observable<DragEvent> {
      return fromEvent<DragEvent>(target, 'dragover', options ?? {})
        .pipe(filter(event => isViewDragEvent(event)));
    }

    function dragenterOrDragleaveOrDrop$(): Observable<DragEvent> {
      // We emit `dragenter` only when entering the target element (or any child element) for the first time
      // and only again after entering it again. The same applies for `dragleave`.
      let dragEnterCount = 0;
      return merge(
        fromEvent<DragEvent>(target, 'dragenter', options ?? {}),
        fromEvent<DragEvent>(target, 'dragleave', options ?? {}),
        fromEvent<DragEvent>(target, 'drop', options ?? {}),
      )
        .pipe(
          filter(event => isViewDragEvent(event)),
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
          filter(event => shouldSubscribe(event.type)),
        );
    }

    function shouldSubscribe(eventType: string): boolean {
      return !filteredEventTypes.size || filteredEventTypes.has(eventType);
    }
  }

  /**
   * Dispatches the given view move event to app instances of the same origin.
   */
  public dispatchViewMoveEvent(event: ViewMoveEvent): void {
    // Wait to dispatch the event until the drag operation finished, if any, because if the drag source element
    // is destroyed during the drag operation, e.g. if moved to another viewpart, the drag operation would not
    // ordinarily complete, meaning 'dragend' or 'dragleave' would not be called.
    const isDragging = this.viewDragData !== null;
    (isDragging ? this.viewDragEnd$ : of(undefined))
      .pipe(take(1))
      .subscribe(() => this._viewMoveBroadcastChannel.postMessage(event));

  }

  /**
   * Makes the given view drag data available to app instances of the same origin.
   *
   * Invoke this method inside 'dragstart' event handler of the element where the drag operation started.
   */
  public setViewDragData(viewDragData: ViewDragData): void {
    this._viewDragStartBroadcastChannel.postMessage(viewDragData);
  }

  /**
   * Removes the view drag data.
   *
   * Invoke this method inside 'dragend' event handler of the element where the drag operation started.
   */
  public unsetViewDragData(): void {
    this._viewDragEndBroadcastChannel.postMessage();
  }

  /**
   * Returns the view drag data of the ongoing view drag operation or `null` if no drag operation is in progress.
   */
  public get viewDragData(): ViewDragData | null {
    return this._viewDragData;
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._viewMoveBroadcastChannel.destroy();
    this._viewDragStartBroadcastChannel.destroy();
    this._viewDragEndBroadcastChannel.destroy();
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
    viewUrlSegments: UrlSegment[];
    appInstanceId: string;
  };
  target: {
    /**
     * Part to which to add the view. If using a {@link region} other than 'center', that part is used as a reference for creating a new part.
     * Set the part to `null` if moving the view to a blank window.
     */
    partId: string | null;
    /**
     * Identity of the new part to be created, if the region is either 'north', 'east', 'south', or 'west'.
     * If not set, a UUID is generated.
     */
    newPartId?: string;
    /**
     * Region of the {@link partId part} where to add the view. If using a region other than 'center', creates a new part in that region.
     */
    region?: 'north' | 'east' | 'south' | 'west' | 'center';
    /**
     * Tab index in the tabbar where to add the view tab. If not set, then the view tab is added as last view tab.
     */
    insertionIndex?: number;
    /**
     * Identity of the window where to move the view to.
     */
    appInstanceId: string | 'new';
  };
}

export interface ViewDragEventListenerOptions extends EventListenerOptions {
  /**
   * Allows filtering for given drag event types.
   */
  eventType?: ViewDragEventType | ViewDragEventType[];
}
