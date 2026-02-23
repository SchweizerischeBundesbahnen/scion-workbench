/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ElementRef, Injectable, Provider} from '@angular/core';
import {MaybeArray, MaybeSignal} from '@scion/sci-components/common';

/**
 * Provides a context for contributions and locations such as toolbars and context menus.
 *
 * The provided environment context is used as the "required" context for contributions and the "available" context for locations.
 *
 * Contributions and locations can override or extend the context.
 *
 * Can be registered via {@link provideMenuEnvironmentProvider}.
 *
 * @see provideMenuEnvironmentProvider
 */
@Injectable()
export abstract class SciMenuEnvironmentProvider {

  /**
   * Method invoked to provide the menu context from the calling injection context.
   *
   * The function can call `inject` to create the context based on the menu's injection context.
   */
  public abstract provideContext?(): MaybeSignal<Map<string, unknown>>;

  /**
   * Method invoked to provide providers for dependency injection from given menu context.
   *
   * Returned providers are available for dependency injection in the menu factory passed to {@link contributeMenu}.
   */
  public abstract provideInjectionContext?(context: Map<string, unknown>): Provider[];

  /**
   * The function can call `inject` to get targets based on the menu's injection context.
   */
  public abstract provideAcceleratorTargets?(): MaybeSignal<MaybeArray<Element | ElementRef<Element>> | undefined>;
}
