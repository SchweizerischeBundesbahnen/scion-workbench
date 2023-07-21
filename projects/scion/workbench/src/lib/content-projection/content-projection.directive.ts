/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Directive, ElementRef, EmbeddedViewRef, Input, OnChanges, OnDestroy, Optional, SimpleChanges, TemplateRef, ViewContainerRef} from '@angular/core';
import {WorkbenchView} from '../view/workbench-view.model';
import {Dimension, fromDimension$} from '@scion/toolkit/observable';
import {setStyle} from '../common/dom.util';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

/**
 * Renders a given template as overlay. The template will stick to the bounding box of the host element of this directive.
 */
@Directive({selector: '[wbContentProjection]', standalone: true})
export class ContentProjectionDirective implements OnChanges, OnDestroy {

  private _contentViewRef: EmbeddedViewRef<unknown> | undefined;

  /**
   * Reference to the view container where to insert the overlay.
   */
  @Input({alias: 'wbContentProjectionOverlayHost', required: true}) // eslint-disable-line @angular-eslint/no-input-rename
  public overlayHost: ViewContainerRef | undefined | null;

  /**
   * Template which to render as overlay. The template will stick to the bounding box of the host element of this directive.
   */
  @Input({alias: 'wbContentProjectionContent', required: true}) // eslint-disable-line @angular-eslint/no-input-rename
  public contentTemplateRef!: TemplateRef<void>;

  constructor(private _host: ElementRef<HTMLElement>, @Optional() private _view: WorkbenchView) {
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this._contentViewRef?.destroy();

    if (!this.overlayHost) {
      return;
    }

    // Create embedded view from content template and align it to the bounds of the host element.
    this._contentViewRef = this.overlayHost.createEmbeddedView(this.contentTemplateRef, null);
    this._contentViewRef.detectChanges();

    // Register dispose notifier.
    const dispose$ = new Subject<void>();
    this._contentViewRef.onDestroy(() => dispose$.next());

    // Position projected content out of the document flow relative to the page viewport.
    this.styleContent({position: 'fixed'});

    // Align content each time the bounding box element changes its size.
    fromDimension$(this._host.nativeElement)
      .pipe(takeUntil(dispose$))
      .subscribe(dimension => {
        if (isNullDimension(dimension)) {
          // When removing the bounding box element (this directive's host) from the DOM, its dimension drops to 0.
          // We ignore this event to preserve the dimension of projected content, crucial, for example, if projected
          // content implements virtual scrolling. Otherwise, its content would reload when adding the host to the DOM again.
          // For example, inactive views are removed from the DOM.
          return;
        }
        this.alignContentToHostBoundaries();
      });

    // Hide content of inactive views.
    this._view?.active$
      .pipe(takeUntil(dispose$))
      .subscribe(active => {
        this.setVisible(active);
      });
  }

  /**
   * Aligns the content of the projection to the boundaries of the host element.
   */
  private alignContentToHostBoundaries(): void {
    const hostPosition: DOMRect = this._host.nativeElement.getBoundingClientRect();
    this.styleContent({
      top: `${hostPosition.top}px`,
      left: `${hostPosition.left}px`,
      width: `${hostPosition.width}px`,
      height: `${hostPosition.height}px`,
    });
  }

  private setVisible(visible: boolean): void {
    // We use `visibility: hidden` over `display: none` to preserve the dimension of projected content, crucial,
    // for example, if projected content implements virtual scrolling. This is because "display:none" sets width
    // and height to 0.
    this.styleContent({visibility: visible ? null : 'hidden'});
  }

  private styleContent(style: {[style: string]: any}): void {
    this._contentViewRef!.rootNodes.forEach(node => setStyle(node, style));
  }

  public ngOnDestroy(): void {
    this._contentViewRef?.destroy();
  }
}

function isNullDimension(dimension: Dimension): boolean {
  return dimension.offsetWidth === 0 && dimension.offsetHeight === 0;
}
