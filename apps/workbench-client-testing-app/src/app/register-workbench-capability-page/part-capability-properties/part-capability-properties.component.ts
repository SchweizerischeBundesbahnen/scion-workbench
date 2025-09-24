/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, forwardRef, inject} from '@angular/core';
import {AbstractControl, ControlValueAccessor, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validator} from '@angular/forms';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {noop} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MAIN_AREA, WorkbenchPartCapability, WorkbenchViewRef} from '@scion/workbench-client';
import {MultiValueInputComponent} from '../../multi-value-input/multi-value-input.component';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {RecordComponent} from '../../record/record.component';
import {parseTypedString} from '../../common/parse-typed-value.util';
import {SciMaterialIconDirective} from '@scion/components.internal/material-icon';

@Component({
  selector: 'app-part-capability-properties',
  templateUrl: './part-capability-properties.component.html',
  styleUrls: ['./part-capability-properties.component.scss'],
  imports: [
    ReactiveFormsModule,
    SciFormFieldComponent,
    MultiValueInputComponent,
    SciCheckboxComponent,
    RecordComponent,
    SciMaterialIconDirective,
  ],
  providers: [
    {provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => PartCapabilityPropertiesComponent)},
    {provide: NG_VALIDATORS, multi: true, useExisting: forwardRef(() => PartCapabilityPropertiesComponent)},
  ],
})
export class PartCapabilityPropertiesComponent implements ControlValueAccessor, Validator {

  private readonly _formBuilder = inject(NonNullableFormBuilder);

  protected readonly form = this._formBuilder.group({
    id: this._formBuilder.control(''),
    path: this._formBuilder.control(''),
    title: this._formBuilder.control(''),
    icon: this._formBuilder.control(''),
    label: this._formBuilder.control(''),
    tooltip: this._formBuilder.control(''),
    views: this._formBuilder.array<FormGroup<ViewFormGroup>>([]),
    cssClass: this._formBuilder.control<string | string[] | undefined>(undefined),
  });

  protected readonly MAIN_AREA = MAIN_AREA;

  private _cvaChangeFn: (properties: WorkbenchPartCapabilityProperties) => void = noop;
  private _cvaTouchedFn: () => void = noop;

  constructor() {
    this.form.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        const views = this.form.controls.views.controls.map((viewFormGroup: FormGroup<ViewFormGroup>): WorkbenchViewRef => ({
          qualifier: viewFormGroup.controls.qualifier.value,
          params: viewFormGroup.controls.params.value,
          active: viewFormGroup.controls.active.value,
          cssClass: viewFormGroup.controls.cssClass.value,
        }));

        this._cvaChangeFn({
          path: parseTypedString(this.form.controls.path.value)!, // allow `undefined` to test capability validation,
          views: views,
          title: parseTypedString(this.form.controls.title.value)!,
          extras: {
            icon: this.form.controls.icon.value,
            label: this.form.controls.label.value,
            tooltip: this.form.controls.tooltip.value,
          },
          cssClass: this.form.controls.cssClass.value,
        });
        this._cvaTouchedFn();
      });
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public writeValue(properties: WorkbenchPartCapabilityProperties | undefined | null): void {
    this.form.controls.path.setValue(properties?.path ?? '');

    // Views
    this.form.controls.views.clear({emitEvent: false});
    (properties?.views ?? [])
      .map(view => this.createViewFormGroup(view))
      .forEach(viewFormGroup => this.form.controls.views.push(viewFormGroup, {emitEvent: false}));
  }

  protected onAddView(): void {
    const viewFormGroup = this.createViewFormGroup();
    this.form.controls.views.push(viewFormGroup);
  }

  protected onRemoveView(index: number): void {
    this.form.controls.views.removeAt(index);
  }

  private createViewFormGroup(view?: WorkbenchViewRef): FormGroup<ViewFormGroup> {
    return this._formBuilder.group({
      qualifier: this._formBuilder.control(view?.qualifier as Record<string, string>),
      params: this._formBuilder.control(view?.params as Record<string, string>),
      active: this._formBuilder.control(view?.active),
      cssClass: this._formBuilder.control(view?.cssClass),
    });
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public registerOnChange(fn: (properties: WorkbenchPartCapabilityProperties) => void): void {
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

export type WorkbenchPartCapabilityProperties = WorkbenchPartCapability['properties'];

interface ViewFormGroup {
  qualifier: FormControl<Record<string, string>>;
  params: FormControl<Record<string, string>>;
  active: FormControl<boolean | undefined>;
  cssClass: FormControl<string | string[] | undefined>;
}
