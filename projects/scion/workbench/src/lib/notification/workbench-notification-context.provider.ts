/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {inject, InjectionToken, Provider} from '@angular/core';
import {provideWorkbenchMessageBoxService} from '../message-box/workbench-message-box-service.provider';
import {provideWorkbenchDialogService} from '../dialog/workbench-dialog-service.provider';
import {provideWorkbenchPopupService} from '../popup/workbench-popup-service.provider';
import {provideMenuAcceleratorTargetProvider, provideMenuContextProvider, provideMenuInjectionContextProvider, provideMenuService} from '@scion/components/menu';
import {ɵWorkbenchNotification} from './ɵworkbench-notification.model';
import {WORKBENCH_ELEMENT} from '../workbench-element-references';
import {WorkbenchNotificationRegistry} from './workbench-notification.registry';
import {WorkbenchMenuContexts} from '../menu/workbench-menu-environment';
import {WorkbenchNotification} from './workbench-notification.model';
import {NotificationId} from '../workbench.identifiers';

/**
 * DI token to register providers available for DI if in the context of a workbench notification.
 */
export const WORKBENCH_NOTIFICATION_CONTEXT = new InjectionToken<Provider[]>('WORKBENCH_NOTIFICATION_CONTEXT');

/**
 * Provides providers available for DI if in the context of a workbench notification.
 */
export function provideWorkbenchNotificationContext(): Provider {
  return {
    provide: WORKBENCH_NOTIFICATION_CONTEXT,
    useFactory: (): Provider[] => [
      provideWorkbenchDialogService(),
      provideWorkbenchMessageBoxService(),
      provideWorkbenchPopupService(),
      provideMenuService(),
      provideMenuContextProvider(() => {
        return new Map().set(WorkbenchMenuContexts.NotificationId, inject(WorkbenchNotification).id);
      }),
      provideMenuAcceleratorTargetProvider(() => {
        return inject(ɵWorkbenchNotification).portal.element;
      }),
      provideMenuInjectionContextProvider(context => {
        const notificationId = context.get(WorkbenchMenuContexts.NotificationId) as NotificationId;
        return [
          {provide: ɵWorkbenchNotification, useValue: inject(WorkbenchNotificationRegistry).get(notificationId)},
          {provide: WorkbenchNotification, useExisting: ɵWorkbenchNotification},
          {provide: WORKBENCH_ELEMENT, useExisting: ɵWorkbenchNotification},
          ...inject(WORKBENCH_NOTIFICATION_CONTEXT),
        ];
      }),
    ],
    multi: true,
  };
}
