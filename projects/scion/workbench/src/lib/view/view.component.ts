/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, DestroyRef, ElementRef, inject, Provider, viewChild} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {SciViewportComponent} from '@scion/components/viewport';
import {ViewMenuService} from '../part/view-context-menu/view-menu.service';
import {ɵWorkbenchView} from './ɵworkbench-view.model';
import {Logger, LoggerNames} from '../logging';
import {A11yModule} from '@angular/cdk/a11y';
import {ViewDragService} from '../view-dnd/view-drag.service';
import {GLASS_PANE_BLOCKABLE, GLASS_PANE_OPTIONS, GlassPaneDirective, GlassPaneOptions} from '../glass-pane/glass-pane.directive';
import {WorkbenchView} from './workbench-view.model';
import {OnAttach, OnDetach} from '../portal/wb-component-portal';
import {synchronizeCssClasses} from '../common/css-class.util';
import {RouterOutletRootContextDirective} from '../routing/router-outlet-root-context.directive';
import {WorkbenchFocusTracker} from '../focus/workbench-focus-tracker.service';
import {createFocusable, Focusable} from './focusable';

/**
 * Renders the workbench view, using a router-outlet to display view content.
 */
@Component({
  selector: 'wb-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
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
  host: {
    '[attr.data-viewid]': 'view.id',
    '[attr.data-focus]': `focusTracker.activeElement() === view.id ? '' : null`,
    '[attr.data-active]': `view.active() ? '' : null`,
    '[attr.data-activation-instant]': `view.activationInstant()`,
    '[class.view-drag]': 'viewDragService.viewDragData() !== null',
  },
})
export class ViewComponent implements OnAttach, OnDetach {

  private readonly _viewport = viewChild.required(SciViewportComponent);

  private _scrollTop = 0;
  private _scrollLeft = 0;

  protected readonly view = inject(ɵWorkbenchView);
  protected readonly focusTracker = inject(WorkbenchFocusTracker);
  protected readonly viewDragService = inject(ViewDragService);

  constructor() {
    this.installComponentLifecycleLogger();
    this.installMenuAccelerators();
    this.addHostCssClasses();

    // Register focusable
    this.view.registerAdapter(Focusable, createFocusable(() => this._viewport().focus()));
    inject(DestroyRef).onDestroy(() => this.view.unregisterAdapter(Focusable));
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

  private installMenuAccelerators(): void {
    inject(ViewMenuService).installMenuAccelerators(inject(ElementRef), this.view);
  }

  private addHostCssClasses(): void {
    const host = inject(ElementRef).nativeElement as HTMLElement;
    synchronizeCssClasses(host, this.view.classList.asList);
  }

  private installComponentLifecycleLogger(): void {
    const logger = inject(Logger);
    logger.debug(() => `Constructing ViewComponent. [viewId=${this.view.id}]`, LoggerNames.LIFECYCLE);
    inject(DestroyRef).onDestroy(() => logger.debug(() => `Destroying ViewComponent [viewId=${this.view.id}]'`, LoggerNames.LIFECYCLE));
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
