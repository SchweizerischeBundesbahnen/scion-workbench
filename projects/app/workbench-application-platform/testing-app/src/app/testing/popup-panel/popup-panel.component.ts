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
import { SciParamsEnterComponent } from '@scion/app/common';
import { Qualifier } from '@scion/workbench-application-platform.api';
import { Popup, PopupService } from '@scion/workbench-application.core';

const QUALIFIER = 'qualifier';
const QUERY_PARAMS = 'queryParams';
const MATRIX_PARAMS = 'matrixParams';
const POSITION = 'position';
const CLOSE_ON_FOCUS_LOST = 'closeOnFocusLost';
const CLOSE_ON_ESCAPE = 'closeOnEscape';
const CLOSE_ON_GRID_LAYOUT_CHANGE = 'closeGridLayoutChange';

@Component({
  selector: 'app-popup-panel',
  templateUrl: './popup-panel.component.html',
  styleUrls: ['./popup-panel.component.scss'],
})
export class PopupPanelComponent {

  public readonly QUALIFIER = QUALIFIER;
  public readonly QUERY_PARAMS = QUERY_PARAMS;
  public readonly MATRIX_PARAMS = MATRIX_PARAMS;
  public readonly POSITION = POSITION;
  public readonly CLOSE_ON_FOCUS_LOST = CLOSE_ON_FOCUS_LOST;
  public readonly CLOSE_ON_ESCAPE = CLOSE_ON_ESCAPE;
  public readonly CLOSE_ON_GRID_LAYOUT_CHANGE = CLOSE_ON_GRID_LAYOUT_CHANGE;

  public form: FormGroup;
  public result: string;

  constructor(formBuilder: FormBuilder, private _popupService: PopupService) {
    this.form = formBuilder.group({
      [QUALIFIER]: formBuilder.array([]),
      [QUERY_PARAMS]: formBuilder.array([]),
      [MATRIX_PARAMS]: formBuilder.array([]),
      [POSITION]: formBuilder.control('east'),
      [CLOSE_ON_FOCUS_LOST]: formBuilder.control(true),
      [CLOSE_ON_ESCAPE]: formBuilder.control(true),
      [CLOSE_ON_GRID_LAYOUT_CHANGE]: formBuilder.control(true),
    });
  }

  public onOpen(element: Element): void {
    this.result = null;
    const qualifier: Qualifier = SciParamsEnterComponent.toParams(this.form.get(QUALIFIER) as FormArray);

    const popup: Popup = {
      queryParams: SciParamsEnterComponent.toParams(this.form.get(QUERY_PARAMS) as FormArray),
      matrixParams: SciParamsEnterComponent.toParams(this.form.get(MATRIX_PARAMS) as FormArray),
      position: this.form.get(POSITION).value,
      anchor: element,
      closeStrategy: {
        onFocusLost: this.form.get(CLOSE_ON_FOCUS_LOST).value,
        onEscape: this.form.get(CLOSE_ON_ESCAPE).value,
        onGridLayoutChange: this.form.get(CLOSE_ON_GRID_LAYOUT_CHANGE).value,
      },
    };

    this._popupService.open<string>(popup, qualifier).then(result => {
      this.result = result;
    });
  }
}
