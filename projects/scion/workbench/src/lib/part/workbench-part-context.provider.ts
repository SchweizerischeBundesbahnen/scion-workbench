/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {computed, inject, InjectionToken, Provider, runInInjectionContext} from '@angular/core';
import {provideWorkbenchMessageBoxService} from '../message-box/workbench-message-box-service.provider';
import {provideWorkbenchDialogService} from '../dialog/workbench-dialog-service.provider';
import {provideWorkbenchPopupService} from '../popup/workbench-popup-service.provider';
import {PART_NULL_ACTIVE_VIEW_ID, WorkbenchMenuContexts} from '../menu/workbench-menu-environment';
import {ɵWorkbenchPart} from './ɵworkbench-part.model';
import {WorkbenchPart} from './workbench-part.model';
import {WorkbenchPartRegistry} from './workbench-part.registry';
import {WORKBENCH_ELEMENT} from '../workbench-element-references';
import {PartId} from '../workbench.identifiers';
import {provideMenuAcceleratorTargetProvider, provideMenuContextProvider, provideMenuInjectionContextProvider, provideMenuService} from '@scion/components/menu';
import {WorkbenchView} from '../view/workbench-view.model';
import {coerceSignal} from '@scion/components/common';
import {ɵWorkbenchView} from '../view/ɵworkbench-view.model';

/**
 * DI token to register providers available for DI if in the context of a workbench part.
 */
export const WORKBENCH_PART_CONTEXT = new InjectionToken<Provider[]>('WORKBENCH_PART_CONTEXT');

/**
 * Provides providers available for DI if in the context of a workbench part.
 */
export function provideWorkbenchPartContext(): Provider[] {
  return [
    {
      provide: WORKBENCH_PART_CONTEXT,
      useFactory: (): Provider[] => [
        provideWorkbenchDialogService(),
        provideWorkbenchMessageBoxService(),
        provideWorkbenchPopupService(),
        provideMenuService(),
      ],
      multi: true,
    },
    /*
     * Provide menu context at the root injector level to not break views dragged to a different part.
     * Otherwise, the view would refer to the wrong part since the injector hierarchy is static.
     */
    provideMenuContextProvider(callingInjector => runInInjectionContext(callingInjector, () => {
      const part = coerceSignal(inject(WorkbenchView, {optional: true})?.part ?? inject(WorkbenchPart, {optional: true}) ?? undefined);
      return part && computed(() => new Map()
        .set(WorkbenchMenuContexts.PartId, part().id)
        .set(WorkbenchMenuContexts.ViewId, PART_NULL_ACTIVE_VIEW_ID) // Prevent contribution of part-content specific menus if a view is active.
        .set(WorkbenchMenuContexts.Peripheral, part().peripheral())
        .set(WorkbenchMenuContexts.MainArea, part().isInMainArea));
    })),
    /*
     * Provide menu accelerator targets at the root injector level to not break views dragged to a different part.
     * Otherwise, the view would refer to the wrong part since the injector hierarchy is static.
     */
    provideMenuAcceleratorTargetProvider(callingInjector => runInInjectionContext(callingInjector, () => {
      const part = coerceSignal(inject(ɵWorkbenchView, {optional: true})?.part ?? inject(ɵWorkbenchPart, {optional: true}) ?? undefined);
      return part && computed(() => part().slot.portal.element());
    })),
    /*
     * Provide menu injection context providers at the root injector level to support view-specific menus located outside a part component,
     * like view menus contributed to the view contextmenu.
     */
    provideMenuInjectionContextProvider(context => {
      const partId = context.get(WorkbenchMenuContexts.PartId) as PartId | undefined;
      if (partId) {
        return [
          {provide: ɵWorkbenchPart, useValue: inject(WorkbenchPartRegistry).get(partId)},
          {provide: WorkbenchPart, useExisting: ɵWorkbenchPart},
          {provide: WORKBENCH_ELEMENT, useExisting: ɵWorkbenchPart},
          ...inject(WORKBENCH_PART_CONTEXT),
        ];
      }
      return [];
    }),
  ];
}
