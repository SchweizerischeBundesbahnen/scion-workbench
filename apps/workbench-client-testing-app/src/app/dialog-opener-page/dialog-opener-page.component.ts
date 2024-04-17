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
import {FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {WorkbenchDialogService, WorkbenchView, ViewId} from '@scion/workbench-client';
import {stringifyError} from '../common/stringify-error.util';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {KeyValueEntry, SciKeyValueFieldComponent} from '@scion/components.internal/key-value-field';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {startWith} from 'rxjs/operators';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {CssClassComponent} from '../css-class/css-class.component';

@Component({
  selector: 'app-dialog-opener-page',
  templateUrl: './dialog-opener-page.component.html',
  styleUrls: ['./dialog-opener-page.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    SciFormFieldComponent,
    SciKeyValueFieldComponent,
    SciCheckboxComponent,
    CssClassComponent,
  ],
})
export default class DialogOpenerPageComponent {

  protected form = this._formBuilder.group({
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

  constructor(view: WorkbenchView,
              private _dialogService: WorkbenchDialogService,
              private _formBuilder: NonNullableFormBuilder) {
    view.signalReady();
    this.installContextualViewIdEnabler();
  }

  protected async onDialogOpen(): Promise<void> {
    const qualifier = SciKeyValueFieldComponent.toDictionary(this.form.controls.qualifier)!;
    const params = SciKeyValueFieldComponent.toDictionary(this.form.controls.options.controls.params);

    this.dialogError = undefined;
    this.returnValue = undefined;

    this._dialogService.open<string>(qualifier, {
      params: params ?? undefined,
      modality: this.form.controls.options.controls.modality.value || undefined,
      animate: this.form.controls.options.controls.animate.value,
      context: {
        viewId: this.form.controls.options.controls.contextualViewId.value || undefined,
      },
      cssClass: this.form.controls.options.controls.cssClass.value,
    })
      .then(result => this.returnValue = result)
      .catch(error => this.dialogError = stringifyError(error) || 'Dialog was closed with an error');
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
