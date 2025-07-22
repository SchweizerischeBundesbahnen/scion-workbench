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
 * Computes a unique popup id.
 */
export function computePopupId(): PopupId {
  return `popup.${UUID.randomUUID().substring(0, 8)}`;
}
