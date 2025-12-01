/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {EnvironmentProviders, inject, makeEnvironmentProviders} from '@angular/core';
import {IntentClient, MessageHeaders} from '@scion/microfrontend-platform';
import {eNOTIFICATION_MESSAGE_PARAM, Translatable, WorkbenchCapabilities, WorkbenchNotificationConfig, ɵWorkbenchNotificationCommand} from '@scion/workbench-client';
import {Logger, LoggerNames} from '../../logging';
import {provideMicrofrontendPlatformInitializer} from '../microfrontend-platform-initializer';
import {createRemoteTranslatable} from '../microfrontend-text/remote-text-provider';
import {WorkbenchNotificationService} from '../../notification/workbench-notification.service';
import {prune} from '../../common/prune.util';

/**
 * Installs an intent handler to show text notifications.
 */
function installNotificationIntentHandler(): void {
  const intentClient = inject(IntentClient);
  const notificationService = inject(WorkbenchNotificationService);
  const logger = inject(Logger);

  intentClient.onIntent<ɵWorkbenchNotificationCommand | WorkbenchNotificationConfig, void>({type: WorkbenchCapabilities.Notification, qualifier: {}}, request => {
    const command: ɵWorkbenchNotificationCommand | WorkbenchNotificationConfig = request.body!;
    const referrer = request.headers.get(MessageHeaders.AppSymbolicName) as string;
    const isLegacyApi = !request.intent.params?.has(eNOTIFICATION_MESSAGE_PARAM);
    const message = (isLegacyApi ? (command as WorkbenchNotificationConfig).content : request.intent.params?.get(eNOTIFICATION_MESSAGE_PARAM)) as Translatable | undefined ?? '';

    logger.debug(() => 'Showing notification', LoggerNames.MICROFRONTEND, command);

    notificationService.show(createRemoteTranslatable(message, {appSymbolicName: referrer}), prune({
      title: createRemoteTranslatable(command.title, {appSymbolicName: referrer}),
      severity: command.severity,
      duration: isLegacyApi && typeof command.duration === 'number' ? command.duration * 1000 : command.duration,
      group: command.group,
      cssClass: command.cssClass,
    }));
  });
}

/**
 * Provides a set of DI providers installing an intent handler to show text notifications.
 *
 * The notification capability is registered in {@link WorkbenchHostManifestInterceptor}.
 */
export function provideNotificationIntentHandler(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideMicrofrontendPlatformInitializer(() => installNotificationIntentHandler()),
  ]);
}
