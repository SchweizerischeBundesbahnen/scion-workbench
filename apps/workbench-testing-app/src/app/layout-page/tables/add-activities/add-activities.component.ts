/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, forwardRef} from '@angular/core';
import {AbstractControl, ControlValueAccessor, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validator, ValidatorFn, Validators} from '@angular/forms';
import {noop} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {SciMaterialIconDirective} from '@scion/components.internal/material-icon';
import {CssClassComponent} from '../../../css-class/css-class.component';
import {ActivityId} from '@scion/workbench';

@Component({
  selector: 'app-add-activities',
  templateUrl: './add-activities.component.html',
  styleUrls: ['./add-activities.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    SciMaterialIconDirective,
    CssClassComponent,
  ],
  providers: [
    {provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => AddActivitiesComponent)},
    {provide: NG_VALIDATORS, multi: true, useExisting: forwardRef(() => AddActivitiesComponent)},
  ],
})
export class AddActivitiesComponent implements ControlValueAccessor, Validator {

  private _cvaChangeFn: (value: ActivityDescriptor[]) => void = noop;
  private _cvaTouchedFn: () => void = noop;

  protected form = this._formBuilder.group({
    activities: this._formBuilder.array<FormGroup<{
      id: FormControl<string>;
      dockTo: FormGroup<{
        dockTo: FormControl<'left-top' | 'left-bottom' | 'right-top' | 'right-bottom' | 'bottom-left' | 'bottom-right'>;
      }>;
      extras: FormGroup<{
        icon: FormControl<string>;
        label: FormControl<string | `%${string}`>;
        tooltip: FormControl<string | `%${string}` | undefined>;
        cssClass: FormControl<string | string[] | undefined>;
        activityId: FormControl<ActivityId | undefined>;
      }>;
    }>>([]),
  });

  constructor(private _formBuilder: NonNullableFormBuilder) {
    this.form.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this._cvaChangeFn(this.form.controls.activities.controls.map(activityFormGroup => ({
          id: activityFormGroup.controls.id.value,
          dockTo: {
            dockTo: activityFormGroup.controls.dockTo.controls.dockTo.value,
          },
          extras: {
            icon: activityFormGroup.controls.extras.controls.icon.value,
            label: activityFormGroup.controls.extras.controls.label.value,
            tooltip: activityFormGroup.controls.extras.controls.tooltip.value,
            cssClass: activityFormGroup.controls.extras.controls.cssClass.value,
            ɵactivityId: activityFormGroup.controls.extras.controls.activityId.value,
          },
        })));
        this._cvaTouchedFn();
      });
  }

  protected onAddActivity(): void {
    this.addActivity({
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

  protected onRemoveActivity(index: number): void {
    this.form.controls.activities.removeAt(index);
  }

  private addActivity(activity: ActivityDescriptor, options?: {emitEvent?: boolean}): void {
    this.form.controls.activities.push(
      this._formBuilder.group({
        id: this._formBuilder.control<string>(activity.id, Validators.required),
        dockTo: this._formBuilder.group({
          dockTo: this._formBuilder.control<'left-top' | 'left-bottom' | 'right-top' | 'right-bottom' | 'bottom-left' | 'bottom-right'>(activity.dockTo.dockTo, Validators.required),
        }),
        extras: this._formBuilder.group({
          icon: this._formBuilder.control<string>(activity.extras.icon, Validators.required),
          label: this._formBuilder.control<string>(activity.extras.label, Validators.required),
          tooltip: this._formBuilder.control<string | undefined>(activity.extras.tooltip),
          cssClass: this._formBuilder.control<string | string[] | undefined>(activity.extras.cssClass),
          activityId: this._formBuilder.control<ActivityId | undefined>(activity.extras.ɵactivityId, activityIdFormatValidator()),
        }),
      }), {emitEvent: options?.emitEvent ?? true});
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public writeValue(activities: ActivityDescriptor[] | undefined | null): void {
    this.form.controls.activities.clear({emitEvent: false});
    activities?.forEach(activity => this.addActivity(activity, {emitEvent: false}));
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public registerOnChange(fn: (value: ActivityDescriptor[]) => void): void {
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
    return this.form.controls.activities.valid ? null : {valid: false};
  }
}

export interface ActivityDescriptor {
  id: string;
  dockTo: {
    dockTo: 'left-top' | 'left-bottom' | 'right-top' | 'right-bottom' | 'bottom-left' | 'bottom-right';
  };
  extras: {
    icon: string;
    label: string | `%${string}`;
    tooltip?: string | `%${string}`;
    cssClass?: string | string[];
    ɵactivityId?: ActivityId;
  };
}

export function activityIdFormatValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }
    const regex = /^activity\..+/;
    return regex.test(control.value) ? null : {invalidActivityIdFormat: true};
  };
}
