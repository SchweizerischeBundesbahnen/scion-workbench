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
import {CommonModule} from '@angular/common';
import {noop} from 'rxjs';
import {AbstractControl, ControlValueAccessor, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validator, Validators} from '@angular/forms';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {SciMaterialIconDirective} from '@scion/components.internal/material-icon';
import {SciKeyValueFieldComponent} from '@scion/components.internal/key-value-field';
import {PerspectivePageViewEntry} from '../perspective-page-views/perspective-page-views.component';
import {Commands} from '@scion/workbench';
import {RouterCommandsComponent} from '../../router-commands/router-commands.component';

@Component({
  selector: 'app-perspective-page-navigate-views',
  templateUrl: './perspective-page-navigate-views.component.html',
  styleUrls: ['./perspective-page-navigate-views.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SciCheckboxComponent,
    SciFormFieldComponent,
    SciMaterialIconDirective,
    SciKeyValueFieldComponent,
    RouterCommandsComponent,
  ],
  providers: [
    {provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => PerspectivePageNavigateViewsComponent)},
    {provide: NG_VALIDATORS, multi: true, useExisting: forwardRef(() => PerspectivePageNavigateViewsComponent)},
  ],
})
export class PerspectivePageNavigateViewsComponent implements ControlValueAccessor, Validator {

  private _cvaChangeFn: (value: PerspectivePageNavigateViewEntry[]) => void = noop;
  private _cvaTouchedFn: () => void = noop;

  @Input()
  public viewEntries: PerspectivePageViewEntry[] = [];

  public form = this._formBuilder.group({
    navigateViews: this._formBuilder.array<FormGroup<{
      id: FormControl<string>;
      commands: FormControl<Commands>;
      options: FormGroup<{
        outlet: FormControl<string | undefined>;
        cssClass: FormControl<string | undefined>;
      }>;
    }>>([]),
  });

  constructor(private _formBuilder: NonNullableFormBuilder) {
    this.form.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        const navigateViews: PerspectivePageNavigateViewEntry[] = this.form.controls.navigateViews.controls.map(formGroup => ({
          id: formGroup.controls.id.value,
          commands: formGroup.controls.commands.value,
          options: {
            outlet: formGroup.controls.options.controls.outlet.value,
            cssClass: formGroup.controls.options.controls.cssClass.value?.split(/\s+/).filter(Boolean),
          },
        }));
        this._cvaChangeFn(navigateViews);
        this._cvaTouchedFn();
      });
  }

  protected onAddNavigateView(): void {
    this.addNavigateViewEntry({
      id: '',
      commands: [],
    });
  }

  protected onClearNavigateViews(): void {
    this.form.controls.navigateViews.clear();
  }

  protected onRemoveNavigateView(index: number): void {
    this.form.controls.navigateViews.removeAt(index);
  }

  private addNavigateViewEntry(navigateView: PerspectivePageNavigateViewEntry, options?: {emitEvent?: boolean}): void {
    this.form.controls.navigateViews.push(
      this._formBuilder.group({
        id: this._formBuilder.control<string>(navigateView.id, Validators.required),
        commands: this._formBuilder.control<Commands>([]),
        options: this._formBuilder.group({
          outlet: this._formBuilder.control<string | undefined>(navigateView.options?.outlet || undefined),
          cssClass: this._formBuilder.control<string | undefined>(navigateView.options?.cssClass?.join(' ')),
        }),
      }), {emitEvent: options?.emitEvent ?? true});
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public writeValue(value: PerspectivePageNavigateViewEntry[] | undefined | null): void {
    this.form.controls.navigateViews.clear({emitEvent: false});
    value?.forEach(navigateView => this.addNavigateViewEntry(navigateView, {emitEvent: false}));
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
    return this.form.controls.navigateViews.valid ? null : {valid: false};
  }
}

export interface PerspectivePageNavigateViewEntry {
  id: string;
  commands: Commands;
  options?: {
    outlet?: string;
    cssClass?: string[];
  };
}

