/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Capability} from '@scion/microfrontend-platform';
import {Signal} from '@angular/core';

/**
 * Provides access to parameters and capability in a host microfrontend component.
 *
 * Can be injected into a host microfrontend component.
 */
export abstract class ActivatedMicrofrontend<T extends Capability = Capability> {
  /**
   * Capability associated with the microfrontend.
   */
  public abstract readonly capability: T;
  /**
   * Parameters passed to the microfrontend.
   */
  public abstract readonly params: Signal<Map<string, unknown>>;
}
