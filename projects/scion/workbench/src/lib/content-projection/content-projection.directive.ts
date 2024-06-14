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
import {ɵWorkbenchView} from '../view/ɵworkbench-view.model';
import {fromDimension$} from '@scion/toolkit/observable';
import {setStyle} from '../common/dom.util';
import {animationFrameScheduler, EMPTY, merge, Subject} from 'rxjs';
import {filter, observeOn, takeUntil} from 'rxjs/operators';

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

  constructor(private _host: ElementRef<HTMLElement>, @Optional() private _view: ɵWorkbenchView) {
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

    // Align content each time the size of the host element changes, or when the content is attached to the DOM.
    // For example, moving a view to another part of the same size will not trigger a dimension change event.
    merge(fromDimension$(this._host.nativeElement), this._view?.portal.attached$.pipe(filter(Boolean)) ?? EMPTY)
      .pipe(
        observeOn(animationFrameScheduler), // Align to host boundaries right before the next repaint.
        takeUntil(dispose$),
      )
      .subscribe(() => {
        this.alignContentToHostBoundaries();
      });

    // Hide content when contextual view is detached, e.g., if not active, or located in the peripheral area and the main area is maximized.
    this._view?.portal.attached$
      .pipe(takeUntil(dispose$))
      .subscribe(attached => {
        this.setVisible(attached);
      });
  }

  /**
   * Aligns the content of the projection to the boundaries of the host element.
   */
  private alignContentToHostBoundaries(): void {
    const hostPosition: DOMRect = this._host.nativeElement.getBoundingClientRect();
    if (!hostPosition.width && !hostPosition.height) {
      // When removing the bounding box element (this directive's host) from the DOM, its dimension drops to 0.
      // We ignore this event to preserve the dimension of projected content, crucial, for example, if projected
      // content implements virtual scrolling. Otherwise, its content would reload when adding the host to the DOM again.
      // For example, inactive views are removed from the DOM.
      return;
    }

    this.styleContent({
      top: `${hostPosition.top}px`,
      left: `${hostPosition.left}px`,
      width: `${hostPosition.width}px`,
      height: `${hostPosition.height}px`,
    });
  }

  private setVisible(visible: boolean): void {
    // We use `visibility: hidden` and not `display: none` to preserve the dimension of projected content.
    // Otherwise:
    // - Projected content would flicker when attaching the contextual view, most noticeable with content that displays a microfrontend.
    // - Projected content would not retain virtual scrollable content since `display:none` sets width and height to 0.
    this.styleContent({visibility: visible ? null : 'hidden'});
  }

  private styleContent(style: {[style: string]: any}): void {
    this._contentViewRef!.rootNodes.forEach(node => setStyle(node, style));
  }

  public ngOnDestroy(): void {
    this._contentViewRef?.destroy();
  }
}
