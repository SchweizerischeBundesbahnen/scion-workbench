/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Type } from '@angular/core';
import { Action, MessageBoxService } from '@scion/workbench';
import { IntentHandler } from '../core/metadata';
import { MessageBus } from '../core/message-bus.service';
import { Defined } from '../core/defined.util';
import { MessageBox, MessageBoxIntentMessage, MessageEnvelope, PlatformCapabilityTypes, Qualifier } from '@scion/workbench-application-platform.api';

/**
 * Opens a workbench messagebox for intents of the type 'messagebox' and which matches given qualifier.
 *
 * If specified a component, it is used as the message box content. The component can inject {MessageBox} instance
 * to access intent payload via 'input' property. The component must be registered as entry-component in app module.
 *
 * ---
 * Example registration:
 *
 * @NgModule({
 *   declarations: [
 *     CustomMessageBoxComponent,
 *     ...
 *   ],
 *   providers: [
 *     {
 *       provide: INTENT_HANDLER,
 *       useFactory: provideCustomMessageBoxIntentHandler,
 *       multi: true,
 *     }
 *   ],
 *   entryComponents: [
 *     CustomMessageBoxComponent,
 *   ],
 *   ...
 * })
 * export class AppModule { }
 *
 * export function provideCustomMessageBoxIntentHandler(): MessageBoxIntentHandler {
 *   return new MessageBoxIntentHandler({'your': 'qualifier'}, 'Your description', CustomMessageBoxComponent);
 * }
 */
export class MessageBoxIntentHandler implements IntentHandler {

  public readonly type: PlatformCapabilityTypes = PlatformCapabilityTypes.MessageBox;

  constructor(public readonly qualifier: Qualifier, public readonly description: string, private _component?: Type<any>) {
  }

  public onIntent(envelope: MessageEnvelope<MessageBoxIntentMessage>): void {
    const messageBus: MessageBus = envelope._injector.get(MessageBus as Type<MessageBus>);
    const messageBoxService: MessageBoxService = envelope._injector.get(MessageBoxService as Type<MessageBoxService>);
    const msgbox: MessageBox = envelope.message.payload;

    messageBoxService.open({
      title: msgbox.title,
      content: this._component || msgbox.text,
      actions: msgbox.actions,
      severity: Defined.orElse(msgbox.severity, 'info'),
      modality: Defined.orElse(msgbox.modality, 'view'),
      contentSelectable: msgbox.contentSelectable,
      cssClass: msgbox.cssClass,
      input: msgbox.payload,
    }).then((action: Action) => {
      messageBus.publishReply(action, envelope.sender, envelope.replyToUid);
    });
  }
}
