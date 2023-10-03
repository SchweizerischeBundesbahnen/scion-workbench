/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, forwardRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AbstractControl, ControlValueAccessor, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validator, Validators} from '@angular/forms';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {noop} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {MAIN_AREA} from '@scion/workbench';
import {SciMaterialIconDirective} from '@scion/components.internal/material-icon';

@Component({
  selector: 'app-perspective-page-parts',
  templateUrl: './perspective-page-parts.component.html',
  styleUrls: ['./perspective-page-parts.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SciFormFieldComponent,
    SciCheckboxComponent,
    SciMaterialIconDirective
  ],
  providers: [
    {provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => PerspectivePagePartsComponent)},
    {provide: NG_VALIDATORS, multi: true, useExisting: forwardRef(() => PerspectivePagePartsComponent)},
  ],
})
export class PerspectivePagePartsComponent implements ControlValueAccessor, Validator {

  private _cvaChangeFn: (value: PerspectivePagePartEntry[]) => void = noop;
  private _cvaTouchedFn: () => void = noop;

  public form = this._formBuilder.group({
    parts: this._formBuilder.array<FormGroup<{
      id: FormControl<string | MAIN_AREA>;
      relativeTo: FormControl<string | undefined>;
      align: FormControl<'left' | 'right' | 'top' | 'bottom' | undefined>;
      ratio: FormControl<number | undefined>;
      activate: FormControl<boolean | undefined>;
    }>>([]),
  });

  public MAIN_AREA = MAIN_AREA;

  constructor(private _formBuilder: NonNullableFormBuilder) {
    this.form.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        const parts: PerspectivePagePartEntry[] = this.form.controls.parts.controls.map(partFormGroup => ({
          id: partFormGroup.controls.id.value,
          relativeTo: partFormGroup.controls.relativeTo.value,
          align: partFormGroup.controls.align.value,
          ratio: partFormGroup.controls.ratio.value,
          activate: partFormGroup.controls.activate.value,
        }));
        this._cvaChangeFn(parts);
        this._cvaTouchedFn();
      });
  }

  protected onAddPart(): void {
    this.addPartEntry({
      id: '',
    });
  }

  protected onClearParts(): void {
    this.form.controls.parts.clear();
  }

  protected onRemovePart(index: number): void {
    this.form.controls.parts.removeAt(index);
  }

  private addPartEntry(part: PerspectivePagePartEntry, options?: {emitEvent?: boolean}): void {
    const first = this.form.controls.parts.length === 0;
    this.form.controls.parts.push(
      this._formBuilder.group({
        id: this._formBuilder.control<string>(part.id, Validators.required),
        relativeTo: this._formBuilder.control<string | undefined>({value: first ? undefined : part.relativeTo, disabled: first}),
        align: this._formBuilder.control<'left' | 'right' | 'top' | 'bottom' | undefined>({value: first ? undefined : part.align, disabled: first}, first ? Validators.nullValidator : Validators.required),
        ratio: this._formBuilder.control<number | undefined>({value: first ? undefined : part.ratio, disabled: first}),
        activate: part.activate,
      }), {emitEvent: options?.emitEvent ?? true});
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public writeValue(value: PerspectivePagePartEntry[] | undefined | null): void {
    this.form.controls.parts.clear({emitEvent: false});
    value?.forEach(part => this.addPartEntry(part, {emitEvent: false}));
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public registerOnChange(fn: any): void {
    this._cvaChangeFn = fn;
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public registerOnTouched(fn: any): void {
    this._cvaTouchedFn = fn;
  }

  /**
   * Method implemented as part of `Validator` to work with Angular forms API
   * @docs-private
   */
  public validate(control: AbstractControl): ValidationErrors | null {
    return this.form.controls.parts.valid ? null : {valid: false};
  }
}

export type PerspectivePagePartEntry = {
  id: string | MAIN_AREA;
  relativeTo?: string;
  align?: 'left' | 'right' | 'top' | 'bottom';
  ratio?: number;
  activate?: boolean;
};
