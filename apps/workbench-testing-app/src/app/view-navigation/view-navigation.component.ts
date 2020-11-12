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
import { WbNavigationExtras, WorkbenchRouter, WorkbenchView } from '@scion/workbench';
import { Params } from '@angular/router';
import { coerceNumberProperty } from '@angular/cdk/coercion';
import { SciParamsEnterComponent } from '@scion/toolkit.internal/widgets';

const PATH = 'path';
const QUERY_PARAMS = 'queryParams';
const MATRIX_PARAMS = 'matrixParams';
const ACTIVATE_IF_PRESENT = 'activateIfPresent';
const CLOSE_IF_PRESENT = 'closeIfPresent';
const TARGET = 'target';
const INSERTION_INDEX = 'insertionIndex';

@Component({
  selector: 'app-view-navigation',
  templateUrl: './view-navigation.component.html',
  styleUrls: ['./view-navigation.component.scss'],
})
export class ViewNavigationComponent {

  public readonly PATH = PATH;
  public readonly MATRIX_PARAMS = MATRIX_PARAMS;
  public readonly QUERY_PARAMS = QUERY_PARAMS;
  public readonly ACTIVATE_IF_PRESENT = ACTIVATE_IF_PRESENT;
  public readonly CLOSE_IF_PRESENT = CLOSE_IF_PRESENT;
  public readonly TARGET = TARGET;
  public readonly INSERTION_INDEX = INSERTION_INDEX;

  public form: FormGroup;

  constructor(formBuilder: FormBuilder, private _router: WorkbenchRouter, private _view: WorkbenchView) {
    this._view.title = 'View Navigation';
    this._view.heading = 'Interact with Workbench Router';
    this._view.cssClass = 'e2e-view-navigation';
    this.form = formBuilder.group({
      [PATH]: formBuilder.control(''),
      [MATRIX_PARAMS]: formBuilder.array([]),
      [QUERY_PARAMS]: formBuilder.array([]),
      [ACTIVATE_IF_PRESENT]: formBuilder.control(true),
      [CLOSE_IF_PRESENT]: formBuilder.control(false),
      [TARGET]: formBuilder.control('blank'),
      [INSERTION_INDEX]: formBuilder.control(''),
    });
  }

  public onNavigate(): void {
    const matrixParams: Params = SciParamsEnterComponent.toParamsDictionary(this.form.get(MATRIX_PARAMS) as FormArray);
    const extras: WbNavigationExtras = {
      queryParams: SciParamsEnterComponent.toParamsDictionary(this.form.get(QUERY_PARAMS) as FormArray),
      activateIfPresent: this.form.get(ACTIVATE_IF_PRESENT).value,
      closeIfPresent: this.form.get(CLOSE_IF_PRESENT).value,
      target: this.form.get(TARGET).value,
      selfViewId: this._view.viewId,
      blankInsertionIndex: coerceInsertionIndex(this.form.get(INSERTION_INDEX).value),
    };

    const commands: any[] = String(this.form.get(PATH).value).split('/');
    if (matrixParams && Object.keys(matrixParams).length) {
      commands.push(matrixParams);
    }

    this._router.navigate(commands, extras).then();
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

