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
import {VIEW_ID_PREFIX} from '../workbench.constants';

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
      return element.id === MAIN_AREA || element.views.length > 0;
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
        return VIEW_ID_PREFIX.concat(`${i}`) as ViewId;
      }
    }
    return VIEW_ID_PREFIX.concat(`${ids.size + 1}`) as ViewId;
  },

  /**
   * Tests if the given id matches the format of a view identifier (e.g., `view.1`, `view.2`, etc.).
   *
   * @see ViewId
   */
  isViewId: (viewId: string | undefined | null): viewId is ViewId => {
    return viewId?.startsWith(VIEW_ID_PREFIX) ?? false;
  },
} as const;
