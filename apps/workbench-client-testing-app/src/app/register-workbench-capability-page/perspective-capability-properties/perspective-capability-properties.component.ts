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
import {AbstractControl, ControlValueAccessor, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validator, Validators} from '@angular/forms';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {noop, Observable} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {SciMaterialIconDirective} from '@scion/components.internal/material-icon';
import {UUID} from '@scion/toolkit/uuid';
import {ActivityId, MAIN_AREA, RelativeTo, WorkbenchPartRef, WorkbenchPerspectiveCapabilityV2} from '@scion/workbench-client';
import {filterArray, mapArray} from '@scion/toolkit/operators';
import {AsyncPipe} from '@angular/common';
import {KeyValueEntry, SciKeyValueFieldComponent} from '@scion/components.internal/key-value-field';
import {MultiValueInputComponent} from '../../multi-value-input/multi-value-input.component';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {RecordComponent} from '../../record/record.component';

@Component({
  selector: 'app-perspective-capability-properties',
  templateUrl: './perspective-capability-properties.component.html',
  styleUrls: ['./perspective-capability-properties.component.scss'],
  imports: [
    ReactiveFormsModule,
    SciFormFieldComponent,
    SciMaterialIconDirective,
    AsyncPipe,
    SciKeyValueFieldComponent,
    MultiValueInputComponent,
    SciCheckboxComponent,
    RecordComponent,
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
    dockedParts: this._formBuilder.array<FormGroup<DockedPartFormGroup>>([]),
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
        const initialPartFormGroup = this.form.controls.parts.controls.at(0)!;
        const initialPart: Omit<WorkbenchPartRef, 'position'> = {
          id: initialPartFormGroup.controls.id.value!,
          qualifier: initialPartFormGroup.controls.qualifier.value,
          active: initialPartFormGroup.controls.active.value!,
          cssClass: initialPartFormGroup.controls.cssClass.value,
        };

        const parts: WorkbenchPartRef[] = this.form.controls.parts.controls.slice(1).map((partFormGroup: FormGroup<PartFormGroup>): WorkbenchPartRef => ({
          id: partFormGroup.controls.id.value!,
          position: {
            relativeTo: partFormGroup.controls.relativeTo.value,
            align: partFormGroup.controls.align.value!,
            ratio: partFormGroup.controls.ratio.value!,
          },
          qualifier: partFormGroup.controls.qualifier.value,
          active: partFormGroup.controls.active.value!,
          cssClass: partFormGroup.controls.cssClass.value,
        }));

        const dockedParts: WorkbenchPartRef[] = this.form.controls.dockedParts.controls.map((partFormGroup: FormGroup<DockedPartFormGroup>): WorkbenchPartRef => ({
          id: partFormGroup.controls.id.value!,
          position: partFormGroup.controls.dockTo.value!,
          qualifier: partFormGroup.controls.qualifier.value,
          active: partFormGroup.controls.active.value!,
          cssClass: partFormGroup.controls.cssClass.value,
          ɵactivityId: partFormGroup.controls.activityId.value,
        }));

        this._cvaChangeFn({
          parts: [
            initialPart,
            ...new Array<WorkbenchPartRef>().concat(dockedParts).concat(parts),
          ],
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
  }

  protected onAddDockedPart(): void {
    const partFormGroup = this.createDockedPartFormGroup();
    this.form.controls.dockedParts.push(partFormGroup);
  }

  protected onRemovePart(index: number): void {
    this.form.controls.parts.removeAt(index);
    this.updatePartFields();
  }

  protected onRemoveDockedPart(index: number): void {
    this.form.controls.dockedParts.removeAt(index);
  }

  private createPartFormGroup(part?: Partial<WorkbenchPartRef> & {position?: RelativeTo}): FormGroup<PartFormGroup> {
    return this._formBuilder.group({
      id: this._formBuilder.control<string | undefined>(part?.id, Validators.required),
      relativeTo: this._formBuilder.control<string | undefined>(part?.position?.relativeTo),
      align: this._formBuilder.control<'left' | 'right' | 'top' | 'bottom' | undefined>(part?.position?.align),
      ratio: this._formBuilder.control<number | undefined>(part?.position?.ratio),
      qualifier: this._formBuilder.control(part?.qualifier as Record<string, string>, {validators: Validators.required}), // TODO [activity] does not validate
      active: this._formBuilder.control<boolean | undefined>(part?.active),
      cssClass: this._formBuilder.control<string | string[] | undefined>(part?.cssClass),
    });
  }

  private createDockedPartFormGroup(part?: Partial<WorkbenchPartRef> & {position?: 'left-top' | 'left-bottom' | 'right-top' | 'right-bottom' | 'bottom-left' | 'bottom-right'}): FormGroup<DockedPartFormGroup> {
    return this._formBuilder.group({
      id: this._formBuilder.control<string | undefined>(part?.id, Validators.required),
      dockTo: this._formBuilder.control<'left-top' | 'left-bottom' | 'right-top' | 'right-bottom' | 'bottom-left' | 'bottom-right' | undefined>(part?.position, {validators: Validators.required}),
      qualifier: this._formBuilder.control(part?.qualifier as Record<string, string>, {validators: Validators.required}), // TODO [activity] does not validate
      active: this._formBuilder.control<boolean | undefined>(part?.active),
      activityId: this._formBuilder.control<ActivityId | undefined>(part?.ɵactivityId),
      cssClass: this._formBuilder.control<string | string[] | undefined>(part?.cssClass),
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
    properties?.parts
      .filter(part => typeof (part as WorkbenchPartRef).position !== 'string')
      .map(part => this.createPartFormGroup(part as Partial<WorkbenchPartRef> & {position?: RelativeTo}))
      .forEach(partFormGroup => this.form.controls.parts.push(partFormGroup, {emitEvent: false}));

    // Docked Parts
    this.form.controls.dockedParts.clear({emitEvent: false});
    properties?.parts
      .map(part => this.createDockedPartFormGroup(part as Partial<WorkbenchPartRef> & {position?: 'left-top' | 'left-bottom' | 'right-top' | 'right-bottom' | 'bottom-left' | 'bottom-right'}))
      .forEach(dockedPartFormGroup => this.form.controls.dockedParts.push(dockedPartFormGroup, {emitEvent: false}));

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

export type WorkbenchPerspectiveCapabilityProperties = WorkbenchPerspectiveCapabilityV2['properties'];

interface PartFormGroup {
  id: FormControl<string | MAIN_AREA | undefined>;
  qualifier: FormControl<Record<string, string>>;
  relativeTo: FormControl<string | undefined>;
  align: FormControl<'left' | 'right' | 'top' | 'bottom' | undefined>;
  ratio: FormControl<number | undefined>;
  active: FormControl<boolean | undefined>;
  cssClass: FormControl<string | string[] | undefined>;
}

interface DockedPartFormGroup {
  id: FormControl<string | MAIN_AREA | undefined>;
  qualifier: FormControl<Record<string, string>>;
  dockTo: FormControl<'left-top' | 'left-bottom' | 'right-top' | 'right-bottom' | 'bottom-left' | 'bottom-right' | undefined>;
  active: FormControl<boolean | undefined>;
  activityId: FormControl<ActivityId | undefined>;
  cssClass: FormControl<string | string[] | undefined>;
}
