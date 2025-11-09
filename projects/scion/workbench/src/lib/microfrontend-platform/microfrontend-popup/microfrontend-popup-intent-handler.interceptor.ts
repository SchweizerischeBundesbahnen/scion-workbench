/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {inject, Injectable} from '@angular/core';
import {APP_IDENTITY, Handler, IntentInterceptor, IntentMessage, mapToBody, MessageClient, MessageHeaders, ResponseStatusCodes} from '@scion/microfrontend-platform';
import {WorkbenchCapabilities, WorkbenchPopupCapability, WorkbenchPopupReferrer, ɵWorkbenchCommands, ɵWorkbenchPopupCommand} from '@scion/workbench-client';
import {MicrofrontendPopupComponent} from './microfrontend-popup.component';
import {Observable} from 'rxjs';
import {Logger, LoggerNames} from '../../logging';
import {Beans} from '@scion/toolkit/bean-manager';
import {stringifyError} from '../../common/stringify-error.util';
import {Arrays} from '@scion/toolkit/util';
import {WorkbenchPopupService} from '../../popup/workbench-popup.service';
import {PopupOrigin} from '../../popup/popup.origin';
import {MicrofrontendHostPopupComponent} from '../microfrontend-host-popup/microfrontend-host-popup.component';
import {isViewId, PopupId} from '../../workbench.identifiers';
import {MicrofrontendPopupInput} from './microfrontend-popup-input';
import {WorkbenchViewRegistry} from '../../view/workbench-view.registry';
import {MicrofrontendWorkbenchView} from '../microfrontend-view/microfrontend-workbench-view.model';

/**
 * Handles popup intents, instructing the workbench to open a popup with the microfrontend declared on the resolved capability.
 *
 * Microfrontends of the host are displayed in {@link MicrofrontendHostPopupComponent}, microfrontends of other applications in {@link MicrofrontendPopupComponent}.
 *
 * Popup intents are handled in this interceptor and are not transported to the providing application, enabling support for applications
 * that are not connected to the SCION Workbench.
 */
@Injectable(/* DO NOT provide via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
export class MicrofrontendPopupIntentHandler implements IntentInterceptor {

  private readonly _popupService = inject(WorkbenchPopupService);
  private readonly _viewRegistry = inject(WorkbenchViewRegistry);
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
    const isHostProvider = capability.metadata!.appSymbolicName === Beans.get(APP_IDENTITY);
    this._logger.debug(() => 'Handling microfrontend popup command', LoggerNames.MICROFRONTEND, command);

    const popupInput: MicrofrontendPopupInput = {
      capability,
      params: message.intent.params ?? new Map<string, unknown>(),
      referrer: this.getReferrer(command),
      closeOnFocusLost: command.closeStrategy?.onFocusLost ?? true,
    };

    return this._popupService.open({
      id: command.popupId,
      component: isHostProvider ? MicrofrontendHostPopupComponent : MicrofrontendPopupComponent,
      input: popupInput,
      anchor: this.observePopupOrigin$(command),
      context: command.context,
      align: command.align,
      size: capability.properties.size,
      closeStrategy: isHostProvider ? command.closeStrategy : {
        ...command.closeStrategy,
        onFocusLost: false, // Closing the popup on focus loss is handled in {MicrofrontendPopupComponent}
      },
      cssClass: Arrays.coerce(capability.properties.cssClass).concat(Arrays.coerce(command.cssClass)),
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
    const context = command.context && (typeof command.context === 'object' ? command.context.viewId : command.context);
    if (!isViewId(context)) {
      return {};
    }

    const view = this._viewRegistry.get(context);
    return {
      viewId: view.id,
      viewCapabilityId: view.adapt(MicrofrontendWorkbenchView)?.capability.metadata!.id,
    };
  }
}
