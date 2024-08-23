/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component} from '@angular/core';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {WorkbenchService} from '@scion/workbench';

@Component({
  selector: 'app-workbench-theme-test-page',
  templateUrl: './workbench-theme-test-page.component.html',
  styleUrls: ['./workbench-theme-test-page.component.scss'],
  standalone: true,
  imports: [
    SciFormFieldComponent,
  ],
})
export default class WorkbenchThemeTestPageComponent {

  constructor(public workbenchService: WorkbenchService) {
  }
}
