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
  selector: 'app-standalone-view-test-page',
  templateUrl: './standalone-view-test-page.component.html',
  styleUrls: ['./standalone-view-test-page.component.scss'],
})
export default class StandaloneViewTestPageComponent {

  protected readonly view = inject(WorkbenchView);
}
