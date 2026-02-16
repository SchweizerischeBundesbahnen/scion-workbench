/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
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
import {MultiValueInputComponent, parseTypedString, prune} from 'workbench-testing-app-common';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {WorkbenchNotificationCapability, WorkbenchNotificationSize} from '@scion/workbench-client';

@Component({
  selector: 'app-notification-capability-properties',
  templateUrl: './notification-capability-properties.component.html',
  styleUrl: './notification-capability-properties.component.scss',
  imports: [
    ReactiveFormsModule,
    MultiValueInputComponent,
    SciCheckboxComponent,
    SciFormFieldComponent,
  ],
  providers: [
    {provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => NotificationCapabilityPropertiesComponent)},
    {provide: NG_VALIDATORS, multi: true, useExisting: forwardRef(() => NotificationCapabilityPropertiesComponent)},
  ],
})
export class NotificationCapabilityPropertiesComponent implements ControlValueAccessor, Validator {

  private readonly _formBuilder = inject(NonNullableFormBuilder);

  protected readonly form = this._formBuilder.group({
    path: this._formBuilder.control(''),
    size: this._formBuilder.group({
      height: this._formBuilder.control(''),
      minHeight: this._formBuilder.control(''),
      maxHeight: this._formBuilder.control(''),
    }),
    groupParamsReducer: this._formBuilder.control(''),
    showSplash: this._formBuilder.control<boolean | undefined>(undefined),
    cssClass: this._formBuilder.control<string | string[] | undefined>(undefined),
  });

  private _cvaChangeFn: (properties: WorkbenchNotificationCapabilityProperties) => void = noop;
  private _cvaTouchedFn: () => void = noop;

  constructor() {
    this.form.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this._cvaChangeFn({
          path: parseTypedString(this.form.controls.path.value)!, // allow `undefined` to test capability validation
          size: prune<WorkbenchNotificationSize>({
            height: parseTypedString(this.form.controls.size.controls.height.value)!, // allow `undefined` to test capability validation
            minHeight: this.form.controls.size.controls.minHeight.value || undefined,
            maxHeight: this.form.controls.size.controls.maxHeight.value || undefined,
          }, {pruneIfEmpty: true}),
          groupParamsReducer: this.form.controls.groupParamsReducer.value || undefined,
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
  public writeValue(properties: WorkbenchNotificationCapabilityProperties | undefined | null): void {
    this.form.controls.path.setValue(properties?.path ?? '');
    this.form.controls.showSplash.setValue(properties?.showSplash);
    this.form.controls.cssClass.setValue(properties?.cssClass);
    this.form.controls.size.controls.height.setValue(properties?.size?.height ?? '');
    this.form.controls.size.controls.minHeight.setValue(properties?.size?.minHeight ?? '');
    this.form.controls.size.controls.maxHeight.setValue(properties?.size?.maxHeight ?? '');
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public registerOnChange(fn: (properties: WorkbenchNotificationCapabilityProperties) => void): void {
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

export type WorkbenchNotificationCapabilityProperties = WorkbenchNotificationCapability['properties'];
