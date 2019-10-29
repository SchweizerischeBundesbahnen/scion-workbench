/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Capability, PlatformCapabilityTypes } from './core.model';

/**
 * Activator capabilities are loaded at platform startup allowing applications to interact with the platform, even if no microfrontend of that application is running,
 * e.g., to dynamically register capabilities based on some application state.
 */
export interface ActivatorCapability extends Capability {
  type: PlatformCapabilityTypes.Activator;

  properties: {

    /**
     * Path to the module to be instantiated at platform startup.
     *
     * The path is relative to the base URL as specified in the application manifest.
     */
    path: string;
  };
}
