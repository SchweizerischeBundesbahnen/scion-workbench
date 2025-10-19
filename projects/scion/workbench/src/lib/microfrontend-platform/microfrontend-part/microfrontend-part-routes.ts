/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {CanMatchFn, PRIMARY_OUTLET, Route, Router} from '@angular/router';
import {EnvironmentProviders, inject, makeEnvironmentProviders} from '@angular/core';
import {APP_IDENTITY, MicrofrontendPlatform, PlatformState} from '@scion/microfrontend-platform';
import {MicrofrontendPartNavigationData} from './microfrontend-part-navigation-data';
import {ManifestObjectCache} from '../manifest-object-cache.service';
import {WORKBENCH_ROUTE} from '../../workbench.constants';
import {MicrofrontendPartComponent} from './microfrontend-part.component';
import {WORKBENCH_OUTLET} from '../../routing/workbench-auxiliary-route-installer.service';
import {ɵWorkbenchRouter} from '../../routing/ɵworkbench-router.service';
import {canMatchWorkbenchPart, matchesIfNavigated} from '../../routing/workbench-route-guards';
import {PartId} from '../../workbench.identifiers';
import {Beans} from '@scion/toolkit/bean-manager';
import MicrofrontendHostPartComponent from './microfrontend-host-part.component';

/**
 * Hint passed to the navigation when navigating a part microfrontend.
 */
export const MICROFRONTEND_PART_NAVIGATION_HINT = 'scion.workbench.microfrontend-part';

/**
 * Provides the route for integrating microfrontend parts.
 */
export function provideMicrofrontendPartRoute(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: WORKBENCH_ROUTE,
      multi: true,
      useFactory: (): Route => ({
        path: '',
        component: MicrofrontendPartComponent,
        canMatch: [canMatchMicrofrontendPart({host: false})], // use a single matcher because Angular evaluates matchers in parallel
      }),
    },
    {
      provide: WORKBENCH_ROUTE,
      multi: true,
      useFactory: (): Route => ({
        path: '',
        component: MicrofrontendHostPartComponent,
        canMatch: [canMatchMicrofrontendPart({host: true})], // use a single matcher because Angular evaluates matchers in parallel
        children: [
          ...inject(Router).config
            // Filter primary routes.
            .filter(route => !route.outlet || route.outlet === PRIMARY_OUTLET)
            // Filter wildcard route as most likely not indended for workbench outlets. Otherwise, the "Not Found" and "Nothing to Show" pages would never be matched.
            .filter(route => route.path !== '**'),
        ],
      }),
    },
  ]);
}

/**
 * Matches the route if target of a workbench part navigated to a part microfrontend, but only
 * if the part capability exists.
 */
function canMatchMicrofrontendPart(filter: {host: boolean}): CanMatchFn {
  return (route, segments): boolean => {

    if (!canMatchWorkbenchPart(MICROFRONTEND_PART_NAVIGATION_HINT)(route, segments)) {
      return false;
    }

    if (MicrofrontendPlatform.state !== PlatformState.Started) {
      return true; // match until started the microfrontend platform to avoid flickering.
    }

    const partId = inject(WORKBENCH_OUTLET) as PartId;
    const layout = inject(ɵWorkbenchRouter).getCurrentNavigationContext().layout;
    const part = layout.part({partId});
    const {capabilityId} = part.navigation!.data as unknown as MicrofrontendPartNavigationData;
    const capability = inject(ManifestObjectCache).getCapability(capabilityId);
    if (!capability) {
      return false;
    }

    const isHostProvider = capability.metadata?.appSymbolicName === Beans.get(APP_IDENTITY);
    if (filter.host) {
      return isHostProvider;
    }
    else {
      return !isHostProvider;
    }
  };
}
