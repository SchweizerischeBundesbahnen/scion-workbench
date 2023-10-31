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
import {FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Intention, ManifestService} from '@scion/microfrontend-platform';
import {WorkbenchCapabilities, WorkbenchView} from '@scion/workbench-client';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {NgIf} from '@angular/common';
import {stringifyError} from '../common/stringify-error.util';
import {KeyValueEntry, SciKeyValueFieldComponent} from '@scion/components.internal/key-value-field';

@Component({
  selector: 'app-register-workbench-intention-page',
  templateUrl: './register-workbench-intention-page.component.html',
  styleUrls: ['./register-workbench-intention-page.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    SciFormFieldComponent,
    SciKeyValueFieldComponent,
  ],
})
export default class RegisterWorkbenchIntentionPageComponent {

  public form = this._formBuilder.group({
    type: this._formBuilder.control('', Validators.required),
    qualifier: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
  });

  public intentionId: string | undefined;
  public registerError: string | undefined;
  public WorkbenchCapabilities = WorkbenchCapabilities;

  constructor(view: WorkbenchView,
              private _manifestService: ManifestService,
              private _formBuilder: NonNullableFormBuilder) {
    view.signalReady();
  }

  public async onRegister(): Promise<void> {
    const intention: Intention = {
      type: this.form.controls.type.value,
      qualifier: SciKeyValueFieldComponent.toDictionary(this.form.controls.qualifier) ?? undefined,
    };

    this.intentionId = undefined;
    this.registerError = undefined;

    await this._manifestService.registerIntention(intention)
      .then(id => {
        this.intentionId = id;
        this.form.reset();
        this.form.setControl('qualifier', this._formBuilder.array<FormGroup<KeyValueEntry>>([]));
      })
      .catch(error => this.registerError = stringifyError(error));
  }
}
