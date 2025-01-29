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
import {WorkbenchObjectRegistry} from '../registry/workbench-object-registry';
import {ɵWorkbenchPerspective} from './ɵworkbench-perspective.model';

/**
 * Registry for {@link ɵWorkbenchPerspective} model objects.
 */
export const WORKBENCH_PERSPECTIVE_REGISTRY = new InjectionToken<WorkbenchObjectRegistry<string, ɵWorkbenchPerspective>>('WORKBENCH_PERSPECTIVE_REGISTRY', {
  providedIn: 'root',
  factory: () => new WorkbenchObjectRegistry<string, ɵWorkbenchPerspective>({
    nullObjectErrorFn: perspectiveId => Error(`[NullPerspectiveError] Perspective '${perspectiveId}' not found.`),
    onUnregister: perspective => perspective.destroy(),
  }),
});
