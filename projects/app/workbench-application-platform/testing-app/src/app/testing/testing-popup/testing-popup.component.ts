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
import { provideWorkbenchPopup, WorkbenchPopup } from '@scion/workbench-application.angular';
import { Observable } from 'rxjs';
import { ActivatedRoute, Params } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomValidators } from '../custom-validators';

const RESULT = 'result';

@Component({
  selector: 'app-testing-popup',
  templateUrl: './testing-popup.component.html',
  styleUrls: ['./testing-popup.component.scss'],
  providers: [
    provideWorkbenchPopup(TestingPopupComponent),
  ],
})
export class TestingPopupComponent {

  public readonly RESULT = RESULT;

  public form: FormGroup;
  public params$: Observable<Params>;
  public queryParams$: Observable<Params>;

  constructor(public popup: WorkbenchPopup, route: ActivatedRoute, formBuilder: FormBuilder) {
    this.params$ = route.params;
    this.queryParams$ = route.queryParams;
    this.form = formBuilder.group({
      [RESULT]: formBuilder.control(undefined, CustomValidators.json),
    });
  }

  public onOk(): void {
    const result = JSON.parse(this.form.get(RESULT).value || null);
    this.popup.close(result);
  }
}
