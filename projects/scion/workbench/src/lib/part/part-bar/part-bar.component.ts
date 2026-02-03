/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, effect, ElementRef, inject, InjectionToken, NgZone, Signal, untracked, viewChild} from '@angular/core';
import {ɵWorkbenchPart} from '../ɵworkbench-part.model';
import {ɵWorkbenchRouter} from '../../routing/ɵworkbench-router.service';
import {ViewListButtonComponent} from '../view-list-button/view-list-button.component';
import {ViewTabBarComponent} from '../view-tab-bar/view-tab-bar.component';
import {dimension} from '@scion/components/dimension';
import {EMPTY, fromEvent, mergeMap, of, pairwise, withLatestFrom} from 'rxjs';
import {subscribeIn} from '@scion/toolkit/operators';
import {TextPipe} from '../../text/text.pipe';
import {IconComponent} from '../../icon/icon.component';
import {SciToolbarComponent} from '../../menu/toolbar/toolbar.component';

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
    ViewListButtonComponent,
    TextPipe,
    IconComponent,
    SciToolbarComponent,
    SciToolbarComponent,
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
    this.installActivityMinimizer();
  }

  protected onPartBarMouseDown(event: Event): void {
    // Activate the part or its active view, if any.
    if (this.part.activeView()) {
      void this.part.activeView()!.activate();
    }
    else {
      void this.part.activate();
    }

    // Prevent default to maintain focus on part and view content.
    event.preventDefault();
  }

  protected onMinimize(): void {
    void this._router.navigate(layout => layout.toggleActivity(this.part.activity()!.id));
  }

  /**
   * Minimizes activities when double-clicking the tabbar or filler, but only if the first and second clicks target the same DOM element.
   * This prevents unintended maximization or minimization when double-clicking a tab's close button.
   */
  private installActivityMinimizer(): void {
    const host = inject(ElementRef).nativeElement as HTMLElement;
    const zone = inject(NgZone);

    effect(onCleanup => {
      // Maximization/minimization is only supported for tabs not located in the peripheral area.
      if (this.part.peripheral()) {
        return;
      }

      const viewTabBar = this._viewTabBar()?.nativeElement as HTMLElement | undefined;
      const filler = this._fillerElement().nativeElement;

      untracked(() => {
        const subscription = fromEvent<MouseEvent>([filler].concat(viewTabBar ?? []), 'dblclick')
          .pipe(
            withLatestFrom(fromEvent<MouseEvent>(host, 'click', {capture: true}).pipe(pairwise(), subscribeIn(fn => zone.runOutsideAngular(fn)))),
            mergeMap(([dblClickEvent, [clickEvent1, clickEvent2]]) => clickEvent1.target === clickEvent2.target ? of(dblClickEvent) : EMPTY),
          )
          .subscribe(event => {
            void this._router.navigate(layout => layout.toggleMaximized());
            event.preventDefault();
          });
        onCleanup(() => subscription.unsubscribe());
      });
    });
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
