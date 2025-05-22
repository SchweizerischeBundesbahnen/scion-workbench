/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {EnvironmentProviders, inject, makeEnvironmentProviders} from '@angular/core';
import {provideWorkbenchInitializer, WorkbenchStartupPhase} from '@scion/workbench';
import {WorkbenchStartupQueryParams} from './workbench-startup-query-params';
import {DOCUMENT} from '@angular/common';

/**
 * Provides a set of DI providers to set design tokens based on {@link WorkbenchStartupQueryParams#DESIGN_TOKENS}.
 */
export function provideDesignTokens(): EnvironmentProviders | [] {
  const designTokens = WorkbenchStartupQueryParams.designTokens();
  if (!designTokens) {
    return [];
  }
  return makeEnvironmentProviders([
    provideWorkbenchInitializer(() => {
      const documentRoot = inject(DOCUMENT).documentElement;
      for (const name in designTokens) {
        documentRoot.style.setProperty(name, designTokens[name]!);
      }
    }, {phase: WorkbenchStartupPhase.PreStartup}),
  ]);
}
