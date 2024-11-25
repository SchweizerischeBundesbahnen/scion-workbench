/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {BehaviorSubject, Observable, skip} from 'rxjs';
import {computed, inject, Injectable, signal} from '@angular/core';
import {ViewDragService} from '../view-dnd/view-drag.service';
import {ɵWorkbenchLayout} from './ɵworkbench-layout';
import {filterNull} from '../common/operators';
import {toSignal} from '@angular/core/rxjs-interop';

/**
 * Provides access to the workbench layout.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchLayoutService {

  private readonly _viewDragService = inject(ViewDragService);
  private readonly _layout$ = new BehaviorSubject<ɵWorkbenchLayout | null>(null);
  private readonly _moving = signal(false);
  private readonly _resizing = signal(false);

  /**
   * Provides the current {@link WorkbenchLayout}, or `null` until Angular has performed the initial navigation.
   */
  public layout = toSignal(this._layout$, {requireSync: true});

  /**
   * Emits the current {@link WorkbenchLayout}.
   *
   * Upon subscription, emits the current layout, and then emits the updated layout every time it changes.
   *
   * The Observable will not emit until Angular has performed the initial navigation.
   */
  public readonly layout$: Observable<ɵWorkbenchLayout> = this._layout$.pipe(filterNull());

  /**
   * Notifies when the workbench layout has changed.
   */
  public readonly onLayoutChange$: Observable<ɵWorkbenchLayout> = this._layout$.pipe(skip(1), filterNull());

  /**
   * Indicates if a drag operation is active, such as moving a view or dialog, or resizing a part.
   */
  public readonly dragging = computed(() => this._viewDragService.dragging() || this._moving() || this._resizing());

  /**
   * Signals moving a workbench element, such as moving a dialog.
   */
  public signalMoving(moving: boolean): void {
    this._moving.set(moving);
  }

  /**
   * Signals resizing a workbench element, such as resizing a dialog or part.
   */
  public signalResizing(resizing: boolean): void {
    this._resizing.set(resizing);
  }

  /**
   * Sets the given {@link WorkbenchLayout}.
   */
  public setLayout(layout: ɵWorkbenchLayout): void {
    this._layout$.next(layout);
  }
}
