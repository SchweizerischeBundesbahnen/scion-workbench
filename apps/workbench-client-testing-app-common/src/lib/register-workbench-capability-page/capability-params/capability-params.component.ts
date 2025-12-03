/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, forwardRef, inject, input, Signal} from '@angular/core';
import {AbstractControl, ControlValueAccessor, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validator, Validators} from '@angular/forms';
import {mergeWith, noop} from 'rxjs';
import {takeUntilDestroyed, toObservable, toSignal} from '@angular/core/rxjs-interop';
import {SciMaterialIconDirective} from '@scion/components.internal/material-icon';
import {ViewParamDefinition} from '@scion/workbench-client';
import {SciCheckboxComponent} from '@scion/components.internal/checkbox';
import {ParamDefinition} from '@scion/microfrontend-platform';
import {UUID} from '@scion/toolkit/uuid';
import {Arrays} from '@scion/toolkit/util';
import {prune} from 'workbench-testing-app-common';

@Component({
  selector: 'app-capability-params',
  templateUrl: './capability-params.component.html',
  styleUrl: './capability-params.component.scss',
  imports: [
    ReactiveFormsModule,
    SciMaterialIconDirective,
    SciCheckboxComponent,
  ],
  providers: [
    {provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => CapabilityParamsComponent)},
    {provide: NG_VALIDATORS, multi: true, useExisting: forwardRef(() => CapabilityParamsComponent)},
  ],
  host: {
    '[attr.data-show-transient-params]': `showTransientParams() ? '' : null`,
    '[class.empty]': `form.controls.params.controls.length`,
  },
})
export class CapabilityParamsComponent implements ControlValueAccessor, Validator {

  public readonly showTransientParams = input<boolean>(false);

  private readonly _formBuilder = inject(NonNullableFormBuilder);

  protected readonly form = this._formBuilder.group({
    params: this._formBuilder.array<FormGroup<ParamFormGroup>>([]),
  });
  protected readonly paramList = `param-list-${UUID.randomUUID()}`;
  protected readonly params = this.computeParamProposals();

  private _cvaChangeFn: (properties: ParamDefinition[] | undefined) => void = noop;
  private _cvaTouchedFn: () => void = noop;

  constructor() {
    this.form.valueChanges
      .pipe(
        mergeWith(toObservable(this.showTransientParams)),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        const params: ParamDefinition[] = this.form.controls.params.controls.map((paramFormGroup): ParamDefinition => {
          return prune({
            name: paramFormGroup.controls.name.value!,
            required: paramFormGroup.controls.required.value ?? false,
            transient: this.showTransientParams() ? (paramFormGroup.controls.transient.value ?? undefined) : undefined,
            deprecated: (() => {
              if (!paramFormGroup.controls.deprecated.value) {
                return undefined;
              }
              if (!paramFormGroup.controls.deprecatedMessage.value && !paramFormGroup.controls.deprecatedUseInstead.value) {
                return true;
              }
              return {
                message: paramFormGroup.controls.deprecatedMessage.value || undefined,
                useInstead: paramFormGroup.controls.deprecatedUseInstead.value || undefined,
              };
            })(),
          });
        });

        this._cvaChangeFn(params.length ? params : undefined);
        this._cvaTouchedFn();
      });

    this.enableDeprecationFieldsIfDeprecated();
  }

  protected onAddParam(): void {
    const paramFormGroup = this.createParamFormGroup();
    this.form.controls.params.push(paramFormGroup);
  }

  protected onRemoveParam(index: number): void {
    this.form.controls.params.removeAt(index);
  }

  private createParamFormGroup(param?: Partial<ParamDefinition>): FormGroup<ParamFormGroup> {
    return this._formBuilder.group({
      name: this._formBuilder.control(param?.name, {validators: Validators.required}),
      required: this._formBuilder.control(param?.required),
      transient: this._formBuilder.control((param as ViewParamDefinition | undefined)?.transient),
      deprecated: this._formBuilder.control(param?.deprecated === true ? true : undefined),
      deprecatedMessage: this._formBuilder.control({value: typeof param?.deprecated === 'object' ? param.deprecated.message : undefined, disabled: param?.deprecated !== true}),
      deprecatedUseInstead: this._formBuilder.control({value: typeof param?.deprecated === 'object' ? param.deprecated.useInstead : undefined, disabled: param?.deprecated !== true}),
    });
  }

  private enableDeprecationFieldsIfDeprecated(): void {
    this.form.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.form.controls.params.controls.forEach(paramFormGroup => {
          if (paramFormGroup.controls.deprecated.value) {
            paramFormGroup.controls.deprecatedMessage.enable({emitEvent: false});
            paramFormGroup.controls.deprecatedUseInstead.enable({emitEvent: false});
          }
          else {
            paramFormGroup.controls.deprecatedMessage.reset(undefined, {onlySelf: true});
            paramFormGroup.controls.deprecatedUseInstead.reset(undefined, {onlySelf: true});
            paramFormGroup.controls.deprecatedMessage.disable({emitEvent: false});
            paramFormGroup.controls.deprecatedUseInstead.disable({emitEvent: false});
          }
        });
      });
  }

  private computeParamProposals(): Signal<string[]> {
    const params = toSignal(this.form.controls.params.valueChanges, {initialValue: []});

    return computed(() => new Array<string | undefined>()
      .concat(params().map(param => param.name))
      .filter((paramName: string | undefined): paramName is string => !!paramName),
    );
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public writeValue(params: ParamDefinition[] | undefined | null): void {
    this.form.controls.params.clear({emitEvent: false});
    Arrays.coerce(params)
      .map(param => this.createParamFormGroup(param))
      .forEach(paramFormGroup => this.form.controls.params.push(paramFormGroup, {emitEvent: false}));
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public registerOnChange(fn: (properties: ParamDefinition[] | undefined) => void): void {
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
    return this.form.valid ? null : {valid: false};
  }
}

interface ParamFormGroup {
  name: FormControl<string | undefined>;
  required: FormControl<boolean | undefined>;
  transient: FormControl<boolean | undefined>;
  deprecated: FormControl<boolean | undefined>;
  deprecatedMessage: FormControl<string | undefined>;
  deprecatedUseInstead: FormControl<string | undefined>;
}
