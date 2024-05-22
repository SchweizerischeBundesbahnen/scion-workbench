/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable} from '@angular/core';
import {ViewId, WorkbenchSelectionService} from '@scion/workbench';

/**
 *
 */
@Injectable({providedIn: 'root'})
export class SelectionRegistry {

  private _selections = new Map<ViewId, WorkbenchSelectionService>();

  public register(viewId: ViewId, selectionService: WorkbenchSelectionService): void {
    this._selections.set(viewId, selectionService);
  }

  public unregister(viewId: ViewId): void {
    this._selections.delete(viewId);
  }

  public get(viewId: ViewId): WorkbenchSelectionService | undefined {
    return this._selections.get(viewId);
  }
}
