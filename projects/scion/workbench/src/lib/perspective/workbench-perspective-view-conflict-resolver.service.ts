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
import {MPartGrid} from '../layout/workbench-layout.model';
import {Arrays, Dictionaries, Maps} from '@scion/toolkit/util';
import {ɵWorkbenchLayoutFactory} from '../layout/ɵworkbench-layout.factory';
import {RouterUtils} from '../routing/router.util';
import {Commands} from '../routing/workbench-router.service';

/**
 * Detects and resolves name conflicts of view names, that may occur when switching between perspectives.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchPerspectiveViewConflictResolver {

  constructor(private _workbenchLayoutFactory: ɵWorkbenchLayoutFactory) {
  }

  /**
   * Detects and resolves name clashes between views defined by the perspective and views in the main area.
   *
   * Conflict resolution for views defined by the perspective:
   * - Assigns views a new identity if target of a primary route. The id of such views begin with the view prefix.
   * - Removes views if target of a secondary route. The id of such views does not begin with the view prefix.
   *
   * @param mainAreaGrid - The grid of the main area.
   * @param perspective - The workbench grid and views of the perspective.
   * @return workbench grid and views of the provided perspective with conflicts resolved, if any.
   */
  public resolve(mainAreaGrid: MPartGrid, perspective: {workbenchGrid: MPartGrid; viewOutlets: {[viewId: string]: Commands}}): {workbenchGrid: MPartGrid; viewOutlets: {[viewId: string]: Commands}} {
    const conflictingLayout = this._workbenchLayoutFactory.create({mainAreaGrid, workbenchGrid: perspective.workbenchGrid});
    const conflictingViewIds = Arrays.intersect(
      conflictingLayout.views({grid: 'workbench'}).map(view => view.id),
      conflictingLayout.views({grid: 'mainArea'}).map(view => view.id),
    );
    if (!conflictingViewIds.length) {
      return perspective;
    }

    const viewOutlets = Maps.coerce(perspective.viewOutlets);
    const resolvedLayout = conflictingViewIds.reduce((layout, conflictingViewId) => {
      if (RouterUtils.isPrimaryRouteTarget(conflictingViewId)) {
        const newViewId = layout.computeNextViewId();
        const path = viewOutlets.get(conflictingViewId)!;
        viewOutlets.delete(conflictingViewId);

        // Rename view in the perspective grid.
        viewOutlets.set(newViewId, path);
        return layout.renameView(conflictingViewId, newViewId, {grid: 'workbench'});
      }
      else {
        return layout.removeView(conflictingViewId, {grid: 'workbench'});
      }
    }, conflictingLayout);

    return {
      workbenchGrid: resolvedLayout.workbenchGrid,
      viewOutlets: Dictionaries.coerce(viewOutlets),
    };
  }
}
