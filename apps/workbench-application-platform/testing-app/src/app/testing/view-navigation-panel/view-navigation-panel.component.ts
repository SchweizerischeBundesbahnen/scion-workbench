/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { SciParamsEnterComponent } from 'app-common';
import { WbNavigationExtras, WorkbenchRouter } from '@scion/workbench-application.angular';
import { Qualifier } from '@scion/workbench-application-platform.api';
import { coerceNumberProperty } from '@angular/cdk/coercion';

const QUALIFIER = 'qualifier';
const QUERY_PARAMS = 'queryParams';
const MATRIX_PARAMS = 'matrixParams';
const ACTIVATE_IF_PRESENT = 'activateIfPresent';
const CLOSE_IF_PRESENT = 'closeIfPresent';
const TARGET = 'target';
const INSERTION_INDEX = 'insertionIndex';

@Component({
  selector: 'app-view-navigation-panel',
  templateUrl: './view-navigation-panel.component.html',
  styleUrls: ['./view-navigation-panel.component.scss'],
})
export class ViewNavigationPanelComponent {

  public readonly QUALIFIER = QUALIFIER;
  public readonly QUERY_PARAMS = QUERY_PARAMS;
  public readonly MATRIX_PARAMS = MATRIX_PARAMS;
  public readonly ACTIVATE_IF_PRESENT = ACTIVATE_IF_PRESENT;
  public readonly CLOSE_IF_PRESENT = CLOSE_IF_PRESENT;
  public readonly TARGET = TARGET;
  public readonly INSERTION_INDEX = INSERTION_INDEX;

  public form: FormGroup;

  constructor(formBuilder: FormBuilder, private _router: WorkbenchRouter) {
    this.form = formBuilder.group({
      [QUALIFIER]: formBuilder.array([]),
      [QUERY_PARAMS]: formBuilder.array([]),
      [MATRIX_PARAMS]: formBuilder.array([]),
      [ACTIVATE_IF_PRESENT]: formBuilder.control(true),
      [CLOSE_IF_PRESENT]: formBuilder.control(false),
      [TARGET]: formBuilder.control('blank'),
      [INSERTION_INDEX]: formBuilder.control(''),
    });
  }

  public onExecute(): void {
    const qualifier: Qualifier = SciParamsEnterComponent.toParams(this.form.get(QUALIFIER) as FormArray);
    const extras: WbNavigationExtras = {
      queryParams: SciParamsEnterComponent.toParams(this.form.get(QUERY_PARAMS) as FormArray),
      matrixParams: SciParamsEnterComponent.toParams(this.form.get(MATRIX_PARAMS) as FormArray),
      activateIfPresent: this.form.get(ACTIVATE_IF_PRESENT).value,
      closeIfPresent: this.form.get(CLOSE_IF_PRESENT).value,
      target: this.form.get(TARGET).value,
      blankInsertionIndex: coerceInsertionIndex(this.form.get(INSERTION_INDEX).value),
    };

    this._router.navigate(qualifier, extras);
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
