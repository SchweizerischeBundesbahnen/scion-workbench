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
import {WorkbenchPopupCapability} from '@scion/workbench-client';
import {MultiValueInputComponent, parseTypedString, prune} from 'workbench-testing-app-common';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';

@Component({
  selector: 'app-popup-capability-properties',
  templateUrl: './popup-capability-properties.component.html',
  styleUrl: './popup-capability-properties.component.scss',
  imports: [
    ReactiveFormsModule,
    MultiValueInputComponent,
    SciCheckboxComponent,
    SciFormFieldComponent,
  ],
  providers: [
    {provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => PopupCapabilityPropertiesComponent)},
    {provide: NG_VALIDATORS, multi: true, useExisting: forwardRef(() => PopupCapabilityPropertiesComponent)},
  ],
})
export class PopupCapabilityPropertiesComponent implements ControlValueAccessor, Validator {

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
    showSplash: this._formBuilder.control<boolean | undefined>(undefined),
    pinToDesktop: this._formBuilder.control(false),
    cssClass: this._formBuilder.control<string | string[] | undefined>(undefined),
  });

  private _cvaChangeFn: (properties: WorkbenchPopupCapabilityProperties) => void = noop;
  private _cvaTouchedFn: () => void = noop;

  constructor() {
    this.form.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this._cvaChangeFn(prune({
          path: parseTypedString(this.form.controls.path.value)!, // allow `undefined` to test capability validation
          size: {
            width: this.form.controls.size.controls.width.value || undefined,
            height: this.form.controls.size.controls.height.value || undefined,
            minWidth: this.form.controls.size.controls.minWidth.value || undefined,
            maxWidth: this.form.controls.size.controls.maxWidth.value || undefined,
            minHeight: this.form.controls.size.controls.minHeight.value || undefined,
            maxHeight: this.form.controls.size.controls.maxHeight.value || undefined,
          },
          showSplash: this.form.controls.showSplash.value ?? undefined,
          pinToDesktop: this.form.controls.pinToDesktop.value,
          cssClass: this.form.controls.cssClass.value ?? undefined,
        }, {pruneIfEmpty: true})!);
        this._cvaTouchedFn();
      });
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public writeValue(properties: WorkbenchPopupCapabilityProperties | undefined | null): void {
    this.form.controls.path.setValue(properties?.path ?? '');
    this.form.controls.size.controls.width.setValue(properties?.size?.width ?? '');
    this.form.controls.size.controls.height.setValue(properties?.size?.height ?? '');
    this.form.controls.size.controls.minWidth.setValue(properties?.size?.minWidth ?? '');
    this.form.controls.size.controls.maxWidth.setValue(properties?.size?.maxWidth ?? '');
    this.form.controls.size.controls.minHeight.setValue(properties?.size?.minHeight ?? '');
    this.form.controls.size.controls.maxHeight.setValue(properties?.size?.maxHeight ?? '');
    this.form.controls.showSplash.setValue(properties?.showSplash);
    this.form.controls.pinToDesktop.setValue(properties?.pinToDesktop ?? false);
    this.form.controls.cssClass.setValue(properties?.cssClass);
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public registerOnChange(fn: (properties: WorkbenchPopupCapabilityProperties) => void): void {
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

export type WorkbenchPopupCapabilityProperties = WorkbenchPopupCapability['properties'] & {pinToDesktop: boolean};
