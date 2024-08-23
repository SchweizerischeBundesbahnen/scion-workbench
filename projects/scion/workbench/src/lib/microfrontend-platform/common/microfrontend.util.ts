/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Capability, SciRouterOutletElement} from '@scion/microfrontend-platform';
import {effect, inject} from '@angular/core';
import {ɵTHEME_CONTEXT_KEY} from '@scion/workbench-client';
import {WorkbenchService} from '../../workbench.service';
import {WorkbenchTheme} from '../../workbench.model';
import {Crypto} from '@scion/toolkit/crypto';

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
    const workbenchService = inject(WorkbenchService);
    effect(() => {
      const theme = workbenchService.theme();
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
   * Creates a stable identifier for given capability.
   */
  createStableIdentifier: async (capability: Capability): Promise<string> => {
    const qualifier = capability.qualifier!;
    const application = capability.metadata!.appSymbolicName;

    // Create identifier consisting of vendor and sorted qualifier entries.
    const identifier = Object.entries(qualifier)
      .sort(([key1], [key2]) => key1.localeCompare(key2))
      .reduce(
        (acc, [key, value]) => acc.concat(key).concat(`${value}`),
        [application],
      )
      .join(';');

    // Hash the identifier.
    const identifierHash = await Crypto.digest(identifier);
    // Use the first 7 digits of the hash.
    return identifierHash.substring(0, 7);
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
