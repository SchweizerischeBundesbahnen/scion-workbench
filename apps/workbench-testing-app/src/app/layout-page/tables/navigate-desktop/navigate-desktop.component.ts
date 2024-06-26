/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, forwardRef} from '@angular/core';
import {noop} from 'rxjs';
import {AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validator} from '@angular/forms';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SciMaterialIconDirective} from '@scion/components.internal/material-icon';
import {Commands, ViewState} from '@scion/workbench';
import {RouterCommandsComponent} from '../../../router-commands/router-commands.component';
import {CssClassComponent} from '../../../css-class/css-class.component';
import {RecordComponent} from '../../../record/record.component';

@Component({
  selector: 'app-navigate-desktop',
  templateUrl: './navigate-desktop.component.html',
  styleUrls: ['./navigate-desktop.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    SciCheckboxComponent,
    SciFormFieldComponent,
    SciMaterialIconDirective,
    RouterCommandsComponent,
    RecordComponent,
    CssClassComponent,
  ],
  providers: [
    {provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => NavigateDesktopComponent)},
    {provide: NG_VALIDATORS, multi: true, useExisting: forwardRef(() => NavigateDesktopComponent)},
  ],
})
export class NavigateDesktopComponent implements ControlValueAccessor, Validator {

  private _cvaChangeFn: (value: DesktopNavigationDescriptor | undefined) => void = noop;
  private _cvaTouchedFn: () => void = noop;

  protected navigateDesktop = false;

  protected form = this._formBuilder.group({
    commands: this._formBuilder.control<Commands>([]),
    extras: this._formBuilder.group({
      hint: this._formBuilder.control<string | undefined>(undefined),
      state: this._formBuilder.control<ViewState | undefined>(undefined),
      cssClass: this._formBuilder.control<string | string[] | undefined>(undefined),
    }),
  });

  constructor(private _formBuilder: NonNullableFormBuilder) {
    this.form.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this._cvaChangeFn({
          commands: this.form.controls.commands.value,
          extras: {
            hint: this.form.controls.extras.controls.hint.value || undefined,
            state: this.form.controls.extras.controls.state.value || undefined,
            cssClass: this.form.controls.extras.controls.cssClass.value || undefined,
          },
        });
        this._cvaTouchedFn();
      });
  }

  public onAddNavigation(): void {
    this.navigateDesktop = true;
  }

  public onRemoveNavigation(): void {
    this.navigateDesktop = false;
    this.form.reset(undefined, {emitEvent: false});
    this._cvaChangeFn(undefined);
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public writeValue(navigation: DesktopNavigationDescriptor | undefined | null): void {
    this.form.reset(undefined, {emitEvent: false});
    this.form.controls.commands.setValue(navigation?.commands ?? []);
    this.form.controls.extras.controls.hint.setValue(navigation?.extras?.hint);
    this.form.controls.extras.controls.state.setValue(navigation?.extras?.state);
    this.form.controls.extras.controls.cssClass.setValue(navigation?.extras?.cssClass);
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

  /**
   * Method implemented as part of `Validator` to work with Angular forms API
   * @docs-private
   */
  public validate(control: AbstractControl): ValidationErrors | null {
    return this.form.valid ? null : {valid: false};
  }
}

export interface DesktopNavigationDescriptor {
  commands: Commands;
  extras?: {
    hint?: string;
    state?: ViewState;
    cssClass?: string | string[];
  };
}
