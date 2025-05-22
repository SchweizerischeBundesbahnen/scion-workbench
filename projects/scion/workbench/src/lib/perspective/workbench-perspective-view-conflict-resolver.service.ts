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
import {Arrays} from '@scion/toolkit/util';
import {ViewId} from '../view/workbench-view.model';
import {WorkbenchLayouts} from '../layout/workbench-layouts.util';
import {ɵWorkbenchLayout} from '../layout/ɵworkbench-layout';
import {Objects} from '../common/objects.util';

/**
 * Detects and resolves conflicting view ids, that may occur when switching between perspectives.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchPerspectiveViewConflictResolver {

  /**
   * Detects and resolves id clashes of views contained in the new layout and views contained in the main area of the current layout,
   * assigning views of the new layout a new identity.
   *
   * @param currentLayout - The current workbench layout.
   * @param newLayout - The new workbench layout.
   * @return new layout with conflicts resolved.
   */
  public resolve(currentLayout: ɵWorkbenchLayout, newLayout: ɵWorkbenchLayout): ɵWorkbenchLayout {
    const activityGrids = WorkbenchLayouts.pickActivityGrids(newLayout.grids);
    const activityViewIds = newLayout.views({grid: Objects.keys(activityGrids)}).map(view => view.id);
    const mainViewIds = newLayout.views({grid: 'main'}).map(view => view.id);
    const mainAreaViewIds = currentLayout.views({grid: 'mainArea'}).map(view => view.id);

    // Test if there are conflicts.
    const conflictingViewIds = Arrays.intersect([...activityViewIds, ...mainViewIds], mainAreaViewIds);
    if (!conflictingViewIds.length) {
      return newLayout;
    }

    // Rename conflicting views.
    const usedViewIds = new Set<ViewId>(activityViewIds.concat(mainViewIds).concat(mainAreaViewIds));
    conflictingViewIds.forEach(conflictingViewId => {
      const newViewId = WorkbenchLayouts.computeNextViewId(usedViewIds);
      newLayout = newLayout.renameView(conflictingViewId, newViewId);
      usedViewIds.add(newViewId);
    });

    return newLayout;
  }
}
