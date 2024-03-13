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
import {WorkbenchCapabilities, WorkbenchDialogCapability, WorkbenchDialogOptions} from '@scion/workbench-client';
import {Logger, LoggerNames} from '../../logging';
import {Beans} from '@scion/toolkit/bean-manager';
import {stringifyError} from '../../common/stringify-error.util';
import {Arrays} from '@scion/toolkit/util';
import {WorkbenchDialogService} from '../../dialog/workbench-dialog.service';
import {MicrofrontendDialogComponent} from './microfrontend-dialog.component';
import {MicrofrontendHostDialogComponent} from '../microfrontend-host-dialog/microfrontend-host-dialog.component';

/**
 * Handles microfrontend dialog intents, instructing the Workbench {@link WorkbenchDialogService} to display the dialog capability in either {@link MicrofrontendDialogComponent}
 * or {@link MicrofrontendHostDialogComponent} if the capability is provided by the workbench host application.
 *
 * Dialog intents are handled in this interceptor in order to support microfrontends not using the SCION Workbench. They are not transported to the providing application.
 */
@Injectable(/* DO NOT PROVIDE via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
export class MicrofrontendDialogIntentInterceptor implements IntentInterceptor {

  constructor(private _dialogService: WorkbenchDialogService,
              private _logger: Logger) {
  }

  /**
   * Dialog intents are handled in this interceptor and then swallowed.
   */
  public intercept(intentMessage: IntentMessage, next: Handler<IntentMessage>): Promise<void> {
    if (intentMessage.intent.type === WorkbenchCapabilities.Dialog) {
      // Do not block the call until the dialog is closed.
      // Otherwise, the caller may receive a timeout error if not closing the dialog before delivery confirmation expires.
      this.consumeDialogIntent(intentMessage).catch(error => this._logger.error('[DialogOpenError] Failed to open dialog.', LoggerNames.MICROFRONTEND, intentMessage, error));
      // Consume the intent and do not pass it to other interceptors or handlers down the chain.
      return Promise.resolve();
    }
    else {
      return next.handle(intentMessage);
    }
  }

  private async consumeDialogIntent(message: IntentMessage<WorkbenchDialogOptions>): Promise<void> {
    const replyTo = message.headers.get(MessageHeaders.ReplyTo);

    try {
      const result = await this.openDialog(message);
      await Beans.get(MessageClient).publish(replyTo, result, {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.TERMINAL)});
    }
    catch (error) {
      await Beans.get(MessageClient).publish(replyTo, stringifyError(error), {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.ERROR)});
    }
  }

  /**
   * Opens a workbench dialog to display the microfrontend from the dialog capability provider.
   */
  private async openDialog(message: IntentMessage<WorkbenchDialogOptions>): Promise<unknown> {
    const options = message.body!;
    const capability = message.capability as WorkbenchDialogCapability;
    const isHostProvider = capability.metadata!.appSymbolicName === Beans.get(APP_IDENTITY);
    this._logger.debug(() => 'Handling microfrontend dialog intent', LoggerNames.MICROFRONTEND, options);

    return this._dialogService.open(
      isHostProvider ? MicrofrontendHostDialogComponent : MicrofrontendDialogComponent,
      {
        inputs: {
          capability,
          params: message.intent.params,
        },
        modality: options.modality,
        context: options.context,
        animate: options.animate,
        cssClass: Arrays.coerce(capability.properties?.cssClass).concat(Arrays.coerce(options.cssClass)),
      },
    );
  }
}
