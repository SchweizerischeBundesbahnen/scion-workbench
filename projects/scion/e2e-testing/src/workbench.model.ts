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
 * Refer to this part to align parts relative to the main area.
 */
export const MAIN_AREA: MAIN_AREA = 'main-area';

/**
 * Represents the type of the constant {@link MAIN_AREA}.
 */
export type MAIN_AREA = 'main-area';
