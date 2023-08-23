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
import {FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {WorkbenchService} from '@scion/workbench';
import {stringifyError} from '../common/stringify-error.util';
import {KeyValueEntry, SciKeyValueFieldComponent} from '@scion/components.internal/key-value-field';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {NgIf} from '@angular/common';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';

@Component({
  selector: 'app-perspective-page',
  templateUrl: './perspective-page.component.html',
  styleUrls: ['./perspective-page.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    SciFormFieldComponent,
    SciCheckboxComponent,
    SciKeyValueFieldComponent,
  ],
})
export default class PerspectivePageComponent {

  public form = this._formBuilder.group({
    id: this._formBuilder.control('', Validators.required),
    transient: this._formBuilder.control<boolean | undefined>(undefined),
    data: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
  });
  public registerError: string | false | undefined;

  constructor(private _formBuilder: NonNullableFormBuilder, private _workbenchService: WorkbenchService) {
  }

  public async onRegister(): Promise<void> {
    try {
      await this._workbenchService.registerPerspective({
        id: this.form.controls.id.value,
        transient: this.form.controls.transient.value || undefined,
        layout: layout => layout,
        data: SciKeyValueFieldComponent.toDictionary(this.form.controls.data) ?? undefined,
      });
      this.registerError = false;
      this.form.reset();
      this.form.setControl('data', this._formBuilder.array<FormGroup<KeyValueEntry>>([]));
    }
    catch (error) {
      this.registerError = stringifyError(error);
    }
  }
}
