/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, effect, inject, signal, untracked} from '@angular/core';
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {SciFormFieldComponent} from '@scion/components.internal/form-field';
import {MessageClient} from '@scion/microfrontend-platform';
import {Subscription} from 'rxjs';
import {WorkbenchView} from '@scion/workbench-client';

@Component({
  selector: 'app-notification-reducer-page',
  imports: [
    ReactiveFormsModule,
    SciFormFieldComponent,
  ],
  templateUrl: './on-notification-reducer-page.component.html',
  styleUrl: './on-notification-reducer-page.component.scss',
})
export class OnNotificationReducerPageComponent {

  private readonly _formBuilder = inject(NonNullableFormBuilder);
  private readonly _messageClient = inject(MessageClient);

  private readonly _subscription = signal<Subscription | undefined>(undefined);

  protected readonly message = signal<string | undefined>(undefined);
  protected readonly form = this._formBuilder.group({
    topic: this._formBuilder.control('', Validators.required),
    paramName: this._formBuilder.control('', Validators.required),
  });

  constructor() {
    inject(WorkbenchView).signalReady();

    effect(onCleanup => {
      const subscription = this._subscription();

      untracked(() => {
        this.message.set(subscription ? 'Listener added' : undefined);
        onCleanup(() => subscription?.unsubscribe());
      });
    });
  }

  protected onInstallListener(): void {
    const paramName = this.form.controls.paramName.value;
    const subscription = this._messageClient.onMessage<{prevParams: Map<string, unknown>; currParams: Map<string, unknown>}>(this.form.controls.topic.value, request => {
      const currText = request.body?.currParams.get(paramName) ?? '';
      const prevText = request.body?.prevParams.get(paramName) ?? '';
      return new Map<string, unknown>().set(paramName, `${prevText}, ${currText}`);
    });
    this._subscription.set(subscription);
  }
}
