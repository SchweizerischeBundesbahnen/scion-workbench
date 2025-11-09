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
import {WorkbenchPart} from './part/workbench-part';
import {WorkbenchView} from './view/workbench-view';
import {WorkbenchDialog} from './dialog/workbench-dialog';
import {WorkbenchPopup} from './popup/workbench-popup';

/**
 * Format of a view identifier.
 *
 * @category View
 */
export type ViewId = `view.${string}`;

/**
 * Format of a part identifier.
 *
 * @category Part
 */
export type PartId = `part.${string}`;

/**
 * Format of a dialog identifier.
 *
 * @category Dialog
 */
export type DialogId = `dialog.${string}`;

/**
 * Format of a popup identifier.
 *
 * @category Popup
 */
export type PopupId = `popup.${string}`;
/**
 * Format of an activity identifier.
 *
 * @docs-private Not public API. For internal use only.
 */
export type ActivityId = `activity.${string}`;

/**
 * Computes a unique popup id.
 */
export function computePopupId(): PopupId {
  return `popup.${UUID.randomUUID().substring(0, 8)}`;
}

/**
 * Union of workbench elements.
 */
export type WorkbenchElement = WorkbenchPart | WorkbenchView | WorkbenchDialog | WorkbenchPopup;
