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
 * Provides capability and parameters of a host microfrontend.
 *
 * Can be injected into a microfrontend component of the host application.
 */
export abstract class ActivatedMicrofrontend {
  /**
   * Capability associated with the microfrontend.
   */
  public abstract readonly capability: Signal<Capability>;
  /**
   * Parameters passed to the microfrontend.
   */
  public abstract readonly params: Signal<Map<string, unknown>>;
  /**
   * Symbolic name of the application that opened the microfrontend.
   */
  public abstract readonly referrer: Signal<string>;
}
