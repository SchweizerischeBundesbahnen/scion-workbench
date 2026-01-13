/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {InjectionToken} from '@angular/core';
import {UUID} from '@scion/toolkit/uuid';
import {UID} from './common/uid.util';
import {isMicrofrontendHostOutlet, MicrofrontendHostOutlet} from './microfrontend-platform/microfrontend-host/microfrontend-host-routes';

/**
 * DI token to get a unique id of the workbench.
 *
 * The id is different each time the app is reloaded. Different workbench windows have different ids.
 */
export const WORKBENCH_ID = new InjectionToken<string>('WORKBENCH_ID', {
  providedIn: 'root',
  factory: () => UUID.randomUUID(),
});

/**
 * Format of a part identifier.
 *
 * Each part is assigned a unique identifier (e.g., `part.9fdf7ab4`, `part.c6485225`, etc.).
 * A part can also have an alternative id, a meaningful but not necessarily unique name. A part can
 * be identified either by its unique or alternative id.
 */
export type PartId = `${typeof PART_ID_PREFIX}${string}`;

/**
 * Format of a view identifier.
 *
 * Each view is assigned a unique identifier (e.g., `view.d4de99fb`, `view.cad347dd`, etc.).
 * A view can also have an alternative id, a meaningful but not necessarily unique name. A view can
 * be identified either by its unique or alternative id.
 */
export type ViewId = `${typeof VIEW_ID_PREFIX}${string}`;

/**
 * Format of a dialog identifier.
 */
export type DialogId = `${typeof DIALOG_ID_PREFIX}${string}`;

/**
 * Format of a popup identifier.
 */
export type PopupId = `${typeof POPUP_ID_PREFIX}${string}`;

/**
 * Format of a notification identifier.
 */
export type NotificationId = `${typeof NOTIFICATION_ID_PREFIX}${string}`;

/**
 * Format of an activity identifier.
 *
 * Each activity is assigned a unique identifier (e.g., `activity.9fdf7ab4`, `activity.c6485225`, etc.).
 *
 * @docs-private Not public API. For internal use only.
 */
export type ActivityId = `${typeof ACTIVITY_ID_PREFIX}${string}`;

/**
 * Tests if the given id matches the format of a view identifier.
 */
export function isViewId(viewId: string | undefined | null): viewId is ViewId {
  return viewId?.startsWith(VIEW_ID_PREFIX) ?? false;
}

/**
 * Tests if the given outlet matches the format of the view outlet.
 */
export function isViewOutlet(outlet: string | undefined | null): outlet is ViewOutlet {
  return isViewId(outlet);
}

/**
 * Tests if the given id matches the format of a part identifier.
 */
export function isPartId(partId: string | undefined | null): partId is PartId {
  return partId?.startsWith(PART_ID_PREFIX) ?? false;
}

/**
 * Tests if the given outlet matches the format of the part outlet.
 */
export function isPartOutlet(outlet: string | undefined | null): outlet is PartOutlet {
  return isPartId(outlet);
}

/**
 * Tests if the given id matches the format of a dialog identifier.
 */
export function isDialogId(dialogId: string | undefined | null): dialogId is DialogId {
  return dialogId?.startsWith(DIALOG_ID_PREFIX) ?? false;
}

/**
 * Tests if the given id matches the format of a dialog identifier.
 */
export function isPopupId(popupId: string | undefined | null): popupId is PopupId {
  return popupId?.startsWith(POPUP_ID_PREFIX) ?? false;
}

/**
 * Tests if the given id matches the format of an activity identifier.
 */
export function isActivityId(activityId: string | undefined | null): activityId is ActivityId {
  return activityId?.startsWith(ACTIVITY_ID_PREFIX) ?? false;
}

/**
 * Tests if the given outlet matches the format of a workbench outlet.
 */
export function isWorkbenchOutlet(outlet: string | undefined | null): outlet is WorkbenchOutlet {
  return isPartOutlet(outlet) || isViewOutlet(outlet) || isMicrofrontendHostOutlet(outlet);
}

/**
 * Computes a unique view id.
 */
export function computeViewId(): ViewId {
  return `${VIEW_ID_PREFIX}${UID.randomUID()}`;
}

/**
 * Computes a unique part id.
 */
export function computePartId(): PartId {
  return `${PART_ID_PREFIX}${UID.randomUID()}`;
}

/**
 * Computes a unique dialog id.
 */
export function computeDialogId(): DialogId {
  return `${DIALOG_ID_PREFIX}${UID.randomUID()}`;
}

/**
 * Computes a unique popup id.
 */
export function computePopupId(): PopupId {
  return `${POPUP_ID_PREFIX}${UID.randomUID()}`;
}

/**
 * Computes a unique notification id.
 */
export function computeNotificationId(): NotificationId {
  return `${NOTIFICATION_ID_PREFIX}${UID.randomUID()}`;
}

/**
 * Computes a unique activity id.
 */
export function computeActivityId(): ActivityId {
  return `${ACTIVITY_ID_PREFIX}${UID.randomUID()}`;
}

/**
 * Format of a view outlet name.
 */
export type ViewOutlet = ViewId;

/**
 * Format of a part outlet name.
 */
export type PartOutlet = PartId;

/**
 * Union of workbench outlets.
 */
export type WorkbenchOutlet = PartOutlet | ViewOutlet | MicrofrontendHostOutlet;

/**
 * Represents the id prefix of views.
 *
 * @see ViewId
 */
export const VIEW_ID_PREFIX = 'view.';

/**
 * Represents the id prefix of parts.
 *
 * @see PartId
 */
export const PART_ID_PREFIX = 'part.';

/**
 * Represents the id prefix of activities.
 *
 * @see ActivityId
 */
export const ACTIVITY_ID_PREFIX = 'activity.';

/**
 * Represents the id prefix of dialogs.
 *
 * @see DialogId
 */
const DIALOG_ID_PREFIX = 'dialog.';

/**
 * Represents the id prefix of notifications.
 *
 * @see NotificationId
 */
const NOTIFICATION_ID_PREFIX = 'notification.';

/**
 * Represents the id prefix of popups.
 *
 * @see PopupId
 */
const POPUP_ID_PREFIX = 'popup.';
