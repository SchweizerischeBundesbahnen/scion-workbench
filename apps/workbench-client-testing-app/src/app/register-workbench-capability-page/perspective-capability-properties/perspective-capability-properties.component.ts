/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, forwardRef} from '@angular/core';
import {ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgFor} from '@angular/common';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {WorkbenchPerspectiveCapability, WorkbenchPerspectiveCapabilityPart} from '@scion/workbench-client';
import {noop} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {startWith} from 'rxjs/operators';
import {MAIN_AREA} from '@scion/workbench';
import {SciMaterialIconDirective} from '@scion/components.internal/material-icon';

@Component({
  selector: 'app-perspective-capability-properties',
  templateUrl: './perspective-capability-properties.component.html',
  styleUrls: ['./perspective-capability-properties.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    SciFormFieldComponent,
    SciCheckboxComponent,
    NgFor,
    SciMaterialIconDirective,
  ],
  providers: [
    {provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => PerspectiveCapabilityPropertiesComponent)},
  ],
})
export class PerspectiveCapabilityPropertiesComponent implements ControlValueAccessor {

  private _cvaChangeFn: (value: WorkbenchPerspectiveCapabilityProperties) => void = noop;
  private _cvaTouchedFn: () => void = noop;

  public form = this._formBuilder.group({
    label: this._formBuilder.control(''),
    parts: this._formBuilder.array<FormGroup<{
      id: FormControl<string>;
      relativeTo: FormControl<string | undefined>;
      align: FormControl<'left' | 'right' | 'top' | 'bottom' | undefined>;
      ratio: FormControl<number | undefined>;
    }>>([]),
  });

  public parts: WorkbenchPerspectiveCapabilityPart[] = [];

  constructor(private _formBuilder: NonNullableFormBuilder) {
    this.form.valueChanges
      .pipe(
        startWith(undefined as void), // Initialize operator because Angular does not emit `valueChanges` on initial form values.
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        const initialPart = this.form.controls.parts.controls[0] ? {id: this.form.controls.parts.controls[0].controls.id.value} : undefined;
        const parts: WorkbenchPerspectiveCapabilityPart[] = this.form.controls.parts.controls.slice(1).map(partFormGroup => ({
          id: partFormGroup.controls.id.value,
          relativeTo: partFormGroup.controls.relativeTo.value,
          align: partFormGroup.controls.align.value!,
          ratio: partFormGroup.controls.ratio.value,
        }));
        // Use setTimeout to ensure initial form values are emitted.
        setTimeout(() => {
          this._cvaChangeFn({
            parts: [initialPart!, ...parts],
            data: {
              label: this.form.controls.label.value,
            },
          });
          this._cvaTouchedFn();
        });
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

  private addPartEntry(part: PartEntry, options?: {emitEvent: boolean}): void {
    const first = this.form.controls.parts.length === 0;
    this.form.controls.parts.push(this._formBuilder.group({
      id: this._formBuilder.control<string>(part.id ?? '', Validators.required),
      relativeTo: this._formBuilder.control<string | undefined>({value: first ? undefined : part.relativeTo || undefined, disabled: first}),
      align: this._formBuilder.control<'left' | 'right' | 'top' | 'bottom' | undefined>({value: first ? undefined : part.align ?? 'left', disabled: first}),
      ratio: this._formBuilder.control<number | undefined>({value: first ? undefined : part.ratio, disabled: first}),
    }), {emitEvent: options?.emitEvent ?? true});
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public writeValue(value: WorkbenchPerspectiveCapabilityProperties | undefined | null): void {
    this.form.controls.parts.clear({emitEvent: false});
    const label = value?.data?.['label'];
    if (typeof label === 'string') {
      this.form.controls.label.setValue(label ?? '');
    }
    value?.parts.forEach(part => this.addPartEntry(part, {emitEvent: false}));
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
}

export type WorkbenchPerspectiveCapabilityProperties = Pick<WorkbenchPerspectiveCapability, 'properties'>['properties'];

export type PartEntry = {
  id: string | typeof MAIN_AREA;
  relativeTo?: string;
  align?: 'left' | 'right' | 'top' | 'bottom';
  ratio?: number;
  activate?: boolean;
};
