/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Type } from '@angular/core';
import { NotificationService } from '@scion/workbench';
import { IntentHandler } from '../core/metadata';
import { Defined } from '../core/defined.util';
import { MessageEnvelope, Notification, NotificationIntentMessage, PlatformCapabilityTypes, Qualifier } from '@scion/workbench-application-platform.api';

/**
 * Shows a workbench notification for intents of the type 'notification' and which matches given qualifier.
 *
 * If specified a component, it is used as the notification content. The component can inject {Notification} instance
 * to access intent payload via 'input' property. The component must be registered as entry-component in app module.
 *
 * ---
 * Example registration:
 *
 * @NgModule({
 *   declarations: [
 *     CustomNotificationComponent,
 *     ...
 *   ],
 *   providers: [
 *     {
 *       provide: INTENT_HANDLER,
 *       useFactory: provideCustomNotificationIntentHandler,
 *       multi: true,
 *     }
 *   ],
 *   ...
 * })
 * export class AppModule { }
 *
 * export function provideCustomNotificationIntentHandler(): NotificationIntentHandler {
 *   return new NotificationIntentHandler({'your': 'qualifier'}, 'Your description', CustomNotificationComponent);
 * }
 */
export class NotificationIntentHandler implements IntentHandler {

  public readonly type: PlatformCapabilityTypes = PlatformCapabilityTypes.Notification;

  constructor(public readonly qualifier: Qualifier, public readonly description: string, private _component?: Type<any>) {
  }

  public onIntent(envelope: MessageEnvelope<NotificationIntentMessage>): void {
    const notification: Notification = envelope.message.payload;

    const notificationService: NotificationService = envelope._injector.get(NotificationService);
    notificationService.notify({
      title: notification.title,
      content: this._component || notification.text,
      severity: Defined.orElse(notification.severity, 'info'),
      duration: notification.duration,
      group: notification.group,
      input: notification.payload,
      cssClass: notification.cssClass,
    });
  }
}
