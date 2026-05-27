/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
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
import {WorkbenchMenuContexts} from '../menu/workbench-menu-environment';
import {WorkbenchDialog} from './workbench-dialog.model';
import {ɵWorkbenchDialog} from './ɵworkbench-dialog.model';
import {DialogId} from '../workbench.identifiers';
import {WORKBENCH_ELEMENT} from '../workbench-element-references';
import {WorkbenchDialogRegistry} from './workbench-dialog.registry';

/**
 * DI token to register providers available for DI if in the context of a workbench dialog.
 */
export const WORKBENCH_DIALOG_CONTEXT = new InjectionToken<Provider[]>('WORKBENCH_DIALOG_CONTEXT');

/**
 * Provides providers available for DI if in the context of a workbench dialog.
 */
export function provideWorkbenchDialogContext(): Provider {
  return {
    provide: WORKBENCH_DIALOG_CONTEXT,
    useFactory: (): Provider[] => [
      provideWorkbenchDialogService(),
      provideWorkbenchMessageBoxService(),
      provideWorkbenchPopupService(),
      provideMenuService(),
      provideMenuContextProvider(() => {
        return new Map().set(WorkbenchMenuContexts.DialogId, inject(WorkbenchDialog).id);
      }),
      provideMenuAcceleratorTargetProvider(() => {
        return inject(ɵWorkbenchDialog).element;
      }),
      provideMenuInjectionContextProvider(context => {
        const dialogId = context.get(WorkbenchMenuContexts.DialogId) as DialogId;
        return [
          {provide: ɵWorkbenchDialog, useValue: inject(WorkbenchDialogRegistry).get(dialogId)},
          {provide: WorkbenchDialog, useExisting: ɵWorkbenchDialog},
          {provide: WORKBENCH_ELEMENT, useExisting: ɵWorkbenchDialog},
          ...inject(WORKBENCH_DIALOG_CONTEXT),
        ];
      }),
    ],
    multi: true,
  };
}
