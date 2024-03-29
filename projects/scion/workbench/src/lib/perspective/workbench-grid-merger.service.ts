/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import {inject, Injectable, IterableChanges, IterableDiffers} from '@angular/core';
import {MPartGrid, MView} from '../layout/workbench-layout.model';
import {ɵWorkbenchLayout} from '../layout/ɵworkbench-layout';
import {MAIN_AREA} from '../layout/workbench-layout';
import {ɵWorkbenchLayoutFactory} from '../layout/ɵworkbench-layout.factory';

/**
 * Performs a three-way merge of the changes from the local and remote grid, using the base grid (common ancestor) as the base of the merge operation.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchGridMerger {

  private _differs = inject(IterableDiffers).find([]);

  constructor(private _workbenchLayoutFactory: ɵWorkbenchLayoutFactory, iterableDiffers: IterableDiffers) {
    this._differs = iterableDiffers.find([]);
  }

  /**
   * Performs a merge of given local and remote grids, using the base grid as the common ancestor.
   */
  public merge(grids: {local: MPartGrid; remote: MPartGrid; base: MPartGrid}): MPartGrid {
    const localLayout = this._workbenchLayoutFactory.create({workbenchGrid: grids.local});
    const baseLayout = this._workbenchLayoutFactory.create({workbenchGrid: grids.base});
    const remoteLayout = this._workbenchLayoutFactory.create({workbenchGrid: grids.remote});

    let mergedLayout: ɵWorkbenchLayout = localLayout;
    const viewsChanges = this.viewsDiff(baseLayout, remoteLayout);

    viewsChanges?.forEachAddedItem(({item: addedView}) => {
      // If the local grid contains the part, add the view to that part.
      const part = remoteLayout.part({by: {viewId: addedView.id}});
      if (mergedLayout.hasPart(part.id)) {
        mergedLayout = mergedLayout.addView(addedView.id, {partId: part.id});
      }
      // If the local grid does not contain the part, add the part to an existing part or create a new part.
      else {
        const existingPart = mergedLayout.parts({grid: 'workbench'}).filter(part => part.id !== MAIN_AREA)[0];
        if (existingPart) {
          mergedLayout = mergedLayout.addView(addedView.id, {partId: existingPart.id});
        }
        else {
          mergedLayout = mergedLayout
            .addPart(part.id, {align: 'left'})
            .addView(addedView.id, {partId: part.id});
        }
      }
    });

    viewsChanges?.forEachRemovedItem(({item: removedView}) => {
      mergedLayout = mergedLayout.removeView(removedView.id);
    });

    return mergedLayout.workbenchGrid;
  }

  /**
   * Computes the diff of views added or removed in layout 2.
   */
  private viewsDiff(layout1: ɵWorkbenchLayout, layout2: ɵWorkbenchLayout): IterableChanges<MView> | null {
    const differ = this._differs.create<MView>((index, view) => view.id);
    differ.diff(layout1.views({grid: 'workbench'}));
    return differ.diff(layout2.views({grid: 'workbench'}));
  }
}
