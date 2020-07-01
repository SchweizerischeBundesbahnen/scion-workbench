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
import { WorkbenchActivity } from '@scion/workbench-application.angular';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PlatformActivityActionTypes, Qualifier, ViewOpenActivityAction } from '@scion/workbench-application-platform.api';
import { SciParamsEnterComponent } from 'app-common';
import { Params } from '@angular/router';

const LABEL = 'label';
const TITLE = 'title';
const CSS_CLASS = 'cssClass';
const QUALIFIER = 'qualifier';
const QUERY_PARAMS = 'queryParams';
const MATRIX_PARAMS = 'matrixParams';
const ACTIVATE_IF_PRESENT = 'activateIfPresent';
const CLOSE_IF_PRESENT = 'closeIfPresent';

@Component({
  selector: 'app-view-open-activity-action-panel',
  templateUrl: './view-open-activity-action-panel.component.html',
  styleUrls: ['./view-open-activity-action-panel.component.scss'],
})
export class ViewOpenActivityActionPanelComponent {

  public readonly LABEL = LABEL;
  public readonly TITLE = TITLE;
  public readonly CSS_CLASS = CSS_CLASS;
  public readonly QUALIFIER = QUALIFIER;
  public readonly QUERY_PARAMS = QUERY_PARAMS;
  public readonly MATRIX_PARAMS = MATRIX_PARAMS;
  public readonly ACTIVATE_IF_PRESENT = ACTIVATE_IF_PRESENT;
  public readonly CLOSE_IF_PRESENT = CLOSE_IF_PRESENT;

  public form: FormGroup;

  constructor(private _activity: WorkbenchActivity, formBuilder: FormBuilder) {
    this.form = formBuilder.group({
      [LABEL]: formBuilder.control('', Validators.required),
      [TITLE]: formBuilder.control(''),
      [CSS_CLASS]: formBuilder.control(''),
      [QUALIFIER]: formBuilder.array([]),
      [QUERY_PARAMS]: formBuilder.array([]),
      [MATRIX_PARAMS]: formBuilder.array([]),
      [ACTIVATE_IF_PRESENT]: formBuilder.control(true),
      [CLOSE_IF_PRESENT]: formBuilder.control(false),
    });
  }

  public onAddAction(): void {
    const qualifier: Qualifier = SciParamsEnterComponent.toParams(this.form.get(QUALIFIER) as FormArray);
    const queryParams: Params = SciParamsEnterComponent.toParams(this.form.get(QUERY_PARAMS) as FormArray);
    const matrixParams: Params = SciParamsEnterComponent.toParams(this.form.get(MATRIX_PARAMS) as FormArray);

    const action: ViewOpenActivityAction = {
      type: PlatformActivityActionTypes.ViewOpen,
      properties: {
        qualifier: qualifier,
        label: this.form.get(LABEL).value,
        title: this.form.get(TITLE).value,
        cssClass: this.form.get(CSS_CLASS).value,
        queryParams: queryParams,
        matrixParams: matrixParams,
        activateIfPresent: this.form.get(ACTIVATE_IF_PRESENT).value,
        closeIfPresent: this.form.get(CLOSE_IF_PRESENT).value,
      },
    };
    this._activity.addAction(action);
  }
}
