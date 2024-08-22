/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ApplicationRef, ComponentFactoryResolver, computed, Injectable, Injector, NgZone, signal, Signal} from '@angular/core';
import {take} from 'rxjs/operators';
import {createElement, setStyle} from '../common/dom.util';
import {ViewDragData, ViewDragService} from './view-drag.service';
import {ComponentPortal, DomPortalOutlet} from '@angular/cdk/portal';
import {subscribeInside} from '@scion/toolkit/operators';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ViewTabDragImageComponent} from '../part/view-tab-drag-image/view-tab-drag-image.component';
import {UrlSegment} from '@angular/router';
import {WorkbenchMenuItem} from '../workbench.model';
import {ViewId, WorkbenchView} from '../view/workbench-view.model';
import {VIEW_TAB_RENDERING_CONTEXT, ViewTabRenderingContext} from '../workbench.constants';
import {WorkbenchPart} from '../part/workbench-part.model';
import {Disposable} from '../common/disposable';
import {NavigationData, NavigationState} from '../routing/routing.model';
import {throwError} from '../common/throw-error.util';

export type ConstrainFn = (rect: ViewDragImageRect) => ViewDragImageRect;

/**
 * Renders a drag image during a view drag operation.
 *
 * Unlike when using the native drag image support, it allows controlling the drag image position and its size during the drag operation.
 * For instance, allows snapping the view tab into the view tab bar (drop zone) when being dragged over.
 */
@Injectable({providedIn: 'root'})
export class ViewTabDragImageRenderer {

  private _viewDragImagePortalOutlet: DomPortalOutlet | null = null;
  private _constrainDragImageRectFn: ((rect: ViewDragImageRect) => ViewDragImageRect) | null = null;

  constructor(private _viewDragService: ViewDragService,
              // TODO [Angular 19][https://github.com/angular/components/issues/24334] Alternative constructor (ComponentFactoryResolver is deprecated)
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
    const dragPosition = this.calculateDragImageRect(this._viewDragService.viewDragData!, event);

    // update the drag image position
    setStyle(this._viewDragImagePortalOutlet!.outletElement as HTMLElement, {
      left: `${dragPosition.x}px`,
      top: `${dragPosition.y}px`,
      height: `${dragPosition.height}px`,
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
    const dragPosition = this.calculateDragImageRect(dragData, event);

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
    const componentRef = this._viewDragImagePortalOutlet.attachComponentPortal(new ComponentPortal(ViewTabDragImageComponent, null, Injector.create({
      parent: this._injector,
      providers: [
        {provide: WorkbenchView, useValue: new DragImageWorkbenchView(dragData)},
        {provide: VIEW_TAB_RENDERING_CONTEXT, useValue: 'drag-image' satisfies ViewTabRenderingContext},
      ],
    })));
    // Detect for changes because constructed outside of Angular.
    componentRef.changeDetectorRef.detectChanges();
  }

  private disposeDragImage(): void {
    this._viewDragImagePortalOutlet!.dispose();
    this._viewDragImagePortalOutlet = null;
  }

  /**
   * Calculates client position and dimension for the drag image, accounting for any constraints.
   */
  public calculateDragImageRect(dragData: ViewDragData, event: DragEvent): ViewDragImageRect {
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
        takeUntilDestroyed(),
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

  public readonly id: ViewId;
  public readonly alternativeId: string | undefined;
  public readonly navigationHint: Signal<string | undefined>;
  public readonly navigationData: Signal<NavigationData>;
  public readonly navigationState: Signal<NavigationState>;
  public readonly part: Signal<WorkbenchPart>;
  public readonly title: Signal<string | null>;
  public readonly heading: Signal<string | null>;
  public readonly dirty: Signal<boolean>;
  public readonly closable: Signal<boolean>;
  public readonly destroyed = false;
  public readonly active = signal(true).asReadonly();
  public readonly blocked = false;
  public readonly cssClass = signal([]).asReadonly();
  public readonly urlSegments: Signal<UrlSegment[]>;
  public readonly first = signal(true).asReadonly();
  public readonly last = signal(true).asReadonly();
  public readonly position = signal(0).asReadonly();
  public readonly scrolledIntoView = signal(true).asReadonly();

  constructor(dragData: ViewDragData) {
    this.id = dragData.viewId;
    this.alternativeId = dragData.alternativeViewId;
    this.part = computed(() => throwError('UnsupportedOperationError'));
    this.navigationHint = signal(dragData.navigationHint).asReadonly();
    this.navigationData = signal(dragData.navigationData ?? {}).asReadonly();
    this.navigationState = signal({}).asReadonly();
    this.title = signal(dragData.viewTitle).asReadonly();
    this.heading = signal(dragData.viewHeading).asReadonly();
    this.dirty = signal(dragData.viewDirty).asReadonly();
    this.closable = signal(dragData.viewClosable).asReadonly();
    this.urlSegments = signal(dragData.viewUrlSegments).asReadonly();
  }

  public close(): Promise<boolean> {
    throw Error('[UnsupportedOperationError]');
  }

  public move(target: 'new-window' | string, options?: {region?: 'north' | 'south' | 'west' | 'east'; workbenchId?: string}): void {
    throw Error('[UnsupportedOperationError]');
  }

  public registerMenuItem(menuItem: WorkbenchMenuItem): Disposable {
    throw Error('[UnsupportedOperationError]');
  }

  public activate(): Promise<boolean> {
    throw Error('[UnsupportedOperationError]');
  }
}
