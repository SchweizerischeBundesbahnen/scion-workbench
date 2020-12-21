/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Injectable, Provider } from '@angular/core';
import { WorkbenchInitializer } from '@scion/workbench';
import { WorkbenchStartupQueryParams } from './workbench-startup-query-params';
import { asyncScheduler } from 'rxjs';

/**
 * Displays an alert dialog during workbench startup to pause the workbench startup until the user confirms the alert.
 *
 * This initializer is only installed if the query parameter {@link WorkbenchStartupQueryParams#CONFIRM_STARTUP_QUERY_PARAM} is set.
 */
@Injectable()
export class ConfirmWorkbenchStartupInitializer implements WorkbenchInitializer {

  public async init(): Promise<void> {
    // Do not open the alert dialog until the next macrotask so that Angular can complete the initial navigation to create routed view components.
    await new Promise(resolve => asyncScheduler.schedule(() => {
      alert('Click to continue Workbench Startup.');
      resolve();
    }));
  }
}

/**
 * Provides a {@link WorkbenchInitializer} to display an alert dialog during workbench startup to pause the workbench startup until the user confirms the alert.
 *
 * Returns an empty provider array if the query parameter {@link WorkbenchStartupQueryParams#CONFIRM_STARTUP_QUERY_PARAM} is not set.
 */
export function provideConfirmWorkbenchStartupInitializer(): Provider[] {
  if (WorkbenchStartupQueryParams.confirmStartup()) {
    return [
      {
        provide: WorkbenchInitializer,
        multi: true,
        useClass: ConfirmWorkbenchStartupInitializer,
      },
    ];
  }
  return [];
}
