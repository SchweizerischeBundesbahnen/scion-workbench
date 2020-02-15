/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Beans, PreDestroy } from '../bean-manager';
import { AnyQualifier, ApplicationManifest, Intention, PlatformCapabilityTypes } from '../platform.model';
import { ApplicationConfig, PlatformRestrictions } from './platform-config';
import { PLATFORM_SYMBOLIC_NAME } from './platform.constants';

/**
 * Provides the {@link ApplicationConfig} for the platform app running in the platform host.
 *
 * This app is used by the platform in the host to connect to the message broker and to provide platform specific capabilities,
 * or to issue intents in the name of the platform.
 *
 * @ignore
 */
export class HostPlatformAppProvider implements PreDestroy {

  public readonly appConfig: ApplicationConfig;

  constructor() {
    const manifest: ApplicationManifest = {
      name: 'SCION Microfrontend Platform',
      capabilities: [],
      intentions: [
        ...provideActivatorApiIntentions(),
      ],
    };

    this.appConfig = {
      symbolicName: PLATFORM_SYMBOLIC_NAME,
      manifestUrl: URL.createObjectURL(new Blob([JSON.stringify(manifest)], {type: 'application/json'})),
    };
  }

  public preDestroy(): void {
    URL.revokeObjectURL(this.appConfig.manifestUrl);
  }
}

/**
 * If the 'Activator API' is enabled, authorize the host platform app to read activators from the manifest registry.
 *
 * @ignore
 */
function provideActivatorApiIntentions(): Intention[] {
  return Beans.get(PlatformRestrictions).activatorApiDisabled ? [] : [{type: PlatformCapabilityTypes.Activator, qualifier: AnyQualifier}];
}
