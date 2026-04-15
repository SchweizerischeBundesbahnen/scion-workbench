/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {inject, Injectable, InjectionToken, Injector, runInInjectionContext} from '@angular/core';
import {materialIconProvider} from './material-icon-provider';
import {scionIconProvider} from './scion-icon-provider';
import {SciIconProviderFn} from './icon-provider.model';
import {SciComponentDescriptor} from '@scion/sci-components/common';

/**
 * Provides icons based on registered icon providers.
 */
@Injectable({providedIn: 'root'})
export class IconProviders {

  private readonly _iconProviders: SciIconProviderFn[] = [
    // Provide app-specific icons.
    ...inject(SCI_ICON_PROVIDER, {optional: true}) ?? [],
    // Provide built-in icons.
    scionIconProvider,
    // Provide material icons.
    materialIconProvider,
  ];
  private readonly _injector = inject(Injector);

  /**
   * Provides the icon descriptor for the given icon based on icon providers registered under the {@link SCI_ICON_PROVIDER} DI token.
   *
   * Icon providers are called in registration order. If a provider does not provide the icon, the next provider is called, and so on.
   */
  public provide(icon: string | undefined): SciComponentDescriptor | undefined {
    if (!icon) {
      return undefined;
    }

    if (!this._iconProviders.length) {
      return undefined;
    }

    for (const iconProvider of this._iconProviders) {
      const componentOrDescriptor = runInInjectionContext(this._injector, () => iconProvider(icon));
      if (componentOrDescriptor) {
        return typeof componentOrDescriptor === 'function' ? {component: componentOrDescriptor} : componentOrDescriptor;
      }
    }
    return undefined;
  }
}

/**
 * Multi-DI token for injecting icon providers.
 *
 * Multiple icon providers can be registered. Providers are called in registration order.
 * If a provider does not provide the icon, the next provider is called, and so on.
 */
export const SCI_ICON_PROVIDER = new InjectionToken<SciIconProviderFn[]>('SCI_ICON_PROVIDER');
