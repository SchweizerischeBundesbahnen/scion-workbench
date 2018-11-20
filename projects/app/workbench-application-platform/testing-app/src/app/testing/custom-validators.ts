/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { AbstractControl, ValidationErrors } from '@angular/forms';

export class CustomValidators {

  private constructor() {
  }

  /**
   * Validator that requires the control have a valid JSON value.
   */
  public static json(control: AbstractControl): ValidationErrors | null {
    if (isEmptyInputValue(control.value)) {
      return null;  // don't validate empty values to allow optional controls
    }

    try {
      JSON.parse(control.value);
      return null;
    } catch (error) {
      return {'json': true};
    }
  }
}

function isEmptyInputValue(value: any): boolean {
  return value == null || value.length === 0;
}
