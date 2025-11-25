/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Directive, effect, inject, input, untracked} from '@angular/core';
import {WorkbenchPopup} from '@scion/workbench';

/**
 * Sets the popup size based on the provided `size` input.
 *
 * Has no effect if used outside a popup context.
 *
 * Usage:
 * ```ts
 * @Component({
 *   hostDirectives: [{directive: PopupSizeDirective, inputs: ['size']}],
 * }
 * ```
 */
@Directive({selector: '[appPopupSize]'})
export class PopupSizeDirective {

  public readonly size = input<WorkbenchPopupSize>();

  constructor() {
    const popup = inject(WorkbenchPopup, {optional: true});
    if (popup) {
      effect(() => {
        const size = this.size();
        if (!size) {
          return;
        }
        untracked(() => {
          popup.size.width = size.width;
          popup.size.height = size.height;
          popup.size.minWidth = size.minWidth;
          popup.size.maxWidth = size.maxWidth;
          popup.size.minHeight = size.minHeight;
          popup.size.maxHeight = size.maxHeight;
        });
      });
    }
  }
}

export interface WorkbenchPopupSize {
  minHeight?: string;
  height?: string;
  maxHeight?: string;
  minWidth?: string;
  width?: string;
  maxWidth?: string;
}
