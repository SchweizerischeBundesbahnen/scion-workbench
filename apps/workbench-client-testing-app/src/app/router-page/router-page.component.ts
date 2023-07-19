/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component} from '@angular/core';
import {FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {WorkbenchNavigationExtras, WorkbenchRouter} from '@scion/workbench-client';
import {KeyValueEntry, SciKeyValueFieldComponent} from '@scion/components.internal/key-value-field';
import {coerceNumberProperty} from '@angular/cdk/coercion';
import {convertValueFromUI} from '../common/convert-value-from-ui.util';
import {NgIf} from '@angular/common';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';

@Component({
  selector: 'app-router-page',
  templateUrl: './router-page.component.html',
  styleUrls: ['./router-page.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    SciFormFieldComponent,
    SciKeyValueFieldComponent,
    SciCheckboxComponent,
  ],
})
export default class RouterPageComponent {

  public form = this._formBuilder.group({
    qualifier: this._formBuilder.array<FormGroup<KeyValueEntry>>([], Validators.required),
    params: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
    target: this._formBuilder.control(''),
    insertionIndex: this._formBuilder.control(''),
    activate: this._formBuilder.control<boolean | undefined>(undefined),
    close: this._formBuilder.control<boolean | undefined>(undefined),
    cssClass: this._formBuilder.control<string | undefined>(undefined),
  });
  public navigateError: string | undefined;

  constructor(private _formBuilder: NonNullableFormBuilder,
              private _router: WorkbenchRouter) {
  }

  public async onNavigate(): Promise<void> {
    this.navigateError = undefined;

    const qualifier = SciKeyValueFieldComponent.toDictionary(this.form.controls.qualifier)!;
    const params = SciKeyValueFieldComponent.toDictionary(this.form.controls.params);

    // Convert entered params to their actual values.
    params && Object.entries(params).forEach(([paramName, paramValue]) => params[paramName] = convertValueFromUI(paramValue));

    const extras: WorkbenchNavigationExtras = {
      activate: this.form.controls.activate.value,
      close: this.form.controls.close.value,
      target: this.form.controls.target.value || undefined,
      blankInsertionIndex: coerceInsertionIndex(this.form.controls.insertionIndex.value),
      params: params || undefined,
      cssClass: this.form.controls.cssClass.value?.split(/\s+/).filter(Boolean),
    };
    await this._router.navigate(qualifier, extras)
      .then(success => success ? Promise.resolve() : Promise.reject('Navigation failed'))
      .catch(error => this.navigateError = error);
  }
}

function coerceInsertionIndex(value: any): number | 'start' | 'end' | undefined {
  if (value === '') {
    return undefined;
  }
  if (value === 'start' || value === 'end' || value === undefined) {
    return value;
  }
  return coerceNumberProperty(value);
}
