/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Directive, inject} from '@angular/core';
import {Field} from '@angular/forms/signals';

@Directive({
  selector: '[appFieldValidation]',
  host: {
    '[class.ng-invalid]': 'field.state().invalid()',
    '[class.ng-touched]': 'field.state().touched()',
  },
})
export class FieldValidationDirective {

  protected readonly field = inject(Field);
}
