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
import {provideTextProvider, SciTextProviderFn} from '@scion/sci-components/text';
import {WorkbenchConfig} from '../workbench-config';
import {workbenchTextProvider} from './workbench-text-provider';
import {MaybeSignal} from '@scion/sci-components/common';

/**
 * Provides a set of DI providers to register text providers.
 */
export function provideTextProviders(config: WorkbenchConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    // Provide app-specific texts.
    provideTextProvider(applicationTextProvider(config)),
    // Provide built-in texts of @scion/workbench.
    provideTextProvider(workbenchTextProvider),
  ]);
}

/**
 * Provides application-specifc texts and translated workbench texts.
 *
 * Register this provider as the first text provider, enabling change or translation of built-in workbench texts.
 */
function applicationTextProvider(config: WorkbenchConfig): SciTextProviderFn {
  const appTextProvider = config.textProvider;
  if (!appTextProvider) {
    return () => undefined;
  }

  return (key: string, params: {[name: string]: string}): MaybeSignal<string> | undefined => {
    // Translation keys starting with the `scion.workbench.internal.` prefix are internal and must not
    // be localized by the workbench application, such as remote keys to resolve texts from micro apps.
    if (key.startsWith('scion.workbench.internal.')) {
      return undefined;
    }
    return appTextProvider(key, params);
  };
}
