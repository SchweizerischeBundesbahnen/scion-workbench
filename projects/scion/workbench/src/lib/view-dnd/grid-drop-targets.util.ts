/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ViewMoveEventTarget} from './view-drag.service';
import {MPart, MPartGrid} from '../layout/workbench-grid.model';

/**
 * Provides helper functions for dragging a view to a grid.
 */
export const GridDropTargets = {

  /**
   * Resolves the drop target for moving a view to the root part (or node) of a grid.
   *
   * Examples:
   * - Droping a view at the grid's boundaries (north, south, east, west).
   * - Dropping a view on the grid's desktop (center).
   *
   * When dropping a view on the grid's desktop, the root of the grid can be a part or a node,
   * depending on whether the grid contains structural parts.
   */
  resolve: (target: {grid: MPartGrid; dropRegion: 'west' | 'east' | 'north' | 'south' | 'center'; workbenchId: string}): ViewMoveEventTarget => {
    const {grid, dropRegion, workbenchId} = target;

    switch (dropRegion) {
      case 'center': {
        if (grid.root instanceof MPart) {
          return {elementId: grid.root.id, workbenchId};
        }
        return {elementId: grid.activePartId, workbenchId};
      }
      default: {
        return {
          elementId: grid.root.id,
          region: dropRegion,
          workbenchId,
          newPart: {ratio: .2},
        };
      }
    }
  },
} as const;
