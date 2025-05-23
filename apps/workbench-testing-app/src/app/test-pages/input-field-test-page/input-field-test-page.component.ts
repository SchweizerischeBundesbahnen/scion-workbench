/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component} from '@angular/core';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';

@Component({
  selector: 'app-input-field-test-page',
  templateUrl: './input-field-test-page.component.html',
  styleUrls: ['./input-field-test-page.component.scss'],
  imports: [SciFormFieldComponent],
})
export default class InputFieldTestPageComponent {
}
