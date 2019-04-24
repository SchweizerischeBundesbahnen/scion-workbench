/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { MessageBus } from './message-bus.service';
import { Service } from './metadata';
import { Platform } from './platform';
import { MessageBox, MessageBoxIntentMessage, PlatformCapabilityTypes, Qualifier } from '@scion/workbench-application-platform.api';

/**
 * Displays message boxes to the user.
 */
export class MessageBoxService implements Service {

  /**
   * Displays the specified message to the user.
   *
   * By default, and if no qualifier is specified, a built-in messagebox pops up.
   * To display a custom message box, provide the qualifier as expected by the
   * respective {IntentHandler} registered in the host application.
   *
   * @returns a promise that resolves to the action key which the user pressed to confirm the message.
   */
  public open(messageBox: MessageBox, qualifier?: Qualifier): Promise<string> {
    const intentMessage: MessageBoxIntentMessage = {
      type: PlatformCapabilityTypes.MessageBox,
      qualifier: qualifier,
      payload: messageBox,
    };

    return Platform.getService(MessageBus).requestReply({channel: 'intent', message: intentMessage})
      .then(replyEnvelope => replyEnvelope && replyEnvelope.message); // replyEnvelope is 'undefined' on shutdown
  }

  public onDestroy(): void {
    // noop
  }
}
