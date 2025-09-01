/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {inject, Injectable} from '@angular/core';
import {APP_IDENTITY, Handler, IntentInterceptor, IntentMessage, MessageClient, MessageHeaders, ResponseStatusCodes} from '@scion/microfrontend-platform';
import {WorkbenchCapabilities, WorkbenchMessageBoxCapability, WorkbenchMessageBoxOptions} from '@scion/workbench-client';
import {Logger, LoggerNames} from '../../logging';
import {Beans} from '@scion/toolkit/bean-manager';
import {stringifyError} from '../../common/stringify-error.util';
import {WorkbenchMessageBoxService} from '../../message-box/workbench-message-box.service';
import {Arrays} from '@scion/toolkit/util';
import {MicrofrontendHostMessageBoxComponent} from '../microfrontend-host-message-box/microfrontend-host-message-box.component';
import {MicrofrontendMessageBoxComponent} from './microfrontend-message-box.component';
import {createRemoteTranslatable} from '../text/remote-text-provider';

/**
 * Handles messagebox intents, instructing the workbench to open a message box with the microfrontend declared on the resolved capability.
 *
 * Microfrontends of the host are displayed in {@link MicrofrontendHostMessageBoxComponent}, microfrontends of other applications in {@link MicrofrontendMessageBoxComponent}.
 *
 * Message box intents are handled in this interceptor and are not transported to the providing application, enabling support for applications
 * that are not connected to the SCION Workbench.
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
      const messageBoxIntentMessage = intentMessage as IntentMessage<WorkbenchMessageBoxOptions>;
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

  private async consumeMessageBoxIntent(message: IntentMessage<WorkbenchMessageBoxOptions>): Promise<void> {
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
  private async openMessageBox(message: IntentMessage<WorkbenchMessageBoxOptions>): Promise<unknown> {
    const options = message.body ?? {};
    const capability = message.capability as WorkbenchMessageBoxCapability;
    const params = message.intent.params ?? new Map();
    const referrer = message.headers.get(MessageHeaders.AppSymbolicName) as string;
    const isHostProvider = capability.metadata!.appSymbolicName === Beans.get(APP_IDENTITY);

    this._logger.debug(() => 'Handling microfrontend messagebox intent', LoggerNames.MICROFRONTEND, options);
    return this._messageBoxService.open(isHostProvider ? MicrofrontendHostMessageBoxComponent : MicrofrontendMessageBoxComponent, {
      inputs: {capability, params, referrer},
      title: createRemoteTranslatable(options.title, {appSymbolicName: referrer}),
      actions: options.actions && Object.fromEntries(Object.entries(options.actions).map(([key, label]) => [key, createRemoteTranslatable(label, {appSymbolicName: referrer})])),
      severity: options.severity,
      modality: options.modality,
      contentSelectable: options.contentSelectable,
      cssClass: Arrays.coerce(capability.properties.cssClass).concat(Arrays.coerce(options.cssClass)),
      context: options.context,
    });
  }
}
