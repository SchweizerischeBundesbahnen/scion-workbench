/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {EnvironmentProviders, makeEnvironmentProviders} from '@angular/core';
import {WORKBENCH_ICON_PROVIDER} from './workbench-icon-provider.model';
import {materialIconProvider} from './material-icon-provider';
import {workbenchIconProvider} from './workbench-icon-provider';
import {WorkbenchConfig} from '../workbench-config';

/**
 * Provides a set of DI providers to register icon providers.
 */
export function provideIconProviders(config: WorkbenchConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    // Provide app-specific icons, or fall back to Material icons.
    {
      provide: WORKBENCH_ICON_PROVIDER,
      useValue: config.iconProvider ?? materialIconProvider,
      multi: true,
    },
    // Provide built-in icons.
    {
      provide: WORKBENCH_ICON_PROVIDER,
      useValue: workbenchIconProvider,
      multi: true,
    },
  ]);
}
