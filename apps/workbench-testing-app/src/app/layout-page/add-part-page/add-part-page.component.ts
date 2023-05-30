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
const RELATIVE_TO = 'relativeTo';
const ALIGN = 'align';
const RATIO = 'ratio';
const ACTIVATE = 'activate';

@Component({
  selector: 'app-add-part-page',
  templateUrl: './add-part-page.component.html',
  styleUrls: ['./add-part-page.component.scss'],
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
export default class AddPartPageComponent {

  public readonly PART_ID = PART_ID;
  public readonly RELATIVE_TO = RELATIVE_TO;
  public readonly ALIGN = ALIGN;
  public readonly RATIO = RATIO;
  public readonly ACTIVATE = ACTIVATE;

  public form: FormGroup;
  public navigateError: string | false | undefined;

  constructor(formBuilder: FormBuilder,
              private _wbRouter: WorkbenchRouter,
              public workbenchService: WorkbenchService) {
    this.form = formBuilder.group({
      [PART_ID]: formBuilder.control(undefined, {validators: Validators.required, nonNullable: true}),
      [RELATIVE_TO]: formBuilder.group({
        [PART_ID]: formBuilder.control(undefined, {nonNullable: true}),
        [ALIGN]: formBuilder.control(undefined, {validators: Validators.required, nonNullable: true}),
        [RATIO]: formBuilder.control(undefined, {nonNullable: true}),
      }),
      [ACTIVATE]: formBuilder.control(undefined, {nonNullable: true}),
    });
  }

  public onNavigate(): void {
    this.navigateError = undefined;

    this._wbRouter
      .ɵnavigate(layout => layout.addPart(this.form.get([PART_ID]).value, {
          relativeTo: this.form.get([RELATIVE_TO, PART_ID]).value || undefined,
          align: this.form.get([RELATIVE_TO, ALIGN]).value,
          ratio: this.form.get([RELATIVE_TO, RATIO]).value ?? undefined,
        },
        {activate: this.form.get([ACTIVATE]).value},
      ))
      .then(() => {
        this.navigateError = false;
        this.form.reset();
      })
      .catch(error => this.navigateError = error);
  }
}
