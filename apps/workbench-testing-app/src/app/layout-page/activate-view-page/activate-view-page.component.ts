/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {WorkbenchRouter, WorkbenchService} from '@scion/workbench';
import {SciFormFieldModule} from '@scion/components.internal/form-field';
import {SciCheckboxModule} from '@scion/components.internal/checkbox';
import {AsyncPipe, NgFor, NgIf} from '@angular/common';

const VIEW_ID = 'viewId';
const OPTIONS = 'options';
const ACTIVATE_PART = 'activatePart';

@Component({
  selector: 'app-activate-view-page',
  templateUrl: './activate-view-page.component.html',
  styleUrls: ['./activate-view-page.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    AsyncPipe,
    ReactiveFormsModule,
    SciFormFieldModule,
    SciCheckboxModule,
  ],
})
export default class ActivateViewPageComponent {

  public readonly VIEW_ID = VIEW_ID;
  public readonly OPTIONS = OPTIONS;
  public readonly ACTIVATE_PART = ACTIVATE_PART;

  public form: FormGroup;
  public navigateError: string | false | undefined;

  constructor(formBuilder: FormBuilder,
              private _wbRouter: WorkbenchRouter,
              public workbenchService: WorkbenchService) {
    this.form = formBuilder.group({
      [VIEW_ID]: formBuilder.control(undefined, {validators: Validators.required, nonNullable: true}),
      [OPTIONS]: formBuilder.group({
        [ACTIVATE_PART]: formBuilder.control(undefined, {nonNullable: true}),
      }),
    });
  }

  public onNavigate(): void {
    this.navigateError = undefined;

    this._wbRouter
      .ɵnavigate(layout => layout.activateView(this.form.get(VIEW_ID).value, {
        activatePart: this.form.get([OPTIONS, ACTIVATE_PART]).value,
      }))
      .then(() => {
        this.navigateError = false;
        this.form.reset();
      })
      .catch(error => this.navigateError = error);
  }
}
