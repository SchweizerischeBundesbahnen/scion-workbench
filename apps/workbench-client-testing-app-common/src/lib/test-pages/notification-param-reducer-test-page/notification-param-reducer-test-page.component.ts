/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, effect, inject, input, numberAttribute, untracked} from '@angular/core';
import {MessageClient} from '@scion/microfrontend-platform';
import {firstValueFrom, timer} from 'rxjs';

/**
 * Component that installs a notification param reducer on specified topic,
 * concatenating the params of the previous and current notification.
 */
@Component({
  selector: 'app-notification-param-reducer-test-page',
  template: 'Installed notification param reducer on topic {{topic()}}.',
})
export class NotificationParamReducerTestPageComponent {

  public readonly topic = input.required<string>();
  public readonly delay = input(0, {transform: delay => numberAttribute(delay, 0)});

  constructor() {
    const messageClient = inject(MessageClient);

    effect(onCleanup => {
      const topic = this.topic();
      const delay = this.delay();

      untracked(() => {
        const subscription = messageClient.onMessage<{prevParams: Record<string, unknown>; currParams: Record<string, unknown>}>(topic, async request => {
          const currParams = request.body?.currParams ?? {};
          const prevParams = request.body?.prevParams ?? {};

          // Simulate slow reducer.
          if (delay) {
            await firstValueFrom(timer(delay));
          }

          return Object.entries(currParams).reduce((acc, [key, value]) => ({
            ...acc,
            [key]: `${prevParams[key] as string}, ${value as string}`,
          }), {});
        });
        onCleanup(() => subscription.unsubscribe());
      });
    });
  }
}
