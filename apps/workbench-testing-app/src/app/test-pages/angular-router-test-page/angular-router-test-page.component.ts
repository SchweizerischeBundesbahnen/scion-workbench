/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component} from '@angular/core';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {Router} from '@angular/router';
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {RouterCommandsComponent} from '../../router-commands/router-commands.component';
import {stringifyError} from '../../common/stringify-error.util';
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

  public form = this._formBuilder.group({
    commands: this._formBuilder.control([], Validators.required),
    outlet: this._formBuilder.control('', Validators.required),
  });

  public navigateError: string | undefined;

  constructor(private _router: Router,
              private _settingsService: SettingsService,
              private _formBuilder: NonNullableFormBuilder) {
  }

  public onNavigate(): void {
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
