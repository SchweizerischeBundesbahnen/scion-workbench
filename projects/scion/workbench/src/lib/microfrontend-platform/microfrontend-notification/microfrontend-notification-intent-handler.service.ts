/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Inject, Injectable, OnDestroy, Optional } from '@angular/core';
import { IntentClient, IntentMessage, ManifestService, MessageClient, MessageHeaders, ResponseStatusCodes } from '@scion/microfrontend-platform';
import { WorkbenchCapabilities, WorkbenchNotificationConfig } from '@scion/workbench-client';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Logger, LoggerNames } from '../../logging';
import { SafeRunner } from '../../safe-runner';
import { NotificationService } from '../../notification/notification.service';
import { MicrofrontendNotificationProvider } from './microfrontend-notification-provider';
import { Beans } from '@scion/toolkit/bean-manager';
import { Maps } from '@scion/toolkit/util';

/**
 * Handles notification intents, displaying a notification using {@link NotificationService}.
 *
 * This class is constructed before the Microfrontend Platform activates micro applications via {@link MICROFRONTEND_PLATFORM_PRE_ACTIVATION} DI token.
 */
@Injectable()
export class MicrofrontendNotificationIntentHandlerService implements OnDestroy {

  private _destroy$ = new Subject<void>();

  constructor(private _intentClient: IntentClient,
              private _messageClient: MessageClient,
              private _notificationService: NotificationService,
              private _logger: Logger,
              private _safeRunner: SafeRunner,
              @Optional() @Inject(MicrofrontendNotificationProvider) notificationProviders: MicrofrontendNotificationProvider[]) {
    (notificationProviders || []).forEach(provider => {
      this.registerNotificationCapability(provider);
      this.handleNotificationIntents(provider);
    });
  }

  /**
   * Registers the notification capability in the host app.
   */
  private registerNotificationCapability(provider: MicrofrontendNotificationProvider): void {
    Beans.get(ManifestService).registerCapability({
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
    this._intentClient.observe$<WorkbenchNotificationConfig>(intentSelector)
      .pipe(takeUntil(this._destroy$))
      .subscribe(intentRequest => this._safeRunner.run(async () => {
        this._logger.debug(() => `Handling ${WorkbenchCapabilities.Notification} intent`, LoggerNames.MICROFRONTEND, intentRequest);
        const replyTo = intentRequest.headers.get(MessageHeaders.ReplyTo);
        try {
          this.onNotificationIntent(intentRequest, provider);
          await this._messageClient.publish(replyTo, undefined, {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.OK)});
        }
        catch (error) {
          await this._messageClient.publish(replyTo, readErrorMessage(error), {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.ERROR)});
        }
      }));
  }

  /**
   * Method invoked when receiving a notification intent.
   */
  private onNotificationIntent(intentRequest: IntentMessage<WorkbenchNotificationConfig>, provider: MicrofrontendNotificationProvider): void {
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
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}

/**
 * Returns the error message if given an error object, or the `toString` representation otherwise.
 */
function readErrorMessage(error: any): string {
  if (error instanceof Error) {
    return error.message;
  }
  return error?.toString();
}
