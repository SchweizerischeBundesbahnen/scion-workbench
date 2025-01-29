/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {WorkbenchPartAction} from '../workbench.model';
import {InjectionToken} from '@angular/core';
import {WorkbenchObjectRegistry} from '../registry/workbench-object-registry';

/**
 * Registry for {@link WorkbenchPartAction} model objects.
 */
export const WORKBENCH_PART_ACTION_REGISTRY = new InjectionToken<WorkbenchObjectRegistry<WorkbenchPartAction, WorkbenchPartAction>>('WORKBENCH_PART_ACTION_REGISTRY', {
  providedIn: 'root',
  factory: () => new WorkbenchObjectRegistry<WorkbenchPartAction, WorkbenchPartAction>({
    nullObjectErrorFn: (action: WorkbenchPartAction) => Error(`[NullPartActionError] Part Action '${JSON.stringify(action)}' not found.`),
  }),
});
