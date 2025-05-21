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
import {effect, ElementRef, inject, Injector, Signal, untracked} from '@angular/core';
import {WorkbenchTheme, ɵTHEME_CONTEXT_KEY} from '@scion/workbench-client';
import {WorkbenchService} from '../../workbench.service';
import {Crypto} from '@scion/toolkit/crypto';
import {coerceElement} from '@angular/cdk/coercion';
import {first} from 'rxjs/operators';
import {DOCUMENT} from '@angular/common';

/**
 * Provides functions related to workbench themes.
 */
export const Microfrontends = {
  /**
   * Propagates the workbench theme and color scheme via contextual data to the microfrontend displayed in the given router outlet,
   * ensuring consistent styling across microfrontends.
   *
   * This method must be passed an injector or called in an injection context. If used in a component, use the component's injector.
   * Stops theme propagation when the injection context is destroyed.
   */
  propagateTheme: (routerOutletElement: Signal<SciRouterOutletElement | ElementRef<SciRouterOutletElement>>, options?: {injector?: Injector}): void => {
    const injector = options?.injector ?? inject(Injector);
    const documentRoot = injector.get(DOCUMENT).documentElement;
    const settings = injector.get(WorkbenchService).settings;

    effect(() => {
      const routerOutlet = coerceElement(routerOutletElement());
      const theme = settings.theme();

      untracked(() => {
        if (theme) {
          const colorScheme = getComputedStyle(documentRoot).colorScheme as 'light' | 'dark';
          routerOutlet.setContextValue<WorkbenchTheme>(ɵTHEME_CONTEXT_KEY, {name: theme, colorScheme});
          routerOutlet.setContextValue('color-scheme', colorScheme);
        }
        else {
          routerOutlet.removeContextValue(ɵTHEME_CONTEXT_KEY);
          routerOutlet.removeContextValue('color-scheme');
        }
      });
    }, {injector, forceRoot: true}); // Run as root effect to run even if the parent component is detached from change detection (e.g., if the view is not visible).
  },
  /**
   * Waits for contextual data to be available to embedded content.
   *
   * This method must be passed an injector or called in an injection context. If used in a component, use the component's injector.
   * Stops waiting when the injection context is destroyed.
   */
  waitForContext: (routerOutletElement: Signal<SciRouterOutletElement | ElementRef<SciRouterOutletElement>>, name: string, options?: {injector?: Injector}): Promise<void> => {
    const injector = options?.injector ?? inject(Injector);

    return new Promise<void>(resolve => {
      effect(onCleanup => {
        const routerOutlet = coerceElement(routerOutletElement());

        untracked(() => {
          const subscription = routerOutlet.contextValues$
            .pipe(first(context => context.has(name)))
            .subscribe(() => resolve());
          onCleanup(() => subscription.unsubscribe());
        });
      }, {injector, forceRoot: true}); // Run as root effect to run even if the parent component is detached from change detection (e.g., if the view is not visible).
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
