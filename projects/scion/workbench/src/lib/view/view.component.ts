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
import {WorkbenchStartup} from '../startup/workbench-launcher.service';
import {Logger, LoggerNames} from '../logging';
import {VIEW_LOCAL_MESSAGE_BOX_HOST, ViewContainerReference} from '../content-projection/view-container.reference';
import {PopupService} from '../popup/popup.service';

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
              public workbenchStartup: WorkbenchStartup,
              messageBoxService: MessageBoxService,
              viewContextMenuService: ViewMenuService,
              private _cd: ChangeDetectorRef,
              @Inject(VIEW_LOCAL_MESSAGE_BOX_HOST) viewLocalMessageBoxHost: ViewContainerReference) {

    // IMPORTANT:
    // Wait mounting this view's named router outlet until the workbench startup has completed.
    //
    // This component is constructed when the workbench detects view outlets in the browser URL, e.g., when workbench navigation
    // occurs or when Angular triggers the initial navigation for an URL that contains view outlets. See {WorkbenchUrlObserver}.
    // Depending on the used workbench launcher, this may happen before starting the workbench or before it completed the startup.
    // In any case, we must not mount the view's named router outlet until the workbench startup is completed. Otherwise, the
    // outlet's routed component would be constructed as well, leading to unexpected or wrong behavior, e.g., because the
    // Microfrontend Platform may not be fully initialized yet, or because the workbench should not be started since the user is
    // not authorized.
    //
    // It would be simplest to install a route guard to protect routed components from being loaded before workbench startup completed.
    // However, this does not work in a situation where the `<wb-workbench>` component is displayed in a router outlet. Then, we
    // would end up in a deadlock, as the view outlet guard would wait until the workbench startup completes, but the workbench component
    // never gets mounted because the navigation never ends, thus cannot initiate the workbench startup.

    this._logger.debug(() => `Constructing ViewComponent. [viewId=${this.viewId}]`, LoggerNames.LIFECYCLE);
    this.viewLocalMessageBoxHost = viewLocalMessageBoxHost.get();

    // Trigger a manual change detection cycle if this view is not the active view in the tabbar. Otherwise, since inactive views are not added
    // to the Angular component tree, their routed component would not be activated until activating the view. But, view components typically
    // initialize their view in the constructor, setting a title, for example. This requires eagerly activating the routed components of inactive views
    // by triggering a manual change detection cycle, but only after workbench startup completed.
    if (!this._view.active) {
      workbenchStartup.whenStarted.then(() => {
        this._logger.debug(() => `Activating view router outlet after initial navigation. [viewId=${this.viewId}]`, LoggerNames.LIFECYCLE);
        this._cd.detectChanges();
      });
    }

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

    if (params[WB_VIEW_TITLE_PARAM] || data[WB_VIEW_TITLE_PARAM]) {
      this._view.title = params[WB_VIEW_TITLE_PARAM] || data[WB_VIEW_TITLE_PARAM];
    }
    if (params[WB_VIEW_HEADING_PARAM] || data[WB_VIEW_HEADING_PARAM]) {
      this._view.heading = params[WB_VIEW_HEADING_PARAM] || data[WB_VIEW_HEADING_PARAM];
    }
    if (!this._view.active) {
      this._cd.detectChanges();
    }
  }

  public onDeactivateRoute(): void {
    this._view.heading = null;
    this._view.title = null;
    this._view.dirty = false;
  }

  public ngOnDestroy(): void {
    this._logger.debug(() => `Destroying ViewComponent [viewId=${this.viewId}]'`, LoggerNames.LIFECYCLE);
    this._destroy$.next();
  }
}
