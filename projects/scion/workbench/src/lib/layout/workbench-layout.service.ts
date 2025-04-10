/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {computed, inject, Injectable, signal} from '@angular/core';
import {ViewDragService} from '../view-dnd/view-drag.service';
import {ɵWorkbenchLayout} from './ɵworkbench-layout';
import {throwError} from '../common/throw-error.util';
import {resolveWhen} from '../common/resolve-when.util';

/**
 * Provides access to the workbench layout.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchLayoutService {

  private readonly _viewDragService = inject(ViewDragService);
  private readonly _layout = signal<ɵWorkbenchLayout | null>(null);
  private readonly _moving = signal(false);
  private readonly _resizing = signal(false);

  /**
   * Provides the layout of the workbench, throwing an error if the initial layout is not yet available.
   */
  public readonly layout = computed(() => this._layout() ?? throwError('[NullLayoutError] Workbench layout not available yet.'));

  /**
   * Indicates whether the layout is available, i.e., after Angular has performed the initial navigation.
   */
  public readonly hasLayout = computed(() => this._layout() !== null);

  /**
   * Resolves when the layout is available, i.e., after Angular has performed the initial navigation.
   */
  public readonly whenLayoutAvailable = resolveWhen(this.hasLayout);

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
    this._layout.set(layout);
  }
}
