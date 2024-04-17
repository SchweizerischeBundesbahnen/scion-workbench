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
import {ɵWorkbenchLayout} from '../layout/ɵworkbench-layout';

/**
 * Performs a three-way merge of the local and remote layouts, using the base layout (common ancestor) as the base of the merge operation.
 *
 * TODO [#452] This implementation discards local changes when a new layout is available.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchGridMerger {

  /**
   * Performs a merge of given local and remote layouts, using the base layout as the common ancestor.
   */
  public merge(grids: {local: ɵWorkbenchLayout; remote: ɵWorkbenchLayout; base: ɵWorkbenchLayout}): ɵWorkbenchLayout {
    const serializedBaseLayout = grids.base.serialize();
    const serializedRemoteLayout = grids.remote.serialize();

    if (serializedBaseLayout.workbenchGrid !== serializedRemoteLayout.workbenchGrid) {
      return grids.remote;
    }
    if (serializedBaseLayout.workbenchViewOutlets !== serializedRemoteLayout.workbenchViewOutlets) {
      return grids.remote;
    }
    return grids.local;
  }
}
