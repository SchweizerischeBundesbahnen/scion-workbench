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
 * Component with a size of 1000x1000 pixels.
 */
@Component({
  selector: 'app-large-test-page',
  template: '',
  styles: `:host {
    width: 1000px;
    height: 1000px;
  }`,
})
export class LargeTestPageComponent {
}
