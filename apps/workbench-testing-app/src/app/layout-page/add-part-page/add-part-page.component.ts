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
import {SciFormFieldModule} from '@scion/components.internal/form-field';
import {SciCheckboxModule} from '@scion/components.internal/checkbox';
import {AsyncPipe, NgFor, NgIf} from '@angular/common';
import {stringifyError} from '../../common/stringify-error.util';

@Component({
  selector: 'app-add-part-page',
  templateUrl: './add-part-page.component.html',
  styleUrls: ['./add-part-page.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    AsyncPipe,
    ReactiveFormsModule,
    SciFormFieldModule,
    SciCheckboxModule,
  ],
})
export default class AddPartPageComponent {

  public form = this._formBuilder.group({
    partId: this._formBuilder.control('', Validators.required),
    relativeTo: this._formBuilder.group({
      partId: this._formBuilder.control<string | undefined>(undefined),
      align: this._formBuilder.control<'left' | 'right' | 'top' | 'bottom' | undefined>(undefined, Validators.required),
      ratio: this._formBuilder.control<number | undefined>(undefined),
    }),
    activate: this._formBuilder.control<boolean | undefined>(undefined),
  });

  public navigateError: string | false | undefined;

  constructor(private _formBuilder: NonNullableFormBuilder,
              private _wbRouter: WorkbenchRouter,
              public workbenchService: WorkbenchService) {
  }

  public onNavigate(): void {
    this.navigateError = undefined;

    this._wbRouter
      .ɵnavigate(layout => layout.addPart(this.form.controls.partId.value!, {
          relativeTo: this.form.controls.relativeTo.controls.partId.value || undefined,
          align: this.form.controls.relativeTo.controls.align.value!,
          ratio: this.form.controls.relativeTo.controls.ratio.value,
        },
        {activate: this.form.controls.activate.value},
      ))
      .then(() => {
        this.navigateError = false;
        this.form.reset();
      })
      .catch(error => this.navigateError = stringifyError(error));
  }
}
