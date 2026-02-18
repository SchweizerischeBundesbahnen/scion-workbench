/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Pipe, PipeTransform} from '@angular/core';

/**
 * Joins given items by given separator.
 */
@Pipe({name: 'wbJoin'})
export class JoinPipe implements PipeTransform {

  public transform<T>(items: T[] | null | undefined, separator: string): string {
    if (!items?.length) {
      return '';
    }
    return items.map(item => `${item}`).join(separator);
  }
}
