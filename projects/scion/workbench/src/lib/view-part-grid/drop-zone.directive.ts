/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Directive, ElementRef, EventEmitter, HostListener, Input, Output, Renderer2 } from '@angular/core';

/**
 * Adds drop zones to the host element, and fires upon a drop action.
 *
 * Valid drop regions are: north, east, south, west and center.
 */
@Directive({
  selector: '[wbDropZone]'
})
export class DropZoneDirective {

  private static readonly NULL_BOUNDS: Bounds = null;
  private static readonly MAX_DROP_ZONE_WIDTH = 150;
  private static readonly DROP_ZONE_GAP = 20;
  private static readonly DROP_ZONE_BGCOLOR = 'rgba(0, 0, 0, .1)';

  private _host: HTMLElement;
  private _dropZone1: HTMLElement;
  private _dropZone2: HTMLElement;

  /**
   * Specifies the drop zones to be installed.
   */
  @Input()
  public wbDropZones: Region[] = ['north', 'east', 'south', 'west', 'center'];

  /**
   * Specifies which drag events to accept for drop events.
   */
  @Input()
  public wbDropFilter: (event: DragEvent) => boolean;

  /**
   * Emits upon a drop action on a drop zone.
   */
  @Output()
  public wbDrop = new EventEmitter<DropEvent>();

  constructor(host: ElementRef, private _renderer: Renderer2) {
    this._host = host.nativeElement as HTMLElement;

    this._dropZone1 = this.createDropZone();
    this._dropZone2 = this.createDropZone();

    this.renderDropZone(this._dropZone1, DropZoneDirective.NULL_BOUNDS);
    this.renderDropZone(this._dropZone2, DropZoneDirective.NULL_BOUNDS);
  }

  @HostListener('dragover', ['$event'])
  public onDragOver(event: DragEvent): void {
    if (this.wbDropFilter && !this.wbDropFilter(event)) {
      return;
    }

    const gap = DropZoneDirective.DROP_ZONE_GAP;
    const bgcolor = DropZoneDirective.DROP_ZONE_BGCOLOR;
    const allowDrop = (): void => event.preventDefault();

    const region = this.computeDropRegion(event);
    switch (region) {
      case 'north': {
        allowDrop();
        this.renderDropZone(this._dropZone1, {
          top: '0', right: '0', bottom: `calc(50% + ${gap}px)`, left: '0',
          background: bgcolor
        });
        this.renderDropZone(this._dropZone2, {
          top: `calc(50% + ${gap}px)`, right: '0', bottom: '0', left: '0',
          background: null
        });
        break;
      }
      case 'east': {
        allowDrop();
        this.renderDropZone(this._dropZone1, {
          top: '0', right: '0', bottom: '0', left: `calc(50% + ${gap}px)`,
          background: bgcolor
        });
        this.renderDropZone(this._dropZone2, {
          top: '0', right: `calc(50% + ${gap}px)`, bottom: '0', left: '0',
          background: null
        });
        break;
      }
      case 'south': {
        allowDrop();
        this.renderDropZone(this._dropZone1, {
          top: `calc(50% + ${gap}px)`, right: '0', bottom: '0', left: '0',
          background: bgcolor
        });
        this.renderDropZone(this._dropZone2, {
          top: '0', right: '0', bottom: `calc(50% + ${gap}px)`, left: '0',
          background: null
        });
        break;
      }
      case 'west': {
        allowDrop();
        this.renderDropZone(this._dropZone1, {
          top: '0', right: `calc(50% + ${gap}px)`, bottom: '0', left: '0',
          background: bgcolor
        });
        this.renderDropZone(this._dropZone2, {
          top: '0', right: '0', bottom: '0', left: `calc(50% + ${gap}px)`,
          background: null
        });
        break;
      }
      case 'center': {
        allowDrop();
        this.renderDropZone(this._dropZone1, {top: '0', right: '0', bottom: '0', left: '0', background: bgcolor});
        this.renderDropZone(this._dropZone2, DropZoneDirective.NULL_BOUNDS);
        break;
      }
      default: {
        this.renderDropZone(this._dropZone1, DropZoneDirective.NULL_BOUNDS);
        this.renderDropZone(this._dropZone2, DropZoneDirective.NULL_BOUNDS);
        break;
      }
    }
  }

  @HostListener('dragleave')
  public onDragLeave(): void {
    this.renderDropZone(this._dropZone1, DropZoneDirective.NULL_BOUNDS);
    this.renderDropZone(this._dropZone2, DropZoneDirective.NULL_BOUNDS);
  }

  @HostListener('drop', ['$event'])
  public onDrop(event: DragEvent): void {
    if (this.wbDropFilter && !this.wbDropFilter(event)) {
      return;
    }

    event.stopPropagation();

    this.renderDropZone(this._dropZone1, DropZoneDirective.NULL_BOUNDS);
    this.renderDropZone(this._dropZone2, DropZoneDirective.NULL_BOUNDS);

    this.wbDrop.emit({
      region: this.computeDropRegion(event),
      source: event
    });
  }

  private computeDropRegion(event: DragEvent): Region | null {
    const horizontalDropZoneWidth = this.horizontalDropZoneWidth;
    const verticalDropZoneHeight = this.verticalDropZoneHeight;
    const offsetX = event.pageX - this._host.getBoundingClientRect().left;
    const offsetY = event.pageY - this._host.getBoundingClientRect().top;

    if (offsetX < horizontalDropZoneWidth) {
      return this.wbDropZones.includes('west') ? 'west' : null;
    }
    if (offsetX > this._host.clientWidth - horizontalDropZoneWidth) {
      return this.wbDropZones.includes('east') ? 'east' : null;
    }
    if (offsetY < verticalDropZoneHeight) {
      return this.wbDropZones.includes('north') ? 'north' : null;
    }
    if (offsetY > this._host.clientHeight - verticalDropZoneHeight) {
      return this.wbDropZones.includes('south') ? 'south' : null;
    }
    return this.wbDropZones.includes('center') ? 'center' : null;
  }

  private renderDropZone(dropZone: HTMLElement, bounds: Bounds): void {
    if (bounds === DropZoneDirective.NULL_BOUNDS) {
      this._renderer.setStyle(dropZone, 'display', 'none');
    } else {
      Object.getOwnPropertyNames(bounds).forEach(name => this._renderer.setStyle(dropZone, name, bounds[name]));
      this._renderer.setStyle(dropZone, 'display', 'inherit');
    }
  }

  private get horizontalDropZoneWidth(): number {
    return Math.min(DropZoneDirective.MAX_DROP_ZONE_WIDTH, this._host.clientWidth / 3);
  }

  private get verticalDropZoneHeight(): number {
    return Math.min(DropZoneDirective.MAX_DROP_ZONE_WIDTH, this._host.clientHeight / 3);
  }

  private createDropZone(): HTMLElement {
    const dropZone = this._renderer.createElement('div');
    this._renderer.addClass(dropZone, 'wb-drop-zone');
    this._renderer.setStyle(dropZone, 'position', 'absolute');
    this._renderer.setStyle(dropZone, 'pointer-events', 'none');
    this._renderer.setStyle(dropZone, 'user-select', 'none');
    this._renderer.setStyle(dropZone, 'border', '1px dashed rgba(0, 0, 0, 1)');
    this._renderer.setStyle(dropZone, 'margin', '1px');
    this._renderer.setStyle(dropZone, 'z-index', '1');
    this._renderer.setStyle(dropZone, 'transition-duration', '125ms');
    this._renderer.setStyle(dropZone, 'transition-property', 'top,right,bottom,left');
    this._renderer.setStyle(dropZone, 'transition-timing-function', 'ease-out');
    this._renderer.appendChild(this._host, dropZone);
    return dropZone;
  }
}

export type Region = 'north' | 'east' | 'south' | 'west' | 'center';

export interface DropEvent {
  source: DragEvent;
  region: Region;
}

interface Bounds {
  top: string;
  right: string;
  bottom: string;
  left: string;
  background: string;
}
