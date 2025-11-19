/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {EnvironmentProviders, inject, makeEnvironmentProviders, provideAppInitializer} from '@angular/core';
import {WorkbenchStartupQueryParams} from './workbench/workbench-startup-query-params';
import {WorkbenchLauncher} from '@scion/workbench';

/**
 * Provides a set of DI providers for launching the workbench.
 */
export function provideWorkbenchLauncher(): EnvironmentProviders | [] {
  if (WorkbenchStartupQueryParams.launcher() !== 'APP_INITIALIZER') {
    return [];
  }

  return makeEnvironmentProviders([
    provideAppInitializer(() => inject(WorkbenchLauncher).launch()),
  ]);
}
