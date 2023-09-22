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
import {MPart, MTreeNode} from '../layout/workbench-layout.model';
import {isGridElementVisible} from '../layout/ɵworkbench-layout';

/**
 * Tests if given element is visible.
 *
 * @see isGridElementVisible
 */
@Pipe({name: 'wbGridElementVisible', standalone: true})
export class GridElementVisiblePipe implements PipeTransform {

  public transform(gridElement: MTreeNode | MPart | null | undefined): gridElement is (MTreeNode | MPart) {
    return !!gridElement && isGridElementVisible(gridElement);
  }
}
