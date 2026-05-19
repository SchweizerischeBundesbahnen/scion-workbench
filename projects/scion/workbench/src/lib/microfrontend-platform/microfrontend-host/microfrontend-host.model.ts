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
import {InjectionToken, Signal} from '@angular/core';

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

/**
 * DI token for a factory that provides {@link ActivatedMicrofrontend} to host microfrontends.
 *
 * Providing {@link ActivatedMicrofrontend} via a factory function gives control over the injection context in which {@link ActivatedMicrofrontend} is constructed.
 * The injection context will be destroyed when the host microfrontend is destroyed, releasing allocated resources and unregistering effects.
 *
 * Without the factory, {@link ActivatedMicrofrontend} would not be destroyed if it were provided at the route level, because Angular does not destroy route providers
 * when destroying the routed component. Route providers are used, for example, for part and view host microfrontends.
 */
export const ACTIVATED_MICROFRONTEND_FACTORY = new InjectionToken<() => ActivatedMicrofrontend>('ACTIVATED_MICROFRONTEND_FACTORY');
