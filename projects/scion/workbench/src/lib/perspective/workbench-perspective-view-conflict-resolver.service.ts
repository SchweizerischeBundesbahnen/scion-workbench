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

/**
 * Detects and resolves conflicting view ids, that may occur when switching between perspectives.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchPerspectiveViewConflictResolver {

  /**
   * Detects and resolves id clashes between views defined by the perspective and views contained in the main area,
   * assigning views of the perspective a new identity.
   *
   * @param currentLayout - The current workbench layout.
   * @param perspectiveLayout - The layout of the perspective to activate.
   * @return layout of the perspective with conflicts resolved.
   */
  public resolve(currentLayout: ɵWorkbenchLayout, perspectiveLayout: ɵWorkbenchLayout): ɵWorkbenchLayout {
    const perspectiveViewIds = perspectiveLayout.views({grid: 'workbench'}).map(view => view.id);
    const mainAreaViewIds = currentLayout.views({grid: 'mainArea'}).map(view => view.id);

    // Test if there are conflicts.
    const conflictingViewIds = Arrays.intersect(perspectiveViewIds, mainAreaViewIds);
    if (!conflictingViewIds.length) {
      return perspectiveLayout;
    }

    // Rename conflicting views.
    const usedViewIds = new Set<ViewId>(perspectiveViewIds.concat(mainAreaViewIds));
    conflictingViewIds.forEach(conflictingViewId => {
      const newViewId = WorkbenchLayouts.computeNextViewId(usedViewIds);
      perspectiveLayout = perspectiveLayout.renameView(conflictingViewId, newViewId);
      usedViewIds.add(newViewId);
    });

    return perspectiveLayout;
  }
}
