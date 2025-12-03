/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, forwardRef, inject, input} from '@angular/core';
import {AbstractControl, ControlValueAccessor, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validator, Validators} from '@angular/forms';
import {noop} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {MAIN_AREA, Translatable} from '@scion/workbench';
import {SciMaterialIconDirective} from '@scion/components.internal/material-icon';
import {UUID} from '@scion/toolkit/uuid';
import {MultiValueInputComponent} from 'workbench-testing-app-common';

@Component({
  selector: 'app-add-parts',
  templateUrl: './add-parts.component.html',
  styleUrls: ['./add-parts.component.scss'],
  imports: [
    ReactiveFormsModule,
    SciCheckboxComponent,
    SciMaterialIconDirective,
    MultiValueInputComponent,
  ],
  providers: [
    {provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => AddPartsComponent)},
    {provide: NG_VALIDATORS, multi: true, useExisting: forwardRef(() => AddPartsComponent)},
  ],
})
export class AddPartsComponent implements ControlValueAccessor, Validator {

  public readonly requiresInitialPart = input(false);
  public readonly partProposals = input([], {transform: arrayAttribute});

  private readonly _formBuilder = inject(NonNullableFormBuilder);

  protected readonly MAIN_AREA = MAIN_AREA;
  protected readonly relativeToList = `relative-to-list-${UUID.randomUUID()}`;
  protected readonly idList = `id-list-${UUID.randomUUID()}`;

  protected readonly form = this._formBuilder.group({
    parts: this._formBuilder.array<FormGroup<{
      id: FormControl<string | MAIN_AREA>;
      relativeTo: FormGroup<{
        relativeTo: FormControl<string | undefined>;
        align: FormControl<'left' | 'right' | 'top' | 'bottom' | undefined>;
        ratio: FormControl<number | undefined>;
      }>;
      extras: FormGroup<{
        title: FormControl<Translatable | undefined>;
        cssClass: FormControl<string | string[] | undefined>;
        activate: FormControl<boolean | undefined>;
      }>;
    }>>([]),
  });

  private _cvaChangeFn: (value: PartDescriptor[]) => void = noop;
  private _cvaTouchedFn: () => void = noop;

  constructor() {
    this.form.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this._cvaChangeFn(this.form.controls.parts.controls.map(partFormGroup => ({
          id: partFormGroup.controls.id.value,
          relativeTo: {
            relativeTo: partFormGroup.controls.relativeTo.controls.relativeTo.value,
            align: partFormGroup.controls.relativeTo.controls.align.value,
            ratio: partFormGroup.controls.relativeTo.controls.ratio.value,
          },
          extras: {
            title: partFormGroup.controls.extras.controls.title.value,
            cssClass: partFormGroup.controls.extras.controls.cssClass.value,
            activate: partFormGroup.controls.extras.controls.activate.value,
          },
        })));
        this._cvaTouchedFn();
      });
  }

  protected onAddPart(): void {
    this.addPart({
      id: '',
      relativeTo: {},
    });
  }

  protected onRemovePart(index: number): void {
    this.form.controls.parts.removeAt(index);
  }

  private addPart(part: PartDescriptor, options?: {emitEvent?: boolean}): void {
    const isInitialPart = this.requiresInitialPart() && this.form.controls.parts.length === 0;
    this.form.controls.parts.push(
      this._formBuilder.group({
        id: this._formBuilder.control<string>(part.id, Validators.required),
        relativeTo: this._formBuilder.group({
          relativeTo: this._formBuilder.control<string | undefined>({value: isInitialPart ? undefined : part.relativeTo.relativeTo, disabled: isInitialPart}),
          align: this._formBuilder.control<'left' | 'right' | 'top' | 'bottom' | undefined>({value: isInitialPart ? undefined : part.relativeTo.align, disabled: isInitialPart}, isInitialPart ? Validators.nullValidator : Validators.required),
          ratio: this._formBuilder.control<number | undefined>({value: isInitialPart ? undefined : part.relativeTo.ratio, disabled: isInitialPart}),
        }),
        extras: this._formBuilder.group({
          title: this._formBuilder.control<Translatable | undefined>(part.extras?.title),
          cssClass: this._formBuilder.control<string | string[] | undefined>(part.extras?.cssClass),
          activate: this._formBuilder.control<boolean | undefined>(part.extras?.activate),
        }),
      }), {emitEvent: options?.emitEvent ?? true});
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public writeValue(parts: PartDescriptor[] | undefined | null): void {
    this.form.controls.parts.clear({emitEvent: false});
    parts?.forEach(part => this.addPart(part, {emitEvent: false}));
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public registerOnChange(fn: (value: PartDescriptor[]) => void): void {
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
    return this.form.controls.parts.valid ? null : {valid: false};
  }
}

export interface PartDescriptor {
  id: string | MAIN_AREA;
  relativeTo: {
    relativeTo?: string;
    align?: 'left' | 'right' | 'top' | 'bottom';
    ratio?: number;
  };
  extras?: {
    title?: Translatable;
    cssClass?: string | string[];
    activate?: boolean;
  };
}

function arrayAttribute(proposals: string[] | null | undefined): string[] {
  return proposals ?? [];
}
