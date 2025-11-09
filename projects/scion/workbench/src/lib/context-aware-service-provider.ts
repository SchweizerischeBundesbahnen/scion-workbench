/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Provider} from '@angular/core';
import {WorkbenchPopupService} from './popup/workbench-popup.service';
import {WorkbenchDialogService} from './dialog/workbench-dialog.service';
import {WorkbenchMessageBoxService} from './message-box/workbench-message-box.service';
import {ɵWorkbenchPopupService} from './popup/ɵworkbench-popup.service';
import {ɵWorkbenchDialogService} from './dialog/ɵworkbench-dialog.service';
import {ɵWorkbenchMessageBoxService} from './message-box/ɵworkbench-message-box.service';

/**
 * Provides a set of DI providers with context aware services:
 *
 * - {@link WorkbenchDialogService}
 * - {@link WorkbenchMessageBoxService}
 * - {@link WorkbenchPopupService}
 */
export function provideContextAwareServices(): Provider {
  return [
    ɵWorkbenchDialogService,
    ɵWorkbenchMessageBoxService,
    ɵWorkbenchPopupService,
    {provide: WorkbenchDialogService, useExisting: ɵWorkbenchDialogService},
    {provide: WorkbenchMessageBoxService, useExisting: ɵWorkbenchMessageBoxService},
    {provide: WorkbenchPopupService, useExisting: ɵWorkbenchPopupService},
  ];
}
