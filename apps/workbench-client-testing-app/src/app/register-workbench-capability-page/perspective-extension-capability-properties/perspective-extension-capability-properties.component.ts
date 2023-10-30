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
import {ControlValueAccessor, FormArray, FormControl, FormGroup, NG_VALUE_ACCESSOR, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {KeyValueEntry, SciKeyValueFieldComponent} from '@scion/components.internal/key-value-field';
import {NgFor} from '@angular/common';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {WorkbenchPerspectiveCapabilityView, WorkbenchPerspectiveExtensionCapability} from '@scion/workbench-client';
import {noop} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {startWith} from 'rxjs/operators';
import {Qualifier} from '@scion/microfrontend-platform';
import {SciMaterialIconDirective} from '@scion/components.internal/material-icon';

@Component({
  selector: 'app-perspective-extension-capability-properties',
  templateUrl: './perspective-extension-capability-properties.component.html',
  styleUrls: ['./perspective-extension-capability-properties.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    SciFormFieldComponent,
    SciKeyValueFieldComponent,
    SciCheckboxComponent,
    NgFor,
    SciMaterialIconDirective,
  ],
  providers: [
    {provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => PerspectiveExtensionCapabilityPropertiesComponent)},
  ],
})
export class PerspectiveExtensionCapabilityPropertiesComponent implements ControlValueAccessor {

  private _cvaChangeFn: (value: WorkbenchPerspectiveExtensionCapabilityProperties) => void = noop;
  private _cvaTouchedFn: () => void = noop;

  public form = this._formBuilder.group({
    perspectiveQualifier: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
    views: this._formBuilder.array<FormGroup<{
      qualifier: FormArray<FormGroup<KeyValueEntry>>;
      partId: FormControl<string>;
      position: FormControl<number | undefined>;
      active: FormControl<boolean | undefined>;
    }>>([]),
  });

  constructor(private _formBuilder: NonNullableFormBuilder) {
    this.form.valueChanges
      .pipe(
        startWith(undefined as void), // Initialize operator because Angular does not emit `valueChanges` on initial form values.
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        const perspective = SciKeyValueFieldComponent.toDictionary(this.form.controls.perspectiveQualifier)!;
        const views: WorkbenchPerspectiveCapabilityView[] = this.form.controls.views.controls.map(viewFormGroup => ({
          qualifier: SciKeyValueFieldComponent.toDictionary(viewFormGroup.controls.qualifier)!,
          partId: viewFormGroup.controls.partId.value,
          position: viewFormGroup.controls.position.value,
          active: viewFormGroup.controls.active.value,
        }));
        // Use setTimeout to ensure initial form values are emitted.
        setTimeout(() => {
          this._cvaChangeFn({perspective, views});
          this._cvaTouchedFn();
        });
      });
  }

  protected onAddView(): void {
    this.addViewEntry({
      qualifier: {},
      partId: '',
      position: undefined,
      active: undefined,
    });
  }

  protected onClearViews(): void {
    this.form.controls.views.clear();
  }

  protected onRemoveView(index: number): void {
    this.form.controls.views.removeAt(index);
  }

  protected addViewEntry(view: ViewEntry, options?: {emitEvent?: boolean}): void {
    const qualifierFormArray = this._formBuilder.array<FormGroup<KeyValueEntry>>([]);
    Object.keys(view.qualifier ?? {}).forEach(key => {
      qualifierFormArray.push(this._formBuilder.group({
        key: key,
        value: view.qualifier![key] as string,
      }));
    });
    this.form.controls.views.push(this._formBuilder.group({
      qualifier: qualifierFormArray,
      partId: this._formBuilder.control(view.partId ?? '', Validators.required),
      position: this._formBuilder.control<number | undefined>(view.position),
      active: this._formBuilder.control<boolean | undefined>(view.active),
    }), {emitEvent: options?.emitEvent ?? true});
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public writeValue(value: WorkbenchPerspectiveExtensionCapabilityProperties | undefined | null): void {
    this.form.controls.views.clear({emitEvent: false});
    value?.views.forEach(view => this.addViewEntry(view, {emitEvent: false}));
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

export type WorkbenchPerspectiveExtensionCapabilityProperties = Pick<WorkbenchPerspectiveExtensionCapability, 'properties'>['properties'];

export type ViewEntry = {
  qualifier: Qualifier;
  partId: string;
  position?: number;
  active?: boolean;
};
