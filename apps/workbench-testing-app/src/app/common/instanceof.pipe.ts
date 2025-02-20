/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Pipe, PipeTransform, Type} from '@angular/core';

/**
 * Tests if the object is of the specified type. If so, returns the object, otherwise returns `null`.
 */
@Pipe({name: 'appInstanceof'})
export class InstanceofPipe implements PipeTransform {

  public transform<T>(object: any | undefined, type: Type<T>): T | null {
    return object instanceof type ? object : null;
  }
}
