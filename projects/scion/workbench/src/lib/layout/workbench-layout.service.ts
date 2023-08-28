/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {BehaviorSubject, merge, Observable, skip, Subject} from 'rxjs';
import {Injectable} from '@angular/core';
import {map} from 'rxjs/operators';
import {ViewDragService} from '../view-dnd/view-drag.service';
import {ɵWorkbenchLayout} from './ɵworkbench-layout';
import {filterNull} from '../common/operators';

/**
 * Provides access to the workbench layout.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchLayoutService {

  private _layout$ = new BehaviorSubject<ɵWorkbenchLayout | null>(null);
  private _dragStart$ = new Subject<void>();
  private _dragEnd$ = new Subject<void>();

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
   * Sets the given {@link WorkbenchLayout}.
   */
  public setLayout(layout: ɵWorkbenchLayout): void {
    this._layout$.next(layout);
  }

  /**
   * Returns a reference to current {@link WorkbenchLayout}, if any. Is `null` until Angular has performed the initial navigation.
   */
  public get layout(): ɵWorkbenchLayout | null {
    return this._layout$.value;
  }
}
