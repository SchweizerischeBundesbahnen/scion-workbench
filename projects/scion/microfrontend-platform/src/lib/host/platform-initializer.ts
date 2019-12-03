/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Beans, Initializer } from '../bean-manager';
import { ApplicationManifest } from '../platform.model';
import { ApplicationRegistry } from './application.registry';
import { ApplicationConfig } from './platform-config';
import { PLATFORM_SYMBOLIC_NAME } from './platform.constants';

/**
 * Initializes the platform.
 */
export class PlatformInitializer implements Initializer {

  public init(): Promise<void> {
    this.registerPlatformApplication();
    return Promise.resolve();
  }

  private registerPlatformApplication(): void {
    const config: ApplicationConfig = {
      symbolicName: PLATFORM_SYMBOLIC_NAME,
      manifestUrl: '',
    };

    const manifest: ApplicationManifest = {
      name: 'SCION Microfrontend Platform',
      capabilities: [],
      intents: [],
    };
    Beans.get(ApplicationRegistry).registerApplication(config, manifest);
  }
}
