/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ApplicationRef, ComponentFactoryResolver, Injectable, Injector, NgZone, OnDestroy} from '@angular/core';
import {of, Subject} from 'rxjs';
import {take, takeUntil} from 'rxjs/operators';
import {createElement, setStyle} from '../dom.util';
import {ViewDragData, ViewDragService} from './view-drag.service';
import {ComponentPortal, DomPortalOutlet} from '@angular/cdk/portal';
import {ViewTabContentComponent} from '../view-part/view-tab-content/view-tab-content.component';
import {WorkbenchMenuItem} from '../workbench.model';
import {WorkbenchModuleConfig} from '../workbench-module-config';
import {VIEW_TAB_CONTEXT} from '../workbench.constants';
import {UrlSegment} from '@angular/router';
import {Disposable} from '../disposable';
import {WorkbenchView} from '../view/workbench-view.model';
import {WorkbenchViewPart} from '../view-part/workbench-view-part.model';
import {subscribeInside} from '@scion/toolkit/operators';

export type ConstrainFn = (rect: ViewDragImageRect) => ViewDragImageRect;

/**
 * Renders a drag image during a view drag operation.
 *
 * Unlike when using the native drag image support, it allows controlling the drag image position and its size during the drag operation.
 * For instance, allows snapping the view tab into the view tab bar (drop zone) when being dragged over.
 */
@Injectable()
export class ViewTabDragImageRenderer implements OnDestroy {

  private _destroy$ = new Subject<void>();
  private _viewDragImagePortalOutlet: DomPortalOutlet | null = null;
  private _constrainDragImageRectFn: ((rect: ViewDragImageRect) => ViewDragImageRect) | null = null;

  constructor(private _viewDragService: ViewDragService,
              private _workbenchModuleConfig: WorkbenchModuleConfig,
              // TODO [Angular 16][https://github.com/angular/components/issues/24334] Alternative constructor (ComponentFactoryResolver is deprecated)
              private _componentFactoryResolver: ComponentFactoryResolver,
              private _applicationRef: ApplicationRef,
              private _injector: Injector,
              private _zone: NgZone) {
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
      this._constrainDragImageRectFn = null;
    }
  }

  private onWindowDragStart(event: DragEvent): void {
    this.createDragImage(event);
  }

  /**
   * Method invoked when dragging a view into the current window. It is invoked outside the Angular zone.
   *
   * If the user starts the drag operation in the current window, this method is invoked immediately,
   * or when dragging the view tab into this window if started the drag operation in another window.
   */
  private onWindowDragEnter(event: DragEvent): void {
    this.createDragImage(event);
  }

  /**
   * Method invoked while dragging a view over the current window. It is invoked outside the Angular zone.
   */
  private onWindowDragOver(event: DragEvent): void {
    const dragPosition = this.computeDragImageRect(this._viewDragService.viewDragData!, event);

    // update the drag image position
    setStyle(this._viewDragImagePortalOutlet!.outletElement as HTMLElement, {
      left: `${dragPosition.x}px`,
      top: `${dragPosition.y}px`,
    });
  }

  /**
   * Method invoked when the drag operation ends for the current window, which is when the user drags the view tab outside of
   * the current window or when the user cancels the drag operation (e.g., by pressing the escape key).
   */
  private onWindowDragLeave(): void {
    this.disposeDragImage();
  }

  /**
   * Method invoked when the drag operation ends for the current window which is when the user drops the view.
   */
  private onWindowDrop(): void {
    // Wait for the zone to stabilize before disposing the tab drag image. Otherwise, the tabbar would flicker
    // because the tab has not yet been rendered at its new position.
    this._zone.onStable
      .pipe(take(1))
      .subscribe(() => {
        this.disposeDragImage();
      });
  }

  private createDragImage(event: DragEvent): void {
    if (this._viewDragImagePortalOutlet) {
      return;
    }

    const dragData = this._viewDragService.viewDragData!;
    const dragPosition = this.computeDragImageRect(dragData, event);

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
    const componentRef = this._viewDragImagePortalOutlet.attachComponentPortal(this.createViewTabContentPortal(dragData));
    componentRef.changeDetectorRef.detectChanges();
  }

  private disposeDragImage(): void {
    this._viewDragImagePortalOutlet!.dispose();
    this._viewDragImagePortalOutlet = null;
  }

  /**
   * Computes the drag image client position and dimension, accounting for any constraints.
   */
  public computeDragImageRect(dragData: ViewDragData, event: DragEvent): ViewDragImageRect {
    const rect = new ViewDragImageRect({
      x: event.clientX - dragData.viewTabPointerOffsetX,
      y: event.clientY - dragData.viewTabPointerOffsetY,
      height: dragData.viewTabHeight,
      width: dragData.viewTabWidth,
    });
    return this._constrainDragImageRectFn ? this._constrainDragImageRectFn(rect) : rect;
  }

  private installWindowViewDragListener(): void {
    this._viewDragService.viewDrag$(window)
      .pipe(
        subscribeInside(fn => this._zone.runOutsideAngular(fn)),
        takeUntil(this._destroy$),
      )
      .subscribe((event: DragEvent) => {
        switch (event.type) {
          case 'dragstart':
            this.onWindowDragStart(event);
            break;
          case 'dragenter':
            this.onWindowDragEnter(event);
            break;
          case 'dragover':
            this.onWindowDragOver(event);
            break;
          case 'dragleave':
            this.onWindowDragLeave();
            break;
          case 'drop':
            this.onWindowDrop();
            break;
        }
      });
  }

  private createViewTabContentPortal(viewDragData: ViewDragData): ComponentPortal<any> {
    const injector = Injector.create({
      parent: this._injector,
      providers: [
        {provide: WorkbenchView, useValue: new DragImageWorkbenchView(viewDragData)},
        {provide: VIEW_TAB_CONTEXT, useValue: 'drag-image'},
      ],
    });

    return new ComponentPortal(this._workbenchModuleConfig.viewTabComponent || ViewTabContentComponent, null, injector);
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}

/**
 * Represents the position and dimension of the drag image.
 */
export class ViewDragImageRect {

  /**
   * Coordinate of the top left corner of the drag image in the "client" coordinate system.
   */
  public readonly x!: number;
  /**
   * Coordinate of the top left corner of the drag image in the "client" coordinate system.
   */
  public readonly y!: number;
  /**
   * Height of the drag image.
   */
  public readonly height!: number;
  /**
   * Width of the drag image.
   */
  public readonly width!: number;

  constructor(rect: Omit<ViewDragImageRect, 'left' | 'right'>) {
    Object.assign(this, rect);
  }

  public get left(): number {
    return this.x;
  }

  public get right(): number {
    return this.x + this.width;
  }
}

class DragImageWorkbenchView implements WorkbenchView {

  public readonly viewId: string;
  public readonly title: string;
  public readonly heading: string;
  public readonly closable: boolean;
  public readonly dirty: boolean;
  public readonly destroyed = false;
  public readonly active$ = of(true);
  public readonly active = true;
  public readonly blocked = false;
  public readonly cssClasses = [];
  public readonly urlSegments: UrlSegment[];
  public readonly first = true;
  public readonly last = true;
  public readonly position = 0;
  public readonly scrolledIntoView = true;

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

  public get part(): WorkbenchViewPart {
    throw Error('[UnsupportedOperationError]');
  }
}
