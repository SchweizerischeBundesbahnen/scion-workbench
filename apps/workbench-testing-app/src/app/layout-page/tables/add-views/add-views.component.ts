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
import {SciMaterialIconDirective} from '@scion/components.internal/material-icon';
import {CssClassComponent} from '../../../css-class/css-class.component';
import {UUID} from '@scion/toolkit/uuid';

@Component({
  selector: 'app-add-views',
  templateUrl: './add-views.component.html',
  styleUrls: ['./add-views.component.scss'],
  imports: [
    ReactiveFormsModule,
    SciCheckboxComponent,
    SciMaterialIconDirective,
    CssClassComponent,
  ],
  providers: [
    {provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => AddViewsComponent)},
    {provide: NG_VALIDATORS, multi: true, useExisting: forwardRef(() => AddViewsComponent)},
  ],
})
export class AddViewsComponent implements ControlValueAccessor, Validator {

  private _cvaChangeFn: (value: ViewDescriptor[]) => void = noop;
  private _cvaTouchedFn: () => void = noop;

  @Input({transform: arrayAttribute})
  public partProposals: string[] = [];

  protected form = this._formBuilder.group({
    views: this._formBuilder.array<FormGroup<{
      id: FormControl<string>;
      options: FormGroup<{
        partId: FormControl<string>;
        position: FormControl<number | 'start' | 'end' | 'before-active-view' | 'after-active-view' | undefined>;
        cssClass: FormControl<string | string[] | undefined>;
        activateView: FormControl<boolean | undefined>;
        activatePart: FormControl<boolean | undefined>;
      }>;
    }>>([]),
  });
  protected partList = `part-list-${UUID.randomUUID()}`;

  constructor(private _formBuilder: NonNullableFormBuilder) {
    this.form.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this._cvaChangeFn(this.form.controls.views.controls.map(viewFormGroup => ({
          id: viewFormGroup.controls.id.value,
          options: {
            partId: viewFormGroup.controls.options.controls.partId.value,
            position: viewFormGroup.controls.options.controls.position.value,
            cssClass: viewFormGroup.controls.options.controls.cssClass.value,
            activateView: viewFormGroup.controls.options.controls.activateView.value,
            activatePart: viewFormGroup.controls.options.controls.activatePart.value,
          },
        })));
        this._cvaTouchedFn();
      });
  }

  protected onAddView(): void {
    this.addView({
      id: '',
      options: {
        partId: '',
      },
    });
  }

  protected onRemoveView(index: number): void {
    this.form.controls.views.removeAt(index);
  }

  private addView(view: ViewDescriptor, options?: {emitEvent?: boolean}): void {
    this.form.controls.views.push(
      this._formBuilder.group({
        id: this._formBuilder.control<string>(view.id, Validators.required),
        options: this._formBuilder.group({
          partId: this._formBuilder.control<string>(view.options.partId, Validators.required),
          position: this._formBuilder.control<number | 'start' | 'end' | 'before-active-view' | 'after-active-view' | undefined>(view.options.position),
          cssClass: this._formBuilder.control<string | string[] | undefined>(view.options.cssClass),
          activateView: this._formBuilder.control<boolean | undefined>(view.options.activateView),
          activatePart: this._formBuilder.control<boolean | undefined>(view.options.activatePart),
        }),
      }), {emitEvent: options?.emitEvent ?? true});
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public writeValue(views: ViewDescriptor[] | undefined | null): void {
    this.form.controls.views.clear({emitEvent: false});
    views?.forEach(view => this.addView(view, {emitEvent: false}));
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public registerOnChange(fn: (value: ViewDescriptor[]) => void): void {
    this._cvaChangeFn = fn;
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public registerOnTouched(fn: () => void): void {
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

export interface ViewDescriptor {
  id: string;
  options: {
    partId: string;
    position?: number | 'start' | 'end' | 'before-active-view' | 'after-active-view';
    activateView?: boolean;
    activatePart?: boolean;
    cssClass?: string | string[];
  };
}

function arrayAttribute(proposals: string[] | null | undefined): string[] {
  return proposals ?? [];
}
