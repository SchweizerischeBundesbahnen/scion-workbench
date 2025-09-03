/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {EnvironmentProviders, makeEnvironmentProviders, Signal} from '@angular/core';
import {WorkbenchConfig} from '../workbench-config';
import {WORKBENCH_TEXT_PROVIDER, WorkbenchTextProviderFn} from './workbench-text-provider.model';
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
      useValue: applicationTextProvider(config),
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

/**
 * Provides application-specifc texts and translated workbench texts.
 *
 * Register this provider as the first text provider, enabling change or translation of built-in workbench texts.
 */
function applicationTextProvider(config: WorkbenchConfig): WorkbenchTextProviderFn {
  const appTextProvider = config.textProvider;
  if (!appTextProvider) {
    return () => undefined;
  }

  return (key: string, params: {[name: string]: string}): Signal<string> | string | undefined => {
    // Translation keys starting with the `workbench.external.` prefix are external and must not
    // be localized by the workbench application, such as remote keys to resolve texts from micro apps.
    if (key.startsWith('workbench.external.')) {
      return undefined;
    }
    return appTextProvider(key, params);
  };
}
