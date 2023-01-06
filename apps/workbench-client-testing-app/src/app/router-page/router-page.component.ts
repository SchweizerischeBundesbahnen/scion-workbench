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
const ACTIVATE = 'activate';
const CLOSE = 'close';
const TARGET = 'target';
const INSERTION_INDEX = 'insertionIndex';
const CSS_CLASS = 'cssClass';

@Component({
  selector: 'app-router-page',
  templateUrl: './router-page.component.html',
  styleUrls: ['./router-page.component.scss'],
})
export class RouterPageComponent {

  public readonly QUALIFIER = QUALIFIER;
  public readonly PARAMS = PARAMS;
  public readonly TARGET = TARGET;
  public readonly INSERTION_INDEX = INSERTION_INDEX;
  public readonly ACTIVATE = ACTIVATE;
  public readonly CLOSE = CLOSE;
  public readonly CSS_CLASS = CSS_CLASS;

  public form: UntypedFormGroup;
  public navigateError: string;

  constructor(formBuilder: UntypedFormBuilder,
              private _router: WorkbenchRouter) {
    this.form = formBuilder.group({
      [QUALIFIER]: formBuilder.array([], Validators.required),
      [PARAMS]: formBuilder.array([]),
      [TARGET]: formBuilder.control(''),
      [INSERTION_INDEX]: formBuilder.control(''),
      [ACTIVATE]: formBuilder.control(undefined),
      [CLOSE]: formBuilder.control(undefined),
      [CSS_CLASS]: formBuilder.control(undefined),
    });
  }

  public async onNavigate(): Promise<void> {
    this.navigateError = undefined;

    const qualifier = SciParamsEnterComponent.toParamsDictionary(this.form.get(QUALIFIER) as UntypedFormArray);
    const params = SciParamsEnterComponent.toParamsDictionary(this.form.get(PARAMS) as UntypedFormArray);

    // Convert entered params to their actual values.
    params && Object.entries(params).forEach(([paramName, paramValue]) => params[paramName] = convertValueFromUI(paramValue));

    const extras: WorkbenchNavigationExtras = {
      activate: this.form.get(ACTIVATE).value,
      close: this.form.get(CLOSE).value,
      target: this.form.get(TARGET).value || undefined,
      blankInsertionIndex: coerceInsertionIndex(this.form.get(INSERTION_INDEX).value),
      params: params || undefined,
      cssClass: this.form.get(CSS_CLASS).value?.split(/\s+/).filter(Boolean),
    };
    await this._router.navigate(qualifier, extras).catch(error => this.navigateError = error);
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
