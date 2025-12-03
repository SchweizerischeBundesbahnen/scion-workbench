/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, forwardRef, inject} from '@angular/core';
import {AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validator} from '@angular/forms';
import {noop} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {WorkbenchDialogCapability, WorkbenchDialogSize} from '@scion/workbench-client';
import {MultiValueInputComponent, parseTypedString, RecordComponent, undefinedIfEmpty} from 'workbench-testing-app-common';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';

@Component({
  selector: 'app-dialog-capability-properties',
  templateUrl: './dialog-capability-properties.component.html',
  styleUrl: './dialog-capability-properties.component.scss',
  imports: [
    ReactiveFormsModule,
    MultiValueInputComponent,
    SciCheckboxComponent,
    RecordComponent,
    SciFormFieldComponent,
  ],
  providers: [
    {provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => DialogCapabilityPropertiesComponent)},
    {provide: NG_VALIDATORS, multi: true, useExisting: forwardRef(() => DialogCapabilityPropertiesComponent)},
  ],
})
export class DialogCapabilityPropertiesComponent implements ControlValueAccessor, Validator {

  private readonly _formBuilder = inject(NonNullableFormBuilder);

  protected readonly form = this._formBuilder.group({
    path: this._formBuilder.control(''),
    size: this._formBuilder.group({
      height: this._formBuilder.control(''),
      width: this._formBuilder.control(''),
      minHeight: this._formBuilder.control(''),
      maxHeight: this._formBuilder.control(''),
      minWidth: this._formBuilder.control(''),
      maxWidth: this._formBuilder.control(''),
    }),
    title: this._formBuilder.control(''),
    resolve: this._formBuilder.control<Record<string, string> | undefined>(undefined),
    closable: this._formBuilder.control<boolean | undefined>(undefined),
    resizable: this._formBuilder.control<boolean | undefined>(undefined),
    padding: this._formBuilder.control<boolean | undefined>(undefined),
    showSplash: this._formBuilder.control<boolean | undefined>(undefined),
    cssClass: this._formBuilder.control<string | string[] | undefined>(undefined),
  });

  private _cvaChangeFn: (properties: WorkbenchDialogCapabilityProperties) => void = noop;
  private _cvaTouchedFn: () => void = noop;

  constructor() {
    this.form.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this._cvaChangeFn({
          path: parseTypedString(this.form.controls.path.value)!, // allow `undefined` to test capability validation
          size: undefinedIfEmpty<WorkbenchDialogSize>({
            width: parseTypedString(this.form.controls.size.controls.width.value)!, // allow `undefined` to test capability validation
            height: parseTypedString(this.form.controls.size.controls.height.value)!, // allow `undefined` to test capability validation
            minWidth: this.form.controls.size.controls.minWidth.value || undefined,
            maxWidth: this.form.controls.size.controls.maxWidth.value || undefined,
            minHeight: this.form.controls.size.controls.minHeight.value || undefined,
            maxHeight: this.form.controls.size.controls.maxHeight.value || undefined,
          })!, // allow `undefined` to test capability validation
          title: this.form.controls.title.value || undefined,
          resolve: this.form.controls.resolve.value ?? undefined,
          closable: this.form.controls.closable.value ?? undefined,
          resizable: this.form.controls.resizable.value ?? undefined,
          padding: this.form.controls.padding.value ?? undefined,
          showSplash: this.form.controls.showSplash.value ?? undefined,
          cssClass: this.form.controls.cssClass.value ?? undefined,
        });
        this._cvaTouchedFn();
      });
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public writeValue(properties: WorkbenchDialogCapabilityProperties | undefined | null): void {
    this.form.controls.path.setValue(properties?.path ?? '');
    this.form.controls.size.controls.width.setValue(properties?.size?.width ?? '');
    this.form.controls.size.controls.height.setValue(properties?.size?.height ?? '');
    this.form.controls.size.controls.minWidth.setValue(properties?.size?.minWidth ?? '');
    this.form.controls.size.controls.maxWidth.setValue(properties?.size?.maxWidth ?? '');
    this.form.controls.size.controls.minHeight.setValue(properties?.size?.minHeight ?? '');
    this.form.controls.size.controls.maxHeight.setValue(properties?.size?.maxHeight ?? '');
    this.form.controls.title.setValue(properties?.title ?? '');
    this.form.controls.resolve.setValue(properties?.resolve);
    this.form.controls.closable.setValue(properties?.closable);
    this.form.controls.resizable.setValue(properties?.resizable);
    this.form.controls.padding.setValue(properties?.padding);
    this.form.controls.showSplash.setValue(properties?.showSplash);
    this.form.controls.cssClass.setValue(properties?.cssClass);
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public registerOnChange(fn: (properties: WorkbenchDialogCapabilityProperties) => void): void {
    this._cvaChangeFn = fn;
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public registerOnTouched(fn: () => void): void {
    this._cvaTouchedFn = fn;
  }

  /**
   * Method implemented as part of `Validator` to work with Angular forms API
   * @docs-private
   */
  public validate(control: AbstractControl): ValidationErrors | null {
    return this.form.valid ? null : {valid: false};
  }
}

export type WorkbenchDialogCapabilityProperties = WorkbenchDialogCapability['properties'];
