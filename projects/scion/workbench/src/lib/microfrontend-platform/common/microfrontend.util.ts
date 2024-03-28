/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {SciRouterOutletElement} from '@scion/microfrontend-platform';
import {inject} from '@angular/core';
import {ɵTHEME_CONTEXT_KEY} from '@scion/workbench-client';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {WorkbenchService} from '../../workbench.service';
import {WorkbenchTheme} from '../../workbench.model';

/**
 * Provides functions related to workbench themes.
 */
export const Microfrontends = {
  /**
   * Propagates the workbench theme and color scheme via contextual data to the microfrontend displayed in the given router outlet,
   * ensuring consistent styling across microfrontends.
   *
   * This method should be invoked in the component's injection context to stop propagation when the component is destroyed.
   */
  propagateTheme: (sciRouterOutletElement: SciRouterOutletElement): void => {
    inject(WorkbenchService).theme$
      .pipe(takeUntilDestroyed())
      .subscribe(theme => {
        if (theme) {
          sciRouterOutletElement.setContextValue<WorkbenchTheme>(ɵTHEME_CONTEXT_KEY, theme);
          sciRouterOutletElement.setContextValue('color-scheme', theme.colorScheme);
        }
        else {
          sciRouterOutletElement.removeContextValue(ɵTHEME_CONTEXT_KEY);
          sciRouterOutletElement.removeContextValue('color-scheme');
        }
      });
  },
  /**
   * Replaces named parameters in the given value with values contained in the given {@link Map}.
   * Named parameters begin with a colon (`:`).
   */
  substituteNamedParameters,
} as const;

function substituteNamedParameters(value: string, params?: Map<string, unknown>): string;
function substituteNamedParameters(value: string | null, params?: Map<string, unknown>): string | null;
function substituteNamedParameters(value: string | undefined, params?: Map<string, unknown>): string | undefined;
function substituteNamedParameters(value: string | null | undefined, params?: Map<string, unknown>): string | null | undefined {
  if (!value || !params?.size) {
    return value;
  }
  return [...params].reduce((acc, [paramKey, paramValue]) => {
    if (paramValue === undefined) {
      return acc;
    }
    return acc.replaceAll(`:${paramKey}`, `${paramValue}`);
  }, value);
}
