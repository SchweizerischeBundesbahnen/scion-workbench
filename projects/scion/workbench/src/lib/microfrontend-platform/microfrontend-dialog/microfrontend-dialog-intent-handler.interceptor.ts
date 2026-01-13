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
import {WorkbenchCapabilities, WorkbenchDialogCapability, ɵWorkbenchDialogCommand} from '@scion/workbench-client';
import {Logger, LoggerNames} from '../../logging';
import {Beans} from '@scion/toolkit/bean-manager';
import {stringifyError} from '../../common/stringify-error.util';
import {Arrays} from '@scion/toolkit/util';
import {WorkbenchDialogService} from '../../dialog/workbench-dialog.service';
import {MicrofrontendDialogComponent} from './microfrontend-dialog.component';
import {ActivatedMicrofrontend} from '../microfrontend-host/microfrontend-host.model';
import {ɵWorkbenchDialog} from '../../dialog/ɵworkbench-dialog.model';
import {MicrofrontendHostDialog} from '../microfrontend-host-dialog/microfrontend-host-dialog.model';
import {MicrofrontendHostComponent} from '../microfrontend-host/microfrontend-host.component';
import {prune} from '../../common/prune.util';
import {Microfrontends} from '../common/microfrontend.util';

/**
 * Handles dialog intents, opening a dialog based on resolved capability.
 *
 * Microfrontends of the host are displayed in {@link ActivatedMicrofrontendComponent}, microfrontends of other applications in {@link MicrofrontendDialogComponent}.
 *
 * Dialog intents are handled in this interceptor and are not transported to the providing application to support applications not connected to the SCION Workbench.
 */
@Injectable(/* DO NOT provide via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
export class MicrofrontendDialogIntentHandler implements IntentInterceptor {

  private readonly _dialogService = inject(WorkbenchDialogService);
  private readonly _logger = inject(Logger);

  /**
   * Dialog intents are handled in this interceptor and then swallowed.
   */
  public intercept(intentMessage: IntentMessage, next: Handler<IntentMessage>): Promise<void> {
    if (intentMessage.intent.type === WorkbenchCapabilities.Dialog) {
      const dialogIntentMessage = intentMessage as IntentMessage<ɵWorkbenchDialogCommand>;
      // Do not block the call until the dialog is closed.
      // Otherwise, the caller may receive a timeout error if not closing the dialog before delivery confirmation expires.
      this.consumeDialogIntent(dialogIntentMessage).catch((error: unknown) => this._logger.error('[DialogOpenError] Failed to open dialog.', LoggerNames.MICROFRONTEND, intentMessage, error));
      // Swallow the intent and do not pass it to other interceptors or handlers down the chain.
      return Promise.resolve();
    }
    else {
      return next.handle(intentMessage);
    }
  }

  private async consumeDialogIntent(message: IntentMessage<ɵWorkbenchDialogCommand>): Promise<void> {
    const replyTo = message.headers.get(MessageHeaders.ReplyTo) as string;

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
  private async openDialog(message: IntentMessage<ɵWorkbenchDialogCommand>): Promise<unknown> {
    const command = message.body ?? {};
    const capability = message.capability as WorkbenchDialogCapability;
    const params = message.intent.params ?? new Map<string, unknown>();
    const isHostProvider = Microfrontends.isHostProvider(capability);
    const referrer = message.headers.get(MessageHeaders.AppSymbolicName) as string;
    this._logger.debug(() => 'Handling microfrontend dialog intent', LoggerNames.MICROFRONTEND, command);

    return this._dialogService.open(isHostProvider ? MicrofrontendHostComponent : MicrofrontendDialogComponent, prune({
      inputs: isHostProvider ? {} : {capability, params},
      providers: isHostProvider ? [provideActivatedMicrofrontend(capability, params, referrer)] : undefined,
      modality: command.modality,
      context: command.context,
      animate: command.animate,
      cssClass: Arrays.coerce(capability.properties.cssClass).concat(Arrays.coerce(command.cssClass)),
    }));
  }
}

/**
 * Provides {@link ActivatedMicrofrontend} for injection in the host microfrontend.
 */
function provideActivatedMicrofrontend(capability: WorkbenchDialogCapability, params: Map<string, unknown>, referrer: string): StaticProvider {
  return {
    provide: ActivatedMicrofrontend,
    useFactory: () => {
      const dialog = inject(ɵWorkbenchDialog);
      // Create in dialog's injection context to bind 'MicrofrontendDialog' to the dialog's lifecycle.
      return runInInjectionContext(dialog.injector, () => new MicrofrontendHostDialog(dialog, capability, params, referrer));
    },
  };
}
