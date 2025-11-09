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
import {Injectable} from '@angular/core';
import {WorkbenchElementRegistry} from '../registry/workbench-element-registry';

/**
 * Registry for {@link WorkbenchMenuItem} factory functions to contribute menu items to the context menu of views.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchViewMenuItemRegistry extends WorkbenchElementRegistry<WorkbenchViewMenuItemFn, WorkbenchViewMenuItemFn> {

  constructor() {
    super({}); // NG2006: Angular requires a super call
  }
}
