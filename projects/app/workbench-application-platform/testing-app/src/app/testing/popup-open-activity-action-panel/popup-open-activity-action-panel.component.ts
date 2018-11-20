/*
 * Copyright (c) 2018 Swiss Federal Railways
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
import { PlatformActivityActionTypes, PopupOpenActivityAction, Qualifier } from '@scion/workbench-application-platform.api';
import { SciParamsEnterComponent } from '@scion/app/common';
import { Params } from '@angular/router';

const LABEL = 'label';
const TITLE = 'title';
const CSS_CLASS = 'cssClass';
const QUALIFIER = 'qualifier';
const QUERY_PARAMS = 'queryParams';
const MATRIX_PARAMS = 'matrixParams';
const CLOSE_ON_FOCUS_LOST = 'closeOnFocusLost';
const CLOSE_ON_ESCAPE = 'closeOnEscape';
const CLOSE_ON_GRID_LAYOUT_CHANGE = 'closeGridLayoutChange';

@Component({
  selector: 'app-popup-open-activity-action-panel',
  templateUrl: './popup-open-activity-action-panel.component.html',
  styleUrls: ['./popup-open-activity-action-panel.component.scss'],
})
export class PopupOpenActivityActionPanelComponent {

  public readonly LABEL = LABEL;
  public readonly TITLE = TITLE;
  public readonly CSS_CLASS = CSS_CLASS;
  public readonly QUALIFIER = QUALIFIER;
  public readonly QUERY_PARAMS = QUERY_PARAMS;
  public readonly MATRIX_PARAMS = MATRIX_PARAMS;
  public readonly CLOSE_ON_FOCUS_LOST = CLOSE_ON_FOCUS_LOST;
  public readonly CLOSE_ON_ESCAPE = CLOSE_ON_ESCAPE;
  public readonly CLOSE_ON_GRID_LAYOUT_CHANGE = CLOSE_ON_GRID_LAYOUT_CHANGE;

  public form: FormGroup;

  constructor(private _activity: WorkbenchActivity, formBuilder: FormBuilder) {
    this.form = formBuilder.group({
      [LABEL]: formBuilder.control('', Validators.required),
      [TITLE]: formBuilder.control(''),
      [CSS_CLASS]: formBuilder.control(''),
      [QUALIFIER]: formBuilder.array([]),
      [QUERY_PARAMS]: formBuilder.array([]),
      [MATRIX_PARAMS]: formBuilder.array([]),
      [CLOSE_ON_FOCUS_LOST]: formBuilder.control(true),
      [CLOSE_ON_ESCAPE]: formBuilder.control(true),
      [CLOSE_ON_GRID_LAYOUT_CHANGE]: formBuilder.control(true),
    });
  }

  public onAddAction(): void {
    const qualifier: Qualifier = SciParamsEnterComponent.toParams(this.form.get(QUALIFIER) as FormArray);
    const queryParams: Params = SciParamsEnterComponent.toParams(this.form.get(QUERY_PARAMS) as FormArray);
    const matrixParams: Params = SciParamsEnterComponent.toParams(this.form.get(MATRIX_PARAMS) as FormArray);

    const action: PopupOpenActivityAction = {
      type: PlatformActivityActionTypes.PopupOpen,
      properties: {
        qualifier: qualifier,
        label: this.form.get(LABEL).value,
        title: this.form.get(TITLE).value,
        cssClass: this.form.get(CSS_CLASS).value,
        queryParams: queryParams,
        matrixParams: matrixParams,
        closeStrategy: {
          onFocusLost: this.form.get(CLOSE_ON_FOCUS_LOST).value,
          onEscape: this.form.get(CLOSE_ON_ESCAPE).value,
          onGridLayoutChange: this.form.get(CLOSE_ON_GRID_LAYOUT_CHANGE).value,
        },
      },
    };
    this._activity.addAction(action);
  }
}
