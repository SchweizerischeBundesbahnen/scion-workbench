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
import {WorkbenchConfig} from '../workbench-config';
import {WORKBENCH_TEXT_PROVIDER} from './workbench-text-provider.model';
import {workbenchViewMenuConfigTextProvider} from './workbench-view-menu-config-text-provider';
import {workbenchTextProvider} from './workbench-text-provider';

/**
 * Provides a set of DI providers to register text providers.
 */
export function provideTextProviders(config: WorkbenchConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    // Provide app-specific texts.
    {
      provide: WORKBENCH_TEXT_PROVIDER,
      useValue: config.textProvider ?? (() => undefined),
      multi: true,
    },
    // Provide texts of menu items configured in `config.viewMenuItems`.
    {
      provide: WORKBENCH_TEXT_PROVIDER,
      useValue: workbenchViewMenuConfigTextProvider(config),
      multi: true,
    },
    // Provide built-in texts.
    {
      provide: WORKBENCH_TEXT_PROVIDER,
      useValue: workbenchTextProvider,
      multi: true,
    },
  ]);
}
