/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Beans, Initializer} from '@scion/toolkit/bean-manager';
import {ContextService} from '@scion/microfrontend-platform';
import {WORKBENCH_ELEMENT} from '../workbench.model';
import {ɵWorkbenchNotification} from './ɵworkbench-notification';
import {ɵNOTIFICATION_CONTEXT, ɵNotificationContext} from './ɵworkbench-notification-context';
import {WorkbenchNotification} from './workbench-notification';

/**
 * Registers {@link WorkbenchNotification} in the bean manager if in the context of a workbench notification.
 *
 * @internal
 */
export class WorkbenchNotificationInitializer implements Initializer {

  public async init(): Promise<void> {
    const notificationContext = await Beans.get(ContextService).lookup<ɵNotificationContext>(ɵNOTIFICATION_CONTEXT);
    if (notificationContext !== null) {
      Beans.register(WorkbenchNotification, {useValue: new ɵWorkbenchNotification(notificationContext)});
      Beans.register(WORKBENCH_ELEMENT, {useExisting: WorkbenchNotification});
    }
  }
}
