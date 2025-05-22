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
import {ViewId, WorkbenchDialogOptions, WorkbenchDialogService, WorkbenchView} from '@scion/workbench-client';
import {stringifyError} from '../common/stringify-error.util';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {KeyValueEntry, SciKeyValueFieldComponent} from '@scion/components.internal/key-value-field';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {startWith} from 'rxjs/operators';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MultiValueInputComponent} from '../multi-value-input/multi-value-input.component';

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
export default class DialogOpenerPageComponent {

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
      modality: this._formBuilder.control<'application' | 'view' | ''>(''),
      contextualViewId: this._formBuilder.control<ViewId | ''>(''),
      animate: this._formBuilder.control(undefined),
      cssClass: this._formBuilder.control<string | string[] | undefined>(undefined),
    }),
  });

  protected dialogError: string | undefined;
  protected returnValue: string | undefined;

  constructor() {
    inject(WorkbenchView).signalReady();
    this.installContextualViewIdEnabler();
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
      params: SciKeyValueFieldComponent.toDictionary(options.params) ?? undefined,
      modality: options.modality.value || undefined,
      animate: options.animate.value,
      context: {
        viewId: options.contextualViewId.value || undefined,
      },
      cssClass: options.cssClass.value,
    };
  }

  /**
   * Enables the field for setting a contextual view reference when choosing view modality.
   */
  private installContextualViewIdEnabler(): void {
    this.form.controls.options.controls.modality.valueChanges
      .pipe(
        startWith(this.form.controls.options.controls.modality.value),
        takeUntilDestroyed(),
      )
      .subscribe(modality => {
        if (modality === 'view') {
          this.form.controls.options.controls.contextualViewId.enable();
        }
        else {
          this.form.controls.options.controls.contextualViewId.setValue('');
          this.form.controls.options.controls.contextualViewId.disable();
        }
      });
  }
}
