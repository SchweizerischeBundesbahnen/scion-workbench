/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {WorkbenchIconDescriptor, WorkbenchIconProviderFn} from './workbench-icon-provider.model';
import {Component, input} from '@angular/core';

/**
 * Provides Material icons for non-workbench icons.
 */
export const materialIconProvider: WorkbenchIconProviderFn = (ligature: string): WorkbenchIconDescriptor | undefined => {
  if (ligature.startsWith('workbench.')) {
    return undefined; // use default workbench icon
  }

  return {component: MaterialIconComponent, inputs: {ligature}};
};

/**
 * Renders a Material icon based on its ligature.
 *
 * This component requires a Material icon font to be included in the HTML.
 *
 * Supported fonts:
 * - https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded
 * - https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined
 * - https://fonts.googleapis.com/css2?family=Material+Symbols+Sharp
 * - https://fonts.googleapis.com/css?family=Material+Icons|Material+Icons+Outlined|Material+Icons+Round|Material+Icons+Sharp
 */
@Component({
  selector: 'wb-material-icon',
  template: '{{ligature()}}',
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
