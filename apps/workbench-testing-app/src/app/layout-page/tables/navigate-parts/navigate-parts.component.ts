/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, forwardRef, inject, input} from '@angular/core';
import {noop} from 'rxjs';
import {AbstractControl, ControlValueAccessor, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validator, Validators} from '@angular/forms';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {SciMaterialIconDirective} from '@scion/components.internal/material-icon';
import {Commands, NavigationData, NavigationState} from '@scion/workbench';
import {RouterCommandsComponent} from '../../../router-commands/router-commands.component';
import {MultiValueInputComponent, prune, RecordComponent} from 'workbench-testing-app-common';
import {UUID} from '@scion/toolkit/uuid';

@Component({
  selector: 'app-navigate-parts',
  templateUrl: './navigate-parts.component.html',
  styleUrls: ['./navigate-parts.component.scss'],
  imports: [
    ReactiveFormsModule,
    SciMaterialIconDirective,
    RouterCommandsComponent,
    RecordComponent,
    MultiValueInputComponent,
  ],
  providers: [
    {provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => NavigatePartsComponent)},
    {provide: NG_VALIDATORS, multi: true, useExisting: forwardRef(() => NavigatePartsComponent)},
  ],
})
export class NavigatePartsComponent implements ControlValueAccessor, Validator {

  public readonly partProposals = input([], {transform: arrayAttribute});

  private readonly _formBuilder = inject(NonNullableFormBuilder);

  protected readonly partList = `part-list-${UUID.randomUUID()}`;

  protected readonly form = this._formBuilder.group({
    navigations: this._formBuilder.array<FormGroup<{
      id: FormControl<string>;
      commands: FormControl<Commands>;
      extras: FormGroup<{
        hint: FormControl<string | undefined>;
        data: FormControl<NavigationData | undefined>;
        state: FormControl<NavigationState | undefined>;
        cssClass: FormControl<string | string[] | undefined>;
      }>;
    }>>([]),
  });

  private _cvaChangeFn: (value: NavigationDescriptor[]) => void = noop;
  private _cvaTouchedFn: () => void = noop;

  constructor() {
    this.form.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this._cvaChangeFn(this.form.controls.navigations.controls.map(navigationFormGroup => prune({
          id: navigationFormGroup.controls.id.value,
          commands: navigationFormGroup.controls.commands.value,
          extras: ({
            hint: navigationFormGroup.controls.extras.controls.hint.value || undefined,
            data: navigationFormGroup.controls.extras.controls.data.value ?? undefined,
            state: navigationFormGroup.controls.extras.controls.state.value ?? undefined,
            cssClass: navigationFormGroup.controls.extras.controls.cssClass.value,
          }),
        }, {pruneIfEmpty: true})!));
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
          data: this._formBuilder.control<NavigationData | undefined>(navigation.extras?.data),
          state: this._formBuilder.control<NavigationState | undefined>(navigation.extras?.state),
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
  public registerOnChange(fn: (value: NavigationDescriptor[]) => void): void {
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
    return this.form.controls.navigations.valid ? null : {valid: false};
  }
}

export interface NavigationDescriptor {
  id: string;
  commands: Commands;
  extras?: {
    hint?: string;
    data?: NavigationData;
    state?: NavigationState;
    cssClass?: string | string[];
  };
}

function arrayAttribute(proposals: string[] | null | undefined): string[] {
  return proposals ?? [];
}
