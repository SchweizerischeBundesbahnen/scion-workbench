/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {inject, Injectable} from '@angular/core';
import {WorkbenchSelectionManagerService} from './workbench-selection-manager.service';
import {WorkbenchSelectionService} from './workbench-selection.service';
import {WorkbenchSelection, WorkbenchSelectionOptions, WorkbenchSelectionProvider} from './workbench-selection.model';
import {Observable} from 'rxjs';
import {filter, map, tap} from 'rxjs/operators';

/** @inheritDoc */
@Injectable()
export class ɵWorkbenchSelectionService implements WorkbenchSelectionService {

  private readonly _selectionManager = inject(WorkbenchSelectionManagerService);
  private readonly _selectionProvider = inject(WorkbenchSelectionProvider);

  public readonly selection: Observable<WorkbenchSelection>;

  // public readonly selection = this.computeSelection();
  // public readonly _selection = signal<WorkbenchSelection>({});
  // public readonly selection = this._selection.asReadonly();

  constructor() {
    this.selection = this._selectionManager.selection
      .pipe(
        tap(selection => console.log('>>> propagate', selection.propagate)),
        filter(selection => selection.provider !== this._selectionProvider.id),
        filter(selection => selection.propagate),
        map(selection => selection.data),
      );
    // this.selection = toSignal(this._selectionManager.selection
    //   .pipe(
    //     filter(selection => selection.provider !== this._selectionProvider.id),
    //     map(selection => selection.data),
    //   ), {requireSync: true});

    // effect(() => {
    //   console.log(`>>> ɵWorkbenchSelectionService provider=${this._selectionProvider.id}`, this._selectionManager.selection());
    // });
    // this.computeSelection();
  }

  public setSelection(selection: WorkbenchSelection, options?: WorkbenchSelectionOptions): void {
    console.log(`>>> set selection propagate=${options?.propagate}`);
    this._selectionManager.setSelection({data: selection, provider: this._selectionProvider.id, propagate: options?.propagate ?? true});
  }

  public deleteSelection(): void {
    this._selectionManager.deleteSelection(this._selectionProvider.id);
  }

  // private computeSelection(): Signal<WorkbenchSelection> {
  //   const selection$ = toObservable(this._selectionManager.selection);
  //   return toSignal(selection$
  //     .pipe(
  //       tap(selection => console.log('>>> compute selection', selection)),
  //       filter(selection => selection.provider !== this._selectionProvider.id),
  //       map(selection => selection.data),
  //     ), {initialValue: {}});
  // }
  // private computeSelection(): void {
  //   effect(() => {
  //     const newSelection = this._selectionManager.selection();
  //
  //     untracked(() => {
  //       if (newSelection.provider !== this._selectionProvider.id) {
  //         this._selection.set(newSelection.data);
  //       }
  //     })
  //   });
  // }
}
