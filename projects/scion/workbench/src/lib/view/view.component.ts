/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectorRef, Component, ElementRef, HostBinding, Inject, OnDestroy, ViewChild, ViewContainerRef} from '@angular/core';
import {AsyncSubject, combineLatest, EMPTY, fromEvent, Subject} from 'rxjs';
import {switchMap, takeUntil} from 'rxjs/operators';
import {ActivatedRoute} from '@angular/router';
import {SciViewportComponent} from '@scion/components/viewport';
import {WbRouterOutletComponent} from '../routing/wb-router-outlet.component';
import {WB_VIEW_HEADING_PARAM, WB_VIEW_TITLE_PARAM} from '../routing/routing.constants';
import {MessageBoxService} from '../message-box/message-box.service';
import {ViewMenuService} from '../view-part/view-context-menu/view-menu.service';
import {ɵWorkbenchView} from './ɵworkbench-view.model';
import {Logger, LoggerNames} from '../logging';
import {VIEW_LOCAL_MESSAGE_BOX_HOST, ViewContainerReference} from '../content-projection/view-container.reference';
import {PopupService} from '../popup/popup.service';
import {Arrays} from '@scion/toolkit/util';
import {WorkbenchRouteData} from '../routing/workbench-route-data';
import {WorkbenchNavigationalStates} from '../routing/workbench-navigational-states';

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
  providers: [MessageBoxService, PopupService],
})
export class ViewComponent implements OnDestroy {

  private _destroy$ = new Subject<void>();
  private _viewport$ = new AsyncSubject<SciViewportComponent>();
  public viewLocalMessageBoxHost: Promise<ViewContainerRef>;

  @ViewChild(SciViewportComponent)
  public set setViewport(viewport: SciViewportComponent) {
    if (viewport) {
      this._viewport$.next(viewport);
      this._viewport$.complete();
    }
  }

  @ViewChild('router_outlet')
  public routerOutlet!: WbRouterOutletComponent; // specs

  @HostBinding('attr.data-viewid')
  public get viewId(): string {
    return this._view.viewId;
  }

  @HostBinding('attr.class')
  public get cssClasses(): string {
    return this._view.cssClasses.join(' ');
  }

  @HostBinding('class.blocked')
  public get blocked(): boolean {
    return this._view.blocked;
  }

  constructor(private _view: ɵWorkbenchView,
              private _logger: Logger,
              private _host: ElementRef<HTMLElement>,
              messageBoxService: MessageBoxService,
              viewContextMenuService: ViewMenuService,
              private _cd: ChangeDetectorRef,
              @Inject(VIEW_LOCAL_MESSAGE_BOX_HOST) viewLocalMessageBoxHost: ViewContainerReference) {
    this._logger.debug(() => `Constructing ViewComponent. [viewId=${this.viewId}]`, LoggerNames.LIFECYCLE);
    this.viewLocalMessageBoxHost = viewLocalMessageBoxHost.get();

    messageBoxService.messageBoxes$({includeParents: true})
      .pipe(takeUntil(this._destroy$))
      .subscribe(messageBoxes => this._view.blocked = messageBoxes.length > 0);

    viewContextMenuService.installMenuItemAccelerators$(this._host, this._view)
      .pipe(takeUntil(this._destroy$))
      .subscribe();

    combineLatest([this._view.active$, this._viewport$])
      .pipe(takeUntil(this._destroy$))
      .subscribe(([active, viewport]) => active ? this.onActivateView(viewport) : this.onDeactivateView(viewport));

    // Prevent this view from getting the focus when it is blocked, for example, when displaying a message box.
    this._view.blocked$
      .pipe(switchMap(blocked => blocked ? fromEvent(this._host.nativeElement, 'focusin', {capture: true}) : EMPTY))
      .subscribe(() => messageBoxService.focusTop());
  }

  private onActivateView(viewport: SciViewportComponent): void {
    viewport.focus();
    viewport.scrollTop = this._view.scrollTop;
    viewport.scrollLeft = this._view.scrollLeft;
  }

  private onDeactivateView(viewport: SciViewportComponent): void {
    this._view.scrollTop = viewport.scrollTop;
    this._view.scrollLeft = viewport.scrollLeft;
  }

  public onActivateRoute(route: ActivatedRoute): void {
    const params = route.snapshot.params;
    const data = route.snapshot.data;

    this._view.title = this._view.title ?? params[WB_VIEW_TITLE_PARAM] ?? data[WB_VIEW_TITLE_PARAM] ?? data[WorkbenchRouteData.title] ?? null;
    this._view.heading = this._view.heading ?? params[WB_VIEW_HEADING_PARAM] ?? data[WB_VIEW_HEADING_PARAM] ?? data[WorkbenchRouteData.heading] ?? null;
    this._view.cssClass = new Array<string>()
      .concat(Arrays.coerce(data[WorkbenchRouteData.cssClass]))
      .concat(Arrays.coerce(data[WorkbenchRouteData.state]?.[WorkbenchNavigationalStates.cssClass]));
    if (!this._view.active) {
      this._cd.detectChanges();
    }
  }

  public onDeactivateRoute(): void {
    this._view.heading = null;
    this._view.title = null;
    this._view.cssClass = [];
    this._view.dirty = false;
  }

  public ngOnDestroy(): void {
    this._logger.debug(() => `Destroying ViewComponent [viewId=${this.viewId}]'`, LoggerNames.LIFECYCLE);
    this._destroy$.next();
  }
}
