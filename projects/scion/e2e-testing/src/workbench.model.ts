/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

/**
 * This files contains model classes of @scion/workbench.
 *
 * In Playwright tests, we cannot reference types from other modules, only interfaces, because they are erased when transpiled to JavaScript.
 */

/**
 * Identifies the part that represents the main area.
 *
 * This part is automatically added to the layout and cannot be removed.
 * Refer to this part to align parts relative to the main area.
 */
export const MAIN_AREA_PART_ID = 'main-area';
