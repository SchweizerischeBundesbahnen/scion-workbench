/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, forwardRef, Input} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {noop} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-record',
  templateUrl: './record.component.html',
  styleUrls: ['./record.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgClass,
  ],
  providers: [
    {provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => RecordComponent)},
  ],
})
export class RecordComponent implements ControlValueAccessor {

  private _cvaChangeFn: (record: Record<string, string> | undefined) => void = noop;
  private _cvaTouchedFn: () => void = noop;

  protected formControl = this._formBuilder.control<string>('');

  @Input('class')
  public cssClass: string | undefined;

  constructor(private _formBuilder: NonNullableFormBuilder) {
    this.formControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this._cvaChangeFn(this.parse(this.formControl.value));
        this._cvaTouchedFn();
      });
  }

  private parse(stringified: string): Record<string, string> | undefined {
    if (!stringified.length) {
      return undefined;
    }
    const record: Record<string, string> = {};
    for (const match of stringified.matchAll(/(?<key>[^=;]+)=(?<value>[^;]+)/g)) {
      const {key, value} = match.groups!;
      record[key] = value;
    }
    return record;
  }

  private stringify(record: Record<string, string> | null | undefined): string {
    return Object.entries(record ?? {}).map(([key, value]) => `${key}=${value}`).join(';');
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public writeValue(record: Record<string, string> | undefined | null): void {
    this.formControl.setValue(this.stringify(record), {emitEvent: false});
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public registerOnChange(fn: (record: Record<string, string> | undefined) => void): void {
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
