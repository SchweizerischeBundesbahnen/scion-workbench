/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Provider} from '@angular/core';
import {ɵPopupService} from './ɵpopup.service';
import {ɵWorkbenchPopupService} from './ɵworkbench-popup.service';
import {WorkbenchPopupService} from './workbench-popup.service';
import {PopupService} from './popup.service';

/**
 * Provides {@link WorkbenchPopupService} for dependency injection.
 */
export function provideWorkbenchPopupService(): Provider[] {
  return [
    ɵWorkbenchPopupService,
    ɵPopupService,
    {provide: WorkbenchPopupService, useExisting: ɵWorkbenchPopupService},
    {provide: PopupService, useExisting: ɵPopupService},
  ];
}
