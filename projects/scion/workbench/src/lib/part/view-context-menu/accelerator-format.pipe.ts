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

/**
 * Formats given keyboard accelerator for display to the user.
 */
@Pipe({name: 'wbFormatAccelerator'})
export class WbFormatAcceleratorPipe implements PipeTransform {

  public transform(accelerator: string[] | null | undefined): string {
    if (!accelerator || accelerator.length === 0) {
      return '';
    }

    return accelerator
      .map(key => key[0].toUpperCase() + key.substring(1).toLowerCase())
      .join('+');
  }
}
