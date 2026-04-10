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
 * Provides an environment context for contributions and locations such as toolbars and context menus.
 *
 * The provided environment context is used as the "required" context for contributions and the "available" context for locations.
 *
 * Contributions and locations can override or extend the context.
 */
@Injectable()
export abstract class SciMenuContextProvider {

  /**
   * Injects the environment context from the calling injection context.
   */
  public abstract injectEnvironmentContext(): MaybeSignal<Map<string, unknown>>;

  /**
   * Provides the injection context from given environment context.
   *
   * This is the inverse of {@link injectEnvironmentContext}.
   */
  public abstract provideInjectionContext?(environmentContext: Map<string, unknown>): Provider[];
}
