/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ApplicationRef, computed, inject, Injectable, Injector, NgZone, signal, Signal} from '@angular/core';
import {take} from 'rxjs/operators';
import {createElement, setStyle} from '../common/dom.util';
import {ViewDragData, ViewDragService} from './view-drag.service';
import {ComponentPortal, DomPortalOutlet} from '@angular/cdk/portal';
import {subscribeIn} from '@scion/toolkit/operators';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ViewTabDragImageComponent} from '../part/view-tab-drag-image/view-tab-drag-image.component';
import {UrlSegment} from '@angular/router';
import {CanCloseFn, CanCloseRef, WorkbenchMenuItem} from '../workbench.model';
import {ViewId, WorkbenchView, WorkbenchViewNavigation} from '../view/workbench-view.model';
import {VIEW_TAB_RENDERING_CONTEXT, ViewTabRenderingContext} from '../workbench.constants';
import {WorkbenchPart} from '../part/workbench-part.model';
import {Disposable} from '../common/disposable';
import {NavigationData, NavigationState} from '../routing/routing.model';
import {throwError} from '../common/throw-error.util';
import {UUID} from '@scion/toolkit/uuid';

export type ConstrainFn = (rect: DOMRect) => DOMRect;

/**
 * Renders a drag image during a view drag operation.
 *
 * Unlike when using the native drag image support, it allows controlling the drag image position and its size during the drag operation.
 * For instance, allows snapping the view tab into the view tab bar (drop zone) when being dragged over.
 */
@Injectable({providedIn: 'root'})
export class ViewTabDragImageRenderer {

  private readonly _viewDragService = inject(ViewDragService);
  private readonly _applicationRef = inject(ApplicationRef);
  private readonly _injector = inject(Injector);
  private readonly _zone = inject(NgZone);

  private _viewDragImagePortalOutlet: DomPortalOutlet | null = null;
  private _constrainDragImageRectFn: ConstrainFn | null = null;

  constructor() {
    this.installWindowViewDragListener();
  }

  /**
   * Allows to constrain the position and dimension of the drag image during a view drag operation.
   */
  public setConstrainDragImageRectFn(fn: ConstrainFn): void {
    this._constrainDragImageRectFn = fn;
  }

  /**
   * Unsets the drag image constrain function, if registered.
   */
  public unsetConstrainDragImageRectFn(fn: ConstrainFn): void {
    if (fn === this._constrainDragImageRectFn) {
      this._constrainDragImageRectFn = null;
    }
  }

  private onWindowDragStart(event: DragEvent): void {
    this.createDragImage(event);
  }

  private onWindowDragEnd(): void {
    this.disposeDragImage();
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
    const dragPosition = this.calculateDragImageRect(this._viewDragService.viewDragData()!, event);

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

    const dragData = this._viewDragService.viewDragData()!;
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
    this._viewDragImagePortalOutlet = new DomPortalOutlet(outletElement, null, this._applicationRef, this._injector);
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
    this._viewDragImagePortalOutlet?.dispose();
    this._viewDragImagePortalOutlet = null;
  }

  /**
   * Calculates client position and dimension for the drag image, accounting for any constraints.
   */
  public calculateDragImageRect(dragData: ViewDragData, event: DragEvent): DOMRect {
    const rect = new DOMRect(
      event.clientX - dragData.viewTabPointerOffsetX,
      event.clientY - dragData.viewTabPointerOffsetY,
      dragData.viewTabWidth,
      dragData.viewTabHeight,
    );
    return this._constrainDragImageRectFn ? this._constrainDragImageRectFn(rect) : rect;
  }

  private installWindowViewDragListener(): void {
    this._viewDragService.viewDrag$(window)
      .pipe(
        subscribeIn(fn => this._zone.runOutsideAngular(fn)),
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
          case 'dragend':
            this.onWindowDragEnd();
            break;
        }
      });
  }
}

class DragImageWorkbenchView implements WorkbenchView {

  public readonly id: ViewId;
  public readonly alternativeId: string | undefined;
  public readonly navigation: Signal<WorkbenchViewNavigation | undefined>;
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
    this.navigation = signal(dragData.navigation && {...dragData.navigation, id: UUID.randomUUID()});
    this.navigationHint = computed(() => this.navigation()?.hint);
    this.navigationData = computed(() => this.navigation()?.data ?? {});
    this.navigationState = computed(() => this.navigation()?.state ?? {});
    this.urlSegments = computed(() => this.navigation()?.path ?? []);
    this.title = signal(dragData.viewTitle).asReadonly();
    this.heading = signal(dragData.viewHeading).asReadonly();
    this.dirty = signal(dragData.viewDirty).asReadonly();
    this.closable = signal(dragData.viewClosable).asReadonly();
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

  public canClose(canClose: CanCloseFn): CanCloseRef {
    throw Error('[UnsupportedOperationError]');
  }
}
