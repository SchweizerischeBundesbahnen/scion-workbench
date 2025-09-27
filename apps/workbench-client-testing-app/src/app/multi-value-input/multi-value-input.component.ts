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
import {noop} from 'rxjs';
import {ControlValueAccessor, NG_VALUE_ACCESSOR, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Arrays} from '@scion/toolkit/util';

@Component({
  selector: 'app-multi-value-input',
  templateUrl: './multi-value-input.component.html',
  styleUrls: ['./multi-value-input.component.scss'],
  imports: [
    ReactiveFormsModule,
  ],
  providers: [
    {provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => MultiValueInputComponent)},
  ],
})
export class MultiValueInputComponent implements ControlValueAccessor {

  public readonly placeholder = input.required<string>();
  public readonly cssClass = input<string>(undefined, {alias: 'class'});

  private _cvaChangeFn: (values: string[] | undefined) => void = noop;
  private _cvaTouchedFn: () => void = noop;

  protected formControl = inject(NonNullableFormBuilder).control<string>('');

  constructor() {
    this.formControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this._cvaChangeFn(parse(this.formControl.value));
        this._cvaTouchedFn();
      });
  }

  protected onBlur(): void {
    this._cvaTouchedFn();
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public writeValue(values: string[] | undefined | null): void {
    this.formControl.setValue(stringify(values), {emitEvent: false});
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public registerOnChange(fn: (value: string[] | undefined) => void): void {
    this._cvaChangeFn = fn;
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public registerOnTouched(fn: () => void): void {
    this._cvaTouchedFn = fn;
  }
}

function parse(stringified: string): string[] | undefined {
  const values = stringified.split(/\s+/).filter(Boolean);
  switch (values.length) {
    case 0:
      return undefined;
    default:
      return values;
  }
}

function stringify(values: string | string[] | undefined | null): string {
  return Arrays.coerce(values).join(' ');
}
