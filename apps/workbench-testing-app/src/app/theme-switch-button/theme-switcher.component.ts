/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectionStrategy, Component, effect, inject, untracked} from '@angular/core';
import {WorkbenchService} from '@scion/workbench';
import {NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {SciMaterialIconDirective} from '@scion/components.internal/material-icon';
import {SciToggleButtonComponent} from '@scion/components.internal/toggle-button';

@Component({
  selector: 'app-theme-switcher',
  templateUrl: './theme-switcher.component.html',
  styleUrls: ['./theme-switcher.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    SciMaterialIconDirective,
    SciToggleButtonComponent,
  ],
})
export class ThemeSwitcherComponent {

  protected readonly lightThemeActiveFormControl = inject(NonNullableFormBuilder).control<boolean | undefined>(undefined);

  constructor() {
    this.installThemeSwitcher();
  }

  protected onActivateLightTheme(): void {
    this.lightThemeActiveFormControl.setValue(true);
  }

  protected onActivateDarkTheme(): void {
    this.lightThemeActiveFormControl.setValue(false);
  }

  private installThemeSwitcher(): void {
    const workbenchService = inject(WorkbenchService);

    effect(() => {
      const theme = workbenchService.settings.theme();
      untracked(() => {
        this.lightThemeActiveFormControl.setValue(theme === 'scion-light', {emitEvent: false});
      });
    });

    this.lightThemeActiveFormControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(lightTheme => {
        workbenchService.settings.theme.set(lightTheme ? 'scion-light' : 'scion-dark');
      });
  }
}
