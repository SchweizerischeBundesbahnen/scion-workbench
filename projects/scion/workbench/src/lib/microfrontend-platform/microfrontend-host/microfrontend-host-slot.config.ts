/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Signal} from '@angular/core';

/**
 * Configures {@link MicrofrontendHostSlotComponent} to display a specific host microfrontend.
 */
export abstract class HostSlotConfig {
  /**
   * Specifies the host microfrontend to display in the slot.
   */
  public abstract readonly capabilityId: Signal<string>;
  /**
   * Specifies parameters available in the microfrontend.
   */
  public abstract readonly params: Signal<Map<string, unknown>>;
  /**
   * Specifies a callback invoked when loading the microfrontend.
   */
  public abstract readonly onLoad?: () => void;
}
