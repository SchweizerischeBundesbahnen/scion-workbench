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
import {ɵWorkbenchDialogService} from './ɵworkbench-dialog.service';
import {WorkbenchDialogService} from './workbench-dialog.service';

/**
 * Provides {@link WorkbenchDialogService} for dependency injection.
 */
export function provideWorkbenchDialogService(): Provider[] {
  return [
    ɵWorkbenchDialogService,
    {provide: WorkbenchDialogService, useExisting: ɵWorkbenchDialogService},
  ];
}
