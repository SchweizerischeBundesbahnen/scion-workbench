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

const PART_ID = 'partId';
const VIEW_ID = 'viewId';
const OPTIONS = 'options';
const POSITION = 'position';
const ACTIVATE_VIEW = 'activateView';
const ACTIVATE_PART = 'activatePart';

@Component({
  selector: 'app-add-view-page',
  templateUrl: './add-view-page.component.html',
  styleUrls: ['./add-view-page.component.scss'],
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
export default class AddViewPageComponent {

  public readonly VIEW_ID = VIEW_ID;
  public readonly OPTIONS = OPTIONS;
  public readonly PART_ID = PART_ID;
  public readonly POSITION = POSITION;
  public readonly ACTIVATE_VIEW = ACTIVATE_VIEW;
  public readonly ACTIVATE_PART = ACTIVATE_PART;

  public form: FormGroup;
  public navigateError: string | false | undefined;

  constructor(formBuilder: FormBuilder,
              private _wbRouter: WorkbenchRouter,
              public workbenchService: WorkbenchService) {
    this.form = formBuilder.group({
      [VIEW_ID]: formBuilder.control(undefined, {validators: Validators.required, nonNullable: true}),
      [OPTIONS]: formBuilder.group({
        [PART_ID]: formBuilder.control(undefined, {validators: Validators.required, nonNullable: true}),
        [POSITION]: formBuilder.control(undefined, {nonNullable: true}),
        [ACTIVATE_VIEW]: formBuilder.control(undefined, {nonNullable: true}),
        [ACTIVATE_PART]: formBuilder.control(undefined, {nonNullable: true}),
      }),
    });
  }

  public onNavigate(): void {
    this.navigateError = undefined;

    this._wbRouter
      .ɵnavigate(layout => layout.addView(this.form.get(VIEW_ID).value, {
        partId: this.form.get([OPTIONS, PART_ID]).value,
        position: this.form.get([OPTIONS, POSITION]).value ?? undefined,
        activateView: this.form.get([OPTIONS, ACTIVATE_VIEW]).value,
        activatePart: this.form.get([OPTIONS, ACTIVATE_PART]).value,
      }))
      .then(() => {
        this.navigateError = false;
        this.form.reset();
      })
      .catch(error => this.navigateError = error);
  }
}
