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
import {WorkbenchLayoutFactory} from '../layout/workbench-layout-factory.service';
import {RouterUtils} from '../routing/router.util';
import {Commands} from '../routing/workbench-router.service';

/**
 * Detects and resolves name conflicts of view names, that may occur when switching between perspectives.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchPerspectiveViewConflictResolver {

  constructor(private _workbenchLayoutFactory: WorkbenchLayoutFactory) {
  }

  /**
   * Detects and resolves name clashes between views defined by the perspective and views contained in the main area.
   *
   * Conflict resolution of conflicting peripheral views:
   * - Assigns views a new identity if target of a primary route. The id of such views begin with the view prefix.
   * - Removes views if target of a secondary route. The id of such views does not begin with the view prefix.
   *
   * @param mainGrid - The grid of the main area.
   * @param perspectiveLayout - The layout to resolve conflicts in.
   * @return resolved layout, or `null` if the layout of the perspective has no conflicts with the main area.
   */
  public resolve(mainGrid: MPartGrid, perspectiveLayout: PerspectiveLayout): PerspectiveLayout | null {
    const conflictingLayout = this._workbenchLayoutFactory.create({mainGrid, peripheralGrid: perspectiveLayout.grid});
    const conflictingViewIds = Arrays.intersect(
      conflictingLayout.views({scope: 'peripheral'}).map(view => view.id),
      conflictingLayout.views({scope: 'main'}).map(view => view.id),
    );
    if (!conflictingViewIds.length) {
      return null;
    }

    const viewOutlets = Maps.coerce(perspectiveLayout.viewOutlets);
    const resolvedLayout = conflictingViewIds.reduce((layout, conflictingViewId) => {
      if (RouterUtils.isPrimaryRouteTarget(conflictingViewId)) {
        const newViewId = layout.computeNextViewId();
        const path = viewOutlets.get(conflictingViewId)!;
        viewOutlets.delete(conflictingViewId);

        // Rename view in the peripheral grid.
        viewOutlets.set(newViewId, path);
        return layout.renameView(conflictingViewId, newViewId, {scope: 'peripheral'});
      }
      else {
        return layout.removeView(conflictingViewId, {scope: 'peripheral'});
      }
    }, conflictingLayout);

    return {
      grid: resolvedLayout.peripheralGrid,
      viewOutlets: Dictionaries.coerce(viewOutlets),
    };
  }
}

/**
 * Contains the perspective grid and associated view outlets.
 */
export interface PerspectiveLayout {
  grid: MPartGrid;
  viewOutlets: {[viewId: string]: Commands};
}
