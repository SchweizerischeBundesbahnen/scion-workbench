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
import {ɵWorkbenchView} from './ɵworkbench-view.model';
import {WorkbenchView} from './workbench-view.model';
import {ViewId} from '../workbench.identifiers';
import {WORKBENCH_ELEMENT} from '../workbench-element-references';
import {WorkbenchViewRegistry} from './workbench-view.registry';

/**
 * DI token to register providers available for DI if in the context of a workbench view.
 */
export const WORKBENCH_VIEW_CONTEXT = new InjectionToken<Provider[]>('WORKBENCH_VIEW_CONTEXT');

/**
 * Provides providers available for DI if in the context of a workbench view.
 */
export function provideWorkbenchViewContext(): Provider[] {
  return [
    {
      provide: WORKBENCH_VIEW_CONTEXT,
      useFactory: (): Provider[] => [
        provideWorkbenchDialogService(),
        provideWorkbenchMessageBoxService(),
        provideWorkbenchPopupService(),
        provideMenuService(),
        provideMenuContextProvider(() => {
          return new Map().set(WorkbenchMenuContexts.ViewId, inject(WorkbenchView).id);
        }),
        provideMenuAcceleratorTargetProvider(() => {
          return inject(ɵWorkbenchView).slot.portal.element;
        }),
      ],
      multi: true,
    },
    /*
    * Provide menu injection context providers at the root injector level to support view-specific menus located outside a view component,
    * like view menus contributed to the part toolbar or view contextmenu.
    */
    provideMenuInjectionContextProvider(context => {
      const viewId = context.get(WorkbenchMenuContexts.ViewId) as ViewId | undefined;
      if (viewId) {
        return [
          {provide: ɵWorkbenchView, useValue: inject(WorkbenchViewRegistry).get(viewId)},
          {provide: WorkbenchView, useExisting: ɵWorkbenchView},
          {provide: WORKBENCH_ELEMENT, useExisting: ɵWorkbenchView},
          ...inject(WORKBENCH_VIEW_CONTEXT),
        ];
      }
      return [];
    }),
  ];
}
