/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {InjectionToken} from '@angular/core';
import {WorkbenchObjectRegistry} from '../registry/workbench-object-registry';
import {ɵPopup} from './popup.config';
import {PopupId} from '../workbench.identifiers';

/**
 * Registry for {@link WorkbenchPopup} model objects.
 */
export const WORKBENCH_POPUP_REGISTRY = new InjectionToken<WorkbenchObjectRegistry<PopupId, ɵPopup>>('WORKBENCH_POPUP_REGISTRY', {
  providedIn: 'root',
  factory: () => new WorkbenchObjectRegistry<PopupId, ɵPopup>({
    nullObjectErrorFn: popupId => Error(`[NullPopupError] Popup '${popupId}' not found.`),
    onUnregister: popup => popup.destroy(),
  }),
});
