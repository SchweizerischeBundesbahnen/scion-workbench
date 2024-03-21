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
import {MPerspectiveLayout} from './workbench-perspective.model';
import {WorkbenchLayoutSerializer} from '../layout/workench-layout-serializer.service';

/**
 * Performs a three-way merge of the changes from the local and remote grid, using the base grid (common ancestor) as the base of the merge operation.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchGridMerger {

  constructor(private _workbenchLayoutSerializer: WorkbenchLayoutSerializer) {
  }

  /**
   * Performs a merge of given local and remote grids, using the base grid as the common ancestor.
   *
   * TODO [WB-LAYOUT] Fix me
   */
  public merge(grids: {local: MPerspectiveLayout; remote: MPerspectiveLayout; base: MPerspectiveLayout}): MPerspectiveLayout {
    const serializedBaseGrid = this._workbenchLayoutSerializer.serialize(grids.base.workbenchGrid);
    const serializedBaseOutlets = this._workbenchLayoutSerializer.serializeViewOutlets(grids.base.viewOutlets);

    const serializedRemoteGrid = this._workbenchLayoutSerializer.serialize(grids.remote.workbenchGrid);
    const serializedRemoteOutlets = this._workbenchLayoutSerializer.serializeViewOutlets(grids.remote.viewOutlets);

    if (serializedBaseGrid === serializedRemoteGrid && serializedBaseOutlets === serializedRemoteOutlets) {
      return grids.local;
    }
    else {
      return grids.remote;
    }
  }
}
