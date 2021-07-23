/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {Injectable} from '@angular/core';
import {IntentClient, ManifestService} from '@scion/microfrontend-platform';
import {WorkbenchCapabilities, WorkbenchNotificationCapability, WorkbenchNotificationConfig} from '@scion/workbench-client';
import {Logger, LoggerNames} from '../../logging';
import {WorkbenchInitializer} from '../../startup/workbench-initializer';
import {NotificationService} from '../../notification/notification.service';

/**
 * Provides the built-in notification capability for microfrontends to show a plain text notification.
 *
 * This class is constructed before the Microfrontend Platform activates micro applications via {@link POST_MICROFRONTEND_PLATFORM_CONNECT} DI token.
 */
@Injectable()
export class MicrofrontendNotificationProvider implements WorkbenchInitializer {

  constructor(intentClient: IntentClient,
              notificationService: NotificationService,
              logger: Logger,
              private _manifestService: ManifestService) {
    intentClient.onIntent<WorkbenchNotificationConfig, void>({type: WorkbenchCapabilities.Notification, qualifier: {}}, ({body: config}) => {
      logger.debug(() => 'Showing notification', LoggerNames.MICROFRONTEND, config);
      notificationService.notify({
        ...config,
        content: config!.content ?? '',
      });
    });
  }

  public async init(): Promise<void> {
    await this._manifestService.registerCapability<WorkbenchNotificationCapability>({
      type: WorkbenchCapabilities.Notification,
      qualifier: {},
      private: false,
      description: 'Allows displaying a text notification to the user.',
    });
  }
}
