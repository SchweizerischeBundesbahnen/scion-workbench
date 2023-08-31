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
import {PerspectivePagePartEntry} from '../perspective-page-parts/perspective-page-parts.component';

@Component({
  selector: 'app-perspective-page-views',
  templateUrl: './perspective-page-views.component.html',
  styleUrls: ['./perspective-page-views.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SciCheckboxComponent, SciFormFieldComponent],
  providers: [
    {provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => PerspectivePageViewsComponent)},
    {provide: NG_VALIDATORS, multi: true, useExisting: forwardRef(() => PerspectivePageViewsComponent)},
  ],
})
export class PerspectivePageViewsComponent implements ControlValueAccessor, Validator {

  private _cvaChangeFn: (value: PerspectivePageViewEntry[]) => void = noop;
  private _cvaTouchedFn: () => void = noop;

  @Input()
  public partEntries: PerspectivePagePartEntry[] = [];

  public form = this._formBuilder.group({
    views: this._formBuilder.array<FormGroup<{
      id: FormControl<string>;
      partId: FormControl<string>;
      position: FormControl<number | undefined>;
      activateView: FormControl<boolean | undefined>;
      activatePart: FormControl<boolean | undefined>;
    }>>([]),
  });

  constructor(private _formBuilder: NonNullableFormBuilder) {
    this.form.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        const views: PerspectivePageViewEntry[] = this.form.controls.views.controls.map(viewFormGroup => ({
          id: viewFormGroup.controls.id.value,
          partId: viewFormGroup.controls.partId.value,
          position: viewFormGroup.controls.position.value,
          activateView: viewFormGroup.controls.activateView.value,
          activatePart: viewFormGroup.controls.activatePart.value,
        }));
        this._cvaChangeFn(views);
        this._cvaTouchedFn();
      });
  }

  protected onAddView(): void {
    this.addViewEntry({
      id: '',
      partId: '',
    });
  }

  protected onClearViews(): void {
    this.form.controls.views.clear();
  }

  protected onRemoveView(index: number): void {
    this.form.controls.views.removeAt(index);
  }

  private addViewEntry(view: PerspectivePageViewEntry, options?: {emitEvent?: boolean}): void {
    this.form.controls.views.push(
      this._formBuilder.group({
        id: this._formBuilder.control<string>(view.id, Validators.required),
        partId: this._formBuilder.control<string>(view.partId, Validators.required),
        position: this._formBuilder.control<number | undefined>(view.position),
        activateView: this._formBuilder.control<boolean | undefined>(view.activateView),
        activatePart: this._formBuilder.control<boolean | undefined>(view.activatePart),
      }), {emitEvent: options?.emitEvent ?? true});
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public writeValue(value: PerspectivePageViewEntry[] | undefined | null): void {
    this.form.controls.views.clear({emitEvent: false});
    value?.forEach(view => this.addViewEntry(view, {emitEvent: false}));
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
    return this.form.controls.views.valid ? null : {valid: false};
  }
}

export type PerspectivePageViewEntry = {
  id: string;
  partId: string;
  position?: number;
  activateView?: boolean;
  activatePart?: boolean;
};
