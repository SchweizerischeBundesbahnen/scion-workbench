/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, input} from '@angular/core';

@Component({
  selector: 'app-underline-toolbar-control',
  template: '',
  styles: `
    :host {
      display: block;
      border-top: var(--border-size) var(--border-style) var(--sci-color-text);
      width: 100%;
    }
  `,
  host: {
    '[style.--border-style]': 'borderStyle()',
    '[style.--border-size]': 'borderWidth()',
  },
})
export class UnderlineToolbarControlComponent {

  public readonly borderStyle = input.required<'solid' | 'double' | 'dashed' | 'dotted'>({alias: 'style'});

  protected readonly borderWidth = computed(() => this.borderStyle() === 'double' ? '3px' : '1px');
}
