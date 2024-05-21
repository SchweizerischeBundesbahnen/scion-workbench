/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {EnvironmentProviders, Inject, Injectable, makeEnvironmentProviders} from '@angular/core';
import {firstValueFrom} from 'rxjs';
import {APP_IDENTITY, Capability, Intention, ManifestService, MessageClient} from '@scion/microfrontend-platform';
import {MICROFRONTEND_PLATFORM_POST_STARTUP} from '@scion/workbench';

/**
 * Provides settings for the workbench testing application.
 */
@Injectable(/* DO NOT PROVIDE via 'providedIn' metadata as associated with the {@link MICROFRONTEND_PLATFORM_POST_STARTUP} DI token. */)
export class WorkbenchHostCapabilityRegistrator {

  constructor(private _manifestService: ManifestService,
              private _messageClient: MessageClient,
              @Inject(APP_IDENTITY) private _symbolicName: string) {
    this.installCapabilityRegisterRequestHandler();
    this.installCapabilityUnregisterRequestHandler();
    this.installIntentionRegisterRequestHandler();
  }

  private installCapabilityRegisterRequestHandler(): void {
    this._messageClient.onMessage<Capability>(`application/${this._symbolicName}/capability/register`, async ({body: capability}) => {
      const capabilityId = await this._manifestService.registerCapability(capability!);
      return (await firstValueFrom(this._manifestService.lookupCapabilities$({id: capabilityId})))[0];
    });
  }

  private installCapabilityUnregisterRequestHandler(): void {
    this._messageClient.onMessage<void>(`application/${this._symbolicName}/capability/:capabilityId/unregister`, async message => {
      await this._manifestService.unregisterCapabilities({id: message.params?.get('capabilityId')});
      return true;
    });
  }

  private installIntentionRegisterRequestHandler(): void {
    this._messageClient.onMessage<Intention>(`application/${this._symbolicName}/intention/register`, async ({body: intention}) => {
      return this._manifestService.registerIntention(intention!);
    });
  }
}

export function provideWorkbenchHostCapabilityRegistrator(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: MICROFRONTEND_PLATFORM_POST_STARTUP,
      useClass: WorkbenchHostCapabilityRegistrator,
      multi: true,
    },
  ]);
}
