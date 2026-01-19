/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Intent, IntentClient, Qualifier, RequestError} from '@scion/microfrontend-platform';
import {WorkbenchNotificationConfig} from './workbench-notification.config';
import {Beans} from '@scion/toolkit/bean-manager';
import {WorkbenchCapabilities} from '../workbench-capabilities.enum';
import {Maps} from '@scion/toolkit/util';
import {firstValueFrom, lastValueFrom} from 'rxjs';
import {Translatable} from '../text/workbench-text-provider.model';
import {WorkbenchNotificationService} from './workbench-notification.service';
import {WorkbenchNotificationOptions} from './workbench-notification.options';
import {eNOTIFICATION_MESSAGE_PARAM, ɵWorkbenchNotificationCommand} from './workbench-notification-command';

/**
 * @ignore
 * @docs-private Not public API. For internal use only.
 */
export class ɵWorkbenchNotificationService implements WorkbenchNotificationService {

  /** @inheritDoc */
  public show(message: Translatable, options?: WorkbenchNotificationOptions): Promise<void>;
  public show(qualifier: Qualifier, options?: WorkbenchNotificationOptions): Promise<void>;
  public show(notification: WorkbenchNotificationConfig, qualifier?: Qualifier): Promise<void>;
  // TODO [Angular 22] Remove backward compatiblity. Replace content with content of `showNotification`
  public show(arg1: Translatable | Qualifier | WorkbenchNotificationConfig, arg2?: WorkbenchNotificationOptions | Qualifier): Promise<void> {
    // New API to open built-in text notification.
    if (typeof arg1 === 'string') {
      return this.showNotification(arg1, arg2);
    }

    // Legacy API.
    const config = arg1 as unknown as Partial<WorkbenchNotificationConfig>;
    if (!Object.keys(config).length || config.title || config.content || config.params || config.severity || config.duration || config.group || config.cssClass) {
      return this.showNotificationLegacy(arg1, arg2 as Qualifier | undefined);
    }

    // New API to open custom host notification.
    return this.showNotification(arg1 as Qualifier, arg2 as WorkbenchNotificationOptions | undefined);
  }

  private async showNotification(message: Translatable | Qualifier, options?: WorkbenchNotificationOptions): Promise<void> {
    const intent = ((): Intent => {
      if (typeof message === 'string') {
        return {type: WorkbenchCapabilities.Notification, qualifier: {}, params: new Map().set(eNOTIFICATION_MESSAGE_PARAM, message)};
      }
      else {
        return {type: WorkbenchCapabilities.Notification, qualifier: message, params: Maps.coerce(options?.params)};
      }
    })();
    const command: ɵWorkbenchNotificationCommand = {
      title: options?.title,
      severity: options?.severity,
      duration: options?.duration,
      group: options?.group,
      cssClass: options?.cssClass,
    };

    try {
      await firstValueFrom(Beans.get(IntentClient).request$<void>(intent, command), {defaultValue: undefined});
    }
    catch (error) {
      throw (error instanceof RequestError ? error.message : error);
    }
  }

  private async showNotificationLegacy(notification: Translatable | WorkbenchNotificationConfig, qualifier?: Qualifier): Promise<void> {
    const config: WorkbenchNotificationConfig = typeof notification === 'string' ? {content: notification} : notification;
    const params = Maps.coerce(config.params);

    const showNotification$ = Beans.get(IntentClient).request$<void>({type: WorkbenchCapabilities.Notification, qualifier, params}, config);
    try {
      await lastValueFrom(showNotification$, {defaultValue: undefined});
    }
    catch (error) {
      throw (error instanceof RequestError ? error.message : error);
    }
  }
}
