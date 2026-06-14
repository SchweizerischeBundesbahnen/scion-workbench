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
import {Beans} from '@scion/toolkit/bean-manager';
import {WorkbenchCapabilities} from '../workbench-capabilities.enum';
import {Maps} from '@scion/toolkit/util';
import {firstValueFrom} from 'rxjs';
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
  public async show(message: Translatable, options?: WorkbenchNotificationOptions): Promise<void>;
  public async show(qualifier: Qualifier, options?: WorkbenchNotificationOptions): Promise<void>;
  public async show(message: Translatable | Qualifier | null, options?: WorkbenchNotificationOptions): Promise<void> {
    const intent = ((): Intent => {
      if (typeof message === 'string' || message === null) {
        return {type: WorkbenchCapabilities.Notification, qualifier: {}, params: new Map().set(eNOTIFICATION_MESSAGE_PARAM, message ?? undefined)};
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
}
