/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { asyncScheduler, BehaviorSubject, merge, Observable, Subject } from 'rxjs';
import { Injectable, NgZone } from '@angular/core';
import { debounce, filter, map, mapTo, observeOn, startWith, take } from 'rxjs/operators';
import { ViewDragService } from './view-dnd/view-drag.service';
import { PartsLayout } from './layout/parts-layout';

/**
 * Provides access to the current parts layout.
 */
@Injectable()
export class WorkbenchLayoutService {

  private _layout: PartsLayout;
  private readonly _layoutChange$ = new Subject<void>();

  private _maximized$ = new BehaviorSubject<boolean>(false);

  /**
   * Notifies upon resizing a view by dragging the sashes which separate them.
   */
  public readonly viewSashDrag$ = new Subject<'start' | 'end'>();

  /**
   * Notifies upon dragging a view to different positions within the Workbench.
   * The event is received across app instances of the same origin.
   */
  public readonly viewDrag$: Observable<'start' | 'end'>;

  /**
   * Notifies upon moving a message box to different positions within the Workbench.
   */
  public readonly messageBoxMove$ = new Subject<'start' | 'end'>();

  /**
   * Notifies upon a workbench layout change. When this Observable emits, the layout is already flushed to the DOM.
   */
  public readonly afterLayoutChange$: Observable<void> = this._layoutChange$
    .pipe(debounce(() => this._zone.onStable), observeOn(asyncScheduler));

  /**
   * Emits the current {@link PartsLayout}.
   *
   * Upon subscription, the current layout is emitted, and then emits continuously when the layout changes.
   * If Angular's initial navigation is not performed yet, blocks until the initial navigation is complete. It never
   * emits `null` and never completes.
   */
  public readonly layout$: Observable<PartsLayout> = this._layoutChange$
    .pipe(
      startWith(undefined as void),
      map(() => this.layout),
      filter<PartsLayout>(Boolean),
    );

  constructor(viewDragService: ViewDragService, private _zone: NgZone) {
    this.viewDrag$ = merge<'start' | 'end'>(
      viewDragService.viewDragStart$.pipe(mapTo('start')),
      viewDragService.viewDragEnd$.pipe(mapTo('end')),
    );
  }

  /**
   * Returns a Promise that resolves on the next layout change. When this Promise resolves,
   * the layout is already flushed to the DOM.
   */
  public async whenLayoutChange(): Promise<void> {
    return this.afterLayoutChange$
      .pipe(take(1))
      .toPromise();
  }

  /**
   * Sets the given {@link PartsLayout}.
   */
  public setLayout(layout: PartsLayout): void {
    this._layout = layout;
    this._layoutChange$.next();
  }

  /**
   * Returns a reference to current {@link PartsLayout}, if any. Is `null` until the initial navigation is performed.
   */
  public get layout(): PartsLayout | null {
    return this._layout || null;
  }

  /**
   * Displays the main content in full viewport width.
   *
   * @param maximize
   *   If not specified, maximize mode is toggled. If 'true', the application is maximized or minimized otherwise.
   */
  public toggleMaximized(maximize?: boolean): void {
    if (maximize === undefined) {
      this._maximized$.next(!this.maximized);
    }
    else {
      this._maximized$.next(maximize);
    }
  }

  /**
   * Indicates whether the main content is displayed in full viewport width.
   */
  public get maximized(): boolean {
    return this._maximized$.getValue();
  }

  /**
   * Emits upon change of main content full viewport mode.
   */
  public get maximized$(): Observable<boolean> {
    return this._maximized$.asObservable();
  }
}
