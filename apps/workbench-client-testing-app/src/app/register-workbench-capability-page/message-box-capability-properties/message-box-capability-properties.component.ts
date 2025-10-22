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
import {WorkbenchMessageBoxCapability, WorkbenchMessageBoxSize} from '@scion/workbench-client';
import {MultiValueInputComponent} from '../../multi-value-input/multi-value-input.component';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {parseTypedString} from '../../common/parse-typed-value.util';
import {undefinedIfEmpty} from '../../common/undefined-if-empty.util';

@Component({
  selector: 'app-message-box-capability-properties',
  templateUrl: './message-box-capability-properties.component.html',
  styleUrl: './message-box-capability-properties.component.scss',
  imports: [
    ReactiveFormsModule,
    MultiValueInputComponent,
    SciCheckboxComponent,
    SciFormFieldComponent,
  ],
  providers: [
    {provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => MessageBoxCapabilityPropertiesComponent)},
    {provide: NG_VALIDATORS, multi: true, useExisting: forwardRef(() => MessageBoxCapabilityPropertiesComponent)},
  ],
})
export class MessageBoxCapabilityPropertiesComponent implements ControlValueAccessor, Validator {

  private readonly _formBuilder = inject(NonNullableFormBuilder);

  protected readonly form = this._formBuilder.group({
    path: this._formBuilder.control(''),
    size: this._formBuilder.group({
      minHeight: this._formBuilder.control(''),
      height: this._formBuilder.control(''),
      maxHeight: this._formBuilder.control(''),
      minWidth: this._formBuilder.control(''),
      width: this._formBuilder.control(''),
      maxWidth: this._formBuilder.control(''),
    }),
    showSplash: this._formBuilder.control<boolean | undefined>(undefined),
    cssClass: this._formBuilder.control<string | string[] | undefined>(undefined),
  });

  private _cvaChangeFn: (properties: WorkbenchMessageBoxCapabilityProperties) => void = noop;
  private _cvaTouchedFn: () => void = noop;

  constructor() {
    this.form.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this._cvaChangeFn({
          path: parseTypedString(this.form.controls.path.value)!, // allow `undefined` to test capability validation
          size: undefinedIfEmpty<WorkbenchMessageBoxSize>({
            width: this.form.controls.size.controls.width.value || undefined,
            height: this.form.controls.size.controls.height.value || undefined,
            minWidth: this.form.controls.size.controls.minWidth.value || undefined,
            maxWidth: this.form.controls.size.controls.maxWidth.value || undefined,
            minHeight: this.form.controls.size.controls.minHeight.value || undefined,
            maxHeight: this.form.controls.size.controls.maxHeight.value || undefined,
          }),
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
  public writeValue(properties: WorkbenchMessageBoxCapabilityProperties | undefined | null): void {
    this.form.controls.path.setValue(properties?.path ?? '');
    this.form.controls.size.controls.width.setValue(properties?.size?.width ?? '');
    this.form.controls.size.controls.height.setValue(properties?.size?.height ?? '');
    this.form.controls.size.controls.minWidth.setValue(properties?.size?.minWidth ?? '');
    this.form.controls.size.controls.maxWidth.setValue(properties?.size?.maxWidth ?? '');
    this.form.controls.size.controls.minHeight.setValue(properties?.size?.minHeight ?? '');
    this.form.controls.size.controls.maxHeight.setValue(properties?.size?.maxHeight ?? '');
    this.form.controls.showSplash.setValue(properties?.showSplash);
    this.form.controls.cssClass.setValue(properties?.cssClass);
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public registerOnChange(fn: (properties: WorkbenchMessageBoxCapabilityProperties) => void): void {
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

export type WorkbenchMessageBoxCapabilityProperties = WorkbenchMessageBoxCapability['properties'];
