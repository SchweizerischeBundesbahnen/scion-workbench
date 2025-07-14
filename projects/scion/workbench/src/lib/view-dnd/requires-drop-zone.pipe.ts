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
import {MPart, MTreeNode} from '../layout/workbench-grid.model';
import {MAIN_AREA} from '../layout/workbench-layout';

/**
 * Determines whether the given element requires a drop zone in the specified region.
 *
 * An element requires a drop zone if its layout is divided into multiple parts in that region.
 */
@Pipe({name: 'wbRequiresDropZone'})
export class RequiresDropZonePipe implements PipeTransform {

  public transform(element: MTreeNode | MPart, region: 'north' | 'south' | 'east' | 'west'): boolean {
    return requiresDropZone(element, region);
  }
}

function requiresDropZone(element: MTreeNode | MPart, region: 'north' | 'south' | 'east' | 'west'): boolean {
  if (element instanceof MPart) {
    // Return `false` for every part except the main area part, allowing for dragging a first view to the side of the main area grid.
    return element.id === MAIN_AREA;
  }

  const {child1, child2} = element;
  if (child1.visible && child2.visible) {
    switch (region) {
      case 'north':
        // The element requires a drop zone if the element (or its first child) is divided horizontally into multiple parts.
        return element.direction === 'row' || requiresDropZone(child1, region);
      case 'south':
        // The element requires a drop zone if the element (or its second child) is divided horizontally into multiple parts.
        return element.direction === 'row' || requiresDropZone(child2, region);
      case 'west':
        // The element requires a drop zone if the element (or its first child) is divided vertically into multiple parts.
        return element.direction === 'column' || requiresDropZone(child1, region);
      case 'east':
        // The element requires a drop zone if the element (or its second child) is divided vertically into multiple parts.
        return element.direction === 'column' || requiresDropZone(child2, region);
      default:
        return false; // unsupported
    }
  }
  return requiresDropZone(child1.visible ? child1 : child2, region);
}
