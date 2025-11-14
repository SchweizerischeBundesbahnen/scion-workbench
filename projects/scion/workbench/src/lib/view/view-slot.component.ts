/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {afterRenderEffect, Component, DestroyRef, DOCUMENT, ElementRef, inject, Provider, untracked, viewChild} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {SciViewportComponent} from '@scion/components/viewport';
import {ViewMenuService} from '../part/view-context-menu/view-menu.service';
import {ɵWorkbenchView} from './ɵworkbench-view.model';
import {Logger, LoggerNames} from '../logging';
import {CdkTrapFocus} from '@angular/cdk/a11y';
import {ViewDragService} from '../view-dnd/view-drag.service';
import {GLASS_PANE_BLOCKABLE, GLASS_PANE_OPTIONS, GlassPaneDirective, GlassPaneOptions} from '../glass-pane/glass-pane.directive';
import {WorkbenchView} from './workbench-view.model';
import {OnAttach, OnDetach} from '../portal/wb-component-portal';
import {RouterOutletRootContextDirective} from '../routing/router-outlet-root-context.directive';
import {FocusTrackerRef, trackFocus} from '../focus/workbench-focus-tracker.service';

/**
 * Acts as a placeholder for a view's content that Angular fills based on the current router state of the associated view outlet.
 */
@Component({
  selector: 'wb-view-slot',
  templateUrl: './view-slot.component.html',
  styleUrls: ['./view-slot.component.scss'],
  imports: [
    RouterOutlet,
    RouterOutletRootContextDirective,
    CdkTrapFocus,
    SciViewportComponent,
  ],
  hostDirectives: [
    GlassPaneDirective,
  ],
  host: {
    '[attr.data-viewid]': 'view.id',
    '[attr.data-active]': `view.active() ? '' : null`,
    '[class.view-drag]': 'viewDragService.dragging()',
    '[class]': 'view.classList.asList()',
  },
  providers: [
    configureViewGlassPane(),
  ],
})
export class ViewSlotComponent implements OnAttach, OnDetach {

  protected readonly view = inject(ɵWorkbenchView);
  protected readonly viewDragService = inject(ViewDragService);

  private readonly _host = inject(ElementRef).nativeElement as HTMLElement;
  private readonly _document = inject(DOCUMENT);
  private readonly _viewport = viewChild.required(SciViewportComponent);
  private readonly _focusTrackerRef: FocusTrackerRef;

  private _scrollTop = 0;
  private _scrollLeft = 0;
  private _activeElementBeforeDetach: HTMLElement | undefined;

  constructor() {
    this._focusTrackerRef = trackFocus(this._host, this.view);

    this.installComponentLifecycleLogger();
    this.installMenuAccelerators();
    this.unsetActiveElementOnPartDeactivate();
  }

  public focus(): void {
    if (!this._host.contains(this._document.activeElement)) {
      this._viewport().focus();
    }
  }

  /**
   * Method invoked after attached this component to the DOM.
   */
  public onAttach(): void {
    this._viewport().scrollTop = this._scrollTop;
    this._viewport().scrollLeft = this._scrollLeft;

    if (this.view.focused()) {
      this._activeElementBeforeDetach?.focus();
      this._activeElementBeforeDetach = undefined;
    }
  }

  /**
   * Method invoked before detaching this component from the DOM.
   */
  public onDetach(): void {
    this._scrollTop = this._viewport().scrollTop;
    this._scrollLeft = this._viewport().scrollLeft;

    if (this.view.focused()) {
      const activeElement = this._document.activeElement;
      if (this._host.contains(activeElement) && activeElement instanceof HTMLElement) {
        this._activeElementBeforeDetach = activeElement;
      }
    }
  }

  private installMenuAccelerators(): void {
    inject(ViewMenuService).installMenuAccelerators(inject(ElementRef), this.view);
  }

  /**
   * Unsets the active workbench element if this view was the focused element when its part is deactivated,
   * such as when closing the activity containing this view. Otherwise, the active element would not be unset.
   */
  private unsetActiveElementOnPartDeactivate(): void {
    afterRenderEffect(() => {
      const partActive = this.view.part().active();
      if (!partActive) {
        untracked(() => this._focusTrackerRef.unsetActiveElement());
      }
    });
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
      useFactory: () => inject(ɵWorkbenchView),
    },
    {
      provide: GLASS_PANE_OPTIONS,
      useFactory: () => ({attributes: {'data-viewid': inject(WorkbenchView).id}}) satisfies GlassPaneOptions,
    },
  ];
}
