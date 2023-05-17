/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {animationFrameScheduler, firstValueFrom, merge, Observable, Subject, timer} from 'rxjs';
import {Injectable} from '@angular/core';
import {debounce, filter, map, startWith} from 'rxjs/operators';
import {ViewDragService} from '../view-dnd/view-drag.service';
import {ɵWorkbenchLayout} from './ɵworkbench-layout';

/**
 * Provides access to the workbench layout.
 */
@Injectable()
export class WorkbenchLayoutService {

  private _layout: ɵWorkbenchLayout | null = null;
  private _layoutChange$ = new Subject<void>();
  private _dragStart$ = new Subject<void>();
  private _dragEnd$ = new Subject<void>();

  /**
   * Emits the current {@link WorkbenchLayout}.
   *
   * Upon subscription, the current layout is emitted, and then emits continuously when the layout changes.
   * If Angular's initial navigation is not performed yet, blocks until the initial navigation is complete. It never
   * emits `null` and never completes.
   */
  public readonly layout$: Observable<ɵWorkbenchLayout> = this._layoutChange$
    .pipe(
      startWith(undefined as void),
      map<void, ɵWorkbenchLayout | null>(() => this.layout),
      filter((layout: ɵWorkbenchLayout | null): layout is ɵWorkbenchLayout => layout !== null),
    );

  /**
   * Notifies upon a workbench layout change. When this Observable emits, the layout has already been flushed to the DOM.
   */
  public readonly onLayoutChange$: Observable<void> = this._layoutChange$
    .pipe(debounce(() => timer(0, animationFrameScheduler)));

  /**
   * Notifies when the user starts or ends modifying the layout using drag and drop, e.g., moving the splitter between parts,
   * moving a message box, or moving a view.
   */
  public readonly dragging$: Observable<'start' | 'end'>;

  constructor(viewDragService: ViewDragService) {
    this.dragging$ = merge(
      merge(this._dragStart$, viewDragService.viewDragStart$).pipe(map((): 'start' => 'start')),
      merge(this._dragEnd$, viewDragService.viewDragEnd$).pipe(map((): 'end' => 'end')),
    );
  }

  /**
   * Invoke to inform the layout when about to start a drag operation, like when start moving the splitter between parts.
   */
  public notifyDragStarting(): void {
    this._dragStart$.next();
  }

  /**
   * Invoke to inform the layout when about to end a drag operation, like when end moving the splitter between parts.
   */
  public notifyDragEnding(): void {
    this._dragEnd$.next();
  }

  /**
   * Returns a Promise that resolves on the next layout change. When this Promise resolves,
   * the layout has already been flushed to the DOM.
   */
  public async whenLayoutChange(): Promise<void> {
    return firstValueFrom(this.onLayoutChange$);
  }

  /**
   * Sets the given {@link WorkbenchLayout}.
   */
  public setLayout(layout: ɵWorkbenchLayout): void {
    this._layout = layout;
    this._layoutChange$.next();
  }

  /**
   * Returns a reference to current {@link WorkbenchLayout}, if any. Is `null` until the initial navigation is performed.
   */
  public get layout(): ɵWorkbenchLayout | null {
    return this._layout;
  }
}
