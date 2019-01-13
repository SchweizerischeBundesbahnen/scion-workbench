/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Directive, ElementRef, EventEmitter, OnDestroy, OnInit, Output, Renderer2 } from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { WorkbenchLayoutService } from '../workbench-layout.service';
import { VIEW_DRAG_TYPE } from '../workbench.constants';

const DROP_REGION_MAX_SIZE = 150;
const DROP_REGION_GAP = 20;
const DROP_REGION_BGCOLOR = 'rgba(0, 0, 0, .1)';
const NULL_BOUNDS: Bounds = null;

/**
 * Adds a view drop zone to the host element allowing the view to be dropped either in the north,
 * east, south, west or in the center.
 */
@Directive({
  selector: '[wbViewDropZone]'
})
export class ViewDropZoneDirective implements OnInit, OnDestroy {

  private _destroy$ = new Subject<void>();
  private _host: Element;

  private _dropZoneOverlay: Element;
  private _dropRegionElement1: Element;
  private _dropRegionElement2: Element;

  private _dropRegion: Region;

  /**
   * Emits upon a view drop action.
   */
  @Output()
  public wbViewDropZoneDrop = new EventEmitter<WbViewDropEvent>();

  constructor(host: ElementRef<Element>, private _renderer: Renderer2, private _workbenchLayout: WorkbenchLayoutService) {
    this._host = host.nativeElement;
  }

  public ngOnInit(): void {
    this.createDropZoneOverlay();
    this.installDragListeners();
  }

  private onDragOver(event: DragEvent): void {
    const dropRegion = this.computeDropRegion(event);
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
            top: '0', right: '0', bottom: '0', left: '0', background: DROP_REGION_BGCOLOR
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
    event.stopPropagation();

    const dropRegion = this._dropRegion;
    this._dropRegion = null;

    this.deactivateDropZone();
    this.wbViewDropZoneDrop.emit({
      region: dropRegion,
      source: event,
    });
  }

  private activateDropZone(): void {
    this._renderer.setStyle(this._dropZoneOverlay, 'display', 'block');
  }

  private deactivateDropZone(): void {
    this._renderer.setStyle(this._dropZoneOverlay, 'display', 'none');
    this.renderDropRegions(NULL_BOUNDS, NULL_BOUNDS);
  }

  private isViewDragEvent(dragEvent: DragEvent): boolean {
    return dragEvent.dataTransfer.types.includes(VIEW_DRAG_TYPE);
  }

  private installDragListeners(): void {
    // Activate drop zone when view tab dragging starts
    this._workbenchLayout.viewTabDrag$
      .pipe(
        filter(event => event === 'start'),
        takeUntil(this._destroy$)
      )
      .subscribe(() => {
        this.activateDropZone();
      });

    // Deactivate drop zone when view tab dragging ends
    this._workbenchLayout.viewTabDrag$
      .pipe(
        filter(event => event === 'end'),
        takeUntil(this._destroy$)
      )
      .subscribe(() => {
        this.deactivateDropZone();
      });

    // Add listeners to control dragging
    fromEvent<DragEvent>(this._dropZoneOverlay, 'dragover')
      .pipe(
        filter(event => this.isViewDragEvent(event)),
        takeUntil(this._destroy$)
      )
      .subscribe((dragEvent: DragEvent) => {
        dragEvent.preventDefault(); // `preventDefault` to allow drop
        this.onDragOver(dragEvent);
      });

    fromEvent<DragEvent>(this._dropZoneOverlay, 'dragleave')
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        this.onDragLeave();
      });

    fromEvent<DragEvent>(this._dropZoneOverlay, 'drop')
      .pipe(
        filter(event => this.isViewDragEvent(event)),
        takeUntil(this._destroy$)
      )
      .subscribe((dragEvent: DragEvent) => {
        this.onDrop(dragEvent);
      });
  }

  private createDropZoneOverlay(): void {
    // Create drop zone as an overlay to avoid flickering when dragging over child elements.
    this._dropZoneOverlay = this.createElement(this._host, 'div', {
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
        'z-index': '1',
      }
    });

    // Create the two drop regions which are moved depending on the computed region.
    const dropRegionOptions: ElementCreateOptions = {
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
    this._dropRegionElement1 = this.createElement(this._dropZoneOverlay, 'section', dropRegionOptions);
    this._dropRegionElement2 = this.createElement(this._dropZoneOverlay, 'section', dropRegionOptions);
  }

  private createElement(parent: Element, tag: string, options?: ElementCreateOptions): Element {
    const element = this._renderer.createElement(tag);
    this._renderer.appendChild(parent, element);
    options && options.style && Object.keys(options.style).forEach(key => this._renderer.setStyle(element, key, options.style[key]));
    options && options.cssClass && this._renderer.addClass(element, options.cssClass);
    return element;
  }

  private renderDropRegions(region1: Bounds, region2: Bounds): void {
    this.renderDropRegion(this._dropRegionElement1, region1);
    this.renderDropRegion(this._dropRegionElement2, region2);
  }

  private renderDropRegion(element: Element, bounds: Bounds): void {
    if (bounds === NULL_BOUNDS) {
      this._renderer.setStyle(element, 'display', 'none');
    }
    else {
      Object.keys(bounds).forEach(key => this._renderer.setStyle(element, key, bounds[key]));
      this._renderer.removeStyle(element, 'display');
    }
  }

  public ngOnDestroy(): void {
    this._dropZoneOverlay && this._dropZoneOverlay.remove();
    this._destroy$.next();
  }

  private computeDropRegion(event: DragEvent): Region {
    const horizontalDropAreaDetectorWidth = Math.min(DROP_REGION_MAX_SIZE, this._host.clientWidth / 3);
    const verticalDropZoneHeight = Math.min(DROP_REGION_MAX_SIZE, this._host.clientHeight / 3);
    const offsetX = event.pageX - this._host.getBoundingClientRect().left;
    const offsetY = event.pageY - this._host.getBoundingClientRect().top;

    if (offsetX < horizontalDropAreaDetectorWidth) {
      return 'west';
    }
    if (offsetX > this._host.clientWidth - horizontalDropAreaDetectorWidth) {
      return 'east';
    }
    if (offsetY < verticalDropZoneHeight) {
      return 'north';
    }
    if (offsetY > this._host.clientHeight - verticalDropZoneHeight) {
      return 'south';
    }
    return 'center';
  }
}

interface ElementCreateOptions {
  cssClass?: string;
  style?: { [style: string]: any };
}

interface Bounds {
  top: string;
  right: string;
  bottom: string;
  left: string;
  background: string;
}

export interface WbViewDropEvent {
  source: DragEvent;
  region: Region;
}

export type Region = 'north' | 'east' | 'south' | 'west' | 'center';
