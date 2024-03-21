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
import {Arrays} from '@scion/toolkit/util';
import {ɵWorkbenchLayoutFactory} from '../layout/ɵworkbench-layout.factory';
import {MPerspectiveLayout} from './workbench-perspective.model';
import {ViewId} from '../view/workbench-view.model';
import {WorkbenchLayouts} from '../layout/workbench-layouts.util';

/**
 * Detects and resolves name conflicts of view names, that may occur when switching between perspectives.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchPerspectiveViewConflictResolver {

  constructor(public _workbenchLayoutFactory: ɵWorkbenchLayoutFactory) {
  }

  /**
   * Detects and resolves name clashes between views defined by the perspective and views in the main area.
   *
   * Conflict resolution for views defined by the perspective:
   * - Assigns views a new identity if target of a primary route. The id of such views begin with the view prefix.
   * - Removes views if target of a secondary route. The id of such views does not begin with the view prefix.
   *
   * @param mainAreaGrid - The grid of the main area.
   * @param perspectiveLayout - The workbench grid and views of the perspective.
   * @return workbench grid and views of the provided perspective with conflicts resolved, if any.
   */
  public resolve(mainAreaGrid: MPartGrid, perspectiveLayout: MPerspectiveLayout): MPerspectiveLayout {
    const perspectiveViewIds = WorkbenchLayouts.collectViews(perspectiveLayout.workbenchGrid.root).map(view => view.id);
    const mainAreaViewIds = WorkbenchLayouts.collectViews(mainAreaGrid.root).map(view => view.id);

    // Sort for deterministic behavior in tests
    const conflictingViewIds = Arrays.intersect(perspectiveViewIds, mainAreaViewIds).sort((a, b) => a.localeCompare(b, 'en', {numeric: true}));
    if (!conflictingViewIds.length) {
      return perspectiveLayout;
    }

    // Create layout with conflicts resolved.
    let layout = this._workbenchLayoutFactory.create({
      workbenchGrid: perspectiveLayout.workbenchGrid,
      viewOutlets: perspectiveLayout.viewOutlets,
    });

    // Rename conflicting views.
    const usedViewIds = new Set<ViewId>(perspectiveViewIds.concat(mainAreaViewIds));
    conflictingViewIds.forEach(conflictingViewId => {
      const newViewId = WorkbenchLayouts.computeNextViewId(usedViewIds);
      layout = layout.renameView(conflictingViewId, newViewId);
      usedViewIds.add(newViewId);
    });

    return {
      workbenchGrid: layout.workbenchGrid,
      viewOutlets: layout.viewOutlets(),
    };
  }
}
