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
import {WorkbenchViewCapability} from '@scion/workbench-client';
import {MultiValueInputComponent} from '../../multi-value-input/multi-value-input.component';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {RecordComponent} from '../../record/record.component';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {parseTypedString} from '../../common/parse-typed-value.util';

@Component({
  selector: 'app-view-capability-properties',
  templateUrl: './view-capability-properties.component.html',
  styleUrls: ['./view-capability-properties.component.scss'],
  imports: [
    ReactiveFormsModule,
    MultiValueInputComponent,
    SciCheckboxComponent,
    RecordComponent,
    SciFormFieldComponent,
  ],
  providers: [
    {provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => ViewCapabilityPropertiesComponent)},
    {provide: NG_VALIDATORS, multi: true, useExisting: forwardRef(() => ViewCapabilityPropertiesComponent)},
  ],
})
export class ViewCapabilityPropertiesComponent implements ControlValueAccessor, Validator {

  private readonly _formBuilder = inject(NonNullableFormBuilder);

  protected readonly form = this._formBuilder.group({
    path: this._formBuilder.control(''),
    title: this._formBuilder.control(''),
    heading: this._formBuilder.control(''),
    resolve: this._formBuilder.control<Record<string, string> | undefined>(undefined),
    lazy: this._formBuilder.control<boolean | undefined>(undefined),
    closable: this._formBuilder.control<boolean | undefined>(undefined),
    showSplash: this._formBuilder.control<boolean | undefined>(undefined),
    cssClass: this._formBuilder.control<string | string[] | undefined>(undefined),
    pinToDesktop: this._formBuilder.control(false),
  });

  private _cvaChangeFn: (properties: WorkbenchViewCapabilityProperties) => void = noop;
  private _cvaTouchedFn: () => void = noop;

  constructor() {
    this.form.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this._cvaChangeFn({
          path: parseTypedString(this.form.controls.path.value)!, // allow `undefined` to test capability validation
          title: this.form.controls.title.value || undefined,
          heading: this.form.controls.heading.value || undefined,
          resolve: this.form.controls.resolve.value ?? undefined,
          lazy: this.form.controls.lazy.value ?? undefined,
          cssClass: this.form.controls.cssClass.value ?? undefined,
          closable: this.form.controls.closable.value ?? undefined,
          showSplash: this.form.controls.showSplash.value ?? undefined,
          pinToDesktop: this.form.controls.pinToDesktop.value,
        });
        this._cvaTouchedFn();
      });
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public writeValue(properties: WorkbenchViewCapabilityProperties | undefined | null): void {
    this.form.controls.path.setValue(properties?.path ?? '');
    this.form.controls.title.setValue(properties?.title ?? '');
    this.form.controls.heading.setValue(properties?.heading ?? '');
    this.form.controls.resolve.setValue(properties?.resolve);
    this.form.controls.lazy.setValue(properties?.lazy);
    this.form.controls.closable.setValue(properties?.closable);
    this.form.controls.showSplash.setValue(properties?.showSplash);
    this.form.controls.cssClass.setValue(properties?.cssClass);
    this.form.controls.pinToDesktop.setValue(properties?.pinToDesktop ?? false);
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public registerOnChange(fn: (properties: WorkbenchViewCapabilityProperties) => void): void {
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

export type WorkbenchViewCapabilityProperties = WorkbenchViewCapability['properties'] & {pinToDesktop: boolean};
