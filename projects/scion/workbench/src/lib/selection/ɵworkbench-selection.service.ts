/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {effect, inject, Injectable, Signal} from '@angular/core';
import {WorkbenchSelectionManagerService} from './workbench-selection-manager.service';
import {filter, map, tap} from 'rxjs/operators';
import {WorkbenchSelectionService} from './workbench-selection.service';
import {WorkbenchSelection, WorkbenchSelectionProvider} from './workbench-selection.model';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';

/** @inheritDoc */
@Injectable()
export class ɵWorkbenchSelectionService implements WorkbenchSelectionService {

  private readonly _selectionManager = inject(WorkbenchSelectionManagerService);
  private readonly _selectionProvider = inject(WorkbenchSelectionProvider);

  public readonly selection = this.computeSelection();

  constructor() {
    effect(() => {
      console.log(`>>> ɵWorkbenchSelectionService provider=${this._selectionProvider.id}`, this._selectionManager.selection());
    });
  }

  public setSelection(selection: WorkbenchSelection): void {
    this._selectionManager.setSelection({data: selection, provider: this._selectionProvider.id});
  }

  public deleteSelection(): void {
    this._selectionManager.deleteSelection(this._selectionProvider.id);
  }

  private computeSelection(): Signal<WorkbenchSelection> {
    const selection$ = toObservable(this._selectionManager.selection);
    return toSignal(selection$
      .pipe(
        tap(selection => console.log('>>> compute selection', selection)),
        filter(selection => selection.provider !== this._selectionProvider.id),
        map(selection => selection.data),
      ), {initialValue: {}});
  }
}
