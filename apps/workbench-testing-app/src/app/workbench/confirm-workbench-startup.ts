/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {EnvironmentProviders, makeEnvironmentProviders} from '@angular/core';
import {provideWorkbenchInitializer} from '@scion/workbench';
import {WorkbenchStartupQueryParams} from './workbench-startup-query-params';
import {asyncScheduler} from 'rxjs';

/**
 * Displays an alert during workbench startup to pause the workbench startup until the user confirms the alert.
 */
async function confirmWorkbenchStartup(): Promise<void> {
  // Do not open the alert until the next macrotask so that Angular can complete the initial navigation to create routed view components.
  await new Promise<void>(resolve => asyncScheduler.schedule(() => {
    alert('Click to continue Workbench Startup.');
    resolve();
  }));
}

/**
 * Provides a set of DI providers to pause workbech startup.
 *
 * Has no effect if the query parameter {@link WorkbenchStartupQueryParams#CONFIRM_STARTUP_QUERY_PARAM} is not set.
 */
export function provideConfirmWorkbenchStartup(): EnvironmentProviders | [] {
  if (WorkbenchStartupQueryParams.confirmStartup()) {
    return makeEnvironmentProviders([
      provideWorkbenchInitializer(() => confirmWorkbenchStartup()),
    ]);
  }
  return [];
}
