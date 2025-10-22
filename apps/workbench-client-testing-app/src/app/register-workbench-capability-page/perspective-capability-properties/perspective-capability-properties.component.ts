/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, forwardRef, inject, Signal} from '@angular/core';
import {AbstractControl, ControlValueAccessor, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validator, Validators} from '@angular/forms';
import {noop} from 'rxjs';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';
import {SciMaterialIconDirective} from '@scion/components.internal/material-icon';
import {UUID} from '@scion/toolkit/uuid';
import {ActivityId, DockingArea, MAIN_AREA, RelativeTo, WorkbenchPartRef, WorkbenchPerspectiveCapability} from '@scion/workbench-client';
import {KeyValueEntry, SciKeyValueFieldComponent} from '@scion/components.internal/key-value-field';
import {MultiValueInputComponent} from '../../multi-value-input/multi-value-input.component';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {RecordComponent} from '../../record/record.component';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';

@Component({
  selector: 'app-perspective-capability-properties',
  templateUrl: './perspective-capability-properties.component.html',
  styleUrl: './perspective-capability-properties.component.scss',
  imports: [
    ReactiveFormsModule,
    SciMaterialIconDirective,
    SciKeyValueFieldComponent,
    MultiValueInputComponent,
    SciCheckboxComponent,
    RecordComponent,
    SciFormFieldComponent,
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
  protected readonly partProposals = this.computePartProposals();

  private _cvaChangeFn: (properties: WorkbenchPerspectiveCapabilityProperties) => void = noop;
  private _cvaTouchedFn: () => void = noop;

  constructor() {
    this.form.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        const [initialPartFormGroup, ...partFormGroups] = this.form.controls.parts.controls;

        this._cvaChangeFn({
          data: SciKeyValueFieldComponent.toDictionary(this.form.controls.data) ?? undefined,
          parts: [
            // Add initial part.
            ...(initialPartFormGroup ? [{
              id: initialPartFormGroup.controls.id.value || undefined,
              qualifier: initialPartFormGroup.controls.qualifier.value ?? undefined,
              params: initialPartFormGroup.controls.params.value ?? undefined,
              active: initialPartFormGroup.controls.active.value ?? undefined,
              cssClass: initialPartFormGroup.controls.cssClass.value ?? undefined,
            }] : []) as [Omit<WorkbenchPartRef, 'position'>],
            // Add docked parts.
            ...this.form.controls.dockedParts.controls.map(dockedPartFormGroup => ({
              id: dockedPartFormGroup.controls.id.value || undefined,
              position: dockedPartFormGroup.controls.position.value || undefined,
              qualifier: dockedPartFormGroup.controls.qualifier.value ?? undefined,
              params: dockedPartFormGroup.controls.params.value ?? undefined,
              active: dockedPartFormGroup.controls.active.value ?? undefined,
              cssClass: dockedPartFormGroup.controls.cssClass.value ?? undefined,
              ɵactivityId: dockedPartFormGroup.controls.activityId.value ?? undefined,
            } as WorkbenchPartRef)),
            // Add other parts.
            ...partFormGroups.map(partFormGroup => ({
              id: partFormGroup.controls.id.value,
              position: {
                relativeTo: partFormGroup.controls.position.controls.relativeTo.value ?? undefined,
                align: partFormGroup.controls.position.controls.align.value || undefined,
                ratio: partFormGroup.controls.position.controls.ratio.value ?? undefined,
              },
              qualifier: partFormGroup.controls.qualifier.value ?? undefined,
              params: partFormGroup.controls.params.value ?? undefined,
              active: partFormGroup.controls.active.value ?? undefined,
              cssClass: partFormGroup.controls.cssClass.value ?? undefined,
            } as WorkbenchPartRef)),
          ],
        });
        this._cvaTouchedFn();
      });
  }

  private computePartProposals(): Signal<string[]> {
    const parts = toSignal(this.form.controls.parts.valueChanges, {initialValue: []});
    const dockedParts = toSignal(this.form.controls.dockedParts.valueChanges, {initialValue: []});

    return computed(() => new Array<string | undefined>()
      .concat(dockedParts().map(part => part.id))
      .concat(parts().map(part => part.id))
      .filter((partId: string | undefined): partId is string => !!partId),
    );
  }

  protected onAddPart(): void {
    const partFormGroup = this.createPartFormGroup();
    this.form.controls.parts.push(partFormGroup);
    this.updatePartFields();
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

  private createPartFormGroup(part?: Partial<WorkbenchPartRef & {position: RelativeTo}>): FormGroup<PartFormGroup> {
    return this._formBuilder.group({
      id: this._formBuilder.control(part?.id, {validators: Validators.required}),
      position: this._formBuilder.group({
        relativeTo: this._formBuilder.control(part?.position?.relativeTo),
        align: this._formBuilder.control(part?.position?.align, {validators: Validators.required}),
        ratio: this._formBuilder.control(part?.position?.ratio),
      }),
      qualifier: this._formBuilder.control(part?.qualifier as Record<string, string> | undefined, {validators: Validators.required}),
      params: this._formBuilder.control(part?.params as Record<string, string> | undefined),
      active: this._formBuilder.control(part?.active),
      cssClass: this._formBuilder.control(part?.cssClass),
    });
  }

  private createDockedPartFormGroup(part?: Partial<WorkbenchPartRef & {position: DockingArea}>): FormGroup<DockedPartFormGroup> {
    return this._formBuilder.group({
      id: this._formBuilder.control(part?.id, {validators: Validators.required}),
      position: this._formBuilder.control(part?.position, {validators: Validators.required}),
      qualifier: this._formBuilder.control(part?.qualifier as Record<string, string> | undefined, {validators: Validators.required}),
      params: this._formBuilder.control(part?.params as Record<string, string> | undefined),
      active: this._formBuilder.control(part?.active),
      activityId: this._formBuilder.control(part?.ɵactivityId),
      cssClass: this._formBuilder.control(part?.cssClass),
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
        partFormGroup.controls.position.controls.relativeTo.disable({emitEvent: false});
        partFormGroup.controls.position.controls.align.disable({emitEvent: false});
        partFormGroup.controls.position.controls.ratio.disable({emitEvent: false});
        // Unset values.
        partFormGroup.controls.position.controls.align.reset(undefined, {emitEvent: false});
        partFormGroup.controls.position.controls.ratio.reset(undefined, {emitEvent: false});
        partFormGroup.controls.position.controls.relativeTo.reset(undefined, {emitEvent: false});
        // Remove validation.
        partFormGroup.controls.position.controls.align.removeValidators(Validators.required);
      }
      else {
        partFormGroup.controls.position.controls.relativeTo.enable({emitEvent: false});
        partFormGroup.controls.position.controls.align.enable({emitEvent: false});
        partFormGroup.controls.position.controls.ratio.enable({emitEvent: false});
        partFormGroup.controls.position.controls.align.setValidators(Validators.required);
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
      .map(part => this.createPartFormGroup(part as Partial<WorkbenchPartRef & {position: RelativeTo}>))
      .forEach(partFormGroup => this.form.controls.parts.push(partFormGroup, {emitEvent: false}));

    // Docked Parts
    this.form.controls.dockedParts.clear({emitEvent: false});
    properties?.parts
      .filter(part => typeof (part as WorkbenchPartRef).position === 'string')
      .map(part => this.createDockedPartFormGroup(part as Partial<WorkbenchPartRef & {position: DockingArea}>))
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

export type WorkbenchPerspectiveCapabilityProperties = WorkbenchPerspectiveCapability['properties'];

interface PartFormGroup {
  id: FormControl<string | MAIN_AREA | undefined>;
  position: FormGroup<{
    align: FormControl<'left' | 'right' | 'top' | 'bottom' | undefined>;
    relativeTo: FormControl<string | undefined>;
    ratio: FormControl<number | undefined>;
  }>;
  qualifier: FormControl<Record<string, string> | undefined>;
  params: FormControl<Record<string, string> | undefined>;
  active: FormControl<boolean | undefined>;
  cssClass: FormControl<string | string[] | undefined>;
}

interface DockedPartFormGroup {
  id: FormControl<string | undefined>;
  position: FormControl<DockingArea | undefined>;
  qualifier: FormControl<Record<string, string> | undefined>;
  params: FormControl<Record<string, string> | undefined>;
  active: FormControl<boolean | undefined>;
  activityId: FormControl<ActivityId | undefined>;
  cssClass: FormControl<string | string[] | undefined>;
}
