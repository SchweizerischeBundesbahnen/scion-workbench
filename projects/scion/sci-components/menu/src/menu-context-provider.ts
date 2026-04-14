/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable, Provider} from '@angular/core';
import {MaybeSignal} from '@scion/sci-components/common';

/**
 * Provides a context for contributions and locations such as toolbars and context menus.
 *
 * The provided environment context is used as the "required" context for contributions and the "available" context for locations.
 *
 * Contributions and locations can override or extend the context.
 */
@Injectable()
export abstract class SciMenuContextProvider {

  /**
   * Method invoked to provide the menu context from the calling injection context.
   */
  public abstract provideMenuContext(): MaybeSignal<Map<string, unknown>>;

  /**
   * Method invoked to provide providers for dependency injection from given menu context.
   *
   * Returned providers are available for dependency injection in the menu factory passed to {@link contributeMenu}.
   */
  public abstract provideMenuInjectionContext?(menuContext: Map<string, unknown>): Provider[];
}
