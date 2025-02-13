/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, forwardRef} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {noop} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Arrays} from '@scion/toolkit/util';

@Component({
  selector: 'app-css-class',
  templateUrl: './css-class.component.html',
  styleUrls: ['./css-class.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
  ],
  providers: [
    {provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => CssClassComponent)},
  ],
})
export class CssClassComponent implements ControlValueAccessor {

  private _cvaChangeFn: (cssClasses: string | string[] | undefined) => void = noop;
  private _cvaTouchedFn: () => void = noop;

  protected formControl = this._formBuilder.control<string>('');

  constructor(private _formBuilder: NonNullableFormBuilder) {
    this.formControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this._cvaChangeFn(this.parse(this.formControl.value));
        this._cvaTouchedFn();
      });
  }

  private parse(stringified: string): string[] | string | undefined {
    const cssClasses = stringified.split(/\s+/).filter(Boolean);
    switch (cssClasses.length) {
      case 0:
        return undefined;
      case 1:
        return cssClasses[0];
      default:
        return cssClasses;
    }
  }

  private stringify(cssClasses: string | string[] | undefined | null): string {
    return Arrays.coerce(cssClasses).join(' ');
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public writeValue(cssClasses: string | string[] | undefined | null): void {
    this.formControl.setValue(this.stringify(cssClasses), {emitEvent: false});
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public registerOnChange(fn: (cssClasses: string | string[] | undefined) => void): void {
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
