/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Inject, Injectable, Optional } from '@angular/core';
import { IntentClient, ManifestService } from '@scion/microfrontend-platform';
import { WorkbenchCapabilities, WorkbenchNotificationCapability, WorkbenchNotificationConfig } from '@scion/workbench-client';
import { Logger, LoggerNames } from '../../logging';
import { NotificationService } from '../../notification/notification.service';
import { MicrofrontendNotificationProvider } from './microfrontend-notification-provider';
import { Beans } from '@scion/toolkit/bean-manager';
import { Maps } from '@scion/toolkit/util';
import { WorkbenchInitializer } from '../../startup/workbench-initializer';

/**
 * Handles notification intents, displaying a notification using {@link NotificationService}.
 *
 * This class is constructed before the Microfrontend Platform activates micro applications via {@link POST_MICROFRONTEND_PLATFORM_CONNECT} DI token.
 */
@Injectable()
export class MicrofrontendNotificationIntentHandlerService implements WorkbenchInitializer {

  private _notificationProviders: MicrofrontendNotificationProvider[];

  constructor(private _intentClient: IntentClient,
              private _notificationService: NotificationService,
              private _logger: Logger,
              @Optional() @Inject(MicrofrontendNotificationProvider) notificationProviders: MicrofrontendNotificationProvider[]) {
    this._notificationProviders = notificationProviders || [];
  }

  public async init(): Promise<void> {
    for (const notificationProvider of this._notificationProviders) {
      await this.registerNotificationCapability(notificationProvider);
      this.handleNotificationIntents(notificationProvider);
    }
  }

  /**
   * Registers the notification capability in the host app.
   */
  private async registerNotificationCapability(provider: MicrofrontendNotificationProvider): Promise<void> {
    await Beans.get(ManifestService).registerCapability<WorkbenchNotificationCapability>({
      type: WorkbenchCapabilities.Notification,
      qualifier: provider.qualifier,
      private: false,
      description: provider.description,
      optionalParams: provider.optionalParams,
      requiredParams: provider.requiredParams,
    });
  }

  /**
   * Subscribes to notification intents and for each intent, displays a notification with the component as configured by the provider.
   */
  private handleNotificationIntents(provider: MicrofrontendNotificationProvider): void {
    const intentSelector = {type: WorkbenchCapabilities.Notification, qualifier: provider.qualifier};
    this._intentClient.onIntent<WorkbenchNotificationConfig>(intentSelector, intentRequest => {
      this._logger.debug(() => `Handling ${WorkbenchCapabilities.Notification} intent`, LoggerNames.MICROFRONTEND, intentRequest);

      const params: Map<string, any> = intentRequest.intent.params;
      const config: WorkbenchNotificationConfig = intentRequest.body;

      this._notificationService.notify({
        title: config.title,
        content: provider.component,
        componentInput: new Map([
          ...intentRequest.headers,
          ...params,
          ...Maps.coerce(intentRequest.intent.qualifier),
          ['$implicit', config.content],
        ]),
        severity: config.severity,
        duration: config.duration,
        group: provider.group ?? config.group,
        groupInputReduceFn: provider.groupInputReduceFn,
        cssClass: config.cssClass,
      });
    });
  }
}

