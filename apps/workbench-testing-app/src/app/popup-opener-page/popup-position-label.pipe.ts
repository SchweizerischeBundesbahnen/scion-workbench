/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Pipe, PipeTransform} from '@angular/core';

export type Position = 'point' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

@Pipe({name: 'wbPopupPositionLabel', standalone: true})
export class PopupPositionLabelPipe implements PipeTransform {

  public transform(position: Position, axis: 'vertical' | 'horizontal'): string {
    switch (position) {
      case 'top-left':
        return axis === 'vertical' ? 'top' : 'left';
      case 'top-right':
        return axis === 'vertical' ? 'top' : 'right';
      case 'bottom-left':
        return axis === 'vertical' ? 'bottom' : 'left';
      case 'bottom-right':
        return axis === 'vertical' ? 'bottom' : 'right';
      case 'point':
        return axis === 'vertical' ? 'y' : 'x';
      default:
        throw Error(`[UnsupportedPositionError] Expected one of [point|top-left|top-right|bottom-left|bottom-right], but was [${position}]`);
    }
  }
}
