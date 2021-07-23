/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {Directive, ElementRef, EmbeddedViewRef, Input, OnDestroy, OnInit, Optional, TemplateRef, ViewContainerRef} from '@angular/core';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {WorkbenchView} from '../view/workbench-view.model';
import {fromDimension$} from '@scion/toolkit/observable';
import {setStyle} from '../dom.util';

/**
 * Renders a given template as overlay. The template will stick to the bounding box of the host element of this directive.
 */
@Directive({selector: '[wbContentProjection]'})
export class ContentProjectionDirective implements OnInit, OnDestroy {

  private _destroy$ = new Subject<void>();

  private _boundingBoxElement: HTMLElement;
  private _contentViewRef!: EmbeddedViewRef<any>;

  /**
   * Reference to the view container where to insert the overlay.
   */
  @Input('wbContentProjectionOverlayHost') // eslint-disable-line @angular-eslint/no-input-rename
  public overlayHost!: ViewContainerRef | Promise<ViewContainerRef>;

  /**
   * Template which to render as overlay. The template will stick to the bounding box of the host element of this directive.
   */
  @Input('wbContentProjectionContent') // eslint-disable-line @angular-eslint/no-input-rename
  public contentTemplateRef!: TemplateRef<void>;

  constructor(host: ElementRef<HTMLElement>, @Optional() private _view: WorkbenchView) {
    this._boundingBoxElement = host.nativeElement;
  }

  public ngOnInit(): void {
    if (!this.overlayHost) {
      throw Error('[ContentProjectionError] Missing required overlay host.');

    }
    if (!this.contentTemplateRef) {
      throw Error('[ContentProjectionError] Missing required content template.');
    }

    this.createAndProjectEmbeddedView().then();
  }

  private async createAndProjectEmbeddedView(): Promise<void> {
    this._contentViewRef = (await this.overlayHost).createEmbeddedView(this.contentTemplateRef, null);
    this._contentViewRef.detectChanges();

    // (Re-)position content each time the bounding box element changes its size.
    fromDimension$(this._boundingBoxElement)
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        this.stickContentToHostBoundingBox();
      });

    // Hide content of inactive views.
    this._view && this._view.active$
      .pipe(takeUntil(this._destroy$))
      .subscribe(active => {
        this.setVisible(active);
      });
  }

  private stickContentToHostBoundingBox(): void {
    const hostPosition: ClientRect = this._boundingBoxElement.getBoundingClientRect();
    this.styleContent({
      position: 'fixed',
      top: `${hostPosition.top}px`,
      left: `${hostPosition.left}px`,
      width: `${hostPosition.width}px`,
      height: `${hostPosition.height}px`,
    });
  }

  private setVisible(visible: boolean): void {
    this.styleContent({display: visible ? null : 'none'});
  }

  private styleContent(style: {[style: string]: any}): void {
    this._contentViewRef.rootNodes.forEach(node => setStyle(node, style));
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._contentViewRef?.destroy();
  }
}
