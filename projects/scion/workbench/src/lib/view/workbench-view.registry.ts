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
import {ɵWorkbenchView} from './ɵworkbench-view.model';
import {WorkbenchObjectRegistry} from '../registry/workbench-object-registry';

/**
 * Registry for {@link WorkbenchView} model objects.
 */
export const WORKBENCH_VIEW_REGISTRY = new InjectionToken<WorkbenchObjectRegistry<string, ɵWorkbenchView>>('WORKBENCH_VIEW_REGISTRY', {
  providedIn: 'root',
  factory: () => new WorkbenchObjectRegistry<string, ɵWorkbenchView>({
    keyFn: view => view.id,
    nullObjectErrorFn: viewId => Error(`[NullViewError] View '${viewId}' not found.`),
    onUnregister: view => view.destroy(),
  }),
});
