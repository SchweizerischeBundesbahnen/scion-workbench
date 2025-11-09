/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ApplicationRef, Component, inject, Type} from '@angular/core';
import {FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {DialogId, PartId, PopupId, ViewId, WorkbenchDialogService} from '@scion/workbench';
import {stringifyError} from '../common/stringify-error.util';
import {KeyValueEntry, SciKeyValueFieldComponent} from '@scion/components.internal/key-value-field';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {DialogPageComponent} from '../dialog-page/dialog-page.component';
import {MultiValueInputComponent} from '../multi-value-input/multi-value-input.component';
import BlankTestPageComponent from '../test-pages/blank-test-page/blank-test-page.component';
import FocusTestPageComponent from '../test-pages/focus-test-page/focus-test-page.component';
import PopupOpenerPageComponent from '../popup-opener-page/popup-opener-page.component';
import InputFieldTestPageComponent from '../test-pages/input-field-test-page/input-field-test-page.component';
import SizeTestPageComponent from '../test-pages/size-test-page/size-test-page.component';
import {UUID} from '@scion/toolkit/uuid';
import {parseTypedString} from '../common/parse-typed-value.util';

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

  private readonly _formBuilder = inject(NonNullableFormBuilder);
  private readonly _dialogService = inject(WorkbenchDialogService);
  private readonly _appRef = inject(ApplicationRef);

  protected readonly form = this._formBuilder.group({
    component: this._formBuilder.control('dialog-page', Validators.required),
    options: this._formBuilder.group({
      inputs: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
      modality: this._formBuilder.control<'application' | 'view' | 'context' | ''>(''),
      context: this._formBuilder.control<ViewId | PartId | DialogId | PopupId | '<null>' | ''>(''),
      cssClass: this._formBuilder.control<string | string[] | undefined>(undefined),
      animate: this._formBuilder.control(undefined),
    }),
    count: this._formBuilder.control(''),
    rootContext: this._formBuilder.control(false),
  });

  protected dialogError: string | undefined;
  protected returnValue: string | undefined;

  protected readonly nullList = `autocomplete-null-${UUID.randomUUID()}`;

  protected async onDialogOpen(): Promise<void> {
    this.dialogError = undefined;
    this.returnValue = undefined;

    const rootContext = this.form.controls.rootContext.value;
    const dialogService = rootContext ? this._appRef.injector.get(WorkbenchDialogService) : this._dialogService;

    const dialogs = [];
    for (let i = 0; i < Number(this.form.controls.count.value || 1); i++) {
      dialogs.push(this.openDialog(dialogService, i));
    }
    await Promise.all(dialogs);
  }

  private openDialog(dialogService: WorkbenchDialogService, index: number): Promise<string | undefined> {
    const component = this.parseComponentFromUI();
    return dialogService.open<string | undefined>(component, {
      inputs: SciKeyValueFieldComponent.toDictionary(this.form.controls.options.controls.inputs) ?? undefined,
      modality: this.form.controls.options.controls.modality.value || undefined,
      cssClass: [`index-${index}`].concat(this.form.controls.options.controls.cssClass.value ?? []),
      animate: this.form.controls.options.controls.animate.value,
      context: parseTypedString(this.form.controls.options.controls.context.value, {undefinedIfEmpty: true}),
    })
      .then(result => this.returnValue = result)
      .catch((error: unknown) => this.dialogError = stringifyError(error) || 'Workbench Dialog was closed with an error');
  }

  private parseComponentFromUI(): Type<DialogPageComponent | BlankTestPageComponent | DialogOpenerPageComponent> {
    switch (this.form.controls.component.value) {
      case 'dialog-page':
        return DialogPageComponent;
      case 'dialog-opener-page':
        return DialogOpenerPageComponent;
      case 'popup-opener-page':
        return PopupOpenerPageComponent;
      case 'focus-test-page':
        return FocusTestPageComponent;
      case 'input-field-test-page':
        return InputFieldTestPageComponent;
      case 'size-test-page':
        return SizeTestPageComponent;
      default:
        throw Error(`[IllegalDialogComponent] Dialog component not supported: ${this.form.controls.component.value}`);
    }
  }
}
