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
import {IntentClient} from '@scion/microfrontend-platform';
import {WorkbenchCapabilities, WorkbenchNotificationConfig} from '@scion/workbench-client';
import {Logger, LoggerNames} from '../../logging';
import {NotificationService} from '../../notification/notification.service';
import {provideMicrofrontendPlatformInitializer} from '../microfrontend-platform-initializer.provider';

/**
 * Installs an intent handler to show text notifications.
 */
function installNotificationIntentHandler(): void {
  const intentClient = inject(IntentClient);
  const notificationService = inject(NotificationService);
  const logger = inject(Logger);

  intentClient.onIntent<WorkbenchNotificationConfig, void>({type: WorkbenchCapabilities.Notification, qualifier: {}}, ({body: config}) => {
    logger.debug(() => 'Showing notification', LoggerNames.MICROFRONTEND, config);
    notificationService.notify({
      title: config?.title,
      content: config?.content ? config.content as string : '',
      severity: config?.severity,
      duration: config?.duration,
      group: config?.group,
      cssClass: config?.cssClass,
    });
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
