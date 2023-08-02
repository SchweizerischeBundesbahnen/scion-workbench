/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectorRef, Component, ElementRef, HostBinding, Inject, OnDestroy, ViewChild} from '@angular/core';
import {AsyncSubject, combineLatest, EMPTY, fromEvent} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {ActivatedRoute, RouterOutlet} from '@angular/router';
import {SciViewportComponent} from '@scion/components/viewport';
import {MessageBoxService} from '../message-box/message-box.service';
import {ViewMenuService} from '../part/view-context-menu/view-menu.service';
import {ɵWorkbenchView} from './ɵworkbench-view.model';
import {Logger, LoggerNames} from '../logging';
import {VIEW_MODAL_MESSAGE_BOX_HOST, ViewContainerReference} from '../content-projection/view-container.reference';
import {PopupService} from '../popup/popup.service';
import {Arrays} from '@scion/toolkit/util';
import {WorkbenchRouteData} from '../routing/workbench-route-data';
import {WorkbenchNavigationalViewStates} from '../routing/workbench-navigational-states';
import {RouterUtils} from '../routing/router.util';
import {A11yModule} from '@angular/cdk/a11y';
import {ContentProjectionDirective} from '../content-projection/content-projection.directive';
import {MessageBoxStackComponent} from '../message-box/message-box-stack.component';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {AsyncPipe} from '@angular/common';
import {ViewDragService} from '../view-dnd/view-drag.service';

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
  standalone: true,
  imports: [
    RouterOutlet,
    A11yModule,
    SciViewportComponent,
    ContentProjectionDirective,
    MessageBoxStackComponent,
    AsyncPipe,
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
    return this._view.cssClasses.join(' ');
  }

  @HostBinding('class.blocked')
  public get blocked(): boolean {
    return this._view.blocked;
  }

  @HostBinding('class.view-drag')
  public get isViewDragActive(): boolean {
    return this._viewDragService.viewDragData !== null;
  }

  constructor(private _view: ɵWorkbenchView,
              private _logger: Logger,
              private _host: ElementRef<HTMLElement>,
              private _cd: ChangeDetectorRef,
              private _viewDragService: ViewDragService,
              messageBoxService: MessageBoxService,
              viewContextMenuService: ViewMenuService,
              @Inject(VIEW_MODAL_MESSAGE_BOX_HOST) protected viewModalMessageBoxHostRef: ViewContainerReference) {
    this._logger.debug(() => `Constructing ViewComponent. [viewId=${this.viewId}]`, LoggerNames.LIFECYCLE);

    messageBoxService.messageBoxes$({includeParents: true})
      .pipe(takeUntilDestroyed())
      .subscribe(messageBoxes => this._view.blocked = messageBoxes.length > 0);

    viewContextMenuService.installMenuItemAccelerators$(this._host, this._view)
      .pipe(takeUntilDestroyed())
      .subscribe();

    combineLatest([this._view.active$, this._viewport$])
      .pipe(takeUntilDestroyed())
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
    const actualRouteSnapshot = RouterUtils.resolveActualRouteSnapshot(route.snapshot);
    this._view.title ??= RouterUtils.lookupRouteData(actualRouteSnapshot, WorkbenchRouteData.title) ?? null;
    this._view.heading ??= RouterUtils.lookupRouteData(actualRouteSnapshot, WorkbenchRouteData.heading) ?? null;
    this._view.cssClass = new Array<string>()
      .concat(Arrays.coerce(RouterUtils.lookupRouteData(actualRouteSnapshot, WorkbenchRouteData.cssClass)))
      .concat(Arrays.coerce(route.snapshot.data[WorkbenchRouteData.state]?.[WorkbenchNavigationalViewStates.cssClass]))
      .concat(this._view.cssClasses);
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
  }
}
