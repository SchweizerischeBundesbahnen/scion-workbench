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
import {Dictionary} from '@scion/toolkit/util';

/**
 * Continues the pipe with specified value of the dictionary.
 */
@Pipe({name: 'wbPluck'})
export class PluckPipe implements PipeTransform {

  public transform<T>(data: Dictionary, name: string): T {
    return data[name];
  }
}
