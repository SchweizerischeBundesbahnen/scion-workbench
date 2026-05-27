/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

/**
 * Keys for defining the context of workbench menus.
 */
export enum WorkbenchMenuContexts {
  PartId = 'partId',
  ViewId = 'viewId',
  DialogId = 'dialogId',
  PopupId = 'popupId',
  NotificationId = 'notificationId',
  Peripheral = 'peripheral',
  MainArea = 'mainArea',
}

/**
 * Context value for {@link WorkbenchMenuContexts.ViewId} set at the part-level to prevent contribution of
 * part-specific menus (menus contributed in part content) when not displaying part content but a part's active view.
 *
 * At the view-level, {@link WorkbenchMenuContexts.ViewId} is overridden with the actual view id.
 *
 * Part toolbars (`toolbar:workbench.part.titlebar`, `toolbar:workbench.part.tabbar`, `toolbar:workbench.part.toolbar`)
 * set {@link WorkbenchMenuContexts.ViewId} based on the part's active view.
 *
 * @see provideWorkbenchPartContext
 * @see PartBarComponent
 */
export const PART_NULL_ACTIVE_VIEW_ID = null;
