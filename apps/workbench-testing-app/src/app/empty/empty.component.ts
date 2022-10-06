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

/**
 * Component that does not display anything. Can be used in end-to-end tests, e.g., as a popup component.
 */
@Component({
  selector: 'app-empty',
  template: 'EmptyComponent',
  standalone: true,
})
export class EmptyComponent {
}
