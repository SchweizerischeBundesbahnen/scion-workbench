/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {computed, EnvironmentProviders, inject, Injectable, Injector, makeEnvironmentProviders, Provider, runInInjectionContext, signal, Signal, Type} from '@angular/core';
import {SciMenuEnvironmentProvider} from './menu-environment-provider';
import {coerceSignal, MaybeSignal} from '@scion/sci-components/common';
import {Arrays, Objects} from '@scion/toolkit/util';
import {coerceElement} from '@angular/cdk/coercion';

/**
 * Provides the environment for menus based on registered menu environment providers.
 *
 * @docs-private Not public API. For internal use only.
 */
@Injectable({providedIn: 'root'})
export class SciMenuEnvironmentProviders {

  // TODO [Angular 22] Remove cast when Angular supports type safety for multi-injection with abstract class DI tokens. See https://github.com/angular/angular/issues/55555
  private readonly _environmentProviders = inject(SciMenuEnvironmentProvider, {optional: true}) as SciMenuEnvironmentProvider[] | null ?? [];

  public provideContext(context: MaybeSignal<Map<string, unknown> | undefined>, options?: {injector?: Injector}): Signal<Map<string, unknown>> {
    const injector = options?.injector ?? inject(Injector);
    const providers: SciMenuEnvironmentProvider[] = [
      ...this._environmentProviders,
      {provideContext: () => computed(() => coerceSignal(context)?.() ?? new Map())}, // higher precedence
    ];

    return providers.reduce((accumulatedContext, provider): Signal<Map<string, unknown>> => {
      const context = coerceSignal(runInInjectionContext(injector, () => provider.provideContext?.()) ?? new Map());
      return computed(() => new Map([...accumulatedContext(), ...context()]), {equal: Objects.isEqual});
    }, signal(new Map<string, unknown>()));
  }

  public provideInjectionContext(menuContext: Map<string, unknown>): Provider[] {
    return this._environmentProviders.flatMap(provider => provider.provideInjectionContext?.(menuContext) ?? []);
  }

  public provideAcceleratorTargets(options?: {injector?: Injector}): Signal<Element[]> {
    const injector = options?.injector ?? inject(Injector);

    return this._environmentProviders.reduce((accumulatedTargets, environmentProvider): Signal<Element[]> => {
      const acceleratorTargets = coerceSignal(runInInjectionContext(injector, () => environmentProvider.provideAcceleratorTargets?.()));

      return computed(() => [
        ...accumulatedTargets(),
        ...Arrays.coerce(acceleratorTargets?.()).map(coerceElement),
      ]);
    }, signal(new Array<Element>()));
  }
}

/**
 * @see SciMenuEnvironmentProvider
 */
export function provideMenuEnvironmentProvider(menuEnvironmentProvider: Type<SciMenuEnvironmentProvider>): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: SciMenuEnvironmentProvider,
      useClass: menuEnvironmentProvider,
      multi: true,
    },
  ]);
}
