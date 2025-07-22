/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import {MPart, MPartGrid, MTreeNode, WorkbenchGrids} from './workbench-grid.model';
import {ActivityId, isActivityId} from '../workbench.identifiers';

/**
 * Provides helper functions for operating on a workbench layout.
 */
export const WorkbenchLayouts = {

  /**
   * Finds the part matching the given predicate, or `null` if not found.
   */
  findPart: (element: MPart | MTreeNode, predicate: (part: MPart) => boolean): MPart | null => {
    if (element instanceof MPart) {
      return predicate(element) ? element : null;
    }
    else {
      return WorkbenchLayouts.findPart(element.child1, predicate) ?? WorkbenchLayouts.findPart(element.child2, predicate);
    }
  },

  /**
   * Tests if the given {@link MPartGrid} is empty.
   *
   * An empty grid has a single, non-structural part with no views and no navigation.
   */
  isGridEmpty: (grid: MPartGrid | undefined): boolean => {
    return !grid || (grid.root instanceof MPart && !grid.root.views.length && !grid.root.navigation && !grid.root.structural);
  },

  /**
   * Picks grids related to activities from the given grids, optionally filtering and/or transforming them.
   *
   * If the transform function returns `undefined`, the grid is excluded.
   */
  pickActivityGrids: pickActivityGrids,
} as const;

function pickActivityGrids<T>(grids: Partial<WorkbenchGrids<T>> | undefined): {[activityId: ActivityId]: T};
function pickActivityGrids<T, P>(grids: Partial<WorkbenchGrids<T>> | undefined, transformFn: (activityGrid: T) => P | undefined): {[activityId: ActivityId]: P};
function pickActivityGrids<T, P = T>(grids: Partial<WorkbenchGrids<T>> | undefined, transformFn?: (activityGrid: T) => P | undefined): {[activityId: ActivityId]: P | T} {
  return Object.fromEntries(Object.entries(grids ?? {}).reduce((acc, [gridName, grid]) => {
    if (!grid) {
      return acc;
    }
    if (!isActivityId(gridName)) {
      return acc;
    }

    if (!transformFn) {
      return acc.set(gridName, grid);
    }

    const transformedGrid = transformFn(grid);
    return transformedGrid ? acc.set(gridName, transformedGrid) : acc;
  }, new Map<ActivityId, P | T>()));
}
