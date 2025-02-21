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
import {AbstractControl, ControlValueAccessor, FormArray, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validator, Validators} from '@angular/forms';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {noop, Observable} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {SciMaterialIconDirective} from '@scion/components.internal/material-icon';
import {UUID} from '@scion/toolkit/uuid';
import {MAIN_AREA, WorkbenchPerspectiveCapability, WorkbenchPerspectivePart, WorkbenchPerspectiveView} from '@scion/workbench-client';
import {RecordComponent} from '../../record/record.component';
import {filterArray, mapArray} from '@scion/toolkit/operators';
import {AsyncPipe} from '@angular/common';
import {KeyValueEntry, SciKeyValueFieldComponent} from '@scion/components.internal/key-value-field';
import {CssClassComponent} from '../../css-class/css-class.component';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';

@Component({
  selector: 'app-perspective-capability-properties',
  templateUrl: './perspective-capability-properties.component.html',
  styleUrls: ['./perspective-capability-properties.component.scss'],
  imports: [
    ReactiveFormsModule,
    SciFormFieldComponent,
    SciMaterialIconDirective,
    RecordComponent,
    AsyncPipe,
    SciKeyValueFieldComponent,
    CssClassComponent,
    SciCheckboxComponent,
  ],
  providers: [
    {provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => PerspectiveCapabilityPropertiesComponent)},
    {provide: NG_VALIDATORS, multi: true, useExisting: forwardRef(() => PerspectiveCapabilityPropertiesComponent)},
  ],
})
export class PerspectiveCapabilityPropertiesComponent implements ControlValueAccessor, Validator {

  private readonly _formBuilder = inject(NonNullableFormBuilder);

  protected readonly form = this._formBuilder.group({
    data: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
    parts: this._formBuilder.array<FormGroup<PartFormGroup>>([]),
  });

  protected readonly MAIN_AREA = MAIN_AREA;
  protected readonly relativeToList = `relative-to-list-${UUID.randomUUID()}`;
  protected readonly partIdList = `partid-list-${UUID.randomUUID()}`;
  protected readonly partProposals$: Observable<string[]>;

  private _cvaChangeFn: (properties: WorkbenchPerspectiveCapabilityProperties) => void = noop;
  private _cvaTouchedFn: () => void = noop;

  constructor() {
    this.form.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        const parts: WorkbenchPerspectivePart[] = this.form.controls.parts.controls.map((partFormGroup: FormGroup<PartFormGroup>): WorkbenchPerspectivePart => ({
          id: partFormGroup.controls.id.value!,
          relativeTo: partFormGroup.controls.relativeTo.value,
          align: partFormGroup.controls.align.value!,
          ratio: partFormGroup.controls.ratio.value!,
          views: partFormGroup.controls.views.controls.map((viewFormGroup: FormGroup<ViewFormGroup>): WorkbenchPerspectiveView => ({
            params: viewFormGroup.controls.params.value,
            qualifier: viewFormGroup.controls.qualifier.value,
            active: viewFormGroup.controls.active.value,
            cssClass: viewFormGroup.controls.cssClass.value,
          })),
        }));

        this._cvaChangeFn({
          layout: parts as WorkbenchPerspectiveCapabilityLayout,
          data: SciKeyValueFieldComponent.toDictionary(this.form.controls.data) ?? undefined,
        });
        this._cvaTouchedFn();
      });

    this.partProposals$ = this.form.controls.parts.valueChanges
      .pipe(
        mapArray(part => part.id),
        filterArray((id: string | undefined): id is string => !!id),
      );
  }

  protected onAddPart(): void {
    const partFormGroup = this.createPartFormGroup();
    this.form.controls.parts.push(partFormGroup);
    this.updatePartFields();
  }

  protected onAddView(partFormGroup: FormGroup<PartFormGroup>): void {
    const viewFormGroup = this.createViewFormGroup();
    partFormGroup.controls.views.push(viewFormGroup);
  }

  protected onRemovePart(index: number): void {
    this.form.controls.parts.removeAt(index);
    this.updatePartFields();
  }

  protected onRemoveView(partFormGroup: FormGroup<PartFormGroup>, index: number): void {
    partFormGroup.controls.views.removeAt(index);
  }

  private createPartFormGroup(part?: Partial<WorkbenchPerspectivePart>): FormGroup<PartFormGroup> {
    return this._formBuilder.group({
      id: this._formBuilder.control<string | undefined>(part?.id, Validators.required),
      relativeTo: this._formBuilder.control<string | undefined>(part?.relativeTo),
      align: this._formBuilder.control<'left' | 'right' | 'top' | 'bottom' | undefined>(part?.align),
      ratio: this._formBuilder.control<number | undefined>(part?.ratio),
      views: this._formBuilder.array<FormGroup<ViewFormGroup>>(part?.views?.map(view => this.createViewFormGroup(view)) ?? []),
    });
  }

  private createViewFormGroup(view?: WorkbenchPerspectiveView): FormGroup<ViewFormGroup> {
    return this._formBuilder.group({
      qualifier: this._formBuilder.control(view?.qualifier as Record<string, string>),
      params: this._formBuilder.control(view?.params as Record<string, string>),
      active: this._formBuilder.control(view?.active),
      cssClass: this._formBuilder.control(view?.cssClass),
    });
  }

  private createKeyValueFormGroup(key: string, value: unknown): FormGroup<KeyValueEntry> {
    return this._formBuilder.group({
      key: this._formBuilder.control(key),
      value: this._formBuilder.control(`${value}`),
    });
  }

  private updatePartFields(): void {
    this.form.controls.parts.controls.forEach((partFormGroup: FormGroup<PartFormGroup>, index) => {
      if (index === 0) {
        // Disable fields.
        partFormGroup.controls.relativeTo.disable({emitEvent: false});
        partFormGroup.controls.align.disable({emitEvent: false});
        partFormGroup.controls.ratio.disable({emitEvent: false});
        // Unset values.
        partFormGroup.controls.align.reset(undefined, {emitEvent: false});
        partFormGroup.controls.ratio.reset(undefined, {emitEvent: false});
        partFormGroup.controls.relativeTo.reset(undefined, {emitEvent: false});
        // Remove validation.
        partFormGroup.controls.align.removeValidators(Validators.required);
      }
      else {
        partFormGroup.controls.relativeTo.enable({emitEvent: false});
        partFormGroup.controls.align.enable({emitEvent: false});
        partFormGroup.controls.ratio.enable({emitEvent: false});
        partFormGroup.controls.align.setValidators(Validators.required);
      }
    });
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public writeValue(properties: WorkbenchPerspectiveCapabilityProperties | undefined | null): void {
    // Parts
    this.form.controls.parts.clear({emitEvent: false});
    properties?.layout
      .map(part => this.createPartFormGroup(part))
      .forEach(partFormGroup => this.form.controls.parts.push(partFormGroup, {emitEvent: false}));

    // Data
    this.form.controls.data.clear({emitEvent: false});
    Object.entries(properties?.data ?? {})
      .map(([key, value]) => this.createKeyValueFormGroup(key, value))
      .forEach(keyValueFormGroup => this.form.controls.data.push(keyValueFormGroup, {emitEvent: false}));
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public registerOnChange(fn: (properties: WorkbenchPerspectiveCapabilityProperties) => void): void {
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

export type WorkbenchPerspectiveCapabilityProperties = WorkbenchPerspectiveCapability['properties'];
export type WorkbenchPerspectiveCapabilityLayout = WorkbenchPerspectiveCapabilityProperties['layout'];

interface PartFormGroup {
  id: FormControl<string | MAIN_AREA | undefined>;
  relativeTo: FormControl<string | undefined>;
  align: FormControl<'left' | 'right' | 'top' | 'bottom' | undefined>;
  ratio: FormControl<number | undefined>;
  views: FormArray<FormGroup<ViewFormGroup>>;
}

interface ViewFormGroup {
  qualifier: FormControl<Record<string, string>>;
  params: FormControl<Record<string, string>>;
  active: FormControl<boolean | undefined>;
  cssClass: FormControl<string | string[] | undefined>;
}
