/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { ApplicationRef, ComponentFactoryResolver, Injectable, Injector, OnDestroy } from '@angular/core';
import { EMPTY, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { createElement, setStyle } from '../dom.util';
import { ViewDragData, ViewDragService } from './view-drag.service';
import { ComponentPortal, DomPortalOutlet, PortalInjector } from '@angular/cdk/portal';
import { ViewTabContentComponent } from '../view-part/view-tab-content/view-tab-content.component';
import { WorkbenchMenuItem, WorkbenchView } from '../workbench.model';
import { WorkbenchConfig } from '../workbench.config';
import { VIEW_TAB_CONTEXT } from '../workbench.constants';
import { UrlSegment } from '@angular/router';
import { Disposable } from '../disposable';

export type ConstrainFn = (rect: ViewDragImageRect) => ViewDragImageRect;

/**
 * Renders a drag image during a view drag operation.
 *
 * Unlike when using the native drag image support, it allows controlling the drag image position and its size during the drag operation.
 * For instance, allows snapping the view tab into the view tab bar (drop zone) when being dragged over.
 */
@Injectable({providedIn: 'root'})
export class ViewTabDragImageRenderer implements OnDestroy {

  private _destroy$ = new Subject<void>();
  private _viewDragImagePortalOutlet: DomPortalOutlet;
  private _constrainDragImageRectFn: (rect: ViewDragImageRect) => ViewDragImageRect;
  private _dragData: ViewDragData;

  constructor(private _viewDragService: ViewDragService,
              private _config: WorkbenchConfig,
              private _componentFactoryResolver: ComponentFactoryResolver,
              private _applicationRef: ApplicationRef,
              private _injector: Injector) {
    this.installWindowViewDragListener();
  }

  /**
   * Allows to constrain the position and dimension of the drag image during a view drag operation.
   */
  public setConstrainDragImageRectFn(fn: (rect: ViewDragImageRect) => ViewDragImageRect): void {
    this._constrainDragImageRectFn = fn;
  }

  /**
   * Unsets the drag image constrain function, if registered.
   */
  public unsetConstrainDragImageRectFn(fn: (rect: ViewDragImageRect) => ViewDragImageRect): void {
    if (fn === this._constrainDragImageRectFn) {
      this._constrainDragImageRectFn = undefined;
    }
  }

  /**
   * Method invoked when dragging a view into the current window. It is invoked ouside of the Angular zone.
   *
   * If the user starts the drag operation in the current window, this method is invoked immediately,
   * or when dragging the view tab into this window if started the drag operation in another window.
   */
  private onWindowDragEnter(event: DragEvent): void {
    this._dragData = this._viewDragService.getViewDragData();
    const dragPosition = this.computeDragImageRect(this._dragData, event);

    // create the drag image
    const outletElement = createElement('div', {
      parent: document.body,
      cssClass: 'wb-view-tab-drag-image',
      style: {
        left: `${dragPosition.x}px`,
        top: `${dragPosition.y}px`,
        width: `${dragPosition.width}px`,
        height: `${dragPosition.height}px`,
      },
    });
    this._viewDragImagePortalOutlet = new DomPortalOutlet(outletElement, this._componentFactoryResolver, this._applicationRef, this._injector);
    const componentRef = this._viewDragImagePortalOutlet.attachComponentPortal(this.createViewTabContentPortal());
    componentRef.changeDetectorRef.detectChanges();
  }

  /**
   * Method invoked while dragging a view over the current window. It is invoked ouside of the Angular zone.
   */
  private onWindowDragOver(event: DragEvent): void {
    const dragPosition = this.computeDragImageRect(this._dragData, event);

    // update the drag image position
    setStyle(this._viewDragImagePortalOutlet.outletElement as HTMLElement, {
      left: `${dragPosition.x}px`,
      top: `${dragPosition.y}px`,
    });
  }

  /**
   * Method invoked when the drag operation ends for the current window, which is when the user drops the view,
   * or cancels the drag operation (e.g., by pressing escape key), or if the user drags the view tab outside of
   * the current window.
   */
  private onWindowDragLeave(): void {
    this._viewDragImagePortalOutlet.dispose();
    this._viewDragImagePortalOutlet = null;
    this._dragData = null;
  }

  /**
   * Gets the drag image client position and dimension, accounting for any constraints.
   */
  private computeDragImageRect(dragData: ViewDragData, event: DragEvent): ViewDragImageRect {
    const rect: ViewDragImageRect = {
      x: event.clientX - dragData.viewTabPointerOffsetX,
      y: event.clientY - dragData.viewTabPointerOffsetY,
      height: dragData.viewTabHeight,
      width: dragData.viewTabWidth,
    };
    return this._constrainDragImageRectFn ? this._constrainDragImageRectFn(rect) : rect;
  }

  private installWindowViewDragListener(): void {
    this._viewDragService.viewDrag$(window, {emitOutsideAngular: true})
      .pipe(takeUntil(this._destroy$))
      .subscribe((event: DragEvent) => {
        switch (event.type) {
          case 'dragenter':
            this.onWindowDragEnter(event);
            break;
          case 'dragover':
            this.onWindowDragOver(event);
            break;
          case 'dragleave':
          case 'drop':
            this.onWindowDragLeave();
            break;
        }
      });
  }

  private createViewTabContentPortal(): ComponentPortal<any> {
    const injector = new PortalInjector(
      this._injector,
      new WeakMap()
        .set(WorkbenchView, new DragImageWorkbenchView(this._dragData))
        .set(VIEW_TAB_CONTEXT, 'drag-image'),
    );
    return new ComponentPortal(this._config.viewTabComponent || ViewTabContentComponent, null, injector);
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}

/**
 * Represents the position and dimension of the drag image.
 */
export interface ViewDragImageRect {
  /**
   * Coordinate of the top left corner of the drag image in the "client" coordinate system.
   */
  x: number;
  /**
   * Coordinate of the top left corner of the drag image in the "client" coordinate system.
   */
  y: number;
  /**
   * Height of the drag image.
   */
  height: number;
  /**
   * Width of the drag image.
   */
  width: number;
}

class DragImageWorkbenchView implements WorkbenchView {

  public readonly viewId: string;
  public readonly title: string;
  public readonly heading: string;
  public readonly part = null;
  public readonly closable: boolean;
  public readonly dirty: boolean;
  public readonly destroyed = false;
  public readonly active$ = of(true);
  public readonly active = true;
  public readonly blocked = false;
  public readonly cssClasses = [];
  public readonly urlSegments: UrlSegment[];
  public readonly viewMenuItems$ = EMPTY;
  public readonly first = true;
  public readonly last = true;
  public readonly position = 0;

  constructor(dragData: ViewDragData) {
    this.viewId = dragData.viewId;
    this.title = dragData.viewTitle;
    this.heading = dragData.viewHeading;
    this.closable = dragData.viewClosable;
    this.dirty = dragData.viewDirty;
    this.urlSegments = dragData.viewUrlSegments;
  }

  public close(): Promise<boolean> {
    throw Error('[UnsupportedOperationError]');
  }

  public move(region: 'north' | 'south' | 'west' | 'east'): Promise<boolean> {
    throw Error('[UnsupportedOperationError]');
  }

  public set cssClass(cssClass: string | string[]) {
    throw Error('[UnsupportedOperationError]');
  }

  public registerMenuItem(menuItem: WorkbenchMenuItem): Disposable {
    throw Error('[UnsupportedOperationError]');
  }
}
