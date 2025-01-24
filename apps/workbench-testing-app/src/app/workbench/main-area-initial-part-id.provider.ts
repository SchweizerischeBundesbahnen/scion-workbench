/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {EnvironmentProviders, makeEnvironmentProviders} from '@angular/core';
import {MAIN_AREA_INITIAL_PART_ID} from '@scion/workbench';
import {WorkbenchStartupQueryParams} from './workbench-startup-query-params';

/**
 * Provides a set of DI providers to control the identity of the initial part in the main area.
 */
export function provideMainAreaInitialPartId(): EnvironmentProviders | [] {
  if (WorkbenchStartupQueryParams.mainAreaInitialPartId()) {
    return makeEnvironmentProviders([
      {provide: MAIN_AREA_INITIAL_PART_ID, useValue: WorkbenchStartupQueryParams.mainAreaInitialPartId()},
    ]);
  }
  return [];
}
