/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {computed, effect, inject, Injectable, Injector, NgZone, OnDestroy, untracked} from '@angular/core';
import {BehaviorSubject, EMPTY, fromEvent, merge, mergeMap, mergeWith, MonoTypeOperatorFunction, Observable, Observer, Subject, switchMap, TeardownLogic} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {Arrays} from '@scion/toolkit/util';
import {WorkbenchBroadcastChannel} from '../communication/workbench-broadcast-channel';
import {observeIn, subscribeIn} from '@scion/toolkit/operators';
import {ViewId, WorkbenchViewNavigation} from '../view/workbench-view.model';
import {ClassListMap} from '../common/class-list';
import {toSignal} from '@angular/core/rxjs-interop';
import {PartId} from '../part/workbench-part.model';

/**
 * Coordinates cross application drag and drop of views.
 *
 * Views can only be moved across applications of the same origin.
 */
@Injectable({providedIn: 'root'})
export class ViewDragService implements OnDestroy {

  private readonly _injector = inject(Injector);
  private readonly _zone = inject(NgZone);
  private readonly _viewDragStartBroadcastChannel = new WorkbenchBroadcastChannel<ViewDragData>('workbench/view/dragstart');
  private readonly _viewDragEndBroadcastChannel = new WorkbenchBroadcastChannel<void>('workbench/view/dragend');
  private readonly _viewMoveBroadcastChannel = new WorkbenchBroadcastChannel<ViewMoveEvent>('workbench/view/move');
  private readonly _tabbarDragOver$ = new BehaviorSubject<PartId | false>(false);
  private readonly _viewMoved$ = new Subject<ViewMoveEvent>();

  /**
   * Notifies when to move a view. The event is broadcasted to all application instances of the same origin.
   */
  public readonly viewMove$: Observable<ViewMoveEvent> = this._viewMoveBroadcastChannel.observe$;

  /**
   * Notifies when the layout of this application has been updated after a view move event.
   */
  public readonly viewMoved$: Observable<ViewMoveEvent> = this._viewMoved$;

  /**
   * Notifies when dragging a tab over a tabbar. The event is the id of the part being dragged over, or `false` if not dragging over a tabbar.
   *
   * Upon subscription, emits the current dragover state, and then each time the state changes. The observable never completes.
   */
  public readonly tabbarDragOver$: Observable<PartId | false> = this._tabbarDragOver$;

  /**
   * Provides the drag data of the current drag operation. Is `null` if no drag operation is in progress.
   */
  public readonly viewDragData = toSignal<ViewDragData | null>(
    merge(
      this._viewDragStartBroadcastChannel.observe$,
      this._viewDragEndBroadcastChannel.observe$.pipe(map(() => null)),
    ),
    {initialValue: null},
  );

  /**
   * Indicates if a drag operation is active across application instances of the same origin.
   */
  public readonly dragging = computed<boolean>(() => this.viewDragData() !== null);

  /**
   * Signals start dragging a tab over specified tabbar (dragenter).
   */
  public signalTabbarDragEnter(partId: PartId): void {
    this._tabbarDragOver$.next(partId);
  }

  /**
   * Signals end dragging a tab over specified tabbar (dragleave).
   */
  public signalTabbarDragLeave(partId: PartId): void {
    if (this._tabbarDragOver$.value === partId) {
      this._tabbarDragOver$.next(false);
    }
  }

  /**
   * Signals successful move of a view in the layout of this app instance.
   */
  public signalViewMoved(event: ViewMoveEvent): void {
    this._viewMoved$.next(event);
  }

  /**
   * Indicates if dragging a tab over a tabbar, returning the id of the part being dragged over, or `false` if not dragging over a tabbar.
   */
  public get isDragOverTabbar(): PartId | false {
    return this._tabbarDragOver$.value;
  }

  /**
   * Tests given event to be a view drag event of an app of this origin.
   */
  public isViewDragEvent(event: DragEvent): boolean {
    if (!event.dataTransfer?.types.includes(VIEW_DRAG_TRANSFER_TYPE)) {
      return false;
    }
    // Test the event to originate from an app of this origin.
    return this.dragging();
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
      // The `dragend` event does not contain a drag transfer type.
      // To filter view-related `dragend` events, we subscribe to view-related `dragstart` events in the first place.
      // When receiving a `dragstart` event we subscribe for the next `dragend` event, expecting it to be view-related.
      return fromEvent<DragEvent>(target, 'dragstart', options ?? {})
        .pipe(
          filter(event => isViewDragEvent(event)),
          switchMap(() => fromEvent<DragEvent>(target, 'dragend', {...options, once: true})),
        );
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
          resetOnDragEnd(),
          filter(event => shouldSubscribe(event.type)),
        );

      /**
       * Resets `dragEnterCount` on `dragend` to prevent inconsistent state if `dragend` should not be triggered.
       */
      function resetOnDragEnd<T>(): MonoTypeOperatorFunction<T> {
        return mergeWith(fromEvent<DragEvent>(target, 'dragend', options ?? {})
          .pipe(mergeMap(() => {
            dragEnterCount = 0;
            return EMPTY;
          })),
        );
      }
    }

    function shouldSubscribe(eventType: string): boolean {
      return !filteredEventTypes.size || filteredEventTypes.has(eventType);
    }
  }

  /**
   * Dispatches the given view move event, broadcasting it to all application instances of the same origin.
   */
  public dispatchViewMoveEvent(event: ViewMoveEvent): void {
    // Dispatch the event after the current drag operation, if any, has ended, preventing destruction of the drag source
    // during the drag operation which would break the drag operation, i.e., `dragend` and `dragleave` events would not be fired.
    this.onDragEnd(() => this._viewMoveBroadcastChannel.postMessage(event), {once: true, injector: this._injector});
  }

  /**
   * Sets given drag data, broadcasting it to all application instances of the same origin.
   *
   * Invoke this method inside 'dragstart' event handler of the element where the drag operation started.
   */
  public setViewDragData(viewDragData: ViewDragData): void {
    this._viewDragStartBroadcastChannel.postMessage(viewDragData);
  }

  /**
   * Unsets the current drag data.
   *
   * Invoke this method inside 'dragend' event handler of the element where the drag operation started.
   */
  public unsetViewDragData(): void {
    this._viewDragEndBroadcastChannel.postMessage();
  }

  /**
   * Registers a callback to be executed when a drag operation ends, executing it immediately if no drag operation is in progress at the time of registration.
   *
   * Automatically unregisters the function when the current injection context or the provided injector is destroyed.
   * Setting `once` unregisters the function after the first execution.
   */
  public onDragEnd(onDragEnd: () => void, options?: {injector?: Injector; once?: true}): void {
    const effectRef = effect(() => {
      if (!this.dragging()) {
        untracked(() => onDragEnd());
        options?.once && effectRef.destroy();
      }
    }, {injector: options?.injector});
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
   * Unique id of the drag operation.
   */
  uid: string;
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
  navigation?: Omit<WorkbenchViewNavigation, 'id' | 'state'>;
  viewClosable: boolean;
  viewDirty: boolean;
  partId: PartId;
  viewTabWidth: number;
  viewTabHeight: number;
  workbenchId: string;
  classList?: ClassListMap;
}

/**
 * Event for moving a view in the workbench layout.
 */
export interface ViewMoveEvent {
  /**
   * Describes which view to move.
   */
  source: ViewMoveEventSource;
  /**
   * Describes where to move the view.
   */
  target: ViewMoveEventTarget;
  /**
   * Drag data associated with this operation. Is only set if moving a view via drag and drop.
   */
  dragData?: ViewDragData;
}

/**
 * Describes which view to move.
 */
export interface ViewMoveEventSource {
  viewId: ViewId;
  partId: PartId;
  navigation?: Omit<WorkbenchViewNavigation, 'id' | 'state'>;
  alternativeViewId?: string;
  workbenchId: string;
  classList?: ClassListMap;
}

/**
 * Describes where to move a view.
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
  elementId?: PartId | string;
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
     * Identity of the new part. If not set, assigns a random id.
     */
    id?: PartId;
    /**
     * Proportional size of the part relative to the reference part.
     * The ratio is the closed interval [0,1]. If not set, defaults to `0.5`.
     */
    ratio?: number;
  };
}

/**
 * Controls how to subscribe to drag events.
 */
export interface ViewDragEventListenerOptions extends EventListenerOptions {
  /**
   * Controls which event(s) to subscribe.
   */
  eventType?: ViewDragEventType | ViewDragEventType[];
}

/**
 * Represents the type of drag event.
 */
export type ViewDragEventType = 'dragstart' | 'dragend' | 'dragenter' | 'dragover' | 'dragleave' | 'drop';

/**
 * Transfer type for dragging a view.
 */
export const VIEW_DRAG_TRANSFER_TYPE = 'workbench/view';
