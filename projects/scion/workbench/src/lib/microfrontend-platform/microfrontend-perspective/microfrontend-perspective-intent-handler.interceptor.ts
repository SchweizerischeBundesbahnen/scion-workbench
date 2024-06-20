/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Handler, IntentInterceptor, IntentMessage, MessageClient, MessageHeaders, ResponseStatusCodes} from '@scion/microfrontend-platform';
import {Injectable} from '@angular/core';
import {WorkbenchCapabilities} from '@scion/workbench-client';
import {Logger, LoggerNames} from '../../logging';
import {Beans} from '@scion/toolkit/bean-manager';
import {WorkbenchService} from '../../workbench.service';

/**
 * Handles perspective intents, instructing the workbench to switch perspective.
 */
@Injectable(/* DO NOT PROVIDE via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
export class MicrofrontendPerspectiveIntentHandler implements IntentInterceptor {

  constructor(private _workbenchService: WorkbenchService, private _logger: Logger) {
  }

  /**
   * Perspective intents are handled in this interceptor and then swallowed.
   */
  public intercept(intentMessage: IntentMessage, next: Handler<IntentMessage>): Promise<void> {
    if (intentMessage.intent.type === WorkbenchCapabilities.Perspective) {
      return this.consumePerspectiveIntent(intentMessage);
    }
    else {
      return next.handle(intentMessage);
    }
  }

  private async consumePerspectiveIntent(message: IntentMessage<void>): Promise<void> {
    const replyTo = message.headers.get(MessageHeaders.ReplyTo);
    const success = await this.switchPerspective(message);
    if (replyTo) {
      await Beans.get(MessageClient).publish(replyTo, success, {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.TERMINAL)});
    }
  }

  private switchPerspective(message: IntentMessage<void>): Promise<boolean> {
    const perspectiveId = message.capability.metadata!.id;
    this._logger.debug(() => `Switching to perspective ${perspectiveId}.`, LoggerNames.MICROFRONTEND);
    return this._workbenchService.switchPerspective(perspectiveId);
  }
}
