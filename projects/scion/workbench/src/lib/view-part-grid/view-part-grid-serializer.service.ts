/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Injectable } from '@angular/core';
import { VIEW_PART_REF_PREFIX } from '../workbench.constants';

/**
 * Serializes and deserializes a URL string into a viewpart grid.
 */
@Injectable()
export class ViewPartGridSerializerService {

  public parseGrid(serializedGrid: string): ViewPartSashBox | ViewPartInfoArray | null {
    return serializedGrid && JSON.parse(atob(serializedGrid)) || null;
  }

  public serializeGrid(grid: ViewPartSashBox | ViewPartInfoArray): string | null {
    return grid && btoa(JSON.stringify(grid)) || null;
  }

  public emptySerializedGrid(): string {
    return btoa(JSON.stringify([VIEW_PART_REF_PREFIX + 1]));
  }
}

/**
 * Array to contain information about a viewpart in the viewpart grid.
 *
 * @see VIEW_PART_REF_INDEX
 * @see ACTIVE_VIEW_REF_INDEX
 * @see VIEW_REFS_START_INDEX
 */
export declare type ViewPartInfoArray = string[];

/**
 * Building block to model a viewpart grid.
 */
export interface ViewPartSashBox {
  id: number;
  sash1: ViewPartSashBox | ViewPartInfoArray;
  sash2: ViewPartSashBox | ViewPartInfoArray;
  splitter: number;
  hsplit: boolean;
}

/**
 * Index in {ViewPartInfoArray} which holds the viewpart identity.
 */
export const VIEW_PART_REF_INDEX = 0;

/**
 * Index in {ViewPartInfoArray} which holds the active view.
 */
export const ACTIVE_VIEW_REF_INDEX = 1;

/**
 * Start index in {ViewPartInfoArray} from where views are declared.
 */
export const VIEW_REFS_START_INDEX = 2;
