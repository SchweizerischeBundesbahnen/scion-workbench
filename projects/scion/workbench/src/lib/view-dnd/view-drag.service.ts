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
import {BehaviorSubject, EMPTY, fromEvent, merge, Observable, Observer, of, TeardownLogic, zip} from 'rxjs';
import {filter, map, take} from 'rxjs/operators';
import {Arrays} from '@scion/toolkit/util';
import {UrlSegment} from '@angular/router';
import {WorkbenchBroadcastChannel} from '../communication/workbench-broadcast-channel';
import {observeIn, subscribeIn} from '@scion/toolkit/operators';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';
import {ViewId} from '../view/workbench-view.model';
import {ClassListMap} from '../common/class-list';
import {NavigationData} from '../routing/routing.model';

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
@Injectable({providedIn: 'root'})
export class ViewDragService implements OnDestroy {

  /**
   * Reference to the view drag data of the ongoing view drag operation, if any, or `null` otherwise.
   */
  private _viewDragData: ViewDragData | null = null;
  private _viewDragStartBroadcastChannel = new WorkbenchBroadcastChannel<ViewDragData>('workbench/view/dragstart');
  private _viewDragEndBroadcastChannel = new WorkbenchBroadcastChannel<void>('workbench/view/dragend');
  private _viewMoveBroadcastChannel = new WorkbenchBroadcastChannel<ViewMoveEvent>('workbench/view/move');
  private _tabbarDragOver$ = new BehaviorSubject<string /* partId */ | null>(null);

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

  /**
   * Emits the identity of the part when the user is dragging a view over its tabbar, or `null` if not dragging over a tabbar.
   * The event is NOT received across app instances.
   *
   * Upon subscription, emits the current state, and then each time the state changes. The observable never completes.
   */
  public readonly tabbarDragOver$: Observable<string | null> = this._tabbarDragOver$;

  /**
   * Indicates if a drag operation is in progress.
   */
  public readonly dragging = toSignal(merge(
    this.viewDragStart$.pipe(map(() => true)),
    this.viewDragEnd$.pipe(map(() => false)),
  ), {initialValue: false});

  constructor(private _zone: NgZone) {
    this.viewDragStart$
      .pipe(takeUntilDestroyed())
      .subscribe(viewDragData => {
        this._viewDragData = viewDragData;
      });
    this.viewDragEnd$
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this._viewDragData = null;
      });
  }

  /**
   * Set when dragging a view over specified tabbar.
   */
  public setTabbarDragover(partId: string): void {
    this._tabbarDragOver$.next(partId);
  }

  /**
   * Unset when not dragging a view over specified tabbar anymore.
   */
  public unsetTabbarDragover(partId: string): void {
    if (this._tabbarDragOver$.value === partId) {
      this._tabbarDragOver$.next(null);
    }
  }

  /**
   * Indicates if dragging a view tab over a tabbar.
   *
   * Returns the identity of the part if the user is dragging a view over its tabbar, or `null` if not dragging over a tabbar.
   */
  public get isDragOverTabbar(): string | null {
    return this._tabbarDragOver$.value;
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
   * @param options.eventType - Filters for specified drag events; defaults to any event.
   * @param options.capture - Controls whether to subscribe for drag events in the capturing phase; defaults to `false`, i.e., `bubbling` phase.
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
          subscribeIn(fn => this._zone.runOutsideAngular(fn)),
          observeIn(fn => insideAngular ? this._zone.run(fn) : this._zone.runOutsideAngular(fn)),
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
    // is destroyed during the drag operation, e.g. if moved to another part, the drag operation would not
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
  viewId: ViewId;
  alternativeViewId?: string;
  viewTitle: string | null;
  viewHeading: string | null;
  viewUrlSegments: UrlSegment[];
  navigationHint?: string;
  navigationData?: NavigationData;
  viewClosable: boolean;
  viewDirty: boolean;
  partId: string;
  viewTabWidth: number;
  viewTabHeight: number;
  workbenchId: string;
  classList?: ClassListMap;
}

/**
 * Event emitted when moving a view.
 */
export interface ViewMoveEvent {
  source: ViewMoveEventSource;
  target: ViewMoveEventTarget;
}

/**
 * Describes a view to be moved to another location.
 */
export interface ViewMoveEventSource {
  viewId: ViewId;
  partId: string;
  navigationHint?: string;
  navigationData?: NavigationData;
  alternativeViewId?: string;
  viewUrlSegments: UrlSegment[];
  workbenchId: string;
  classList?: ClassListMap;
}

/**
 * Describes the target location for moving a view.
 */
export interface ViewMoveEventTarget {
  /**
   * Part (or node) where (or relative to which) to add the view.
   *
   * Rules for different regions:
   * - If not specifying a region, {@link elementId} is mandatory and must reference a part.
   * - For regions `north`, `south`, `east`, or `west`, {@link elementId} can reference a part or node,
   *   relative to which to align the view. If not set, the view is aligned relative to the root of
   *   the entire layout.
   *
   * Note: Property is ignored when moving the view to a new window.
   */
  elementId?: string;
  /**
   * Region of {@link elementId} where to add the view (in a new part).
   *
   * If not specified, {@link elementId} must reference a part to which to add the view.
   *
   * Note:
   * - Property is ignored when moving the view to a new window.
   * - Property is required if {@link elementId} is a node.
   */
  region?: 'north' | 'east' | 'south' | 'west';
  /**
   * Position where to insert the view. The position is zero-based. If not set, adds the view after the active view.
   */
  position?: number | 'start' | 'end';
  /**
   * Identifier of the target workbench, or 'new-window' to move the view to a new browser window.
   */
  workbenchId: string | 'new-window';
  /**
   * Describes the part to be created if the region is 'north', 'east', 'south', or 'west'.
   */
  newPart?: {
    /**
     * Identity of the new part. If not set, assigns a UUID.
     */
    id?: string;
    /**
     * Proportional size of the part relative to the reference part.
     * The ratio is the closed interval [0,1]. If not set, defaults to `0.5`.
     */
    ratio?: number;
  };
}

export interface ViewDragEventListenerOptions extends EventListenerOptions {
  /**
   * Allows filtering for given drag event types.
   */
  eventType?: ViewDragEventType | ViewDragEventType[];
}
