/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable, OnDestroy} from '@angular/core';
import {ɵWorkbenchDialog} from './ɵworkbench-dialog';
import {BehaviorSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

/**
 * Registry for {@link ɵWorkbenchDialog} objects.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchDialogRegistry implements OnDestroy {

  private _dialogs$ = new BehaviorSubject<ɵWorkbenchDialog[]>([]);

  public register(dialog: ɵWorkbenchDialog): void {
    this._dialogs$.next(this._dialogs$.value.concat(dialog));
  }

  public unregister(dialog: ɵWorkbenchDialog): void {
    this._dialogs$.next(this._dialogs$.value.filter(candidate => candidate !== dialog));
  }

  public indexOf(dialog: ɵWorkbenchDialog): number {
    const index = this.dialogs({viewId: dialog.context.view?.id}).indexOf(dialog);
    if (index === -1) {
      throw Error('[NullDialogError] Dialog not found');
    }
    return index;
  }

  /**
   * Returns currently opened dialogs, sorted by the time they were opened, based on the specified filter.
   */
  public dialogs(filter?: {viewId?: string} | ((dialog: ɵWorkbenchDialog) => boolean)): ɵWorkbenchDialog[] {
    const filterFn = typeof filter === 'function' ? filter : (dialog: ɵWorkbenchDialog) => !filter?.viewId || dialog.context.view?.id === filter.viewId;
    return this._dialogs$.value.filter(filterFn);
  }

  /**
   * Observes the topmost dialog in the given context.
   *
   * If a view context is specified, the topmost dialog that overlays that view is returned.
   * This can be either a view-modal or an application-modal dialog. Otherwise, returns
   * the topmost application-modal dialog.
   */
  public top$(context?: {viewId?: string}): Observable<ɵWorkbenchDialog | undefined> {
    return this._dialogs$.pipe(map(() => this.top(context)));
  }

  /**
   * Returns the topmost dialog in the given context.
   *
   * If a view context is specified, the topmost dialog that overlays that view is returned.
   * This can be either a view-modal or an application-modal dialog. Otherwise, returns
   * the topmost application-modal dialog.
   */
  public top(context?: {viewId?: string}): ɵWorkbenchDialog | undefined {
    return this.dialogs(dialog => !dialog.context.view || dialog.context.view.id === context?.viewId).at(-1);
  }

  public ngOnDestroy(): void {
    this._dialogs$.value.forEach(dialog => dialog.destroy());
    this._dialogs$.next([]);
  }
}
