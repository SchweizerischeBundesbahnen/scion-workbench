/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Beans} from '@scion/toolkit/bean-manager';
import {WorkbenchView} from '../view/workbench-view.model';
import {WorkbenchMenuContextKeys} from './workbench-client-menu.model';
import {WorkbenchPart} from '../part/workbench-part.model';
import {WorkbenchDialog} from '../dialog/workbench-dialog.model';
import {WorkbenchNotification} from '../notification/workbench-notification.model';
import {WorkbenchPopup} from '../popup/workbench-popup.model';

export function provideMenuEnvironmentContext(): Map<string, unknown> {
  const view = Beans.opt(WorkbenchView);
  if (view) {
    return new Map<string, unknown>().set(WorkbenchMenuContextKeys.ViewId, view.id);
  }

  const part = Beans.opt(WorkbenchPart);
  if (part) {
    return new Map<string, unknown>().set(WorkbenchMenuContextKeys.PartId, part.id);
  }

  const dialog = Beans.opt(WorkbenchDialog);
  if (dialog) {
    return new Map<string, unknown>().set(WorkbenchMenuContextKeys.DialogId, dialog.id);
  }

  const popup = Beans.opt(WorkbenchPopup);
  if (popup) {
    return new Map<string, unknown>().set(WorkbenchMenuContextKeys.PopupId, popup.id);
  }

  const notification = Beans.opt(WorkbenchNotification);
  if (notification) {
    return new Map<string, unknown>().set(WorkbenchMenuContextKeys.NotificationId, notification.id);
  }

  return new Map();
}
