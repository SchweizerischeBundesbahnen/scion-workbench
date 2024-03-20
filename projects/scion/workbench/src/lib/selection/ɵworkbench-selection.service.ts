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
import {WorkbenchSelection, WorkbenchSelectionManagerService} from './workbench-selection-manager.service';
import {Observable} from 'rxjs';
import {WorkbenchSelectionService} from './workbench-selection.service';
import {WorkbenchView} from '../view/workbench-view.model';
import {filter} from 'rxjs/operators';

/** @inheritDoc */
@Injectable({providedIn: 'root'})
export class ɵWorkbenchSelectionService implements WorkbenchSelectionService {

  public readonly selection$: Observable<WorkbenchSelection>;

  private settingSelection = false;

  constructor(private _selectionManager: WorkbenchSelectionManagerService,
              private _view: WorkbenchView) {
    this.selection$ = this._selectionManager.selection$
      .pipe(filter(() => !this.settingSelection));
  }

  public setSelection(selection: WorkbenchSelection): void {
    this.settingSelection = true;
    try {
      this._selectionManager.setSelection(selection, {workbenchObjectId: this._view.id});
    }
    finally {
      this.settingSelection = false;
    }
  }

  public deleteSelection(): void {
    this._selectionManager.deleteSelection(this._view.id);
  }
}
