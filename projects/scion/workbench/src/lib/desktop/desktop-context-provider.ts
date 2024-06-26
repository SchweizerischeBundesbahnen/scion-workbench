/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Provider} from '@angular/core';
import {ɵWorkbenchDesktop} from './ɵworkbench-desktop.model';
import {WorkbenchDesktop} from './workbench-desktop.model';

/**
 * Configures an injector with providers that are aware of the specified desktop.
 */
export function provideDesktopContext(view: ɵWorkbenchDesktop | null | undefined): Provider {
  return [
    {provide: ɵWorkbenchDesktop, useValue: view ?? null},
    {provide: WorkbenchDesktop, useExisting: ɵWorkbenchDesktop},
  ];
}
