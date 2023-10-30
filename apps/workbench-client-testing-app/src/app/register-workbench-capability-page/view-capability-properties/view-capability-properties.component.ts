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
import {ControlValueAccessor, NG_VALUE_ACCESSOR, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {WorkbenchViewCapability} from '@scion/workbench-client';
import {noop} from 'rxjs';
import {Arrays} from '@scion/toolkit/util';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {startWith} from 'rxjs/operators';
import {parseTypedValue, unparseTypedValue} from '../../common/typed-value-parser.util';

@Component({
  selector: 'app-view-capability-properties',
  templateUrl: './view-capability-properties.component.html',
  styleUrls: ['./view-capability-properties.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    SciFormFieldComponent,
    SciCheckboxComponent,
  ],
  providers: [
    {provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => ViewCapabilityPropertiesComponent)},
  ],
})
export class ViewCapabilityPropertiesComponent implements ControlValueAccessor {

  private _cvaChangeFn: (value: WorkbenchViewCapabilityProperties) => void = noop;
  private _cvaTouchedFn: () => void = noop;

  public form = this._formBuilder.group({
    path: this._formBuilder.control(''),
    title: this._formBuilder.control(''),
    heading: this._formBuilder.control(''),
    closable: this._formBuilder.control(true),
    cssClass: this._formBuilder.control(''),
    showSplash: this._formBuilder.control(false),
    pinToStartPage: this._formBuilder.control(false),
  });

  constructor(private _formBuilder: NonNullableFormBuilder) {
    this.form.valueChanges
      .pipe(
        startWith(undefined as void), // Initialize operator because Angular does not emit `valueChanges` on initial form values.
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        // Use setTimeout to ensure initial form values are emitted.
        setTimeout(() => {
          this._cvaChangeFn({
            path: parseTypedValue(this.form.controls.path.value) as string,
            title: this.form.controls.title.value || undefined,
            heading: this.form.controls.heading.value || undefined,
            cssClass: this.form.controls.cssClass.value.split(/\s+/).filter(Boolean),
            closable: this.form.controls.closable.value ?? undefined,
            pinToStartPage: this.form.controls.pinToStartPage.value,
          });
          this._cvaTouchedFn();
        });
      });
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public writeValue(value: WorkbenchViewCapabilityProperties | undefined | null): void {
    this.form.reset();
    value && this.form.setValue({
      path: unparseTypedValue(value.path),
      title: value.title ?? '',
      heading: value.heading ?? '',
      closable: value.closable ?? true,
      pinToStartPage: value.pinToStartPage,
      showSplash: value.showSplash ?? false,
      cssClass: Arrays.coerce(value?.cssClass).join(' '),
    });
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

export type WorkbenchViewCapabilityProperties = Pick<WorkbenchViewCapability, 'properties'>['properties'] & {pinToStartPage: boolean};
