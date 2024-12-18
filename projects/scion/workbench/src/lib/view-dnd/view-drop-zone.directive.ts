/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Directive, ElementRef, EventEmitter, inject, Injector, Input, NgZone, OnInit, Output, runInInjectionContext} from '@angular/core';
import {createElement, setStyle} from '../common/dom.util';
import {ViewDragData, ViewDragService} from './view-drag.service';
import {subscribeIn} from '@scion/toolkit/operators';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ViewDropPlaceholderRenderer} from './view-drop-placeholder-renderer.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {Arrays} from '@scion/toolkit/util';

/**
 * Adds view drop zones to the host element, allowing views to be dropped either in the north, east, south, west or center.
 *
 * The drop zones are aligned with the bounds of the host element, requiring the host to define a positioning context.
 * If not positioned, the element is changed to be positioned relative.
 */
@Directive({selector: '[wbViewDropZone]', standalone: true})
export class ViewDropZoneDirective implements OnInit {

  private readonly _host: HTMLElement;
  private readonly _injector = inject(Injector);

  @Input('wbViewDropZoneContext') // eslint-disable-line @angular-eslint/no-input-rename
  public context?: string;

  /**
   * Specifies the regions where a drop zone should be installed. If not set, installs a drop zone in every region.
   */
  @Input('wbViewDropZoneRegions') // eslint-disable-line @angular-eslint/no-input-rename
  public regions?: DropZoneRegion;

  /**
   * Specifies CSS class(es) to add to the drop zone.
   */
  @Input('wbViewDropZoneCssClass') // eslint-disable-line @angular-eslint/no-input-rename
  public cssClass?: string | string[] | undefined;

  /**
   * Specifies the size of the drop zone, either as percentage value [0,1] or absolute pixel value.
   */
  @Input({alias: 'wbViewDropZoneSize', required: true}) // eslint-disable-line @angular-eslint/no-input-rename
  public dropZoneSize = .5;

  /**
   * Specifies the size of the visual placeholder when dragging a view over a drop zone.
   * Can be a percentage value [0,1] or absolute pixel value. If not set, defaults to {@link dropZoneSize}.
   */
  @Input('wbViewDropZonePlaceholderSize') // eslint-disable-line @angular-eslint/no-input-rename
  public dropPlaceholderSize?: number | undefined;

  /**
   * Emits upon a view drop action.
   */
  @Output('wbViewDropZoneDrop') // eslint-disable-line @angular-eslint/no-output-rename
  public viewDrop = new EventEmitter<WbViewDropEvent>();

  constructor(host: ElementRef<HTMLElement>,
              private _viewDragService: ViewDragService,
              private _viewDropPlaceholderRenderer: ViewDropPlaceholderRenderer,
              private _zone: NgZone) {
    this._host = host.nativeElement;
    // this.installDropZones();
  }

  public ngOnInit(): void {
    this.ensureHostElementPositioned();
    runInInjectionContext(this._injector, () => this.installDropZones());
  }

  /**
   * Installs a drop zone for each specified region.
   *
   * - DOM elements for drop zones are created lazily when dragging a view over the host element.
   * - When dragging a view over a drop zone, renders the drop placeholder using the {@link ViewDropPlaceholderRenderer}.
   */
  private installDropZones(): void {
    const disposables = new Array<DisposeFn>();

    if (this.context === 'part.bottom-right' || 1 + 1 === 2) {
      console.log('>>> here we go');
      this._viewDragService.viewDrag$(this._host, {eventType: ['dragenter', 'dragover', 'dragleave', 'drop'], capture: true})
        .pipe(
          subscribeIn(fn => this._zone.runOutsideAngular(fn)),
          takeUntilDestroyed(),
        )
        .subscribe((event: DragEvent) => {
          // Disable the drop zone when dragging over the tab bar, allowing the user to change the tab order even for tabs covered by the drop zone.
          if (this._viewDragService.isDragOverTabbar) {
            return;
          }

          const region = this.computeDropZone(event, this.regions ?? {north: true, east: true, south: true, west: true, center: true}, this.dropZoneSize);
          if (region === null) {
            return;
          }

          event.stopPropagation();
          console.log('>>> region', region);

          const dropPlaceholderInset = this.calculateInset(region, this.dropPlaceholderSize ?? this.dropZoneSize);

          switch (event.type) {
            case 'dragenter':
              this._viewDropPlaceholderRenderer.updatePosition(this._host, dropPlaceholderInset);
              break;
            case 'dragover':
              this._viewDropPlaceholderRenderer.updatePosition(this._host, dropPlaceholderInset);
              event.preventDefault(); // allow view drop
              break;
            case 'dragleave':
              break;
            case 'drop':
              this._zone.run(() => this.viewDrop.emit({
                dropRegion: region,
                dragData: this._viewDragService.viewDragData()!,
              }));
              break;
          }

        });
      return;
    }

    // Create drop zones when entering the host element.
    this._viewDragService.viewDrag$(this._host, {eventType: 'dragenter'})
      .pipe(
        subscribeIn(fn => this._zone.runOutsideAngular(fn)),
        takeUntilDestroyed(),
      )
      .subscribe(event => {
        if (!this.regions || this.regions.center) {
          disposables.push(...this.createDropZone('center'));
        }
        if (!this.regions || this.regions.north) {
          disposables.push(...this.createDropZone('north'));
        }
        if (!this.regions || this.regions.south) {
          disposables.push(...this.createDropZone('south'));
        }
        if (!this.regions || this.regions.west) {
          disposables.push(...this.createDropZone('west'));
        }
        if (!this.regions || this.regions.east) {
          disposables.push(...this.createDropZone('east'));
        }
      });

    // Dispose drop zones when leaving the host element, or when the drag operation completes.
    this._viewDragService.viewDrag$(this._host, {eventType: ['dragleave', 'drop']})
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        disposables.forEach(disposeFn => disposeFn());
        disposables.length = 0;
      });
  }

  private computeDropZone(event: MouseEvent, regions: DropZoneRegion, size: number): 'north' | 'east' | 'south' | 'west' | 'center' | null {
    const boundingClientRect = this._host.getBoundingClientRect();
    const hCenter = boundingClientRect.width / 2;
    const vCenter = boundingClientRect.height / 2;

    const pointerOffsetTop = event.clientY - boundingClientRect.y;
    const pointerOffsetRight = boundingClientRect.right - event.clientX;
    const pointerOffsetBottom = boundingClientRect.bottom - event.clientY;
    const pointerOffsetLeft = event.clientX - boundingClientRect.x;

    const maxHeight = coercePixelValue(size, {containerSize: boundingClientRect.height});
    const maxWidth = coercePixelValue(size, {containerSize: boundingClientRect.width});

    // Quadrant left-top
    if (pointerOffsetLeft < hCenter && pointerOffsetTop < vCenter) {
      if (pointerOffsetLeft > maxWidth && pointerOffsetTop > maxHeight) {

        return regions.center ? 'center' : null;
      }
      else if (regions.west && regions.north) {
        if (pointerOffsetLeft < pointerOffsetTop) {
          return 'west'
        }
        else {
          return 'north'
        }
      }
      else if (regions.west) {
        return 'west';
      }
      else if (regions.north) {
        return 'north';
      }
      else if (regions.center) {
        return 'center';
      }
      else {
        return null;
      }
    }

    // Quadrant right-top
    if (pointerOffsetLeft > hCenter && pointerOffsetTop < vCenter) {
      console.log('>>> quadrant right-top');
      if (pointerOffsetRight > maxWidth && pointerOffsetTop > maxHeight) {
        return regions.center ? 'center' : null;
      }
      else if (regions.east && regions.north) {
        if (pointerOffsetRight < pointerOffsetTop) {
          return 'east'
        }
        else {
          return 'north'
        }
      }
      else if (regions.east) {
        return 'east';
      }
      else if (regions.north) {
        return 'north';
      }
      else if (regions.center) {
        return 'center';
      }
      else {
        return null;
      }
    }
    // Quadrant left-bottom
    if (pointerOffsetLeft < hCenter && pointerOffsetTop > vCenter) {
      console.log('>>> quadrant left-bottom');
      if (pointerOffsetLeft > maxWidth && pointerOffsetBottom > maxHeight) {
        return regions.center ? 'center' : null;
      }
      else if (regions.west && regions.south) {
        if (pointerOffsetLeft < pointerOffsetBottom) {
          return 'west'
        }
        else {
          return 'south'
        }
      }
      else if (regions.west) {
        return 'west';
      }
      else if (regions.south) {
        return 'south';
      }
      else if (regions.center) {
        return 'center';
      }
      else {
        return null;
      }
    }

    // Quadrant right-bottom
    if (pointerOffsetLeft > hCenter && pointerOffsetTop > vCenter) {
      console.log('>>> quadrant right-bottom');
      if (pointerOffsetRight > maxWidth && pointerOffsetBottom > maxHeight) {
        return regions.center ? 'center' : null;
      }
      else if (regions.east && regions.south) {
        if (pointerOffsetRight < pointerOffsetBottom) {
          return 'east'
        }
        else {
          return 'south'
        }
      }
      else if (regions.east) {
        return 'east';
      }
      else if (regions.south) {
        return 'south';
      }
      else if (regions.center) {
        return 'center';
      }
      else {
        return null;
      }
    }
    return null;
  }

  /**
   * Creates the drop zone for the specified region.
   */
  private createDropZone(region: 'north' | 'east' | 'south' | 'west' | 'center'): DisposeFn[] {
    const dropZoneInset = this.calculateInset(region, this.dropZoneSize);
    const dropPlaceholderInset = this.calculateInset(region, this.dropPlaceholderSize ?? this.dropZoneSize);
    const dispose$ = new Subject<void>();

    // Create the drop zone HTML element.
    const dropZoneElement = createElement('div', {
      parent: this._host,
      cssClass: ['e2e-view-drop-zone', `e2e-${region}`, ...Arrays.coerce(this.cssClass)],
      style: {
        position: 'absolute',
        top: `${dropZoneInset.top}px`,
        right: `${dropZoneInset.right}px`,
        bottom: `${dropZoneInset.bottom}px`,
        left: `${dropZoneInset.left}px`,
      },
    });

    // Install drag listener to render the drop placeholder and handle drop.
    this._viewDragService.viewDrag$(dropZoneElement, {eventType: ['dragenter', 'dragover', 'drop']})
      .pipe(
        subscribeIn(fn => this._zone.runOutsideAngular(fn)),
        takeUntil(dispose$),
      )
      .subscribe((event: DragEvent) => {
        switch (event.type) {
          case 'dragenter':
            this._viewDropPlaceholderRenderer.updatePosition(this._host, dropPlaceholderInset);
            break;
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

    // Disable the drop zone when dragging over the tab bar, allowing the user to change the tab order even for tabs covered by the drop zone.
    this._viewDragService.tabbarDragOver$
      .pipe(
        subscribeIn(fn => this._zone.runOutsideAngular(fn)),
        takeUntil(dispose$),
      )
      .subscribe(dragOverTabbar => {
        if (dragOverTabbar) {
          setStyle(dropZoneElement, {'pointer-events': 'none'});
        }
        else {
          setStyle(dropZoneElement, {'pointer-events': null});
        }
      });

    return [
      () => dispose$.next(),
      () => dropZoneElement.remove(),
    ];
  }

  /**
   * Calculates the inset for the drop region based on the given size.
   *
   * If passing a ratio [0,1] for the size, the size is interpreted as a percentage value relative to the size of the host element.
   */
  private calculateInset(region: 'north' | 'east' | 'south' | 'west' | 'center', size: number): Inset {
    return {
      top: region === 'south' ? this._host.clientHeight - coercePixelValue(size, {containerSize: this._host.clientHeight}) : 0,
      right: region === 'west' ? this._host.clientWidth - coercePixelValue(size, {containerSize: this._host.clientWidth}) : 0,
      bottom: region === 'north' ? this._host.clientHeight - coercePixelValue(size, {containerSize: this._host.clientHeight}) : 0,
      left: region === 'east' ? this._host.clientWidth - coercePixelValue(size, {containerSize: this._host.clientWidth}) : 0,
    };
  }

  private ensureHostElementPositioned(): void {
    if (getComputedStyle(this._host).position === 'static') {
      setStyle(this._host, {'position': 'relative'});
    }
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
  dropRegion: 'north' | 'east' | 'south' | 'west' | 'center';
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
 * Distance between an element and the parent element.
 */
interface Inset {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

type DisposeFn = () => void;
