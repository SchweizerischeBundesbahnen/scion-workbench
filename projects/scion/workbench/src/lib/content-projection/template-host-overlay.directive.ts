/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { AfterViewInit, Directive, DoCheck, ElementRef, EmbeddedViewRef, EventEmitter, Input, KeyValueDiffer, KeyValueDiffers, OnDestroy, OnInit, Optional, Output, Renderer2, TemplateRef, ViewContainerRef } from '@angular/core';
import { WorkbenchView } from '../workbench.model';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { WorkbenchActivityPartService } from '../activity-part/workbench-activity-part.service';
import { combineLatest, Subject } from 'rxjs';
import { WorkbenchLayoutService } from '../workbench-layout.service';

/**
 * Instantiates an Embedded View based on the {@link TemplateRef `templateRef`}, appends it
 * to a top-level workbench DOM element and aligns its boundaries to snap with this directive's host element.
 */
@Directive({selector: '[wbTemplateHostOverlay]'})
export class TemplateHostOverlayDirective implements OnInit, AfterViewInit, DoCheck, OnDestroy {

  private _destroy$ = new Subject<void>();

  private _whenViewRef: Promise<EmbeddedViewRef<void>>;
  private _viewRefResolveFn: (viewRef: EmbeddedViewRef<void>) => void;

  private _host: Element;
  private _positionDiffer: KeyValueDiffer<string, any>;

  /**
   * The template to create an overlay for.
   */
  @Input('wbTemplate') // tslint:disable-line:no-input-rename
  public templateRef: TemplateRef<void>;

  /**
   * The host to attach the template overlay.
   */
  @Input('wbOverlayHost') // tslint:disable-line:no-input-rename
  public overlayHost: ViewContainerRef;

  /**
   * Emits the {ViewRef} of the template.
   */
  @Output('wbTemplateViewRef') // tslint:disable-line:no-output-rename
  public templateViewRef = new EventEmitter<EmbeddedViewRef<void>>();

  constructor(host: ElementRef,
              differs: KeyValueDiffers,
              private _vcr: ViewContainerRef,
              private _renderer: Renderer2,
              @Optional() view: WorkbenchView,
              route: ActivatedRoute,
              activityPartService: WorkbenchActivityPartService,
              workbenchLayoutService: WorkbenchLayoutService) {
    this._host = host.nativeElement as Element;
    this._positionDiffer = differs.find({}).create();
    this._whenViewRef = new Promise<EmbeddedViewRef<void>>(resolve => this._viewRefResolveFn = resolve); // tslint:disable-line:typedef

    this.installViewActiveListener(view);
    this.installActivityActiveListener(activityPartService, route, workbenchLayoutService);
    this.setViewRefStyle({position: 'fixed'});
  }

  public ngOnInit(): void {
    const overlayHost = this.overlayHost || this._vcr;
    const viewRef = overlayHost.createEmbeddedView(this.templateRef, null);
    viewRef.detectChanges();

    this._viewRefResolveFn(viewRef);
    this.templateViewRef.emit(viewRef);
  }

  public ngAfterViewInit(): void {
    this.adjustViewBounds();
  }

  public ngDoCheck(): void {
    this.adjustViewBounds();
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._whenViewRef.then(viewRef => viewRef.destroy());
  }

  private adjustViewBounds(): void {
    // Position the template within the host's bounding box
    const position: ClientRect = this._host.getBoundingClientRect();
    const style = {
      top: `${position.top}px`,
      left: `${position.left}px`,
      width: `${position.width}px`,
      height: `${position.height}px`,
    };

    // Performance optimization: set new style object only if its content changed
    if (this._positionDiffer.diff(style)) {
      this.setViewRefStyle(style);
    }
  }

  private setViewRefStyle(style: { [style: string]: any }): void {
    this._whenViewRef.then(viewRef => {
      viewRef.rootNodes.forEach(node => {
        Object.keys(style).forEach(key => this._renderer.setStyle(node, key, style[key]));
      });
    });
  }

  private installActivityActiveListener(activityService: WorkbenchActivityPartService, route: ActivatedRoute, workbenchLayoutService: WorkbenchLayoutService): void {
    const activity = activityService.getActivityFromRoutingContext(route.snapshot);
    activity && combineLatest([activity.active$, workbenchLayoutService.maximized$])
      .pipe(takeUntil(this._destroy$))
      .subscribe(([active, maximized]) => this.setViewRefStyle({display: active && !maximized ? null : 'none'}));
  }

  private installViewActiveListener(view: WorkbenchView): void {
    view && view.active$
      .pipe(takeUntil(this._destroy$))
      .subscribe(active => this.setViewRefStyle({display: active ? null : 'none'}));
  }
}
