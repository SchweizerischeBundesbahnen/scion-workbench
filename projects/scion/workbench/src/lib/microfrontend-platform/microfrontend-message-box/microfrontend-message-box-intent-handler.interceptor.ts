/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {inject, Injectable, runInInjectionContext, StaticProvider} from '@angular/core';
import {Handler, IntentInterceptor, IntentMessage, MessageClient, MessageHeaders, ResponseStatusCodes} from '@scion/microfrontend-platform';
import {WorkbenchCapabilities, WorkbenchMessageBoxCapability, ɵWorkbenchMessageBoxCommand} from '@scion/workbench-client';
import {Logger, LoggerNames} from '../../logging';
import {Beans} from '@scion/toolkit/bean-manager';
import {stringifyError} from '../../common/stringify-error.util';
import {WorkbenchMessageBoxService} from '../../message-box/workbench-message-box.service';
import {Arrays} from '@scion/toolkit/util';
import {MicrofrontendMessageBoxComponent} from './microfrontend-message-box.component';
import {createRemoteTranslatable} from '../microfrontend-text/remote-text-provider';
import {MicrofrontendHostComponent} from '../microfrontend-host/microfrontend-host.component';
import {ɵWorkbenchDialog} from '../../dialog/ɵworkbench-dialog.model';
import {MicrofrontendHostMessageBox} from '../microfrontend-host-message-box/microfrontend-host-message-box.model';
import {ActivatedMicrofrontend} from '../microfrontend-host/microfrontend-host.model';
import {prune} from '../../common/prune.util';
import {Microfrontends} from '../common/microfrontend.util';

/**
 * Handles messagebox intents, opening a message box based on resolved capability.
 *
 * Microfrontends of the host are displayed in {@link ActivatedMicrofrontendComponent}, microfrontends of other applications in {@link MicrofrontendMessageBoxComponent}.
 *
 * Messagebox intents are handled in this interceptor and are not transported to the providing application to support applications not connected to the SCION Workbench.
 */
@Injectable(/* DO NOT provide via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
export class MicrofrontendMessageBoxIntentHandler implements IntentInterceptor {

  private readonly _messageBoxService = inject(WorkbenchMessageBoxService);
  private readonly _logger = inject(Logger);

  /**
   * Message box intents are handled in this interceptor and then swallowed.
   */
  public intercept(intentMessage: IntentMessage, next: Handler<IntentMessage>): Promise<void> {
    if (intentMessage.intent.type === WorkbenchCapabilities.MessageBox) {
      const messageBoxIntentMessage = intentMessage as IntentMessage<ɵWorkbenchMessageBoxCommand>;
      // Do not block the call until the message box is closed.
      // Otherwise, the caller may receive a timeout error if not closing the message box before delivery confirmation expires.
      this.consumeMessageBoxIntent(messageBoxIntentMessage).catch((error: unknown) => this._logger.error('[MessageBoxOpenError] Failed to open message box.', LoggerNames.MICROFRONTEND, intentMessage, error));
      // Swallow the intent and do not pass it to other interceptors or handlers down the chain.
      return Promise.resolve();
    }
    else {
      return next.handle(intentMessage);
    }
  }

  private async consumeMessageBoxIntent(message: IntentMessage<ɵWorkbenchMessageBoxCommand>): Promise<void> {
    const replyTo = message.headers.get(MessageHeaders.ReplyTo) as string;

    try {
      const result = await this.openMessageBox(message);
      // Use 'Beans.opt' to not error if the platform is destroyed, e.g., in tests if not closing message boxes.
      await Beans.opt(MessageClient)?.publish(replyTo, result, {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.TERMINAL)});
    }
    catch (error) {
      // Use 'Beans.opt' to not error if the platform is destroyed, e.g., in tests if not closing message boxes.
      await Beans.opt(MessageClient)?.publish(replyTo, stringifyError(error), {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.ERROR)});
    }
  }

  /**
   * Opens the microfrontend declared by the resolved capability in a message box.
   */
  private async openMessageBox(message: IntentMessage<ɵWorkbenchMessageBoxCommand>): Promise<unknown> {
    const command = message.body ?? {};
    const capability = message.capability as WorkbenchMessageBoxCapability;
    const params = message.intent.params ?? new Map<string, unknown>();
    const referrer = message.headers.get(MessageHeaders.AppSymbolicName) as string;
    const isHostProvider = Microfrontends.isHostProvider(capability);

    this._logger.debug(() => 'Handling microfrontend messagebox intent', LoggerNames.MICROFRONTEND, command);
    return this._messageBoxService.open(isHostProvider ? MicrofrontendHostComponent : MicrofrontendMessageBoxComponent, prune({
      inputs: isHostProvider ? {} : {capability, params, referrer},
      providers: isHostProvider ? [provideActivatedMicrofrontend(capability, params, referrer)] : undefined,
      title: createRemoteTranslatable(command.title, {appSymbolicName: referrer}),
      actions: command.actions && Object.fromEntries(Object.entries(command.actions).map(([key, label]) => [key, createRemoteTranslatable(label, {appSymbolicName: referrer})])),
      severity: command.severity,
      modality: command.modality,
      contentSelectable: command.contentSelectable,
      cssClass: Arrays.coerce(capability.properties.cssClass).concat(Arrays.coerce(command.cssClass)),
      context: command.context,
    }));
  }
}

/**
 * Provides {@link ActivatedMicrofrontend} for injection in the host microfrontend.
 */
function provideActivatedMicrofrontend(capability: WorkbenchMessageBoxCapability, params: Map<string, unknown>, referrer: string): StaticProvider {
  return {
    provide: ActivatedMicrofrontend,
    useFactory: () => {
      const dialog = inject(ɵWorkbenchDialog);
      // Create in dialog's injection context to bind 'MicrofrontendMessageBox' to the dialog's lifecycle.
      return runInInjectionContext(dialog.injector, () => new MicrofrontendHostMessageBox(dialog, capability, params, referrer));
    },
  };
}
