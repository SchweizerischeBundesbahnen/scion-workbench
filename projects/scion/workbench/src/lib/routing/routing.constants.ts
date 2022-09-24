/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

/**
 * Key to define the title of a view in {@link Route.data}.
 *
 * @deprecated since version 14.0.0-beta.2; Use {@link WorkbenchRouteData.title} instead; API will be removed in version 16, including setting the title via URL matrix parameters, for which no replacement is planned.
 */
export const WB_VIEW_TITLE_PARAM = 'wb.title';

/**
 * Key to define the heading of a view in {@link Route.data}.
 *
 * @deprecated since version 14.0.0-beta.2; Use {@link WorkbenchRouteData.heading} instead; API will be removed in version 16, including setting the heading via URL matrix parameters, for which no replacement is planned.
 */
export const WB_VIEW_HEADING_PARAM = 'wb.heading';

/**
 * Key for reading navigational state from {@link ActivatedRoute.data}.
 *
 * @deprecated since version 14.0.0-beta.2; Use {@link WorkbenchRouteData.state} instead; API will be removed in version 16.
 */
export const WB_STATE_DATA = 'wb.state';
