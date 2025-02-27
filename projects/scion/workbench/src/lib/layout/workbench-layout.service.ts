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
import {computed, effect, inject, Injectable, Injector, signal} from '@angular/core';
import {ViewDragService} from '../view-dnd/view-drag.service';
import {ɵWorkbenchLayout} from './ɵworkbench-layout';
import {filterNull} from '../common/operators';
import {toSignal} from '@angular/core/rxjs-interop';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {WorkbenchStorage} from '../storage/workbench-storage';

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
   * Indicates if the layout should be optimized for widescreen displays.
   */
  public readonly widescreenModeEnabled = signal(false);

  /**
   * Provides the current {@link WorkbenchLayout}, or `null` until Angular has performed the initial navigation.
   *
   * TODO [activity] Look for usages where we do not have a layout -> try changing it to NOT null.
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

  constructor() {
    void this.installWidescreenModeSynchronizer();
  }

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

  /**
   * Synchronizes the widescreen mode with persistent storage.
   */
  private async installWidescreenModeSynchronizer(): Promise<void> {
    const workbenchStorage = inject(WorkbenchStorage);
    const injector = inject(Injector);
    const enabled = await workbenchStorage.load(WIDESCREEN_STORAGE_KEY) ?? false;
    this.widescreenModeEnabled.set(coerceBooleanProperty(enabled));

    effect(() => {
      const enabled = this.widescreenModeEnabled();
      void workbenchStorage.store(WIDESCREEN_STORAGE_KEY, `${enabled}`);
    }, {injector});
  }
}

/**
 * Key for storing widescreen mode setting across layouts.
 */
const WIDESCREEN_STORAGE_KEY = 'scion.workbench.layout.widescreen-mode';
