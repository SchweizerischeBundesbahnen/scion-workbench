/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component } from '@angular/core';
import { WorkbenchView } from '@scion/workbench';

@Component({
  selector: 'app-view-bb9700a6',
  templateUrl: 'view-bb9700a6.component.html',
})

export class ViewBb9700a6Component {

  constructor(view: WorkbenchView) {
    view.title = 'Testcase bb9700a6';
    view.cssClass = 'e2e-view-bb9700a6';
  }
}
