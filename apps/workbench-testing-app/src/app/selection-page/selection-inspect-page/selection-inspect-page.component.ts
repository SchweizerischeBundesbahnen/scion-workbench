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
import {ReactiveFormsModule} from '@angular/forms';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {ɵWorkbenchSelectionManagerService} from '@scion/workbench';
import {JsonPipe, KeyValuePipe} from '@angular/common';
import {SciKeyValueComponent} from '@scion/components.internal/key-value';

@Component({
  selector: 'app-selection-inspect-page',
  templateUrl: './selection-inspect-page.component.html',
  styleUrls: ['./selection-inspect-page.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    SciFormFieldComponent,
    KeyValuePipe,
    SciKeyValueComponent,
    JsonPipe,
  ],
})
export default class SelectionInspectPageComponent {

  public selectionMap = this._selectionManagerService._selections;

  constructor(private _selectionManagerService: ɵWorkbenchSelectionManagerService) {
  }

}
