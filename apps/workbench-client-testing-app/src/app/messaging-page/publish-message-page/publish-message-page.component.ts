/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject} from '@angular/core';
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {MessageClient} from '@scion/microfrontend-platform';
import {stringifyError} from '../../common/stringify-error.util';

@Component({
  selector: 'app-publish-message-page',
  templateUrl: './publish-message-page.component.html',
  styleUrls: ['./publish-message-page.component.scss'],
  imports: [
    ReactiveFormsModule,
    SciFormFieldComponent,
  ],
})
export class PublishMessagePageComponent {

  private readonly _formBuilder = inject(NonNullableFormBuilder);
  private readonly _messageClient = inject(MessageClient);

  protected readonly form = this._formBuilder.group({
    topic: this._formBuilder.control('', Validators.required),
  });

  protected publishError: string | false | undefined;

  protected onPublish(): void {
    this.publishError = undefined;
    this._messageClient
      .publish(this.form.controls.topic.value)
      .then(() => {
        this.publishError = false;
        this.form.reset();
      })
      .catch((error: unknown) => this.publishError = stringifyError(error));
  }
}
