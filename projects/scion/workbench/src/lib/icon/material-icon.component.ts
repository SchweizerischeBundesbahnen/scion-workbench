/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, input} from '@angular/core';

/**
 * Renders a Material icon based on its ligature.
 *
 * This component requires the Material icon font to be included in the HTML.
 *
 * Supported ligatures from the following fonts:
 * - https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded
 * - https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined
 * - https://fonts.googleapis.com/css2?family=Material+Symbols+Sharp
 * - https://fonts.googleapis.com/css?family=Material+Icons|Material+Icons+Outlined|Material+Icons+Round|Material+Icons+Sharp
 */
@Component({
  selector: 'wb-material-icon',
  templateUrl: './material-icon.component.html',
  styleUrls: ['./material-icon.component.scss'],
  host: {
    '[class.material-icons]': 'true',
    '[class.material-icons-outlined]': 'true',
    '[class.material-icons-round]': 'true',
    '[class.material-icons-sharp]': 'true',
    '[class.material-symbols-sharp]': 'true',
    '[class.material-symbols-outlined]': 'true',
    '[class.material-symbols-rounded]': 'true',
  },
})
export class MaterialIconComponent {

  /**
   * Specifies the ligature of the Material icon.
   */
  public readonly ligature = input.required<string>();
}
