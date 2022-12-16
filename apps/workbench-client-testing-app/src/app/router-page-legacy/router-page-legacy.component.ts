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
import {ɵWorkbenchLegacyNavigationExtras, ɵWorkbenchLegacyRouter} from '@scion/workbench-client';
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
const CSS_CLASS = 'cssClass';

/**
 * @deprecated since version 14; API will be removed in version 16; used internally to test not to break old workbench clients
 */
@Component({
  selector: 'app-router-page-legacy',
  templateUrl: './router-page-legacy.component.html',
  styleUrls: ['./router-page-legacy.component.scss'],
})
export class RouterPageLegacyComponent {

  public readonly QUALIFIER = QUALIFIER;
  public readonly PARAMS = PARAMS;
  public readonly TARGET = TARGET;
  public readonly SELF_VIEW_ID = SELF_VIEW_ID;
  public readonly INSERTION_INDEX = INSERTION_INDEX;
  public readonly ACTIVATE_IF_PRESENT = ACTIVATE_IF_PRESENT;
  public readonly CLOSE_IF_PRESENT = CLOSE_IF_PRESENT;
  public readonly CSS_CLASS = CSS_CLASS;

  public form: UntypedFormGroup;
  public navigateError: string;

  private _router: ɵWorkbenchLegacyRouter;

  constructor(formBuilder: UntypedFormBuilder) {
    this._router = new ɵWorkbenchLegacyRouter();
    this.form = formBuilder.group({
      [QUALIFIER]: formBuilder.array([], Validators.required),
      [PARAMS]: formBuilder.array([]),
      [TARGET]: formBuilder.control(''),
      [SELF_VIEW_ID]: formBuilder.control(''),
      [INSERTION_INDEX]: formBuilder.control(''),
      [ACTIVATE_IF_PRESENT]: formBuilder.control(undefined),
      [CLOSE_IF_PRESENT]: formBuilder.control(undefined),
      [CSS_CLASS]: formBuilder.control(undefined),
    });
  }

  public async onNavigate(): Promise<void> {
    this.navigateError = undefined;

    const qualifier = SciParamsEnterComponent.toParamsDictionary(this.form.get(QUALIFIER) as UntypedFormArray);
    const params = SciParamsEnterComponent.toParamsDictionary(this.form.get(PARAMS) as UntypedFormArray);

    // Convert entered params to their actual values.
    params && Object.entries(params).forEach(([paramName, paramValue]) => params[paramName] = convertValueFromUI(paramValue));

    const extras: ɵWorkbenchLegacyNavigationExtras = {
      activateIfPresent: this.form.get(ACTIVATE_IF_PRESENT).value,
      closeIfPresent: this.form.get(CLOSE_IF_PRESENT).value,
      target: this.form.get(TARGET).value || undefined,
      selfViewId: this.form.get(SELF_VIEW_ID).value || undefined,
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