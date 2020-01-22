/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { NgModule } from '@angular/core';
import { ACTIVATION_CONTEXT, ActivationContext, Beans, ClientConfig, ContextService, MessageClient, PlatformState, PlatformStates } from '@scion/microfrontend-platform';
import { take } from 'rxjs/operators';
import { TestingAppTopics } from './testing-app.topics';

/**
 * Module which operates as activator.
 *
 * When loaded it publishes an activation event to the topic {@link TestingAppTopics.ApplicationActivated}.
 */
@NgModule({})
export class ActivatorModule {

  constructor() {
    Beans.get(PlatformState).whenState(PlatformStates.Started).then(() => this.publishApplicationActivatedEvent());
  }

  private publishApplicationActivatedEvent(): void {
    Beans.get(ContextService).observe$<ActivationContext>(ACTIVATION_CONTEXT)
      .pipe(take(1))
      .subscribe((activationContext: ActivationContext) => {
        if (!activationContext) {
          throw Error('[NullActivationContextError] Not running in an activation context.');
        }

        const event = `${Beans.get(ClientConfig).symbolicName} [primary: ${activationContext.primary}, X-APP-NAME: ${activationContext.activator.properties['X-APP-NAME']}]`;
        Beans.get(MessageClient).publish$(TestingAppTopics.ApplicationActivated, event).subscribe();
      });
  }
}
