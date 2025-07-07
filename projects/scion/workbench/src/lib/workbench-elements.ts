/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {UUID} from '@scion/toolkit/uuid';
import {PartId} from './part/workbench-part.model';
import {ViewId} from './view/workbench-view.model';

/**
 * Represents the id prefix of dialogs.
 */
export const DIALOG_ID_PREFIX = 'dialog.';

/**
 * Represents the id prefix of popups.
 */
export const POPUP_ID_PREFIX = 'popup.';

/**
 * Format of a dialog identifier.
 */
export type DialogId = `${typeof DIALOG_ID_PREFIX}${string}`;

/**
 * Format of a popup identifier.
 */
export type PopupId = `${typeof POPUP_ID_PREFIX}${string}`;

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

export function newDialogId(): DialogId {
  return `${DIALOG_ID_PREFIX}${UUID.randomUUID()}`;
}

export function newPopupId(): PopupId {
  return `${POPUP_ID_PREFIX}${UUID.randomUUID()}`;
}

export type WorkbenchElementId = PartId | ViewId | DialogId | PopupId;
