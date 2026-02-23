/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {InjectionToken, Provider} from '@angular/core';
import {provideWorkbenchMessageBoxService} from '../message-box/workbench-message-box-service.provider';
import {provideWorkbenchDialogService} from '../dialog/workbench-dialog-service.provider';
import {provideWorkbenchPopupService} from '../popup/workbench-popup-service.provider';
import {provideSciMenuService} from '@scion/sci-components/menu';

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
      provideSciMenuService(),
    ],
    multi: true,
  };
}
