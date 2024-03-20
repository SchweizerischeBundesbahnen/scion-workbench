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
import {stringifyError} from '../../common/stringify-error.util';
import {Commands} from '@scion/workbench';

@Component({
  selector: 'app-angular-router-test-page',
  templateUrl: './angular-router-test-page.component.html',
  styleUrls: ['./angular-router-test-page.component.scss'],
  standalone: true,
  imports: [
    SciFormFieldComponent,
    ReactiveFormsModule,
  ],
})
export default class AngularRouterTestPageComponent {

  public form = this._formBuilder.group({
    path: this._formBuilder.control('', Validators.required),
    outlet: this._formBuilder.control('', Validators.required),
  });

  public navigateError: string | undefined;

  constructor(private _router: Router, private _formBuilder: NonNullableFormBuilder) {
  }

  public onNavigate(): void {
    const commands: Commands = [{
      outlets: {
        [this.form.controls.outlet.value]: [this.form.controls.path.value],
      },
    }];

    this.navigateError = undefined;
    this._router.navigate(commands)
      .then(success => success ? Promise.resolve() : Promise.reject('Navigation failed'))
      .then(() => this.form.reset())
      .catch(error => this.navigateError = stringifyError(error));
  }
}
