/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable} from '@angular/core';
import {WorkbenchSelectionManagerService} from './workbench-selection-manager.service';
import {Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {WorkbenchSelectionService} from './workbench-selection.service';
import {WorkbenchSelectionData, WorkbenchSelectionProvider, ɵWorkbenchSelection} from './workbench-selection.model';

/** @inheritDoc */
@Injectable()
export class ɵWorkbenchSelectionService implements WorkbenchSelectionService {

  public readonly selection$: Observable<WorkbenchSelectionData>;

  constructor(private _selectionManager: WorkbenchSelectionManagerService,
              private _selectionProvider: WorkbenchSelectionProvider) {
    this.selection$ = this._selectionManager.selection$
      .pipe(
        filter(selection => selection.provider !== this._selectionProvider.id),
        map(selection => selection.data),
      );
  }

  public setSelection(selection: WorkbenchSelectionData): void {
    this._selectionManager.setSelection(new ɵWorkbenchSelection(selection, {provider: this._selectionProvider.id}));
  }

  public deleteSelection(): void {
    this._selectionManager.deleteSelection(this._selectionProvider.id);
  }
}
