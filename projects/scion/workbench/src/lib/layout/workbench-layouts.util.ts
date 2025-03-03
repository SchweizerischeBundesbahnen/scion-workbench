/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import {MPart, MTreeNode} from './workbench-layout.model';
import {MAIN_AREA} from './workbench-layout';
import {ViewId} from '../view/workbench-view.model';
import {ACTIVITY_ID_PREFIX, PART_ID_PREFIX, VIEW_ID_PREFIX} from '../workbench.constants';
import {UID} from '../common/uid.util';
import {PartId} from '../part/workbench-part.model';
import {ActivityId} from '../activity/workbench-activity.model';
import {WorkbenchGrids} from './workbench-grids.model';
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
   * Computes the next available view id.
   */
  computeNextViewId: (viewIds: Iterable<ViewId>): ViewId => {
    const ids = Array.from(viewIds)
      .map(viewId => Number(viewId.substring(VIEW_ID_PREFIX.length)))
      .reduce((set, id) => set.add(id), new Set<number>());

    for (let i = 1; i <= ids.size; i++) {
      if (!ids.has(i)) {
        return `${VIEW_ID_PREFIX}${i}`;
      }
    }
    return `${VIEW_ID_PREFIX}${ids.size + 1}`;
  },

  /**
   * Computes a random part id.
   */
  computePartId: (): PartId => `${PART_ID_PREFIX}${UID.randomUID()}`,

  /**
   * Computes a random activity id.
   */
  computeActivityId: (): ActivityId => `${ACTIVITY_ID_PREFIX}${UID.randomUID()}`,

  pickActivityGrids: pickActivityGrids,
} as const;

function pickActivityGrids<T>(grids: Partial<WorkbenchGrids<T>> | undefined): {[activityId: ActivityId]: T};
function pickActivityGrids<T, P>(grids: Partial<WorkbenchGrids<T>> | undefined, projectFn: (activityGrid: T) => P | undefined): {[activityId: ActivityId]: P};
function pickActivityGrids<T, P = T>(grids: Partial<WorkbenchGrids<T>> | undefined, projectFn?: (activityGrid: T) => P | undefined): {[activityId: ActivityId]: P | T} {
  return Object.fromEntries(Object.entries(grids ?? {}).reduce((acc, [gridName, grid]) => {
    if (!grid) {
      return acc;
    }
    if (!isActivityId(gridName)) {
      return acc;
    }

    if (!projectFn) {
      return acc.set(gridName, grid);
    }

    const projectedGrid = projectFn(grid);
    return projectedGrid ? acc.set(gridName, projectedGrid) : acc;
  }, new Map<ActivityId, P | T>()));
}
