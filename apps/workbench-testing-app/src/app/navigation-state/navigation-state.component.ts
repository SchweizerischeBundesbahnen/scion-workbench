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
import {ViewState} from '@scion/workbench';
import {noop} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-navigation-state',
  templateUrl: './navigation-state.component.html',
  styleUrls: ['./navigation-state.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
  ],
  providers: [
    {provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => NavigationStateComponent)},
  ],
})
export class NavigationStateComponent implements ControlValueAccessor {

  private _cvaChangeFn: (state: ViewState | undefined) => void = noop;
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

  private parse(stringified: string): ViewState | undefined {
    if (!stringified.length) {
      return undefined;
    }
    const state: ViewState = {};
    for (const match of stringified.matchAll(/(?<key>[^=;]+)=(?<value>[^;]+)/g)) {
      const {key, value} = match.groups!;
      state[key] = value;
    }
    return state;
  }

  private stringify(state: ViewState | null | undefined): string {
    return Object.entries(state ?? {}).map(([key, value]) => `${key}=${value}`).join(';');
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public writeValue(state: ViewState | undefined | null): void {
    this.formControl.setValue(this.stringify(state), {emitEvent: false});
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
