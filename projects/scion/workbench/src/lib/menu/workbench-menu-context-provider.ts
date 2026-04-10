/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {computed, EnvironmentProviders, inject, makeEnvironmentProviders, Provider} from '@angular/core';
import {SciMenuContextProvider} from '@scion/sci-components/menu';
import {WorkbenchView} from '../view/workbench-view.model';
import {WorkbenchPart} from '../part/workbench-part.model';
import {WorkbenchDialog} from '../dialog/workbench-dialog.model';
import {WorkbenchNotification} from '../notification/workbench-notification.model';
import {MaybeSignal} from '@scion/sci-components/common';
import {WORKBENCH_PART_CONTEXT} from '../part/workbench-part-context.provider';
import {WORKBENCH_ELEMENT} from '../workbench-element-references';
import {ɵWorkbenchPart} from '../part/ɵworkbench-part.model';
import {WORKBENCH_VIEW_CONTEXT} from '../view/workbench-view-context.provider';
import {ɵWorkbenchView} from '../view/ɵworkbench-view.model';
import {WORKBENCH_DIALOG_CONTEXT} from '../dialog/workbench-dialog-context.provider';
import {ɵWorkbenchDialog} from '../dialog/ɵworkbench-dialog.model';
import {WORKBENCH_NOTIFICATION_CONTEXT} from '../notification/workbench-notification-context.provider';
import {ɵWorkbenchNotification} from '../notification/ɵworkbench-notification.model';
import {WorkbenchPopup} from '../popup/workbench-popup.model';
import {WORKBENCH_POPUP_CONTEXT} from '../popup/workbench-popup-context.provider';
import {ɵWorkbenchPopup} from '../popup/ɵworkbench-popup.model';
import {WorkbenchPartRegistry} from '../part/workbench-part.registry';
import {WorkbenchViewRegistry} from '../view/workbench-view.registry';
import {WorkbenchNotificationRegistry} from '../notification/workbench-notification.registry';
import {WorkbenchDialogRegistry} from '../dialog/workbench-dialog.registry';
import {WorkbenchPopupRegistry} from '../popup/workbench-popup.registry';
import {DialogId, NotificationId, PartId, PopupId, ViewId} from '../workbench.identifiers';

class WorkbenchMenuContextProvider implements SciMenuContextProvider {

  private readonly _partRegistry = inject(WorkbenchPartRegistry);
  private readonly _viewRegistry = inject(WorkbenchViewRegistry);
  private readonly _dialogRegistry = inject(WorkbenchDialogRegistry);
  private readonly _popupRegistry = inject(WorkbenchPopupRegistry);
  private readonly _notificationRegistry = inject(WorkbenchNotificationRegistry);

  /** @inheritDoc */
  public injectEnvironmentContext(): MaybeSignal<Map<string, unknown>> {
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

    return NULL_CONTEXT;
  }

  /** @inheritDoc */
  public provideInjectionContext?(context: Map<string, unknown>): Provider[] {
    const viewId = context.get(WorkbenchMenuContextKeys.ViewId) as ViewId | undefined;
    const partId = context.get(WorkbenchMenuContextKeys.PartId) as PartId | undefined;
    if (viewId && partId) {
      const view = this._viewRegistry.get(viewId);
      const part = this._partRegistry.get(partId);

      return [
        {provide: ɵWorkbenchView, useValue: view},
        {provide: WorkbenchView, useExisting: ɵWorkbenchView},
        {provide: ɵWorkbenchPart, useValue: part},
        {provide: WorkbenchPart, useExisting: ɵWorkbenchPart},
        {provide: WORKBENCH_ELEMENT, useExisting: ɵWorkbenchView},
        inject(WORKBENCH_VIEW_CONTEXT, {optional: true}) ?? [],
      ];
    }

    if (partId) {
      const part = this._partRegistry.get(partId);
      return [
        {provide: ɵWorkbenchPart, useValue: part},
        {provide: WorkbenchPart, useExisting: ɵWorkbenchPart},
        {provide: WORKBENCH_ELEMENT, useExisting: ɵWorkbenchPart},
        inject(WORKBENCH_PART_CONTEXT, {optional: true}) ?? [],
      ];
    }

    if (viewId) {
      const view = this._viewRegistry.get(viewId);

      return [
        {provide: ɵWorkbenchView, useValue: view},
        {provide: WorkbenchView, useExisting: ɵWorkbenchView},
        {provide: WORKBENCH_ELEMENT, useExisting: ɵWorkbenchView},
        inject(WORKBENCH_VIEW_CONTEXT, {optional: true}) ?? [],
      ];
    }

    const dialogId = context.get(WorkbenchMenuContextKeys.DialogId) as DialogId | undefined;
    if (dialogId) {
      const dialog = this._dialogRegistry.get(dialogId);
      return [
        {provide: ɵWorkbenchDialog, useValue: dialog},
        {provide: WorkbenchDialog, useExisting: ɵWorkbenchDialog},
        {provide: WORKBENCH_ELEMENT, useExisting: ɵWorkbenchDialog},
        inject(WORKBENCH_DIALOG_CONTEXT, {optional: true}) ?? [],
      ];
    }

    const popupId = context.get(WorkbenchMenuContextKeys.PopupId) as PopupId | undefined;
    if (popupId) {
      const popup = this._popupRegistry.get(popupId);
      return [
        {provide: ɵWorkbenchPopup, useValue: popup},
        {provide: WorkbenchPopup, useExisting: ɵWorkbenchPopup},
        {provide: WORKBENCH_ELEMENT, useExisting: ɵWorkbenchPopup},
        inject(WORKBENCH_POPUP_CONTEXT, {optional: true}) ?? [],
      ];
    }

    const notificationId = context.get(WorkbenchMenuContextKeys.NotificationId) as NotificationId | undefined;
    if (notificationId) {
      const notification = this._notificationRegistry.get(notificationId);
      return [
        {provide: ɵWorkbenchNotification, useValue: notification},
        {provide: WorkbenchNotification, useExisting: ɵWorkbenchNotification},
        {provide: WORKBENCH_ELEMENT, useExisting: ɵWorkbenchNotification},
        inject(WORKBENCH_NOTIFICATION_CONTEXT, {optional: true}) ?? [],
      ];
    }

    return [];
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
  DialogId = 'dialogId',
  PopupId = 'popupId',
  NotificationId = 'notificationId',
  Peripheral = 'peripheral',
  MainArea = 'mainArea',
}

const NULL_CONTEXT = new Map<string, unknown>();
