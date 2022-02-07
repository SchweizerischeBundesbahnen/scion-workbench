/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {MicrofrontendPlatformConfig} from '@scion/microfrontend-platform';

/**
 * Allows loading the configuration for the SCION Microfrontend Platform asynchronously, e.g., over the network or from a JSON file.
 */
export abstract class MicrofrontendPlatformConfigLoader {

  /**
   * Loads the platform configuration asynchronously.
   */
  public abstract load(): Promise<MicrofrontendPlatformConfig>;
}
