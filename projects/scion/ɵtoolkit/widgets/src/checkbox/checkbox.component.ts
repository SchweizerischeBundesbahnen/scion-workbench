/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef, Input, OnDestroy } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { noop, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { coerceBooleanProperty } from '@angular/cdk/coercion';

@Component({
  selector: 'sci-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => SciCheckboxComponent)},
  ],
})
export class SciCheckboxComponent implements ControlValueAccessor, OnDestroy {

  private _destroy$ = new Subject<void>();

  private _cvaChangeFn: (value: any) => void = noop;
  private _cvaTouchedFn: () => void = noop;

  public formControl = new FormControl(false, {updateOn: 'change'});

  /**
   * Sets focus order in sequential keyboard navigation.
   * If not specified, the focus order is according to the position in the document (tabindex=0).
   */
  @Input()
  public tabindex = 0;

  @Input()
  public set disabled(disabled: boolean) {
    coerceBooleanProperty(disabled) ? this.formControl.disable() : this.formControl.enable();
  }

  constructor(private _cd: ChangeDetectorRef) {
    this.formControl.valueChanges
      .pipe(takeUntil(this._destroy$))
      .subscribe(checked => {
        this._cvaChangeFn(checked);
        this._cvaTouchedFn();
        this._cd.markForCheck();
      });
  }

  public get isChecked(): boolean {
    return this.formControl.value;
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   */
  public registerOnChange(fn: any): void {
    this._cvaChangeFn = fn;
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   */
  public registerOnTouched(fn: any): void {
    this._cvaTouchedFn = fn;
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   */
  public setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this._cd.markForCheck();
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   */
  public writeValue(value: any): void {
    this.formControl.setValue(coerceBooleanProperty(value), {emitEvent: false});
    this._cd.markForCheck();
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
