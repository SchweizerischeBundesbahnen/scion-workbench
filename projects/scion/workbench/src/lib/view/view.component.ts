/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { AfterViewInit, Component, ElementRef, HostBinding, OnDestroy, ViewChild } from '@angular/core';
import { InternalWorkbenchView } from '../workbench.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { SciViewportComponent } from '@scion/toolkit/viewport';
import { WbRouterOutletDirective } from '../routing/wb-router-outlet.directive';
import { WB_VIEW_HEADING_PARAM, WB_VIEW_TITLE_PARAM } from '../routing/routing-params.constants';
import { MessageBoxService } from '../message-box/message-box.service';
import { OverlayHostRef } from '../overlay-host-ref.service';
import { ContentProjectionContext } from '../content-projection/content-projection-context.service';
import { ViewMenuService } from '../view-part/view-context-menu/view-menu.service';

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
  providers: [MessageBoxService, ContentProjectionContext],
})
export class ViewComponent implements AfterViewInit, OnDestroy {

  private _destroy$ = new Subject<void>();

  @ViewChild(SciViewportComponent, {static: true})
  private _viewport: SciViewportComponent;

  @ViewChild('router_outlet', {static: true})
  public routerOutlet: WbRouterOutletDirective; // specs

  @HostBinding('attr.data-viewid')
  public get viewId(): string {
    return this._view.viewId;
  }

  @HostBinding('attr.content-projection')
  public get contentProjectionActive(): boolean {
    return this._contentProjectionContext.isActive();
  }

  @HostBinding('attr.class')
  public get cssClasses(): string {
    return this._view.cssClasses.join(' ');
  }

  constructor(host: ElementRef<HTMLElement>,
              private _view: InternalWorkbenchView,
              private _contentProjectionContext: ContentProjectionContext,
              public messageBoxOverlayHostRef: OverlayHostRef,
              messageBoxService: MessageBoxService,
              viewContextMenuService: ViewMenuService) {
    messageBoxService.count$
      .pipe(takeUntil(this._destroy$))
      .subscribe(count => this._view.blocked = count > 0);
    viewContextMenuService.installMenuItemAccelerators$(host, this._view)
      .pipe(takeUntil(this._destroy$))
      .subscribe();
  }

  public ngAfterViewInit(): void {
    this._view.active$
      .pipe(takeUntil(this._destroy$))
      .subscribe(active => active ? this.onActivateView() : this.onDeactivateView());
  }

  private onActivateView(): void {
    this._viewport.focus();
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
