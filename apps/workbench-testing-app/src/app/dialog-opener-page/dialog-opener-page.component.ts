/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ApplicationRef, Component, Type} from '@angular/core';
import {FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {ViewId, WorkbenchDialogService} from '@scion/workbench';
import {startWith} from 'rxjs/operators';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {stringifyError} from '../common/stringify-error.util';
import {KeyValueEntry, SciKeyValueFieldComponent} from '@scion/components.internal/key-value-field';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {DialogPageComponent} from '../dialog-page/dialog-page.component';
import {CssClassComponent} from '../css-class/css-class.component';
import BlankTestPageComponent from '../test-pages/blank-test-page/blank-test-page.component';
import FocusTestPageComponent from '../test-pages/focus-test-page/focus-test-page.component';
import PopupOpenerPageComponent from '../popup-opener-page/popup-opener-page.component';
import InputFieldTestPageComponent from '../test-pages/input-field-test-page/input-field-test-page.component';
import SizeTestPageComponent from '../test-pages/size-test-page/size-test-page.component';

@Component({
  selector: 'app-dialog-opener-page',
  templateUrl: './dialog-opener-page.component.html',
  styleUrls: ['./dialog-opener-page.component.scss'],
  imports: [
    ReactiveFormsModule,
    SciFormFieldComponent,
    SciKeyValueFieldComponent,
    SciCheckboxComponent,
    CssClassComponent,
  ],
})
export default class DialogOpenerPageComponent {

  public form = this._formBuilder.group({
    component: this._formBuilder.control('dialog-page', Validators.required),
    options: this._formBuilder.group({
      inputs: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
      modality: this._formBuilder.control<'application' | 'view' | ''>(''),
      contextualViewId: this._formBuilder.control<ViewId | ''>(''),
      cssClass: this._formBuilder.control<string | string[] | undefined>(undefined),
      animate: this._formBuilder.control(undefined),
    }),
    count: this._formBuilder.control(''),
    viewContextActive: this._formBuilder.control(true),
  });
  public dialogError: string | undefined;
  public returnValue: string | undefined;

  constructor(private _formBuilder: NonNullableFormBuilder,
              private _dialogService: WorkbenchDialogService,
              private _appRef: ApplicationRef) {
    this.installContextualViewIdEnabler();
  }

  public async onDialogOpen(): Promise<void> {
    this.dialogError = undefined;
    this.returnValue = undefined;

    const unsetViewContext = !this.form.controls.viewContextActive.value;
    const dialogService = unsetViewContext ? this._appRef.injector.get(WorkbenchDialogService) : this._dialogService;

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
      context: {
        viewId: this.form.controls.options.controls.contextualViewId.value || undefined,
      },
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
