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
import {Dictionary, Maps} from '@scion/toolkit/util';

/**
 * Creates a {@link Map} from the given map-like object. If given a {@link Map}, it is returned.
 * If given `null` or `undefined`, returns an empty Map.
 */
@Pipe({name: 'wbCoerceMap'})
export class MapCoercePipe implements PipeTransform {

  public transform<V>(mapLike: Map<string, V> | Dictionary<V> | undefined | null): Map<string, V> {
    return Maps.coerce(mapLike);
  }
}
