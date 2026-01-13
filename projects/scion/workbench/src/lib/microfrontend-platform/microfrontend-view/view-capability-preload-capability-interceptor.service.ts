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
import {inject, Injectable} from '@angular/core';
import {WorkbenchCapabilities, WorkbenchViewCapability} from '@scion/workbench-client';
import '../microfrontend-platform.config';
import {Logger} from '../../logging';
import {Microfrontends} from '../common/microfrontend.util';

/**
 * Configures view capabilities not defining {@link WorkbenchViewCapability.properties.lazy} to preload views to maintain compatibility with applications setting view titles and headings in view microfrontends.
 *
 * @see MicrofrontendPlatformConfig.preloadInactiveViews
 */
@Injectable(/* DO NOT provide via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
export class ViewCapabilityPreloadCapabilityInterceptor implements CapabilityInterceptor {

  private readonly _logger = inject(Logger);

  public async intercept(capability: Capability): Promise<Capability> {
    if (capability.type !== WorkbenchCapabilities.View) {
      return capability;
    }

    const viewCapability = capability as WorkbenchViewCapability;

    // Lazy is not supported for host view capabilities.
    if (Microfrontends.isHostProvider(capability)) {
      return viewCapability;
    }

    if (viewCapability.properties.lazy === undefined) {
      viewCapability.properties.lazy = false;
      const appSymbolicName = viewCapability.metadata?.appSymbolicName;
      const qualifier = Object.entries(viewCapability.qualifier).reduce((qualifier, [key, value]) => `${qualifier};${key}=${value}`, '').substring(1);
      this._logger.warn(`[Deprecation] Application '${appSymbolicName}' provides a "non-lazy" view capability: {${qualifier}}. Change to lazy by setting 'lazy' in capability properties. Lazy views require a title and heading in the manifest. Title and heading can be localized with optional interpolation parameters using resolvers. See documentation for details: https://workbench-client-api.scion.vercel.app/interfaces/WorkbenchViewCapability.html`);
    }

    return viewCapability;
  }
}
