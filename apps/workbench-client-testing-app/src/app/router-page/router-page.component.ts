/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject, numberAttribute} from '@angular/core';
import {FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {WorkbenchNavigationExtras, WorkbenchRouter, WorkbenchView} from '@scion/workbench-client';
import {KeyValueEntry, SciKeyValueFieldComponent} from '@scion/components.internal/key-value-field';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {parseTypedObject} from '../common/parse-typed-value.util';
import {UUID} from '@scion/toolkit/uuid';
import {stringifyError} from '../common/stringify-error.util';
import {MultiValueInputComponent} from '../multi-value-input/multi-value-input.component';
import {prune} from '../common/prune.util';

@Component({
  selector: 'app-router-page',
  templateUrl: './router-page.component.html',
  styleUrls: ['./router-page.component.scss'],
  imports: [
    ReactiveFormsModule,
    SciFormFieldComponent,
    SciKeyValueFieldComponent,
    SciCheckboxComponent,
    MultiValueInputComponent,
  ],
})
export default class RouterPageComponent {

  private readonly _formBuilder = inject(NonNullableFormBuilder);
  private readonly _router = inject(WorkbenchRouter);

  protected readonly form = this._formBuilder.group({
    qualifier: this._formBuilder.array<FormGroup<KeyValueEntry>>([], Validators.required),
    params: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
    target: this._formBuilder.control(''),
    partId: this._formBuilder.control(''),
    position: this._formBuilder.control(''),
    activate: this._formBuilder.control<boolean | undefined>(undefined),
    close: this._formBuilder.control<boolean | undefined>(undefined),
    cssClass: this._formBuilder.control<string | string[] | undefined>(undefined),
  });

  protected readonly targetList = `target-list-${UUID.randomUUID()}`;
  protected readonly positionList = `position-list-${UUID.randomUUID()}`;

  protected navigateError: string | undefined;

  constructor() {
    inject(WorkbenchView).signalReady();
  }

  protected async onNavigate(): Promise<void> {
    this.navigateError = undefined;

    const qualifier = SciKeyValueFieldComponent.toDictionary(this.form.controls.qualifier)!;
    const params = parseTypedObject(SciKeyValueFieldComponent.toDictionary(this.form.controls.params));

    const extras: WorkbenchNavigationExtras = prune({
      activate: this.form.controls.activate.value,
      close: this.form.controls.close.value,
      target: this.form.controls.target.value || undefined,
      partId: this.form.controls.partId.value || undefined,
      position: coercePosition(this.form.controls.position.value),
      params: params ?? undefined,
      cssClass: this.form.controls.cssClass.value ?? undefined,
    });
    await this._router.navigate(qualifier, extras)
      .then(success => success ? Promise.resolve() : Promise.reject(Error('Navigation failed')))
      .then(() => this.resetForm())
      .catch((error: unknown) => this.navigateError = stringifyError(error));
  }

  private resetForm(): void {
    this.form.reset();
    this.form.setControl('qualifier', this._formBuilder.array<FormGroup<KeyValueEntry>>([]));
    this.form.setControl('params', this._formBuilder.array<FormGroup<KeyValueEntry>>([]));
  }
}

function coercePosition(value: unknown): number | 'start' | 'end' | 'before-active-view' | 'after-active-view' | undefined {
  if (value === '') {
    return undefined;
  }
  if (value === 'start' || value === 'end' || value === 'before-active-view' || value === 'after-active-view' || value === undefined) {
    return value;
  }
  return numberAttribute(value);
}
