/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject, viewChild} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {RouterOutletRootContextDirective} from '../../routing/router-outlet-root-context.directive';
import {WorkbenchPart} from '../workbench-part.model';
import {SciViewportComponent} from '@scion/components/viewport';
import {OnAttach, OnDetach} from '../../portal/wb-component-portal';

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

  protected readonly part = inject(WorkbenchPart);

  private readonly _viewport = viewChild.required(SciViewportComponent);

  private _scrollTop = 0;
  private _scrollLeft = 0;

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
}
