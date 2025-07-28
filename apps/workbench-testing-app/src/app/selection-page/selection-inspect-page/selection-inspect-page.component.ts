/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {ɵWorkbenchSelectionManagerService} from '@scion/workbench';
import {JsonPipe, KeyValuePipe} from '@angular/common';

@Component({
  selector: 'app-selection-inspect-page',
  templateUrl: './selection-inspect-page.component.html',
  styleUrls: ['./selection-inspect-page.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    KeyValuePipe,
    JsonPipe,
  ],
})
export default class SelectionInspectPageComponent {

  protected selectionMap = inject(ɵWorkbenchSelectionManagerService)._selections;
}
