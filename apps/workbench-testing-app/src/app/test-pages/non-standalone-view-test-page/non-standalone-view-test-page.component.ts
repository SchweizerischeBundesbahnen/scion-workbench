/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject} from '@angular/core';
import {WorkbenchView} from '@scion/workbench';

@Component({
  selector: 'app-non-standalone-view-test-page',
  templateUrl: './non-standalone-view-test-page.component.html',
  styleUrls: ['./non-standalone-view-test-page.component.scss'],
  standalone: false, // eslint-disable-line @angular-eslint/prefer-standalone
})
export class NonStandaloneViewTestPageComponent {

  protected readonly view = inject(WorkbenchView);
}
