/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Directive, ElementRef, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output } from '@angular/core';
import { asapScheduler, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { createElement, ElementCreateOptions, setStyle } from '../dom.util';
import { ViewDragData, ViewDragService } from './view-drag.service';

const DROP_REGION_MAX_SIZE = 150;
const DROP_REGION_GAP = 20;
const DROP_REGION_BGCOLOR = 'rgba(0, 0, 0, .1)';
const NULL_BOUNDS: Bounds = null!;

/**
 * Adds a view drop zone to the host element allowing the view to be dropped either in the north,
 * east, south, west or in the center.
 *
 * The drop zone is aligned with the target's bounds, thus requires the element to define a positioning context.
 * If not positioned, the element is changed to be positioned relative.
 */
@Directive({
  selector: '[wbViewDropZone]',
})
export class ViewDropZoneDirective implements OnInit, OnDestroy {

  private _destroy$ = new Subject<void>();
  private _host: HTMLElement;

  private _dropZoneOverlay!: HTMLElement;
  private _dropRegionElement1!: HTMLElement;
  private _dropRegionElement2!: HTMLElement;

  private _dropRegion: Region | null = null;

  /**
   * Specifies which drop regions to allow. If not specified, all regions are allowed.
   */
  @Input()
  public wbViewDropZoneRegions?: Region[];

  /**
   * Emits upon a view drop action.
   */
  @Output()
  public wbViewDropZoneDrop = new EventEmitter<WbViewDropEvent>();

  constructor(host: ElementRef<HTMLElement>, private _viewDragService: ViewDragService, private _zone: NgZone) {
    this._host = host.nativeElement;

    // Ensure the host element to define a positioning context (after element creation)
    asapScheduler.schedule(() => ensureHostElementPositioned(this._host));
  }

  public ngOnInit(): void {
    this.createDropZoneOverlay();
    this.installDragListeners();
  }

  private onDragOver(event: DragEvent): void {
    NgZone.assertNotInAngularZone();

    const dropRegion = this.computeDropRegion(event);
    if (dropRegion === undefined) {
      this.renderDropRegions(NULL_BOUNDS, NULL_BOUNDS);
      return;
    }

    event.preventDefault(); // allow view drop
    if (dropRegion === this._dropRegion) {
      return; // drop region did not change
    }

    switch (this._dropRegion = dropRegion) {
      case 'north': {
        this.renderDropRegions(
          {
            top: '0', right: '0', bottom: `calc(50% + ${DROP_REGION_GAP}px)`, left: '0',
            background: DROP_REGION_BGCOLOR,
          },
          {
            top: `calc(50% + ${DROP_REGION_GAP}px)`, right: '0', bottom: '0', left: '0',
            background: null,
          });
        break;
      }
      case 'east': {
        this.renderDropRegions(
          {
            top: '0', right: '0', bottom: '0', left: `calc(50% + ${DROP_REGION_GAP}px)`,
            background: DROP_REGION_BGCOLOR,
          },
          {
            top: '0', right: `calc(50% + ${DROP_REGION_GAP}px)`, bottom: '0', left: '0',
            background: null,
          });
        break;
      }
      case 'south': {
        this.renderDropRegions(
          {
            top: `calc(50% + ${DROP_REGION_GAP}px)`, right: '0', bottom: '0', left: '0',
            background: DROP_REGION_BGCOLOR,
          },
          {
            top: '0', right: '0', bottom: `calc(50% + ${DROP_REGION_GAP}px)`, left: '0',
            background: null,
          });
        break;
      }
      case 'west': {
        this.renderDropRegions(
          {
            top: '0', right: `calc(50% + ${DROP_REGION_GAP}px)`, bottom: '0', left: '0',
            background: DROP_REGION_BGCOLOR,
          },
          {
            top: '0', right: '0', bottom: '0', left: `calc(50% + ${DROP_REGION_GAP}px)`,
            background: null,
          });
        break;
      }
      default: {
        this.renderDropRegions(
          {
            top: '0', right: '0', bottom: '0', left: '0', background: DROP_REGION_BGCOLOR,
          },
          NULL_BOUNDS,
        );
        break;
      }
    }
  }

  private onDragLeave(): void {
    this._dropRegion = null;
    this.renderDropRegions(NULL_BOUNDS, NULL_BOUNDS);
  }

  private onDrop(event: DragEvent): void {
    const dropEvent: WbViewDropEvent = {
      dropRegion: this._dropRegion!,
      dragData: this._viewDragService.getViewDragData()!,
      sourceEvent: event,
    };

    this._dropRegion = null;
    this.renderDropRegions(NULL_BOUNDS, NULL_BOUNDS);

    this._zone.run(() => this.wbViewDropZoneDrop.emit(dropEvent));
  }

  private activateDropZone(): void {
    setStyle(this._dropZoneOverlay, {display: 'block'});
  }

  private deactivateDropZone(): void {
    setStyle(this._dropZoneOverlay, {display: 'none'});
  }

  private installDragListeners(): void {
    this._viewDragService.viewDrag$(window, {capture: true, eventType: ['dragenter', 'dragleave', 'drop'], emitOutsideAngular: true})
      .pipe(takeUntil(this._destroy$))
      .subscribe((event: DragEvent) => {
        switch (event.type) {
          case 'dragenter':
            this.activateDropZone();
            break;
          case 'dragleave':
          case 'drop':
            this.deactivateDropZone();
            break;
        }
      });

    this._viewDragService.viewDrag$(this._dropZoneOverlay, {emitOutsideAngular: true})
      .pipe(takeUntil(this._destroy$))
      .subscribe((event: DragEvent) => {
        switch (event.type) {
          case 'dragover':
            this.onDragOver(event);
            break;
          case 'dragleave':
            this.onDragLeave();
            break;
          case 'drop':
            this.onDrop(event);
            break;
        }
      });
  }

  private createDropZoneOverlay(): void {
    // Create drop zone as an overlay to avoid flickering when dragging over child elements.
    this._dropZoneOverlay = createElement('div', {
      parent: this._host,
      cssClass: 'wb-view-drop-zone',
      style: {
        'position': 'absolute',
        'display': 'none',
        'pointer-events': 'auto',
        'user-select': 'none',
        'top': '0',
        'right': '0',
        'bottom': '0',
        'left': '0',
      },
    });

    // Create the two drop regions which are moved depending on the computed region.
    const dropRegionOptions: ElementCreateOptions = {
      parent: this._dropZoneOverlay,
      cssClass: 'wb-view-drop-region',
      style: {
        'position': 'absolute',
        'display': 'none',
        'pointer-events': 'none',
        'user-select': 'none',
        'border': '1px dashed rgba(0, 0, 0, 1)',
        'margin': '1px',
        'transition-duration': '125ms',
        'transition-property': 'top,right,bottom,left',
        'transition-timing-function': 'ease-out',
      },
    };
    this._dropRegionElement1 = createElement('section', dropRegionOptions);
    this._dropRegionElement2 = createElement('section', dropRegionOptions);
  }

  private renderDropRegions(region1: Bounds, region2: Bounds): void {
    this.renderDropRegion(this._dropRegionElement1, region1);
    this.renderDropRegion(this._dropRegionElement2, region2);
  }

  private renderDropRegion(element: HTMLElement, bounds: Bounds): void {
    if (bounds === NULL_BOUNDS) {
      setStyle(element, {display: 'none'});
    }
    else {
      setStyle(element, {
        ...bounds,
        display: null,
      });
    }
  }

  private computeDropRegion(event: DragEvent): Region | undefined {
    const horizontalDropZoneWidth = Math.min(DROP_REGION_MAX_SIZE, this._host.clientWidth / 3);
    const verticalDropZoneHeight = Math.min(DROP_REGION_MAX_SIZE, this._host.clientHeight / 3);
    const offsetX = event.pageX - this._host.getBoundingClientRect().left;
    const offsetY = event.pageY - this._host.getBoundingClientRect().top;

    if (this.supportsRegion('west') && offsetX < horizontalDropZoneWidth) {
      return 'west';
    }
    if (this.supportsRegion('east') && offsetX > this._host.clientWidth - horizontalDropZoneWidth) {
      return 'east';
    }
    if (this.supportsRegion('north') && offsetY < verticalDropZoneHeight) {
      return 'north';
    }
    if (this.supportsRegion('south') && offsetY > this._host.clientHeight - verticalDropZoneHeight) {
      return 'south';
    }
    if (this.supportsRegion('center')) {
      return 'center';
    }

    return undefined;
  }

  private supportsRegion(region: Region): boolean {
    return !this.wbViewDropZoneRegions || this.wbViewDropZoneRegions.includes(region);
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}

function ensureHostElementPositioned(element: HTMLElement): void {
  if (getComputedStyle(element).position === 'static') {
    element.style.position = 'relative';
  }
}

interface Bounds {
  top: string;
  right: string;
  bottom: string;
  left: string;
  background: string | null;
}

export interface WbViewDropEvent {
  sourceEvent: DragEvent;
  dropRegion: Region;
  dragData: ViewDragData;
}

export type Region = 'north' | 'east' | 'south' | 'west' | 'center';
