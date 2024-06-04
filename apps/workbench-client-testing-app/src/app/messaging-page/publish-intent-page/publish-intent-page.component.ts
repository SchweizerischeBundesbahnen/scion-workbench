/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component} from '@angular/core';
import {FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {Intent, IntentClient} from '@scion/microfrontend-platform';
import {stringifyError} from '../../common/stringify-error.util';
import {KeyValueEntry, SciKeyValueFieldComponent} from '@scion/components.internal/key-value-field';

@Component({
  selector: 'app-publish-intent-page',
  templateUrl: './publish-intent-page.component.html',
  styleUrls: ['./publish-intent-page.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    SciFormFieldComponent,
    SciKeyValueFieldComponent,
  ],
})
export class PublishIntentPageComponent {

  public publishError: string | false | undefined;

  public form = this._formBuilder.group({
    type: this._formBuilder.control('', Validators.required),
    qualifier: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
    params: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
  });

  constructor(private _formBuilder: NonNullableFormBuilder, private _intentClient: IntentClient) {
  }

  public onPublish(): void {
    this.publishError = undefined;
    const intent: Intent = {
      type: this.form.controls.type.value,
      qualifier: SciKeyValueFieldComponent.toDictionary(this.form.controls.qualifier) ?? undefined,
      params: SciKeyValueFieldComponent.toMap(this.form.controls.params) ?? undefined,
    };
    this._intentClient
      .publish(intent)
      .then(() => {
        this.publishError = false;
        this.form.reset();
      })
      .catch(error => this.publishError = stringifyError(error));
  }
}
