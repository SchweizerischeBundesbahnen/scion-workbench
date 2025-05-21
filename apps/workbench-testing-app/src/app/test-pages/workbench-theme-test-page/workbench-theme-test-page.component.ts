/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, inject, Signal, untracked} from '@angular/core';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {WorkbenchService} from '@scion/workbench';
import {DOCUMENT} from '@angular/common';

@Component({
  selector: 'app-workbench-theme-test-page',
  templateUrl: './workbench-theme-test-page.component.html',
  styleUrls: ['./workbench-theme-test-page.component.scss'],
  imports: [
    SciFormFieldComponent,
  ],
})
export default class WorkbenchThemeTestPageComponent {

  protected readonly theme = inject(WorkbenchService).settings.theme;
  protected readonly colorScheme = this.computeColorScheme();

  private computeColorScheme(): Signal<'light' | 'dark'> {
    const documentElement = inject(DOCUMENT).documentElement;

    return computed(() => {
      // Track theme.
      this.theme();

      // Compute the color scheme when the theme has changed.
      return untracked(() => getComputedStyle(documentElement).colorScheme as 'light' | 'dark');
    });
  }
}
