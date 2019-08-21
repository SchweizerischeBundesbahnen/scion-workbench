/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { BehaviorSubject, merge, Observable, Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { mapTo } from 'rxjs/operators';
import { ViewDragService } from './view-dnd/view-drag.service';

/**
 * Allows rearrange the layout of Workbench window.
 */
@Injectable()
export class WorkbenchLayoutService {

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
   * Notifies upon workbench layout change.
   */
  public readonly afterGridChange$ = new Subject<void>();

  constructor(viewDragService: ViewDragService) {
    this.viewDrag$ = merge<'start' | 'end'>(
      viewDragService.viewDragStart$.pipe(mapTo('start')),
      viewDragService.viewDragEnd$.pipe(mapTo('end')),
    );
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
