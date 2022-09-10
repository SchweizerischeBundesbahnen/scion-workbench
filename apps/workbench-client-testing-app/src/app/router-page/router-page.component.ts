/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component} from '@angular/core';
import {UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {WorkbenchNavigationExtras, WorkbenchRouter} from '@scion/workbench-client';
import {SciParamsEnterComponent} from '@scion/components.internal/params-enter';
import {coerceNumberProperty} from '@angular/cdk/coercion';
import {convertValueFromUI} from '../util/util';

const QUALIFIER = 'qualifier';
const PARAMS = 'params';
const ACTIVATE_IF_PRESENT = 'activateIfPresent';
const CLOSE_IF_PRESENT = 'closeIfPresent';
const TARGET = 'target';
const SELF_VIEW_ID = 'selfViewId';
const INSERTION_INDEX = 'insertionIndex';

@Component({
  selector: 'app-router-page',
  templateUrl: './router-page.component.html',
  styleUrls: ['./router-page.component.scss'],
})
export class RouterPageComponent {

  public readonly QUALIFIER = QUALIFIER;
  public readonly PARAMS = PARAMS;
  public readonly TARGET = TARGET;
  public readonly SELF_VIEW_ID = SELF_VIEW_ID;
  public readonly INSERTION_INDEX = INSERTION_INDEX;
  public readonly ACTIVATE_IF_PRESENT = ACTIVATE_IF_PRESENT;
  public readonly CLOSE_IF_PRESENT = CLOSE_IF_PRESENT;

  public form: UntypedFormGroup;
  public navigateError: string;
  public navigated = false;

  constructor(formBuilder: UntypedFormBuilder,
              private _router: WorkbenchRouter) {
    this.form = formBuilder.group({
      [QUALIFIER]: formBuilder.array([], Validators.required),
      [PARAMS]: formBuilder.array([]),
      [TARGET]: formBuilder.control(''),
      [SELF_VIEW_ID]: formBuilder.control(''),
      [INSERTION_INDEX]: formBuilder.control(''),
      [ACTIVATE_IF_PRESENT]: formBuilder.control(undefined),
      [CLOSE_IF_PRESENT]: formBuilder.control(undefined),
    });
  }

  public async onNavigate(): Promise<void> {
    this.navigateError = undefined;
    this.navigated = false;

    const qualifier = SciParamsEnterComponent.toParamsDictionary(this.form.get(QUALIFIER) as UntypedFormArray);
    const params = SciParamsEnterComponent.toParamsDictionary(this.form.get(PARAMS) as UntypedFormArray);

    // Convert entered params to their actual values.
    params && Object.entries(params).forEach(([paramName, paramValue]) => params[paramName] = convertValueFromUI(paramValue));

    const extras: WorkbenchNavigationExtras = {
      activateIfPresent: this.form.get(ACTIVATE_IF_PRESENT).value,
      closeIfPresent: this.form.get(CLOSE_IF_PRESENT).value,
      target: this.form.get(TARGET).value || undefined,
      selfViewId: this.form.get(SELF_VIEW_ID).value || undefined,
      blankInsertionIndex: coerceInsertionIndex(this.form.get(INSERTION_INDEX).value),
      params: params || undefined,
    };
    await this._router.navigate(qualifier, extras)
      .then(success => this.navigated = success)
      .catch(error => this.navigateError = error);
  }
}

function coerceInsertionIndex(value: any): number | 'start' | 'end' | undefined {
  if (value === '') {
    return undefined;
  }
  if (value === 'start' || value === 'end' || value === undefined) {
    return value;
  }
  return coerceNumberProperty(value);
}
