/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, ElementRef, HostListener, inject, InjectionToken, Signal, viewChild} from '@angular/core';
import {ɵWorkbenchPart} from '../ɵworkbench-part.model';
import {ɵWorkbenchRouter} from '../../routing/ɵworkbench-router.service';
import {PartActionComponent} from '../part-action/part-action.component';
import {ViewListButtonComponent} from '../view-list-button/view-list-button.component';
import {ViewTabBarComponent} from '../view-tab-bar/view-tab-bar.component';
import {dimension} from '@scion/components/dimension';
import {NgClass} from '@angular/common';

/**
 * DI token to inject the HTML element of the {@link PartBarComponent}.
 */
export const PART_BAR_ELEMENT = new InjectionToken<HTMLElement>('PART_BAR_ELEMENT');

@Component({
  selector: 'wb-part-bar',
  templateUrl: './part-bar.component.html',
  styleUrls: ['./part-bar.component.scss'],
  imports: [
    ViewTabBarComponent,
    PartActionComponent,
    ViewListButtonComponent,
    NgClass,
  ],
  providers: [
    {provide: PART_BAR_ELEMENT, useFactory: () => inject(ElementRef).nativeElement as HTMLElement},
  ],
})
export class PartBarComponent {

  private readonly _router = inject(ɵWorkbenchRouter);
  private readonly _viewTabBar = viewChild(ViewTabBarComponent, {read: ElementRef<HTMLElement>});
  private readonly _fillerElement = viewChild.required<ElementRef<HTMLElement>>('filler');

  protected readonly part = inject(ɵWorkbenchPart);
  protected readonly startActions = computed(() => this.part.actions().filter(action => action.align === 'start'));
  protected readonly endActions = computed(() => this.part.actions().filter(action => action.align !== 'start'));
  protected readonly maxViewTabBarWidth: Signal<number>;

  constructor() {
    this.maxViewTabBarWidth = this.calculateMaxViewTabBarWidth();
  }

  @HostListener('dblclick', ['$event'])
  protected onDoubleClick(event: MouseEvent): void {
    if (this.part.isInMainArea) {
      void this._router.navigate(layout => layout.toggleMaximized());
    }
    event.stopPropagation();
  }

  /**
   * Calculates the maximum available width for the view tab bar.
   */
  private calculateMaxViewTabBarWidth(): Signal<number> {
    const fillerDimension = dimension(this._fillerElement);
    const viewTabBarDimension = dimension(this._viewTabBar);
    return computed(() => (viewTabBarDimension()?.offsetWidth ?? 0) + fillerDimension().offsetWidth);
  }
}
