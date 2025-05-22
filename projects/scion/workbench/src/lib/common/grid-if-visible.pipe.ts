/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Pipe, PipeTransform} from '@angular/core';
import {MPartGrid} from '../layout/workbench-grid.model';
import {WorkbenchLayouts} from '../layout/workbench-layouts.util';

/**
 * Returns given grid, but only if visible.
 *
 * @see isGridElementVisible
 */
@Pipe({name: 'wbGridIfVisible'})
export class GridIfVisiblePipe implements PipeTransform {

  public transform(grid: MPartGrid | null | undefined): MPartGrid | null {
    if (grid && WorkbenchLayouts.isGridElementVisible(grid.root)) {
      return grid;
    }
    return null;
  }
}
