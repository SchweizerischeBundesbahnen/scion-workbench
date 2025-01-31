/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {WorkbenchViewMenuItemFn} from '../workbench.model';
import {InjectionToken} from '@angular/core';
import {WorkbenchObjectRegistry} from '../registry/workbench-object-registry';

/**
 * Registry for {@link WorkbenchMenuItem} factory functions to contribute menu items to the context menu of views.
 */
export const WORKBENCH_VIEW_MENU_ITEM_REGISTRY = new InjectionToken<WorkbenchObjectRegistry<WorkbenchViewMenuItemFn, WorkbenchViewMenuItemFn>>('WORKBENCH_VIEW_MENU_ITEM_REGISTRY', {
  providedIn: 'root',
  factory: () => new WorkbenchObjectRegistry<WorkbenchViewMenuItemFn, WorkbenchViewMenuItemFn>(),
});
