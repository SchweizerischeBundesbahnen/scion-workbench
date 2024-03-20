/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable} from '@angular/core';
import {APP_IDENTITY, Handler, IntentInterceptor, IntentMessage, mapToBody, MessageClient, MessageHeaders, ResponseStatusCodes} from '@scion/microfrontend-platform';
import {WorkbenchCapabilities, WorkbenchPopupCapability, WorkbenchPopupReferrer, ɵPopupContext, ɵWorkbenchCommands, ɵWorkbenchPopupCommand} from '@scion/workbench-client';
import {MicrofrontendPopupComponent} from './microfrontend-popup.component';
import {Observable} from 'rxjs';
import {Logger, LoggerNames} from '../../logging';
import {Beans} from '@scion/toolkit/bean-manager';
import {stringifyError} from '../../common/stringify-error.util';
import {Arrays, Maps} from '@scion/toolkit/util';
import {PopupService} from '../../popup/popup.service';
import {PopupOrigin} from '../../popup/popup.origin';
import {WorkbenchViewRegistry} from '../../view/workbench-view.registry';
import {MicrofrontendHostPopupComponent} from '../microfrontend-host-popup/microfrontend-host-popup.component';
import {MicrofrontendWorkbenchView} from '../microfrontend-view/microfrontend-workbench-view.model';

/**
 * Handles microfrontend popup intents, instructing the Workbench {@link PopupService} to navigate to the microfrontend of a given popup capability.
 *
 * Popup intents are handled in this interceptor in order to support microfrontends not using the SCION Workbench. They are not transported to the providing application.
 */
@Injectable(/* DO NOT PROVIDE via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
export class MicrofrontendPopupIntentInterceptor implements IntentInterceptor {

  private _openedPopups = new Set<string>();

  constructor(private _popupService: PopupService,
              private _viewRegistry: WorkbenchViewRegistry,
              private _logger: Logger) {
  }

  /**
   * Popup intents are handled in this interceptor and then swallowed.
   */
  public intercept(intentMessage: IntentMessage, next: Handler<IntentMessage>): Promise<void> {
    if (intentMessage.intent.type === WorkbenchCapabilities.Popup) {
      // Do not block the call until the popup is closed.
      // Otherwise, the caller may receive a timeout error if not closing the popup before delivery confirmation expires.
      this.consumePopupIntent(intentMessage).catch(error => this._logger.error('[PopupOpenError] Failed to open popup.', LoggerNames.MICROFRONTEND, intentMessage, error));
      return Promise.resolve();
    }
    else {
      return next.handle(intentMessage);
    }
  }

  private async consumePopupIntent(message: IntentMessage<ɵWorkbenchPopupCommand>): Promise<void> {
    const popupId = message.body!.popupId;
    const replyTo = message.headers.get(MessageHeaders.ReplyTo);

    // Ignore subsequent intents if a popup is already open, as it would lead to the first popup being closed.
    if (this._openedPopups.has(popupId)) {
      this._logger.warn('Ignoring popup intent because multiple popup providers found that match the popup intent. Most likely this is not intended and may indicate an incorrect manifest configuration.', message.intent);
      return;
    }

    this._openedPopups.add(popupId);
    try {
      const result = await this.openPopup(message);
      await Beans.get(MessageClient).publish(replyTo, result, {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.TERMINAL)});
    }
    catch (error) {
      await Beans.get(MessageClient).publish(replyTo, stringifyError(error), {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.ERROR)});
    }
    finally {
      this._openedPopups.delete(popupId);
    }
  }

  /**
   * Opens a workbench popup for displaying the microfrontend of a popup capability.
   */
  private async openPopup(message: IntentMessage<ɵWorkbenchPopupCommand>): Promise<any> {
    const command = message.body!;
    const capability = message.capability as WorkbenchPopupCapability;
    const isHostProvider = capability.metadata!.appSymbolicName === Beans.get(APP_IDENTITY);
    this._logger.debug(() => 'Handling microfrontend popup command', LoggerNames.MICROFRONTEND, command);

    const popupContext: ɵPopupContext = {
      popupId: command.popupId,
      capability: capability,
      params: new Map([
        ...Maps.coerce(message.intent.params),
        ...Maps.coerce(message.intent.qualifier),
      ]),
      closeOnFocusLost: command.closeStrategy?.onFocusLost ?? true,
      referrer: this.getReferrer(command),
    };

    return this._popupService.open({
      component: isHostProvider ? MicrofrontendHostPopupComponent : MicrofrontendPopupComponent,
      input: popupContext,
      anchor: this.observePopupOrigin$(command),
      context: command.context,
      align: command.align,
      size: capability.properties?.size,
      closeStrategy: isHostProvider ? command.closeStrategy : {
        ...command.closeStrategy,
        onFocusLost: false, // Closing the popup on focus loss is handled in {MicrofrontendPopupComponent}
      },
      cssClass: Arrays.coerce(capability.properties?.cssClass).concat(Arrays.coerce(command.cssClass)),
    });
  }

  /**
   * Constructs an Observable that, upon subscription, emits the position of the popup anchor, and then each time it is repositioned.
   */
  private observePopupOrigin$(command: ɵWorkbenchPopupCommand): Observable<PopupOrigin> {
    return Beans.get(MessageClient).observe$<PopupOrigin>(ɵWorkbenchCommands.popupOriginTopic(command.popupId)).pipe(mapToBody());
  }

  /**
   * Returns information about the context in which a popup was opened.
   */
  private getReferrer(command: ɵWorkbenchPopupCommand): WorkbenchPopupReferrer {
    if (!command.context?.viewId) {
      return {};
    }

    const view = this._viewRegistry.get(command.context.viewId);
    return {
      viewId: view.id,
      viewCapabilityId: view.adapt(MicrofrontendWorkbenchView)?.capability.metadata!.id,
    };
  }
}
