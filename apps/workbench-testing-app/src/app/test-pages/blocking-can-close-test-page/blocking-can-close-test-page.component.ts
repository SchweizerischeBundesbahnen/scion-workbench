/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject} from '@angular/core';
import {WorkbenchView} from '@scion/workbench';
import {noop} from 'rxjs';

@Component({
  selector: 'app-blocking-can-close-test-page',
  template: 'Blocking CanClose Test Page',
  standalone: true,
})
export default class BlockingCanCloseTestPageComponent {

  constructor() {
    inject(WorkbenchView).canClose(() => {
      console.debug('[BlockingCanCloseTestPageComponent] BLOCKING');
      return new Promise<boolean>(noop);
    });
  }
}
