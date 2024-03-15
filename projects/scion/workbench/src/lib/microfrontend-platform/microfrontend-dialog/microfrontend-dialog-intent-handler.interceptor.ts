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
 * Handles dialog intents, instructing the workbench to open a dialog with the microfrontend declared on the resolved capability.
 *
 * Microfrontends of the host are displayed in {@link MicrofrontendHostDialogComponent}, microfrontends of other applications in {@link MicrofrontendDialogComponent}.
 *
 * Dialog intents are handled in this interceptor and are not transported to the providing application, enabling support for applications
 * that are not connected to the SCION Workbench.
 */
@Injectable(/* DO NOT PROVIDE via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
export class MicrofrontendDialogIntentHandler implements IntentInterceptor {

  constructor(private _dialogService: WorkbenchDialogService, private _logger: Logger) {
  }

  /**
   * Dialog intents are handled in this interceptor and then swallowed.
   */
  public intercept(intentMessage: IntentMessage, next: Handler<IntentMessage>): Promise<void> {
    if (intentMessage.intent.type === WorkbenchCapabilities.Dialog) {
      // Do not block the call until the dialog is closed.
      // Otherwise, the caller may receive a timeout error if not closing the dialog before delivery confirmation expires.
      this.consumeDialogIntent(intentMessage).catch(error => this._logger.error('[DialogOpenError] Failed to open dialog.', LoggerNames.MICROFRONTEND, intentMessage, error));
      // Swallow the intent and do not pass it to other interceptors or handlers down the chain.
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
      // Use 'Beans.opt' to not error if the platform is destroyed, e.g., in tests if not closing dialogs.
      await Beans.opt(MessageClient)?.publish(replyTo, result, {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.TERMINAL)});
    }
    catch (error) {
      // Use 'Beans.opt' to not error if the platform is destroyed, e.g., in tests if not closing dialogs.
      await Beans.opt(MessageClient)?.publish(replyTo, stringifyError(error), {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.ERROR)});
    }
  }

  /**
   * Opens the microfrontend declared by the resolved capability in a dialog.
   */
  private async openDialog(message: IntentMessage<WorkbenchDialogOptions>): Promise<unknown> {
    const options = message.body ?? {};
    const capability = message.capability as WorkbenchDialogCapability;
    const params = message.intent.params ?? new Map();
    const isHostProvider = capability.metadata!.appSymbolicName === Beans.get(APP_IDENTITY);
    this._logger.debug(() => 'Handling microfrontend dialog intent', LoggerNames.MICROFRONTEND, options);

    return this._dialogService.open(isHostProvider ? MicrofrontendHostDialogComponent : MicrofrontendDialogComponent, {
      inputs: {capability, params},
      modality: options.modality,
      context: options.context,
      animate: options.animate,
      cssClass: Arrays.coerce(capability.properties?.cssClass).concat(Arrays.coerce(options.cssClass)),
    });
  }
}
