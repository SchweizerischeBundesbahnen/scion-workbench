/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Pipe, PipeTransform} from '@angular/core';

/**
 * Calculates the two sash proportions for the given ratio of a {@link MTreeNode}. Each proportion is >= 1.
 */
@Pipe({name: 'wbTreeNodeSashSizes'})
export class TreeNodeSashSizesPipe implements PipeTransform {

  public transform(ratio: number): [string, string] {
    // Important: `SciSashboxComponent` requires proportions to be >= 1. For this reason we cannot simply calculate [ratio, 1 - ratio].
    if (ratio === 0) {
      return ['0px', '1'];
    }
    if (ratio === 1) {
      return ['1', '0px'];
    }

    return [`${1 / (1 - ratio)}`, `${1 / ratio}`];
  }
}
