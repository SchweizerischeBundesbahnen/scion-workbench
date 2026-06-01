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

/**
 * Component that logs component lifecycle events.
 */
@Component({
  selector: 'app-lifecycle-logger-test-page',
  template: 'Lifecycle Logger Test Page',
})
export default class LifecycleLoggerTestPageComponent {

  constructor() {
    console.debug(`[${inject(WorkbenchView).id}][LifecycleLoggerTestPageComponent#construct]`);
  }
}
