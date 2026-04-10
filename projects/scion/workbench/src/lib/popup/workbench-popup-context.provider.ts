/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
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
import {provideWorkbenchPopupService} from './workbench-popup-service.provider';

/**
 * DI token to register providers available for DI if in the context of a workbench popup.
 */
export const WORKBENCH_POPUP_CONTEXT = new InjectionToken<Provider[]>('WORKBENCH_POPUP_CONTEXT');

/**
 * Provides providers available for DI if in the context of a workbench popup.
 */
export function provideWorkbenchPopupContext(): Provider {
  return {
    provide: WORKBENCH_POPUP_CONTEXT,
    useFactory: (): Provider[] => [
      provideWorkbenchDialogService(),
      provideWorkbenchMessageBoxService(),
      provideWorkbenchPopupService(),
    ],
    multi: true,
  };
}
