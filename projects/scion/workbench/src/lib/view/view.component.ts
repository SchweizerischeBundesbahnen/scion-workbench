/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { AfterViewInit, Component, HostBinding, OnDestroy, ViewChild } from '@angular/core';
import { InternalWorkbenchView } from '../workbench.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { SciViewportComponent } from '../ui/viewport/viewport.component';
import { WbRouterOutletDirective } from '../routing/wb-router-outlet.directive';
import { WB_VIEW_HEADING_PARAM, WB_VIEW_TITLE_PARAM } from '../routing/routing-params.constants';
import { MessageBoxService } from '../message-box/message-box.service';
import { OverlayHostRef } from '../overlay-host-ref.service';

/**
 * Is the graphical representation of a workbench view.
 *
 * The view has its dedicated router outlet to display view content. Use route path parameters
 * to decide what specific content to present. Use matrix parameters to associate optional data
 * with the view outlet URL.
 *
 * Title and heading of this view are either set via `WorkbenchView`, or given as route data or matrix parameter.
 */
@Component({
  selector: 'wb-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  providers: [MessageBoxService]
})
export class ViewComponent implements AfterViewInit, OnDestroy {

  private _destroy$ = new Subject<void>();

  @ViewChild(SciViewportComponent)
  private _viewport: SciViewportComponent;

  @ViewChild('router_outlet')
  public routerOutlet: WbRouterOutletDirective; // specs

  @HostBinding('attr.id')
  public get id(): string {
    return this._view.viewRef; // specs
  }

  constructor(private _view: InternalWorkbenchView,
              private _messageBoxService: MessageBoxService,
              public messageBoxOverlayHostRef: OverlayHostRef) {
    this._messageBoxService.count$
      .pipe(takeUntil(this._destroy$))
      .subscribe(count => this._view.disabled = count > 0);
  }

  public ngAfterViewInit(): void {
    this._view.active$
      .pipe(takeUntil(this._destroy$))
      .subscribe(active => active ? this.onActivateView() : this.onDeactivateView());
  }

  private onActivateView(): void {
    this._viewport.viewportElement.focus();
    this._viewport.scrollTop = this._view.scrollTop;
    this._viewport.scrollLeft = this._view.scrollLeft;
  }

  private onDeactivateView(): void {
    this._view.scrollTop = this._viewport.scrollTop;
    this._view.scrollLeft = this._viewport.scrollLeft;
  }

  public onActivateRoute(route: ActivatedRoute): void {
    const params = route.snapshot.params;
    const data = route.snapshot.data;

    if (params[WB_VIEW_TITLE_PARAM] || data[WB_VIEW_TITLE_PARAM]) {
      this._view.title = params[WB_VIEW_TITLE_PARAM] || data[WB_VIEW_TITLE_PARAM];
    }
    if (params[WB_VIEW_HEADING_PARAM] || data[WB_VIEW_HEADING_PARAM]) {
      this._view.heading = params[WB_VIEW_HEADING_PARAM] || data[WB_VIEW_HEADING_PARAM];
    }
  }

  public onDeactivateRoute(): void {
    this._view.heading = null;
    this._view.title = null;
    this._view.dirty = false;
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
