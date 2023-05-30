/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {WorkbenchModule, WorkbenchModuleConfig} from '@scion/workbench';
import {EnvironmentProviders, importProvidersFrom} from '@angular/core';

/**
 * Provides a set of DI providers to set up SCION Workbench.
 */
export function provideWorkbench(config: WorkbenchModuleConfig): EnvironmentProviders {
  return importProvidersFrom(WorkbenchModule.forRoot(config));
}
