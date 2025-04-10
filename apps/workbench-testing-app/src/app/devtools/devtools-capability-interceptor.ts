/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Capability, CapabilityInterceptor, QualifierMatcher} from '@scion/microfrontend-platform';
import {EnvironmentProviders, makeEnvironmentProviders} from '@angular/core';
import {WorkbenchCapabilities} from '@scion/workbench-client';
import {MicrofrontendPlatformStartupPhase, provideMicrofrontendPlatformInitializer} from '@scion/workbench';
import {Beans} from '@scion/toolkit/bean-manager';

/**
 * Qualifier of the SCION DevTools view capability.
 */
const DEVTOOLS_QUALIFIER_MATCHER = new QualifierMatcher({component: 'devtools', vendor: 'scion'});

/**
 * Intercepts the DevTools view capability to pin it to the desktop.
 */
class DevToolsViewCapabilityInterceptor implements CapabilityInterceptor {

  public async intercept(capability: Capability): Promise<Capability> {
    if (capability.type !== WorkbenchCapabilities.View) {
      return capability;
    }
    if (!DEVTOOLS_QUALIFIER_MATCHER.matches(capability.qualifier)) {
      return capability;
    }

    // Add property to pin DevTools to the desktop.
    capability.properties = {
      ...capability.properties,
      pinToDesktop: true,
    };

    return capability;
  }
}

/**
 * Provides a set of DI providers to pin DevTools to the desktop.
 */
export function provideDevToolsInterceptor(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideMicrofrontendPlatformInitializer(() => void Beans.register(CapabilityInterceptor, {useClass: DevToolsViewCapabilityInterceptor, multi: true}), {phase: MicrofrontendPlatformStartupPhase.PreStartup}),
  ]);
}
