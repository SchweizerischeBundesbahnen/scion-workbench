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
import {MAIN_AREA} from './workbench-layout';
import {ViewId} from '../view/workbench-view.model';
import {ACTIVITY_ID_PREFIX, PART_ID_PREFIX, VIEW_ID_PREFIX} from '../workbench.constants';
import {UID} from '../common/uid.util';
import {PartId} from '../part/workbench-part.model';
import {ActivityId} from '../activity/workbench-activity.model';
import {isActivityId} from './ɵworkbench-layout';

/**
 * Provides helper functions for operating on a workbench layout.
 */
export const WorkbenchLayouts = {

  /**
   * Recursively collects all parts of a given element and its descendants.
   */
  collectParts: (element: MPart | MTreeNode): MPart[] => {
    const parts = new Array<MPart>();
    if (element instanceof MPart) {
      parts.push(element);
    }
    else {
      parts.push(...WorkbenchLayouts.collectParts(element.child1));
      parts.push(...WorkbenchLayouts.collectParts(element.child2));
    }
    return parts;
  },

  /**
   * Tests if the given {@link MTreeNode} or {@link MPart} is visible.
   *
   * - A part is considered visible if it is the main area part or has at least one view.
   * - A node is considered visible if it has at least one visible part in its child hierarchy.
   */
  isGridElementVisible: (element: MTreeNode | MPart): boolean => {
    if (element instanceof MPart) {
      return element.id === MAIN_AREA || element.views.length > 0 || !!element.navigation;
    }
    return WorkbenchLayouts.isGridElementVisible(element.child1) || WorkbenchLayouts.isGridElementVisible(element.child2);
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
   * Computes a unique view id.
   */
  computeViewId: (): ViewId => `${VIEW_ID_PREFIX}${UID.randomUID()}`,

  /**
   * Computes a unique part id.
   */
  computePartId: (): PartId => `${PART_ID_PREFIX}${UID.randomUID()}`,

  /**
   * Computes a unique activity id.
   */
  computeActivityId: (): ActivityId => `${ACTIVITY_ID_PREFIX}${UID.randomUID()}`,

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
