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
import {provideWorkbenchDialogService} from '../dialog/ɵworkbench-dialog.service';
import {provideWorkbenchMessageBoxService} from '../message-box/ɵworkbench-message-box.service';
import {provideWorkbenchPopupService} from '../popup/ɵworkbench-popup.service';

/**
 * DI token to register providers available for DI if in the context of a workbench part.
 */
export const WORKBENCH_PART_CONTEXT = new InjectionToken<Provider[]>('WORKBENCH_PART_CONTEXT');

/**
 * Provides providers available for DI if in the context of a workbench part.
 */
export function provideWorkbenchPartContext(): Provider {
  return {
    provide: WORKBENCH_PART_CONTEXT,
    useFactory: (): Provider[] => [
      provideWorkbenchDialogService(),
      provideWorkbenchMessageBoxService(),
      provideWorkbenchPopupService(),
    ],
    multi: true,
  };
}
