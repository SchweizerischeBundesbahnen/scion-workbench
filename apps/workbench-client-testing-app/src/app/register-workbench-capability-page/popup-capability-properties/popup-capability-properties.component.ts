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
import {PopupSize, WorkbenchPopupCapability} from '@scion/workbench-client';
import {noop} from 'rxjs';
import {Arrays} from '@scion/toolkit/util';
import {undefinedIfEmpty} from '../../common/undefined-if-empty.util';
import {startWith} from 'rxjs/operators';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {parseTypedValue, unparseTypedValue} from '../../common/typed-value-parser.util';

@Component({
  selector: 'app-popup-capability-properties',
  templateUrl: './popup-capability-properties.component.html',
  styleUrls: ['./popup-capability-properties.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    SciFormFieldComponent,
    SciCheckboxComponent,
  ],
  providers: [
    {provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => PopupCapabilityPropertiesComponent)},
  ],
})
export class PopupCapabilityPropertiesComponent implements ControlValueAccessor {

  private _cvaChangeFn: (value: WorkbenchPopupCapabilityProperties) => void = noop;
  private _cvaTouchedFn: () => void = noop;

  public form = this._formBuilder.group({
    path: this._formBuilder.control(''),
    size: this._formBuilder.group({
      minHeight: this._formBuilder.control(''),
      height: this._formBuilder.control(''),
      maxHeight: this._formBuilder.control(''),
      minWidth: this._formBuilder.control(''),
      width: this._formBuilder.control(''),
      maxWidth: this._formBuilder.control(''),
    }),
    pinToStartPage: this._formBuilder.control(true),
    showSplash: this._formBuilder.control(false),
    cssClass: this._formBuilder.control(''),
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
            size: undefinedIfEmpty<PopupSize>({
              minHeight: this.form.controls.size.controls.minHeight.value || undefined,
              height: this.form.controls.size.controls.height.value || undefined,
              maxHeight: this.form.controls.size.controls.maxHeight.value || undefined,
              minWidth: this.form.controls.size.controls.minWidth.value || undefined,
              width: this.form.controls.size.controls.width.value || undefined,
              maxWidth: this.form.controls.size.controls.maxWidth.value || undefined,
            }),
            pinToStartPage: this.form.controls.pinToStartPage.value,
            cssClass: this.form.controls.cssClass.value.split(/\s+/).filter(Boolean),
          });
          this._cvaTouchedFn();
        });
      });
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public writeValue(value: WorkbenchPopupCapabilityProperties | undefined | null): void {
    this.form.reset();
    value && this.form.setValue({
      path: unparseTypedValue(value.path),
      size: {
        minHeight: value.size?.minHeight ?? '',
        height: value.size?.height ?? '',
        maxHeight: value.size?.maxHeight ?? '',
        width: value.size?.width ?? '',
        minWidth: value.size?.minWidth ?? '',
        maxWidth: value.size?.maxWidth ?? '',
      },
      pinToStartPage: value.pinToStartPage,
      showSplash: value.showSplash ?? false,
      cssClass: Arrays.coerce(value.cssClass).join(' '),
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

export type WorkbenchPopupCapabilityProperties = Pick<WorkbenchPopupCapability, 'properties'>['properties'] & {pinToStartPage: boolean};
