/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable} from '@angular/core';
import {WorkbenchElementRegistry} from '../registry/workbench-element-registry';
import {PopupId} from '../workbench.identifiers';
import {ɵWorkbenchPopup} from './ɵworkbench-popup.model';

/**
 * Registry for {@link WorkbenchPopup} elements.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchPopupRegistry extends WorkbenchElementRegistry<PopupId, ɵWorkbenchPopup> {
  constructor() {
    super({
      nullElementErrorFn: popupId => Error(`[NullPopupError] Popup '${popupId}' not found.`),
      onUnregister: popup => popup.destroy(),
    });
  }
}
