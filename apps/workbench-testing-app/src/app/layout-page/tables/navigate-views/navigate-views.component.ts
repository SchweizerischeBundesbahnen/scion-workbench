/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, forwardRef, Input} from '@angular/core';
import {noop} from 'rxjs';
import {AbstractControl, ControlValueAccessor, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validator, Validators} from '@angular/forms';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SciMaterialIconDirective} from '@scion/components.internal/material-icon';
import {Commands, ViewState} from '@scion/workbench';
import {RouterCommandsComponent} from '../../../router-commands/router-commands.component';
import {CssClassComponent} from '../../../css-class/css-class.component';
import {UUID} from '@scion/toolkit/uuid';
import {RecordComponent} from '../../../record/record.component';

@Component({
  selector: 'app-navigate-views',
  templateUrl: './navigate-views.component.html',
  styleUrls: ['./navigate-views.component.scss'],
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
    {provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => NavigateViewsComponent)},
    {provide: NG_VALIDATORS, multi: true, useExisting: forwardRef(() => NavigateViewsComponent)},
  ],
})
export class NavigateViewsComponent implements ControlValueAccessor, Validator {

  private _cvaChangeFn: (value: NavigationDescriptor[]) => void = noop;
  private _cvaTouchedFn: () => void = noop;

  @Input({transform: arrayAttribute})
  public viewProposals: string[] = [];

  protected form = this._formBuilder.group({
    navigations: this._formBuilder.array<FormGroup<{
      id: FormControl<string>;
      commands: FormControl<Commands>;
      extras: FormGroup<{
        hint: FormControl<string | undefined>;
        state: FormControl<ViewState | undefined>;
        cssClass: FormControl<string | string[] | undefined>;
      }>;
    }>>([]),
  });
  protected viewList = `view-list-${UUID.randomUUID()}`;

  constructor(private _formBuilder: NonNullableFormBuilder) {
    this.form.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this._cvaChangeFn(this.form.controls.navigations.controls.map(navigationFormGroup => ({
          id: navigationFormGroup.controls.id.value,
          commands: navigationFormGroup.controls.commands.value,
          extras: ({
            hint: navigationFormGroup.controls.extras.controls.hint.value || undefined,
            state: navigationFormGroup.controls.extras.controls.state.value,
            cssClass: navigationFormGroup.controls.extras.controls.cssClass.value,
          }),
        })));
        this._cvaTouchedFn();
      });
  }

  protected onAddNavigation(): void {
    this.addNavigation({
      id: '',
      commands: [],
    });
  }

  protected onRemoveNavigation(index: number): void {
    this.form.controls.navigations.removeAt(index);
  }

  private addNavigation(navigation: NavigationDescriptor, options?: {emitEvent?: boolean}): void {
    this.form.controls.navigations.push(
      this._formBuilder.group({
        id: this._formBuilder.control<string>(navigation.id, Validators.required),
        commands: this._formBuilder.control<Commands>(navigation.commands),
        extras: this._formBuilder.group({
          hint: this._formBuilder.control<string | undefined>(navigation.extras?.hint),
          state: this._formBuilder.control<ViewState | undefined>(navigation.extras?.state),
          cssClass: this._formBuilder.control<string | string[] | undefined>(undefined),
        }),
      }), {emitEvent: options?.emitEvent ?? true});
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public writeValue(navigations: NavigationDescriptor[] | undefined | null): void {
    this.form.controls.navigations.clear({emitEvent: false});
    navigations?.forEach(navigation => this.addNavigation(navigation, {emitEvent: false}));
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
    return this.form.controls.navigations.valid ? null : {valid: false};
  }
}

export interface NavigationDescriptor {
  id: string;
  commands: Commands;
  extras?: {
    hint?: string;
    state?: ViewState;
    cssClass?: string | string[];
  };
}

function arrayAttribute(proposals: string[] | null | undefined): string[] {
  return proposals ?? [];
}
