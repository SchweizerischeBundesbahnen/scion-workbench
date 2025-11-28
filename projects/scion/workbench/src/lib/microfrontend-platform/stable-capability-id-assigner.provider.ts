/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Capability, CapabilityInterceptor} from '@scion/microfrontend-platform';
import {Microfrontends} from './common/microfrontend.util';
import {EnvironmentProviders, makeEnvironmentProviders} from '@angular/core';
import {WorkbenchCapabilities} from '@scion/workbench-client';
import {Beans} from '@scion/toolkit/bean-manager';
import {MicrofrontendPlatformStartupPhase, provideMicrofrontendPlatformInitializer} from './microfrontend-platform-initializer';

/**
 * Provides a set of DI providers to assign capabilities of the specified type a stable identifer.
 */
export function provideStableCapabilityId(capabilityType: WorkbenchCapabilities): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideMicrofrontendPlatformInitializer(onPreStartup, {phase: MicrofrontendPlatformStartupPhase.PreStartup}),
  ]);

  function onPreStartup(): void {
    // Register capability interceptor to assign capabilities of the specified type a stable identifer.
    Beans.register(CapabilityInterceptor, {useValue: new StableCapabilityIdAssigner(capabilityType), multi: true});
  }
}

/**
 * Assigns capabilities of the specified type a stable identifer.
 */
class StableCapabilityIdAssigner implements CapabilityInterceptor {

  constructor(private _capabilityType: WorkbenchCapabilities) {
  }

  public async intercept(capability: Capability): Promise<Capability> {
    if (this._capabilityType === capability.type) {
      return {
        ...capability,
        metadata: {
          ...capability.metadata!,
          id: await Microfrontends.createStableIdentifier(capability),
        },
      };
    }

    return capability;
  }
}
