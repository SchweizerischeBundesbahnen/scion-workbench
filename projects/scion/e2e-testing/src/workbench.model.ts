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
 * This file contains model classes of @scion/workbench.
 *
 * In Playwright tests, we cannot reference types from other modules, only interfaces, because they are erased when transpiled to JavaScript.
 */

/**
 * Identifies the main area part in the workbench layout.
 *
 * Refer to this part to align parts relative to the main area.
 *
 * The main area is a special part that can be added to the layout. The main area is where the workbench opens views by default.
 * It is shared between perspectives and its layout is not reset when resetting perspectives.
 */
export const MAIN_AREA: MAIN_AREA = 'part.main-area';

/**
 * Represents the type of the {@link MAIN_AREA} constant.
 */
export type MAIN_AREA = 'part.main-area';

/**
 * Represents the alternative id of the main area part.
 *
 * @see MAIN_AREA
 */
export const MAIN_AREA_ALTERNATIVE_ID = 'main-area';

/**
 * Format of an activity identifier.
 */
export type ActivityId = `activity.${string}`;
