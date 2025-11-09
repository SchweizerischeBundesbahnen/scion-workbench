/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {WorkbenchPartActionFn} from '../workbench.model';
import {Injectable} from '@angular/core';
import {WorkbenchElementRegistry} from '../registry/workbench-element-registry';

/**
 * Registry for {@link WorkbenchPartAction} factory functions.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchPartActionRegistry extends WorkbenchElementRegistry<WorkbenchPartActionFn, WorkbenchPartActionFn> {

  constructor() {
    super({}); // NG2006: Angular requires a super call
  }
}
