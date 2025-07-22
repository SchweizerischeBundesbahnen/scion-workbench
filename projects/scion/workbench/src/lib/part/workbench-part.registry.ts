/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {InjectionToken} from '@angular/core';
import {ɵWorkbenchPart} from './ɵworkbench-part.model';
import {WorkbenchObjectRegistry} from '../registry/workbench-object-registry';
import {PartId} from '../workbench.identifiers';

/**
 * Registry for {@link WorkbenchPart} model objects.
 */
export const WORKBENCH_PART_REGISTRY = new InjectionToken<WorkbenchObjectRegistry<PartId, ɵWorkbenchPart>>('WORKBENCH_PART_REGISTRY', {
  providedIn: 'root',
  factory: () => new WorkbenchObjectRegistry<PartId, ɵWorkbenchPart>({
    nullObjectErrorFn: partId => Error(`[NullPartError] Part '${partId}' not found.`),
    onUnregister: part => part.destroy(),
  }),
});
