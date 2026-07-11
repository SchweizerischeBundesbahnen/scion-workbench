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
 * Context keys available to menu items displayed in workbench elements.
 */
export enum WorkbenchMenuContexts {
  /** @internal */
  PartId = 'partId',
  /** @internal */
  ViewId = 'viewId',
  /** @internal */
  DialogId = 'dialogId',
  /** @internal */
  PopupId = 'popupId',
  /** @internal */
  NotificationId = 'notificationId',
  /** Indicates whether contributing to the peripheral area of the workbench. */
  Peripheral = 'peripheral',
  /** Indicates whether contributing to the main area of the workbench. */
  MainArea = 'mainArea',
}

/**
 * Context value for {@link WorkbenchMenuContexts.ViewId} set at the part-level to prevent contribution of
 * part-specific menus (menus contributed in part content) to the active view.
 *
 * @see provideWorkbenchPartContext
 * @see PartBarComponent
 */
export const PART_NULL_ACTIVE_VIEW_ID = null;
