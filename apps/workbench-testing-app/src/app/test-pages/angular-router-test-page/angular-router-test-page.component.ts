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
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {Router} from '@angular/router';
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {RouterCommandsComponent} from '../../router-commands/router-commands.component';
import {stringifyError} from 'workbench-testing-app-common';
import {SettingsService} from '../../settings.service';
import {Commands} from '@scion/workbench';

@Component({
  selector: 'app-angular-router-test-page',
  templateUrl: './angular-router-test-page.component.html',
  styleUrls: ['./angular-router-test-page.component.scss'],
  imports: [
    SciFormFieldComponent,
    RouterCommandsComponent,
    ReactiveFormsModule,
  ],
})
export default class AngularRouterTestPageComponent {

  private readonly _router = inject(Router);
  private readonly _settingsService = inject(SettingsService);
  private readonly _formBuilder = inject(NonNullableFormBuilder);

  protected readonly form = this._formBuilder.group({
    commands: this._formBuilder.control([], Validators.required),
    outlet: this._formBuilder.control('', Validators.required),
  });

  protected navigateError: string | undefined;

  protected onNavigate(): void {
    const commands: Commands = [{
      outlets: {
        [this.form.controls.outlet.value]: this.form.controls.commands.value,
      },
    }];

    this.navigateError = undefined;
    this._router.navigate(commands)
      .then(success => success ? Promise.resolve() : Promise.reject(Error('Navigation failed')))
      .then(() => this.resetForm())
      .catch((error: unknown) => this.navigateError = stringifyError(error));
  }

  private resetForm(): void {
    if (this._settingsService.isEnabled('resetFormsOnSubmit')) {
      this.form.reset();
    }
  }
}
