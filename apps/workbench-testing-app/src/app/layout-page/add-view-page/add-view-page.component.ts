/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component} from '@angular/core';
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {WorkbenchRouter, WorkbenchService} from '@scion/workbench';
import {AsyncPipe, NgFor, NgIf} from '@angular/common';
import {stringifyError} from '../../common/stringify-error.util';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';

@Component({
  selector: 'app-add-view-page',
  templateUrl: './add-view-page.component.html',
  styleUrls: ['./add-view-page.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    AsyncPipe,
    ReactiveFormsModule,
    SciFormFieldComponent,
    SciCheckboxComponent,
  ],
})
export default class AddViewPageComponent {

  public form = this._formBuilder.group({
    viewId: this._formBuilder.control('', Validators.required),
    options: this._formBuilder.group({
      partId: this._formBuilder.control('', Validators.required),
      position: this._formBuilder.control<number | undefined>(undefined),
      activateView: this._formBuilder.control<boolean | undefined>(undefined),
      activatePart: this._formBuilder.control<boolean | undefined>(undefined),
    }),
  });
  public navigateError: string | false | undefined;

  constructor(private _formBuilder: NonNullableFormBuilder,
              private _wbRouter: WorkbenchRouter,
              public workbenchService: WorkbenchService) {
  }

  public onNavigate(): void {
    this.navigateError = undefined;

    this._wbRouter
      .ɵnavigate(layout => layout.addView(this.form.controls.viewId.value, {
        partId: this.form.controls.options.controls.partId.value,
        position: this.form.controls.options.controls.position.value ?? undefined,
        activateView: this.form.controls.options.controls.activateView.value,
        activatePart: this.form.controls.options.controls.activatePart.value,
      }))
      .then(() => {
        this.navigateError = false;
        this.form.reset();
      })
      .catch(error => this.navigateError = stringifyError(error));
  }
}
