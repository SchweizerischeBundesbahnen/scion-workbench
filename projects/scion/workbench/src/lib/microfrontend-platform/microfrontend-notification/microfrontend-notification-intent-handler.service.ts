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
import {IntentClient} from '@scion/microfrontend-platform';
import {WorkbenchCapabilities, WorkbenchNotificationConfig} from '@scion/workbench-client';
import {Logger, LoggerNames} from '../../logging';
import {NotificationService} from '../../notification/notification.service';

/**
 * Handles intents that refer to the built-in notification capability, allowing microfrontends to display simple text notifications.
 *
 * This class is constructed after connected to the SCION Microfrontend Platform via {@link MICROFRONTEND_PLATFORM_POST_STARTUP} DI token.
 *
 * @see WorkbenchHostManifestInterceptor
 * @see MICROFRONTEND_PLATFORM_POST_STARTUP
 */
@Injectable()
export class MicrofrontendNotificationIntentHandler {

  constructor(intentClient: IntentClient, notificationService: NotificationService, logger: Logger) {
    intentClient.onIntent<WorkbenchNotificationConfig, void>({type: WorkbenchCapabilities.Notification, qualifier: {}}, ({body: config}) => {
      logger.debug(() => 'Showing notification', LoggerNames.MICROFRONTEND, config);
      notificationService.notify({
        title: config?.title,
        content: config?.content,
        severity: config?.severity,
        duration: config?.duration,
        group: config?.group,
        cssClass: config?.cssClass,
      });
    });
  }
}
