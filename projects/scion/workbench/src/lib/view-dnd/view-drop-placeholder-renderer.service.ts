/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {inject, Injectable, NgZone} from '@angular/core';
import {createElement, setStyle} from '../common/dom.util';
import {ViewDragService} from './view-drag.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {subscribeIn} from '@scion/toolkit/operators';
import {VIEW_DROP_ZONE_OVERLAY_HOST} from '../content-projection/workbench-element-references';
import {filter} from 'rxjs/operators';
import {merge} from 'rxjs';

/**
 * Renders the visual placeholder when dragging a view over a valid drop zone.
 *
 * To animate the transition of the placeholder, we use a single HTML element for the placeholder and
 * adjust its position when the drop zone changes.
 */
@Injectable({providedIn: 'root'})
export class ViewDropPlaceholderRenderer {

  private _dropPlaceholderOverlayHost = inject(VIEW_DROP_ZONE_OVERLAY_HOST);
  private _dropPlaceholder: HTMLElement | null = null;

  constructor(private _viewDragService: ViewDragService, private _zone: NgZone) {
    this.installDropPlaceholderDisposer();
  }

  /**
   * Repositions the placeholder, or creates it if not created yet.
   *
   * @param referenceElement - Specifies the element that serves as the reference point for positioning the placeholder.
   * @param inset - Specifies the spacing between the placeholder and the boundaries of the reference element.
   */
  public updatePosition(referenceElement: HTMLElement, inset: {top: number; right: number; bottom: number; left: number}): void {
    this._dropPlaceholder ??= this.createDropPlaceholder();
    const referenceElementBounds = referenceElement.getBoundingClientRect();

    setStyle(this._dropPlaceholder, {
      top: `${referenceElementBounds.top + inset.top}px`,
      left: `${referenceElementBounds.left + inset.left}px`,
      width: `${referenceElement.clientWidth - inset.left - inset.right}px`,
      height: `${referenceElement.clientHeight - inset.top - inset.bottom}px`,
    });
  }

  private createDropPlaceholder(): HTMLElement {
    return createElement('div', {
      parent: this._dropPlaceholderOverlayHost()!.element.nativeElement,
      style: {
        'position': 'fixed',
        'background-color': 'var(--sci-workbench-part-dropzone-background-color)',
        'border': '1px var(--sci-workbench-part-dropzone-border-style) var(--sci-workbench-part-dropzone-border-color)',
        'border-radius': 'var(--sci-workbench-part-dropzone-border-radius)',
        'pointer-events': 'none',
        'transition-duration': '125ms',
        'transition-property': 'top,left,width,height',
        'transition-timing-function': 'ease-out',
      },
    });
  }

  /**
   * Disposes the drop placeholder in the following events:
   *
   * - When the user drags a view over the tab bar, as the tabbar takes precedence over the drop zones.
   * - When the user drags a view over a non-valid drop target, such as outside the workbench.
   * - When the user drags a view out of the window, cancels or completes the drag operation.
   */
  private installDropPlaceholderDisposer(): void {
    const tabbarDragOver$ = this._viewDragService.tabbarDragOver$.pipe(filter(Boolean));
    const nonDropTargetDragOver$ = this._viewDragService.viewDrag$(window, {eventType: 'dragover'}).pipe(filter(event => !event.defaultPrevented));
    const dragEnd$ = this._viewDragService.viewDrag$(window, {eventType: ['dragend', 'drop', 'dragleave']});

    merge(tabbarDragOver$, nonDropTargetDragOver$, dragEnd$)
      .pipe(
        subscribeIn(fn => this._zone.runOutsideAngular(fn)),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this._dropPlaceholder?.remove();
        this._dropPlaceholder = null;
      });
  }
}
