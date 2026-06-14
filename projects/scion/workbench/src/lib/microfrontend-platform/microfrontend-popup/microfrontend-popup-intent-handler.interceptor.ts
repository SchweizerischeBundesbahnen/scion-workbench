/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {inject, Injectable, Provider} from '@angular/core';
import {Handler, IntentInterceptor, IntentMessage, mapToBody, MessageClient, MessageHeaders, ResponseStatusCodes} from '@scion/microfrontend-platform';
import {WorkbenchCapabilities, WorkbenchPopupCapability, ɵWorkbenchCommands, ɵWorkbenchPopupCommand} from '@scion/workbench-client';
import {MicrofrontendPopupComponent} from './microfrontend-popup.component';
import {Observable} from 'rxjs';
import {Logger, LoggerNames} from '../../logging';
import {Beans} from '@scion/toolkit/bean-manager';
import {stringifyError} from '../../common/stringify-error.util';
import {Arrays} from '@scion/toolkit/util';
import {WorkbenchPopupService} from '../../popup/workbench-popup.service';
import {PopupOrigin} from '../../popup/popup.origin';
import {PopupId} from '../../workbench.identifiers';
import {prune} from '../../common/prune.util';
import {MicrofrontendHostComponent} from '../microfrontend-host/microfrontend-host.component';
import {ɵWorkbenchPopup} from '../../popup/ɵworkbench-popup.model';
import {MicrofrontendHostPopup} from '../microfrontend-host-popup/microfrontend-host-popup.model';
import {ACTIVATED_MICROFRONTEND_FACTORY} from '../microfrontend-host/microfrontend-host.model';
import {Microfrontends} from '../common/microfrontend.util';

/**
 * Handles popup intents, opening a popup based on resolved capability.
 *
 * Microfrontends of the host are displayed in {@link ActivatedMicrofrontendComponent}, microfrontends of other applications in {@link MicrofrontendPopupComponent}.
 *
 * Popup intents are handled in this interceptor and are not transported to the providing application to support applications not connected to the SCION Workbench.
 */
@Injectable(/* DO NOT provide via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
export class MicrofrontendPopupIntentHandler implements IntentInterceptor {

  private readonly _popupService = inject(WorkbenchPopupService);
  private readonly _logger = inject(Logger);
  private readonly _openedPopups = new Set<PopupId>();

  /**
   * Popup intents are handled in this interceptor and then swallowed.
   */
  public intercept(intentMessage: IntentMessage, next: Handler<IntentMessage>): Promise<void> {
    if (intentMessage.intent.type === WorkbenchCapabilities.Popup) {
      const popupIntentMessage = intentMessage as IntentMessage<ɵWorkbenchPopupCommand>;
      // Do not block the call until the popup is closed.
      // Otherwise, the caller may receive a timeout error if not closing the popup before delivery confirmation expires.
      this.consumePopupIntent(popupIntentMessage).catch((error: unknown) => this._logger.error('[PopupOpenError] Failed to open popup.', LoggerNames.MICROFRONTEND, intentMessage, error));
      return Promise.resolve();
    }
    else {
      return next.handle(intentMessage);
    }
  }

  private async consumePopupIntent(message: IntentMessage<ɵWorkbenchPopupCommand>): Promise<void> {
    const popupId = message.body!.popupId;
    const replyTo = message.headers.get(MessageHeaders.ReplyTo) as string;

    // Ignore subsequent intents if a popup is already open, as it would lead to the first popup being closed.
    if (this._openedPopups.has(popupId)) {
      this._logger.warn('Ignoring popup intent because multiple popup providers found that match the popup intent. Most likely this is not intended and may indicate an incorrect manifest configuration.', message.intent);
      return;
    }

    this._openedPopups.add(popupId);
    try {
      const result = await this.openPopup(message);
      // Use 'Beans.opt' to not error if the platform is destroyed, e.g., in tests if not closing popups.
      await Beans.opt(MessageClient)?.publish(replyTo, result, {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.TERMINAL)});
    }
    catch (error) {
      // Use 'Beans.opt' to not error if the platform is destroyed, e.g., in tests if not closing popups.
      await Beans.opt(MessageClient)?.publish(replyTo, stringifyError(error), {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.ERROR)});
    }
    finally {
      this._openedPopups.delete(popupId);
    }
  }

  /**
   * Opens the microfrontend declared by the resolved capability in a popup.
   */
  private async openPopup(message: IntentMessage<ɵWorkbenchPopupCommand>): Promise<unknown> {
    const command = message.body!;
    const capability = message.capability as WorkbenchPopupCapability;
    const params = message.intent.params ?? new Map<string, unknown>();
    const referrer = message.headers.get(MessageHeaders.AppSymbolicName) as string;
    const closeOnFocusLost = command.closeStrategy?.onFocusLost ?? true;
    const isHostProvider = Microfrontends.isHostProvider(capability);
    this._logger.debug(() => 'Handling microfrontend popup command', LoggerNames.MICROFRONTEND, command);

    return this._popupService.open(isHostProvider ? MicrofrontendHostComponent : MicrofrontendPopupComponent, prune({
      id: command.popupId,
      inputs: isHostProvider ? {} : {capability, params, referrer, closeOnFocusLost},
      providers: isHostProvider ? [provideActivatedMicrofrontend(capability, params, referrer)] : undefined,
      anchor: this.observePopupOrigin$(command),
      context: command.context,
      align: command.align,
      closeStrategy: isHostProvider ? command.closeStrategy : {
        ...command.closeStrategy,
        onFocusLost: false, // Closing the popup on focus loss is handled in {MicrofrontendPopupComponent}
      },
      cssClass: Arrays.coerce(capability.properties.cssClass).concat(Arrays.coerce(command.cssClass)),
    }));
  }

  /**
   * Constructs an Observable that, upon subscription, emits the position of the popup anchor, and then each time it is repositioned.
   */
  private observePopupOrigin$(command: ɵWorkbenchPopupCommand): Observable<PopupOrigin> {
    return Beans.get(MessageClient).observe$<PopupOrigin>(ɵWorkbenchCommands.popupOriginTopic(command.popupId)).pipe(mapToBody());
  }
}

/**
 * Provides {@link ActivatedMicrofrontend} for injection in the host microfrontend.
 */
function provideActivatedMicrofrontend(capability: WorkbenchPopupCapability, params: Map<string, unknown>, referrer: string): Provider {
  return {
    provide: ACTIVATED_MICROFRONTEND_FACTORY,
    useValue: () => new MicrofrontendHostPopup(inject(ɵWorkbenchPopup), capability, params, referrer),
  };
}
