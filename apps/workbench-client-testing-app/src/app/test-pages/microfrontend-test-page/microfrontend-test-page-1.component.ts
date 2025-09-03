/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component} from '@angular/core';

/**
 * Microfrontend that can be used in end-to-end tests.
 */
@Component({
  selector: 'app-microfrontend-test-page-1',
  template: 'Microfrontend 1',
})
export default class MicrofrontendTestPage1Component {

  constructor() {
    console.debug(`[MicrofrontendTestPage1Component#construct]`);
  }
}
