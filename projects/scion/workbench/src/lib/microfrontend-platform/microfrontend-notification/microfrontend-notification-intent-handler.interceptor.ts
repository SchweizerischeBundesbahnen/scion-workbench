/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {inject, Injectable, runInInjectionContext, StaticProvider} from '@angular/core';
import {Handler, IntentInterceptor, IntentMessage, MessageClient, MessageHeaders, ResponseStatusCodes} from '@scion/microfrontend-platform';
import {eNOTIFICATION_MESSAGE_PARAM, WorkbenchCapabilities, WorkbenchNotificationCapability, WorkbenchNotificationConfig, ɵWorkbenchNotificationCommand} from '@scion/workbench-client';
import {Logger, LoggerNames} from '../../logging';
import {Beans} from '@scion/toolkit/bean-manager';
import {Arrays} from '@scion/toolkit/util';
import {MicrofrontendNotificationComponent} from './microfrontend-notification.component';
import {createRemoteTranslatable} from '../microfrontend-text/remote-text-provider';
import {MicrofrontendHostComponent} from '../microfrontend-host/microfrontend-host.component';
import {ActivatedMicrofrontend} from '../microfrontend-host/microfrontend-host.model';
import {prune} from '../../common/prune.util';
import {Microfrontends} from '../common/microfrontend.util';
import {WorkbenchNotificationService} from "../../notification/workbench-notification.service";
import {MicrofrontendHostNotification} from '../microfrontend-host-notification/microfrontend-host-notification.model';
import {ɵWorkbenchNotification} from '../../notification/ɵworkbench-notification.model';
import {TEXT_NOTIFICATION_CAPABILITY_IDENTITY, TEXT_NOTIFICATION_CAPABILITY_IDENTITY_PROPERTY} from '../microfrontend-host-notification/notification-text-message/notification-text-message.component';

/**
 * Handles notification intents, opening a notification based on resolved capability.
 *
 * Microfrontends of the host are displayed in {@link MicrofrontendHostComponent}, microfrontends of other applications in {@link MicrofrontendNotificationComponent}.
 *
 * Notification intents are handled in this interceptor and are not transported to the providing application to support applications not connected to the SCION Workbench.
 */
@Injectable(/* DO NOT provide via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
export class MicrofrontendNotificationIntentHandler implements IntentInterceptor {

  private readonly _notificationService = inject(WorkbenchNotificationService);
  private readonly _logger = inject(Logger);

  /**
   * Notification intents are handled in this interceptor and then swallowed.
   */
  public intercept(intentMessage: IntentMessage, next: Handler<IntentMessage>): Promise<void> {
    if (intentMessage.intent.type === WorkbenchCapabilities.Notification) {
      const replyTo = intentMessage.headers.get(MessageHeaders.ReplyTo) as string;

      this.showNotification(intentMessage as IntentMessage<ɵWorkbenchNotificationCommand | WorkbenchNotificationConfig>);
      void Beans.get(MessageClient).publish(replyTo, undefined, {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.TERMINAL)});

      // Swallow the intent and do not pass it to other interceptors or handlers down the chain.
      return Promise.resolve();
    }
    else {
      return next.handle(intentMessage);
    }
  }

  /**
   * Displays the microfrontend declared by the resolved capability in a notification.
   */
  private showNotification(intentMessage: IntentMessage<ɵWorkbenchNotificationCommand | WorkbenchNotificationConfig>): void {
    const command: ɵWorkbenchNotificationCommand | WorkbenchNotificationConfig = intentMessage.body!;
    const capability = intentMessage.capability as WorkbenchNotificationCapability;
    const params = intentMessage.intent.params ?? new Map<string, unknown>();
    const referrer = intentMessage.headers.get(MessageHeaders.AppSymbolicName) as string;
    const isHostProvider = Microfrontends.isHostProvider(capability);
    const isTextMessage = capability.properties[TEXT_NOTIFICATION_CAPABILITY_IDENTITY_PROPERTY] === TEXT_NOTIFICATION_CAPABILITY_IDENTITY;
    const isLegacyApi = isTextMessage && !intentMessage.intent.params?.has(eNOTIFICATION_MESSAGE_PARAM);

    if (isLegacyApi) {
      params.set(eNOTIFICATION_MESSAGE_PARAM, (command as WorkbenchNotificationConfig).content);
    }

    this._logger.debug(() => 'Handling microfrontend notification intent', LoggerNames.MICROFRONTEND, command);
    return this._notificationService.show(isHostProvider ? MicrofrontendHostComponent : MicrofrontendNotificationComponent,  prune({
      inputs: isHostProvider ? {} : {capability, params, referrer},
      providers: isHostProvider ? [provideActivatedMicrofrontend(capability, params, referrer)] : undefined,
      title: createRemoteTranslatable(command.title, {appSymbolicName: referrer}),
      severity: command.severity,
      duration: isLegacyApi && typeof command.duration === 'number' ? command.duration * 1000 : command.duration,
      group: command.group,
      cssClass: Arrays.coerce(capability.properties.cssClass).concat(Arrays.coerce(command.cssClass)),
    }));
  }
}

/**
 * Provides {@link ActivatedMicrofrontend} for injection in the host microfrontend.
 */
function provideActivatedMicrofrontend(capability: WorkbenchNotificationCapability, params: Map<string, unknown>, referrer: string): StaticProvider {
  return {
    provide: ActivatedMicrofrontend,
    useFactory: () => {
      const notification = inject(ɵWorkbenchNotification);
      // Create in notification's injection context to bind 'MicrofrontendNotification' to the notification's lifecycle.
      return runInInjectionContext(notification.injector, () => new MicrofrontendHostNotification(notification, capability, params, referrer));
    },
  };
}
