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
import {AbstractControl, ControlValueAccessor, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validator, ValidatorFn, Validators} from '@angular/forms';
import {noop} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {SciMaterialIconDirective} from '@scion/components.internal/material-icon';
import {MultiValueInputComponent} from '../../../multi-value-input/multi-value-input.component';
import {ActivityId, Translatable} from '@scion/workbench';
import {parseTypedString} from '../../../common/parse-typed-value.util';
import {UUID} from '@scion/toolkit/uuid';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';

@Component({
  selector: 'app-add-docked-parts',
  templateUrl: './add-docked-parts.component.html',
  styleUrls: ['./add-docked-parts.component.scss'],
  imports: [
    ReactiveFormsModule,
    SciMaterialIconDirective,
    MultiValueInputComponent,
    SciCheckboxComponent,
  ],
  providers: [
    {provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => AddDockedPartsComponent)},
    {provide: NG_VALIDATORS, multi: true, useExisting: forwardRef(() => AddDockedPartsComponent)},
  ],
})
export class AddDockedPartsComponent implements ControlValueAccessor, Validator {

  private readonly _formBuilder = inject(NonNullableFormBuilder);

  private _cvaChangeFn: (value: DockedPartDescriptor[]) => void = noop;
  private _cvaTouchedFn: () => void = noop;

  protected readonly titleList = `title-list-${UUID.randomUUID()}`;

  protected readonly form = this._formBuilder.group({
    dockedParts: this._formBuilder.array<FormGroup<{
      id: FormControl<string>;
      dockTo: FormGroup<{
        dockTo: FormControl<'left-top' | 'left-bottom' | 'right-top' | 'right-bottom' | 'bottom-left' | 'bottom-right'>;
      }>;
      extras: FormGroup<{
        icon: FormControl<string>;
        label: FormControl<Translatable>;
        tooltip: FormControl<Translatable | undefined>;
        title: FormControl<Translatable | undefined>;
        cssClass: FormControl<string | string[] | undefined>;
        activate: FormControl<boolean | undefined>;
        activityId: FormControl<ActivityId | undefined>;
      }>;
    }>>([]),
  });

  constructor() {
    this.form.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this._cvaChangeFn(this.form.controls.dockedParts.controls.map(dockedPartFormGroup => ({
          id: dockedPartFormGroup.controls.id.value,
          dockTo: {
            dockTo: dockedPartFormGroup.controls.dockTo.controls.dockTo.value,
          },
          extras: {
            icon: dockedPartFormGroup.controls.extras.controls.icon.value,
            label: dockedPartFormGroup.controls.extras.controls.label.value,
            tooltip: dockedPartFormGroup.controls.extras.controls.tooltip.value,
            title: parseTypedString(dockedPartFormGroup.controls.extras.controls.title.value)!,
            cssClass: dockedPartFormGroup.controls.extras.controls.cssClass.value,
            activate: dockedPartFormGroup.controls.extras.controls.activate.value,
            ɵactivityId: dockedPartFormGroup.controls.extras.controls.activityId.value,
          },
        })));
        this._cvaTouchedFn();
      });
  }

  protected onAddDockedPart(): void {
    this.addDockedPart({
      id: '',
      dockTo: {
        dockTo: 'left-top',
      },
      extras: {
        icon: '',
        label: '',
      },
    });
  }

  protected onRemoveDockedPart(index: number): void {
    this.form.controls.dockedParts.removeAt(index);
  }

  private addDockedPart(dockedPart: DockedPartDescriptor, options?: {emitEvent?: boolean}): void {
    this.form.controls.dockedParts.push(
      this._formBuilder.group({
        id: this._formBuilder.control<string>(dockedPart.id, Validators.required),
        dockTo: this._formBuilder.group({
          dockTo: this._formBuilder.control<'left-top' | 'left-bottom' | 'right-top' | 'right-bottom' | 'bottom-left' | 'bottom-right'>(dockedPart.dockTo.dockTo, Validators.required),
        }),
        extras: this._formBuilder.group({
          icon: this._formBuilder.control<string>(dockedPart.extras.icon, Validators.required),
          label: this._formBuilder.control<Translatable>(dockedPart.extras.label, Validators.required),
          tooltip: this._formBuilder.control<Translatable | undefined>(dockedPart.extras.tooltip),
          title: this._formBuilder.control<Translatable | undefined>(dockedPart.extras.title === false ? '<boolean>false</boolean>' : dockedPart.extras.title),
          cssClass: this._formBuilder.control<string | string[] | undefined>(dockedPart.extras.cssClass),
          activate: this._formBuilder.control<boolean | undefined>(dockedPart.extras.activate),
          activityId: this._formBuilder.control<ActivityId | undefined>(dockedPart.extras.ɵactivityId, activityIdFormatValidator()),
        }),
      }), {emitEvent: options?.emitEvent ?? true});
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public writeValue(dockedParts: DockedPartDescriptor[] | undefined | null): void {
    this.form.controls.dockedParts.clear({emitEvent: false});
    dockedParts?.forEach(dockedPart => this.addDockedPart(dockedPart, {emitEvent: false}));
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public registerOnChange(fn: (value: DockedPartDescriptor[]) => void): void {
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
    return this.form.controls.dockedParts.valid ? null : {valid: false};
  }
}

export interface DockedPartDescriptor {
  id: string;
  dockTo: {
    dockTo: 'left-top' | 'left-bottom' | 'right-top' | 'right-bottom' | 'bottom-left' | 'bottom-right';
  };
  extras: {
    icon: string;
    label: Translatable;
    tooltip?: Translatable;
    title?: Translatable | false;
    cssClass?: string | string[];
    activate?: boolean;
    ɵactivityId?: ActivityId;
  };
}

function activityIdFormatValidator(): ValidatorFn {
  return (control: AbstractControl<ActivityId | undefined>): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }
    const regex = /^activity\..+/;
    return regex.test(control.value) ? null : {invalidActivityIdFormat: true};
  };
}
