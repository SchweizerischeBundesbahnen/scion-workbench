/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, DOCUMENT, ElementRef, inject, untracked, viewChild} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {RouterOutletRootContextDirective} from '../../routing/router-outlet-root-context.directive';
import {SciViewportComponent} from '@scion/components/viewport';
import {OnAttach, OnDetach} from '../../portal/wb-component-portal';
import {registerFocusTracker, WorkbenchFocusTracker} from '../../focus/workbench-focus-tracker.service';
import {rootEffect} from '../../common/root-effect';
import {asyncScheduler} from 'rxjs';
import {ɵWorkbenchPart} from '../ɵworkbench-part.model';

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
  protected readonly focusTracker = inject(WorkbenchFocusTracker);

  private readonly _host = inject(ElementRef).nativeElement as HTMLElement;
  private readonly _document = inject(DOCUMENT);
  private readonly _viewport = viewChild.required(SciViewportComponent);

  private _scrollTop = 0;
  private _scrollLeft = 0;
  private _activeElementBeforeDetach: HTMLElement | undefined;

  constructor() {
    registerFocusTracker(inject(ElementRef) as ElementRef<HTMLElement>, this.part.id);

    rootEffect(onCleanup => {
      const attached = this.part.slot.portal.attached();
      if (!attached) {
        untracked(() => {
          const unset = asyncScheduler.schedule(() => this.focusTracker.unsetActiveElement(this.part.id));
          onCleanup(() => unset.unsubscribe());
        });
      }
    });
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

    this._activeElementBeforeDetach?.focus();
    this._activeElementBeforeDetach = undefined;
  }

  /**
   * Method invoked before detaching this component from the DOM.
   */
  public onDetach(): void {
    this._scrollTop = this._viewport().scrollTop;
    this._scrollLeft = this._viewport().scrollLeft;

    const activeElement = this._document.activeElement;
    if (this._host.contains(activeElement) && activeElement instanceof HTMLElement) {
      this._activeElementBeforeDetach = activeElement;
    }
    // setTimeout(() => this.focusTracker.unsetActiveElement(this.part.id));
  }
}
