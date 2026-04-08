/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {computed, EnvironmentProviders, inject, makeEnvironmentProviders} from '@angular/core';
import {SciMenuContextProvider} from '@scion/sci-components/menu';
import {WorkbenchView} from '../view/workbench-view.model';
import {WorkbenchPart} from '../part/workbench-part.model';
import {WorkbenchDialog} from '../dialog/workbench-dialog.model';
import {WorkbenchNotification} from '../notification/workbench-notification.model';
import {MaybeSignal} from '@scion/sci-components/common';

class WorkbenchMenuContextProvider implements SciMenuContextProvider {

  /** @inheritDoc */
  public provideContext(): MaybeSignal<Map<string, unknown> | undefined> {
    const view = inject(WorkbenchView, {optional: true});
    if (view) {
      return computed(() => new Map<string, unknown>()
        .set(WorkbenchMenuContextKeys.ViewId, view.id)
        .set(WorkbenchMenuContextKeys.PartId, view.part().id)
        .set(WorkbenchMenuContextKeys.Peripheral, view.part().peripheral())
        .set(WorkbenchMenuContextKeys.MainArea, view.part().isInMainArea));
    }

    const part = inject(WorkbenchPart, {optional: true});
    if (part) {
      return computed(() => new Map<string, unknown>()
        .set(WorkbenchMenuContextKeys.PartId, part.id)
        .set(WorkbenchMenuContextKeys.ViewId, PART_CONTEXT_VIEW_ID)
        .set(WorkbenchMenuContextKeys.Peripheral, part.peripheral())
        .set(WorkbenchMenuContextKeys.MainArea, part.isInMainArea));
    }

    const dialog = inject(WorkbenchDialog, {optional: true});
    if (dialog) {
      return new Map<string, unknown>().set(WorkbenchMenuContextKeys.DialogId, dialog.id);
    }

    const notification = inject(WorkbenchNotification, {optional: true});
    if (notification) {
      return new Map<string, unknown>().set(WorkbenchMenuContextKeys.NotificationId, notification.id);
    }

    return undefined;
  }
}

export function provideWorkbenchMenuContextProvider(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {provide: SciMenuContextProvider, useClass: WorkbenchMenuContextProvider},
  ]);
}

/**
 * Default value for `viewId` if in the context of a part.
 */
export const PART_CONTEXT_VIEW_ID = null;

/**
 * Workbench context keys used by workbench menus.
 */
export enum WorkbenchMenuContextKeys {
  ViewId = 'viewId',
  PartId = 'partId',
  Peripheral = 'peripheral',
  MainArea = 'mainArea',
  DialogId = 'dialogId',
  NotificationId = 'notificationId',
}
