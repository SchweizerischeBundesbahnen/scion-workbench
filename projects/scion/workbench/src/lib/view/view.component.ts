/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, effect, ElementRef, HostBinding, inject, OnDestroy, Provider, untracked, viewChild} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {SciViewportComponent} from '@scion/components/viewport';
import {ViewMenuService} from '../part/view-context-menu/view-menu.service';
import {ɵWorkbenchView} from './ɵworkbench-view.model';
import {Logger, LoggerNames} from '../logging';
import {A11yModule} from '@angular/cdk/a11y';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ViewDragService} from '../view-dnd/view-drag.service';
import {GLASS_PANE_BLOCKABLE, GLASS_PANE_OPTIONS, GlassPaneDirective, GlassPaneOptions} from '../glass-pane/glass-pane.directive';
import {ViewId, WorkbenchView} from './workbench-view.model';
import {OnAttach, OnDetach} from '../portal/wb-component-portal';
import {synchronizeCssClasses} from '../common/css-class.util';
import {RouterOutletRootContextDirective} from '../routing/router-outlet-root-context.directive';

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
    RouterOutletRootContextDirective,
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
export class ViewComponent implements OnDestroy, OnAttach, OnDetach {

  private _viewport = viewChild.required(SciViewportComponent);
  private _scrollTop = 0;
  private _scrollLeft = 0;

  @HostBinding('attr.data-viewid')
  public get viewId(): ViewId {
    return this._view.id;
  }

  @HostBinding('class.view-drag')
  public get isViewDragActive(): boolean {
    return this._viewDragService.viewDragData() !== null;
  }

  constructor(private _view: ɵWorkbenchView,
              private _viewDragService: ViewDragService,
              private _logger: Logger) {
    this._logger.debug(() => `Constructing ViewComponent. [viewId=${this.viewId}]`, LoggerNames.LIFECYCLE);
    this.installMenuItemAccelerators();
    this.installOnActivateView();
    this.addHostCssClasses();
  }

  /**
   * Method invoked after attached this component to the DOM.
   */
  public onAttach(): void {
    this._viewport().scrollTop = this._scrollTop;
    this._viewport().scrollLeft = this._scrollLeft;
  }

  /**
   * Method invoked before detaching this component from the DOM.
   */
  public onDetach(): void {
    this._scrollTop = this._viewport().scrollTop;
    this._scrollLeft = this._viewport().scrollLeft;
  }

  private onActivateView(): void {
    // Gain focus only if in the active part.
    if (this._view.part().active()) {
      this._viewport().focus();
    }
  }

  private installMenuItemAccelerators(): void {
    inject(ViewMenuService).installMenuItemAccelerators$(inject(ElementRef<HTMLElement>), this._view)
      .pipe(takeUntilDestroyed())
      .subscribe();
  }

  private installOnActivateView(): void {
    effect(() => {
      if (this._view.active()) {
        untracked(() => this.onActivateView());
      }
    });
  }

  private addHostCssClasses(): void {
    const host = inject(ElementRef<HTMLElement>).nativeElement;
    synchronizeCssClasses(host, this._view.classList.asList);
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
