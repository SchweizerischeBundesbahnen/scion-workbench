/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable} from '@angular/core';
import {APP_IDENTITY, Handler, IntentInterceptor, IntentMessage, MessageClient, MessageHeaders, ResponseStatusCodes} from '@scion/microfrontend-platform';
import {MESSAGE_BOX_CONTENT_PARAM, WorkbenchCapabilities, WorkbenchMessageBoxCapability, WorkbenchMessageBoxOptions as WorkbenchClientMessageBoxOptions} from '@scion/workbench-client';
import {Logger, LoggerNames} from '../../logging';
import {Beans} from '@scion/toolkit/bean-manager';
import {stringifyError} from '../../common/stringify-error.util';
import {WorkbenchMessageBoxService} from '../../message-box/workbench-message-box.service';
import {WorkbenchMessageBoxOptions} from '../../message-box/workbench-message-box.options';
import {Arrays} from '@scion/toolkit/util';
import {MicrofrontendHostMessageBoxComponent} from '../microfrontend-host-message-box/microfrontend-host-message-box.component';
import {MicrofrontendMessageBoxComponent} from './microfrontend-message-box.component';

/**
 * TODO
 */
@Injectable(/* DO NOT PROVIDE via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
export class MicrofrontendMessageBoxIntentHandler implements IntentInterceptor {

  constructor(private _messageBoxService: WorkbenchMessageBoxService,
              private _logger: Logger) {
  }

  /**
   * Message box intents are handled in this interceptor and then swallowed.
   */
  public intercept(intentMessage: IntentMessage, next: Handler<IntentMessage>): Promise<void> {
    if (intentMessage.intent.type === WorkbenchCapabilities.MessageBox) {
      // Do not block the call until the message box is closed.
      // Otherwise, the caller may receive a timeout error if not closing the message box before delivery confirmation expires.
      this.consumeMessageBoxIntent(intentMessage).catch(error => this._logger.error('[MessageBoxOpenError] Failed to open message box.', LoggerNames.MICROFRONTEND, intentMessage, error));
      // Consume the intent and do not pass it to other interceptors or handlers down the chain.
      return Promise.resolve();
    }
    else {
      return next.handle(intentMessage);
    }
  }

  private async consumeMessageBoxIntent(message: IntentMessage<WorkbenchClientMessageBoxOptions>): Promise<void> {
    const replyTo = message.headers.get(MessageHeaders.ReplyTo);

    try {
      const result = await this.openMessageBox(message);
      await Beans.get(MessageClient).publish(replyTo, result, {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.TERMINAL)});
    }
    catch (error) {
      await Beans.get(MessageClient).publish(replyTo, stringifyError(error), {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.ERROR)});
    }
  }

  /**
   * Opens a workbench message box for displaying the microfrontend of a message box capability.
   */
  private async openMessageBox(message: IntentMessage<WorkbenchClientMessageBoxOptions>): Promise<any> {
    const input = message.body!;
    const capability = message.capability as WorkbenchMessageBoxCapability;
    const params = message.intent.params ?? new Map();
    const options: WorkbenchMessageBoxOptions = {
      inputs: {
        capability,
        params,
      },
      title: input.title,
      actions: input.actions,
      severity: input.severity,
      modality: input.modality,
      contentSelectable: input.contentSelectable,
      cssClass: Arrays.coerce(capability.properties?.cssClass).concat(Arrays.coerce(input.cssClass)),
      context: input.context,
    };

    if (!capability.qualifier || !Object.keys(capability.qualifier).length) {
      this._logger.debug(() => 'Handling microfrontend message box intent for built-in workbench capability', LoggerNames.MICROFRONTEND, options);
      return this._messageBoxService.open(params.get(MESSAGE_BOX_CONTENT_PARAM), options);
    }
    else {
      const isHostProvider = capability.metadata!.appSymbolicName === Beans.get(APP_IDENTITY);
      this._logger.debug(() => 'Handling microfrontend message box intent for custom capability provider', LoggerNames.MICROFRONTEND, options);
      return this._messageBoxService.open(isHostProvider ? MicrofrontendHostMessageBoxComponent : MicrofrontendMessageBoxComponent, options);
    }
  }
}
