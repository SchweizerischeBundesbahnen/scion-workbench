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
import {ɵWorkbenchPopup} from './ɵworkbench-popup.model';
import {WorkbenchPopup} from './workbench-popup.model';
import {PopupId} from '../workbench.identifiers';
import {WORKBENCH_ELEMENT} from '../workbench-element-references';
import {WorkbenchPopupRegistry} from './workbench-popup.registry';

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
      provideMenuService(),
      provideMenuContextProvider(() => {
        return new Map().set(WorkbenchMenuContexts.PopupId, inject(WorkbenchPopup).id);
      }),
      provideMenuAcceleratorTargetProvider(() => {
        return inject(ɵWorkbenchPopup).element;
      }),
      provideMenuInjectionContextProvider(context => {
        const popupId = context.get(WorkbenchMenuContexts.PopupId) as PopupId;
        return [
          {provide: ɵWorkbenchPopup, useValue: inject(WorkbenchPopupRegistry).get(popupId)},
          {provide: WorkbenchPopup, useExisting: ɵWorkbenchPopup},
          {provide: WORKBENCH_ELEMENT, useExisting: ɵWorkbenchPopup},
          ...inject(WORKBENCH_POPUP_CONTEXT),
        ];
      }),
    ],
    multi: true,
  };
}
