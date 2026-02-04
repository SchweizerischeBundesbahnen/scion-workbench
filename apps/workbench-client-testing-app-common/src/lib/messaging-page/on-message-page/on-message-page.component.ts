/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, DestroyRef, inject} from '@angular/core';
import {FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {MessageClient} from '@scion/microfrontend-platform';
import {KeyValueEntry} from '@scion/components.internal/key-value-field';
import {Subject, Subscription} from 'rxjs';
import {parseTypedString} from 'workbench-testing-app-common';

@Component({
  selector: 'app-on-message-page',
  templateUrl: './on-message-page.component.html',
  styleUrls: ['./on-message-page.component.scss'],
  imports: [
    ReactiveFormsModule,
    SciFormFieldComponent,
  ],
})
export class OnMessagePageComponent {

  private readonly _formBuilder = inject(NonNullableFormBuilder);
  private readonly _messageClient = inject(MessageClient);
  private readonly _value$ = new Subject<string | number | boolean | undefined>();

  protected readonly form = this._formBuilder.group({
    topic: this._formBuilder.control('', Validators.required),
    value: this._formBuilder.control(''),
    params: this._formBuilder.array<FormGroup<KeyValueEntry>>([]),
  });
  protected subscription: Subscription | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.onCancel());
  }

  protected onInstallOnMessage(): void {
    this.subscription = this._messageClient.onMessage(this.form.controls.topic.value, () => this._value$);
  }

  protected onSaveValue(): void {
    this._value$.next(parseTypedString(this.form.controls.value.value) ?? undefined);
  }

  protected onCancel(): void {
    this.subscription?.unsubscribe();
    this.subscription = undefined;
  }
}
