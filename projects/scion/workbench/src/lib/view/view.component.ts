/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, ElementRef, HostBinding, OnDestroy, Provider, ViewChild} from '@angular/core';
import {AsyncSubject, combineLatest} from 'rxjs';
import {ActivatedRoute, RouterOutlet} from '@angular/router';
import {SciViewportComponent} from '@scion/components/viewport';
import {ViewMenuService} from '../part/view-context-menu/view-menu.service';
import {ɵWorkbenchView} from './ɵworkbench-view.model';
import {Logger, LoggerNames} from '../logging';
import {WorkbenchRouteData} from '../routing/workbench-route-data';
import {RouterUtils} from '../routing/router.util';
import {A11yModule} from '@angular/cdk/a11y';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {AsyncPipe} from '@angular/common';
import {ViewDragService} from '../view-dnd/view-drag.service';
import {GLASS_PANE_BLOCKABLE, GlassPaneDirective} from '../glass-pane/glass-pane.directive';

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
  standalone: true,
  imports: [
    RouterOutlet,
    A11yModule,
    SciViewportComponent,
    AsyncPipe,
  ],
  hostDirectives: [
    GlassPaneDirective,
  ],
  providers: [
    configureViewGlassPane(),
  ],
})
export class ViewComponent implements OnDestroy {

  private _viewport$ = new AsyncSubject<SciViewportComponent>();

  @ViewChild(SciViewportComponent)
  public set setViewport(viewport: SciViewportComponent) {
    if (viewport) {
      this._viewport$.next(viewport);
      this._viewport$.complete();
    }
  }

  @ViewChild('router_outlet')
  public routerOutlet!: RouterOutlet; // specs

  @HostBinding('attr.data-viewid')
  public get viewId(): string {
    return this._view.id;
  }

  @HostBinding('attr.class')
  public get cssClasses(): string {
    return this._view.classList.value.join(' ');
  }

  @HostBinding('class.view-drag')
  public get isViewDragActive(): boolean {
    return this._viewDragService.viewDragData !== null;
  }

  constructor(private _view: ɵWorkbenchView,
              private _logger: Logger,
              private _host: ElementRef<HTMLElement>,
              private _viewDragService: ViewDragService,
              viewContextMenuService: ViewMenuService) {
    this._logger.debug(() => `Constructing ViewComponent. [viewId=${this.viewId}]`, LoggerNames.LIFECYCLE);

    viewContextMenuService.installMenuItemAccelerators$(this._host, this._view)
      .pipe(takeUntilDestroyed())
      .subscribe();

    combineLatest([this._view.active$, this._viewport$])
      .pipe(takeUntilDestroyed())
      .subscribe(([active, viewport]) => active ? this.onActivateView(viewport) : this.onDeactivateView(viewport));
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
    const actualRouteSnapshot = RouterUtils.resolveActualRouteSnapshot(route.snapshot);
    this._view.title ??= RouterUtils.lookupRouteData(actualRouteSnapshot, WorkbenchRouteData.title) ?? null;
    this._view.heading ??= RouterUtils.lookupRouteData(actualRouteSnapshot, WorkbenchRouteData.heading) ?? null;
    this._view.classList.set(RouterUtils.lookupRouteData(actualRouteSnapshot, WorkbenchRouteData.cssClass), {scope: 'route'});
  }

  public onDeactivateRoute(): void {
    this._view.heading = null;
    this._view.title = null;
    this._view.dirty = false;
    this._view.classList.remove({scope: 'application'});
    this._view.classList.remove({scope: 'route'});
    this._view.classList.remove({scope: 'navigation'});
  }

  public ngOnDestroy(): void {
    this._logger.debug(() => `Destroying ViewComponent [viewId=${this.viewId}]'`, LoggerNames.LIFECYCLE);
  }
}

/**
 * Blocks this view when dialog(s) overlay it.
 */
function configureViewGlassPane(): Provider {
  return {
    provide: GLASS_PANE_BLOCKABLE,
    useExisting: ɵWorkbenchView,
  };
}

