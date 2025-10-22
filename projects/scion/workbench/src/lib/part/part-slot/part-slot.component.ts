/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {afterRenderEffect, Component, DOCUMENT, ElementRef, inject, untracked, viewChild} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {RouterOutletRootContextDirective} from '../../routing/router-outlet-root-context.directive';
import {ɵWorkbenchPart} from '../ɵworkbench-part.model';
import {SciViewportComponent} from '@scion/components/viewport';
import {OnAttach, OnDetach} from '../../portal/wb-component-portal';
import {FocusTrackerRef, trackFocus} from '../../focus/workbench-focus-tracker.service';

/**
 * Acts as a placeholder for a part's content that Angular fills based on the current router state of the associated part outlet.
 */
@Component({
  selector: 'wb-part-slot',
  templateUrl: './part-slot.component.html',
  styleUrl: './part-slot.component.scss',
  imports: [
    RouterOutlet,
    RouterOutletRootContextDirective,
    SciViewportComponent,
  ],
})
export class PartSlotComponent implements OnAttach, OnDetach {

  protected readonly part = inject(ɵWorkbenchPart);

  private readonly _host = inject(ElementRef).nativeElement as HTMLElement;
  private readonly _document = inject(DOCUMENT);
  private readonly _viewport = viewChild.required(SciViewportComponent);
  private readonly _focusTrackerRef: FocusTrackerRef;

  private _scrollTop = 0;
  private _scrollLeft = 0;
  private _activeElementBeforeDetach: HTMLElement | undefined;

  constructor() {
    this._focusTrackerRef = trackFocus(this._host, this.part);
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

    if (this.part.focused()) {
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

    if (this.part.focused()) {
      const activeElement = this._document.activeElement;
      if (this._host.contains(activeElement) && activeElement instanceof HTMLElement) {
        this._activeElementBeforeDetach = activeElement;
      }
    }
  }

  /**
   * Unsets the active workbench element if this part was the focused element when it is deactivated,
   * such as when closing the activity containing this part. Otherwise, the active element would not be unset.
   */
  private unsetActiveElementOnPartDeactivate(): void {
    afterRenderEffect(() => {
      const active = this.part.active();
      if (!active) {
        untracked(() => this._focusTrackerRef.unsetActiveElement());
      }
    });
  }
}
