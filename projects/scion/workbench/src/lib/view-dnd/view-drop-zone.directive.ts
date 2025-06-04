/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {computed, Directive, effect, ElementRef, inject, input, NgZone, output, untracked} from '@angular/core';
import {createElement, nextAnimationFrame$, positionElement, setAttribute, setStyle} from '../common/dom.util';
import {ViewDragData, ViewDragService} from './view-drag.service';
import {ViewDropPlaceholderRenderer} from './view-drop-placeholder-renderer.service';
import {Disposable} from '../common/disposable';
import {boundingClientRect} from '@scion/components/dimension';
import {UUID} from '@scion/toolkit/uuid';
import {audit, BehaviorSubject, delay, identity, Observable, of, share, SubjectLike, switchMap} from 'rxjs';
import {subscribeIn} from '@scion/toolkit/operators';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {finalize, tap} from 'rxjs/operators';

/**
 * Makes the host element a drop zone for views.
 *
 * Views can be dropped in the configured region(s) (north, east, south, west, center).
 *
 * The drop zone is aligned with the bounds of the host element, requiring the host to define a positioning context.
 * If not positioned, the element is changed to be positioned relative.
 */
@Directive({selector: '[wbViewDropZone]'})
export class ViewDropZoneDirective {

  /**
   * Specifies the regions where views can be dropped. Defaults to every region.
   */
  public readonly regions = input<DropZoneRegion | false>(undefined, {alias: 'wbViewDropZoneRegions'});

  /**
   * Specifies attribute(s) to add to the drop zone.
   */
  public readonly attributes = input<{[name: string]: unknown} | undefined>(undefined, {alias: 'wbViewDropZoneAttributes'});

  /**
   * Specifies the size of a drop zone region, either as percentage value [0,1] or absolute pixel value.
   */
  public readonly dropRegionSize = input(.5, {alias: 'wbViewDropZoneRegionSize', transform: (value: number | undefined) => value ?? .5});

  /**
   * Specifies the size of the visual placeholder when dragging a view over a drop region.
   * Can be a percentage value [0,1] or absolute pixel value. Defaults to {@link dropRegionSize}.
   */
  public readonly dropPlaceholderSize = input<number | undefined>(undefined, {alias: 'wbViewDropZonePlaceholderSize'});

  /**
   * Notifies when dropping a view.
   */
  public readonly viewDrop = output<WbViewDropEvent>({alias: 'wbViewDropZoneDrop'});

  private readonly _host = inject(ElementRef).nativeElement as HTMLElement;
  private readonly _viewDragService = inject(ViewDragService);
  private readonly _viewDropPlaceholderRenderer = inject(ViewDropPlaceholderRenderer);
  private readonly _zone = inject(NgZone);
  private readonly _id = UUID.randomUUID();
  private readonly _boundingClientRect = boundingClientRect(inject(ElementRef));
  private readonly _dropRegion$ = createDropRegionObservable();

  private readonly _dropRegionSize = computed(() => ({
    maxHeight: coercePixelValue(this.dropRegionSize(), {containerSize: this._boundingClientRect().height}),
    maxWidth: coercePixelValue(this.dropRegionSize(), {containerSize: this._boundingClientRect().width}),
  }));

  constructor() {
    this.installDropZone();
    this.installDropPlaceholderRenderer();
    positionElement(this._host, {context: 'dropzone'});
  }

  /**
   * Creates a drop zone when start dragging a view and disposes it when end dragging the view.
   *
   * When a view is dragged over the drop zone, computes the drop region and renders the drop placeholder using the {@link ViewDropPlaceholderRenderer}.
   */
  private installDropZone(): void {
    effect(onCleanup => {
      if (this._viewDragService.dragging()) {
        const dropZone = untracked(() => this.createDropZone());
        onCleanup(() => dropZone.dispose());
      }
    });
  }

  /**
   * Creates the drop zone element.
   *
   * Views can be dropped in configured drop regions (north, east, south, west, center).
   * The current drop region is computed based on the pointer position. Adjacent drop regions are split
   * at a 45° angle.
   *
   * +-----------------------+
   * | \       north       / |
   * | w +---------------+ e |
   * | e |               | a |
   * | s |    center     | s |
   * | t |               | t |
   * |   +---------------+   |
   * | /       south       \ |
   * +-----------------------+
   */
  public createDropZone(): Disposable {
    const dropZoneElement = createElement('div', {
      parent: this._host,
      attributes: {
        ...this.attributes(),
        'data-id': this._id,
      },
      cssClass: 'e2e-drop-zone',
      style: {
        'position': 'absolute',
        'inset': 0,
        'pointer-events': 'none',
      },
    });

    // Subscribe to drag events on the host, not on the drop zone element, because disabled when not dragging over an allowed drop region.
    // Moving the pointer out of allowed drop regions disables the drop zone element, making pointer events available to nested drop zones.
    // Moving the pointer back re-enables the drop zone element.
    const dragHandler = this._viewDragService.viewDrag$(this._host, {eventType: ['dragenter', 'dragover', 'dragleave', 'drop']})
      .pipe(subscribeIn(fn => this._zone.runOutsideAngular(fn)))
      .subscribe((event: DragEvent) => {
        // Unset region when dragging over the tab bar or out of the host element.
        if (this._viewDragService.isDragOverTabbar || event.type === 'dragleave') {
          this._dropRegion$.next(null);
          return;
        }

        // Compute the drop region.
        const region = this.computeDropZoneRegion(event);
        this._dropRegion$.next(region);
        if (!region) {
          return;
        }

        switch (event.type) {
          case 'dragover':
            event.preventDefault(); // allow view drop
            break;
          case 'drop':
            this._zone.run(() => this.viewDrop.emit({
              dropRegion: region,
              dragData: this._viewDragService.viewDragData()!,
            }));
            break;
        }
      });

    // Enable drop zone based on dragging over an allowed drop region.
    // If enabled, drag events are not received by nested drop zones.
    const dropZoneActivator = this._dropRegion$.subscribe(dropRegion => {
      setStyle(dropZoneElement, {'pointer-events': dropRegion ? null : 'none'});
      setAttribute(dropZoneElement, {'data-region': dropRegion});
    });

    return {
      dispose: () => {
        dragHandler.unsubscribe();
        dropZoneActivator.unsubscribe();
        dropZoneElement.remove();
        this._dropRegion$.next(null);
      },
    };
  }

  /**
   * Renders or removes the drop placeholder based on the current drop region.
   */
  private installDropPlaceholderRenderer(): void {
    // Use an observable instead of an effect to control when to call `ViewDropPlaceholderRenderer.render`.
    // Child elements must invoke the render method before parent elements. Otherwise, nested drop zones
    // would override the drop placeholder of parent drop zones.

    // Component effects always execute top-down the component tree, the opposite direction to drag events
    // that bubble up the component tree. The same applies to root effects, which execute in registration
    // order rather than in the order of tracked signal changes.

    const dragging = this._viewDragService.dragging;
    this._dropRegion$
      .pipe(
        // When leaving the drop zone (no drop region) but continue dragging, remove the drop zone asynchronously
        // to animate transition of the placeholder to another drop zone. If ended dragging, remove the placeholder
        // immediately.
        switchMap((region: Region | null) => of(region).pipe(!region && dragging() ? delay(50) : identity)),
        finalize(() => this._viewDropPlaceholderRenderer.render(this._id, null)),
        takeUntilDestroyed(),
      )
      .subscribe((region: Region | null) => {
        if (region) {
          // Render the drop placeholder.
          const rect = this.computeDropPlaceholderRect(region, this.dropPlaceholderSize() ?? this.dropRegionSize());
          this._viewDropPlaceholderRenderer.render(this._id, rect);
        }
        else {
          // Remove the drop placeholder.
          this._viewDropPlaceholderRenderer.render(this._id, null);
        }
      });
  }

  /**
   * Computes the drop region based on the pointer position and allowed regions, returning `null` if not dragging over an allowed region.
   */
  private computeDropZoneRegion(event: DragEvent): Region | null {
    const regions = this.regions() ?? {north: true, east: true, south: true, west: true, center: true};
    if (!regions) {
      return null;
    }

    const {width, height, left, top, right, bottom} = this._boundingClientRect();
    const {maxHeight, maxWidth} = this._dropRegionSize();
    const hCenter = width / 2;
    const vCenter = height / 2;

    // Calculate pointer insets relative to the host.
    const pointerInset = {
      top: event.clientY - top,
      right: right - event.clientX,
      bottom: bottom - event.clientY,
      left: event.clientX - left,
    };

    // Compute allowed regions.
    const north = regions.north && pointerInset.top <= maxHeight && 'north';
    const south = regions.south && pointerInset.bottom <= maxHeight && 'south';
    const east = regions.east && pointerInset.right <= maxWidth && 'east';
    const west = regions.west && pointerInset.left <= maxWidth && 'west';
    const center = regions.center && 'center';

    // Calculate region in top/left quadrant.
    if (pointerInset.left <= hCenter && pointerInset.top <= vCenter) {
      if (pointerInset.left < pointerInset.top) {
        return west || north || center || null;
      }
      else {
        return north || west || center || null;
      }
    }
    // Calculate region in top/right quadrant.
    else if (pointerInset.left >= hCenter && pointerInset.top <= vCenter) {
      if (pointerInset.right < pointerInset.top) {
        return east || north || center || null;
      }
      else {
        return north || east || center || null;
      }
    }
    // Calculate region in bottom/left quadrant.
    else if (pointerInset.left <= hCenter && pointerInset.top >= vCenter) {
      if (pointerInset.left < pointerInset.bottom) {
        return west || south || center || null;
      }
      else {
        return south || west || center || null;
      }
    }
    // Calculate region in bottom/right quadrant.
    else if (pointerInset.left >= hCenter && pointerInset.top >= vCenter) {
      if (pointerInset.right < pointerInset.bottom) {
        return east || south || center || null;
      }
      else {
        return south || east || center || null;
      }
    }

    return center || null;
  }

  /**
   * Calculates the bounding box of the drop placeholder in given region based on the given size.
   *
   * If passing a ratio [0,1] for the size, the size is interpreted as a percentage value relative to the size of the host element.
   */
  private computeDropPlaceholderRect(region: Region, size: number): DOMRect {
    const {x, y, width, height} = this._boundingClientRect();
    return new DOMRect(
      x + (region === 'east' ? width - coercePixelValue(size, {containerSize: width}) : 0),
      y + (region === 'south' ? height - coercePixelValue(size, {containerSize: height}) : 0),
      region === 'west' || region === 'east' ? coercePixelValue(size, {containerSize: width}) : width,
      region === 'north' || region === 'south' ? coercePixelValue(size, {containerSize: height}) : height,
    );
  }
}

/**
 * Coerces given value to a CSS pixel value.
 *
 * If passing a ratio [0,1], it is interpreted as a percentage value relative to the size of the container.
 */
function coercePixelValue(pixelOrRatio: number, options: {containerSize: number}): number {
  return (pixelOrRatio <= 1) ? options.containerSize * pixelOrRatio : pixelOrRatio;
}

/**
 * Event that is emitted when dropping a view.
 */
export interface WbViewDropEvent {
  dropRegion: Region;
  dragData: ViewDragData;
}

/**
 * Specifies the regions where a drop zone should be installed.
 */
export interface DropZoneRegion {
  north: boolean;
  south: boolean;
  west: boolean;
  east: boolean;
  center: boolean;
}

/**
 * Represents a drop region.
 */
type Region = 'north' | 'east' | 'south' | 'west' | 'center';

/**
 * Creates a subject-like observable to observe and set the drop region,
 * multicasting the drop zone to many observers while throttling emission
 * to the latest drop region per animation frame.
 */
function createDropRegionObservable(): Observable<Region | null> & Pick<SubjectLike<Region | null>, 'next'> {
  const zone = inject(NgZone);
  const region$ = new BehaviorSubject<Region | null>(null);

  const observe$ = region$
    .pipe(
      subscribeIn(fn => zone.runOutsideAngular(fn)),
      // Ensure not to be in Angular.
      tap(() => NgZone.assertNotInAngularZone()),
      // Throttle emission to a single event per animation frame.
      audit(() => nextAnimationFrame$()),
      share(),
    ) as Observable<Region | null> & Pick<SubjectLike<Region | null>, 'next'>;

  // Add notifier function.
  observe$.next = (region: Region | null): void => {
    if (region$.value !== region) {
      zone.runOutsideAngular(() => region$.next(region));
    }
  };

  return observe$;
}
