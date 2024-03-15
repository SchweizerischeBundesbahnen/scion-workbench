/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, ElementRef, HostBinding, inject, OnDestroy, Provider, ViewChild} from '@angular/core';
import {AsyncSubject, combineLatest} from 'rxjs';
import {RouterOutlet} from '@angular/router';
import {SciViewportComponent} from '@scion/components/viewport';
import {ViewMenuService} from '../part/view-context-menu/view-menu.service';
import {ɵWorkbenchView} from './ɵworkbench-view.model';
import {Logger, LoggerNames} from '../logging';
import {A11yModule} from '@angular/cdk/a11y';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ViewDragService} from '../view-dnd/view-drag.service';
import {GLASS_PANE_BLOCKABLE, GLASS_PANE_OPTIONS, GlassPaneDirective, GlassPaneOptions} from '../glass-pane/glass-pane.directive';
import {WorkbenchView} from './workbench-view.model';

/**
 * Renders the workbench view, using a router-outlet to display view content.
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

  public ngOnDestroy(): void {
    this._logger.debug(() => `Destroying ViewComponent [viewId=${this.viewId}]'`, LoggerNames.LIFECYCLE);
  }
}

/**
 * Blocks this view when dialog(s) overlay it.
 */
function configureViewGlassPane(): Provider[] {
  return [
    {
      provide: GLASS_PANE_BLOCKABLE,
      useExisting: ɵWorkbenchView,
    },
    {
      provide: GLASS_PANE_OPTIONS,
      useFactory: (): GlassPaneOptions => ({attributes: {'data-viewid': inject(WorkbenchView).id}}),
    },
  ];
}
