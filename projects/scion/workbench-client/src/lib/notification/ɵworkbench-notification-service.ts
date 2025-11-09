/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {IntentClient, Qualifier, RequestError} from '@scion/microfrontend-platform';
import {WorkbenchNotificationConfig} from './workbench-notification.config';
import {Beans} from '@scion/toolkit/bean-manager';
import {WorkbenchCapabilities} from '../workbench-capabilities.enum';
import {Maps} from '@scion/toolkit/util';
import {lastValueFrom} from 'rxjs';
import {Translatable} from '../text/workbench-text-provider.model';
import {WorkbenchNotificationService} from './workbench-notification-service';

/**
 * @ignore
 * @docs-private Not public API. For internal use only.
 */
export class ɵWorkbenchNotificationService implements WorkbenchNotificationService {

  /** @inheritDoc */
  public async show(notification: Translatable | WorkbenchNotificationConfig, qualifier?: Qualifier): Promise<void> {
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
