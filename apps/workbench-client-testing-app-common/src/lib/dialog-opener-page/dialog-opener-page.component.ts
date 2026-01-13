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
import {FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {DialogId, PartId, PopupId, ViewId, WORKBENCH_ELEMENT, WorkbenchDialogOptions, WorkbenchDialogService, WorkbenchElement} from '@scion/workbench-client';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {KeyValueEntry, SciKeyValueFieldComponent} from '@scion/components.internal/key-value-field';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {UUID} from '@scion/toolkit/uuid';
import {MultiValueInputComponent, parseTypedObject, parseTypedString, stringifyError} from 'workbench-testing-app-common';
import {Beans} from '@scion/toolkit/bean-manager';

@Component({
  selector: 'app-dialog-opener-page',
  templateUrl: './dialog-opener-page.component.html',
  styleUrls: ['./dialog-opener-page.component.scss'],
  imports: [
    ReactiveFormsModule,
    SciFormFieldComponent,
    SciKeyValueFieldComponent,
    SciCheckboxComponent,
    MultiValueInputComponent,
  ],
})
export class DialogOpenerPageComponent {

  private readonly _dialogService = inject(WorkbenchDialogService);
  private readonly _formBuilder = inject(NonNullableFormBuilder);

  protected readonly form = this._formBuilder.group({
    qualifier: this._formBuilder.array<FormGroup<KeyValueEntry>>([
      this._formBuilder.group({
        key: this._formBuilder.control('component'),
        value: this._formBuilder.control('dialog'),
      }),
      this._formBuilder.group({
        key: this._formBuilder.control('app'),
        value: this._formBuilder.control('app1'),
      }),
    ], Validators.required),
    options: this._formBuilder.group({
      params: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
      modality: this._formBuilder.control<'' | 'none' | 'context' | 'application' | 'view'>(''),
      context: this._formBuilder.control<ViewId | PartId | DialogId | PopupId | '<null>' | ''>(''),
      animate: this._formBuilder.control(undefined),
      cssClass: this._formBuilder.control<string | string[] | undefined>(undefined),
    }),
  });

  protected dialogError: string | undefined;
  protected returnValue: string | undefined;

  protected readonly nullList = `autocomplete-null-${UUID.randomUUID()}`;

  constructor() {
    Beans.opt<WorkbenchElement>(WORKBENCH_ELEMENT)?.signalReady();
  }

  protected async onDialogOpen(): Promise<void> {
    this.dialogError = undefined;
    this.returnValue = undefined;

    const qualifier = SciKeyValueFieldComponent.toDictionary(this.form.controls.qualifier)!;
    this._dialogService.open<string>(qualifier, this.readOptions())
      .then(result => this.returnValue = result)
      .catch((error: unknown) => this.dialogError = stringifyError(error) || 'Dialog was closed with an error');
  }

  /**
   * Reads options from the UI.
   */
  private readOptions(): WorkbenchDialogOptions {
    const options = this.form.controls.options.controls;
    return {
      params: parseTypedObject(SciKeyValueFieldComponent.toDictionary(options.params)) ?? undefined,
      modality: options.modality.value || undefined,
      animate: options.animate.value,
      context: parseTypedString(options.context.value, {undefinedIfEmpty: true}),
      cssClass: options.cssClass.value,
    };
  }
}
