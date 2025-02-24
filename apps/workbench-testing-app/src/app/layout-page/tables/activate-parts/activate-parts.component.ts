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
import {noop} from 'rxjs';
import {ControlValueAccessor, NG_VALUE_ACCESSOR, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Arrays} from '@scion/toolkit/util';

@Component({
  selector: 'app-activate-parts',
  templateUrl: './activate-parts.component.html',
  styleUrls: ['./activate-parts.component.scss'],
  imports: [
    ReactiveFormsModule,
  ],
  providers: [
    {provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => ActivatePartsComponent)},
  ],
})
export class ActivatePartsComponent implements ControlValueAccessor {

  private _cvaChangeFn: (parts: string[] | undefined) => void = noop;
  private _cvaTouchedFn: () => void = noop;

  private readonly _formBuilder = inject(NonNullableFormBuilder);

  protected formControl = this._formBuilder.control<string>('');

  constructor() {
    this.formControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this._cvaChangeFn(parse(this.formControl.value));
        this._cvaTouchedFn();
      });
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public writeValue(parts: string[] | undefined | null): void {
    this.formControl.setValue(stringify(parts), {emitEvent: false});
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
  const parts = stringified.split(/\s+/).filter(Boolean);
  switch (parts.length) {
    case 0:
      return undefined;
    default:
      return parts;
  }
}

function stringify(cssClasses: string | string[] | undefined | null): string {
  return Arrays.coerce(cssClasses).join(' ');
}
