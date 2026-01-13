/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {CanMatchFn, Route} from '@angular/router';
import {EnvironmentProviders, inject, makeEnvironmentProviders, runInInjectionContext, StaticProvider} from '@angular/core';
import {MicrofrontendPlatform, PlatformState} from '@scion/microfrontend-platform';
import {MicrofrontendPartNavigationData} from './microfrontend-part-navigation-data';
import {ManifestObjectCache} from '../manifest-object-cache.service';
import {WORKBENCH_ROUTE} from '../../workbench.constants';
import {MicrofrontendPartComponent} from './microfrontend-part.component';
import {WORKBENCH_OUTLET} from '../../routing/workbench-auxiliary-route-installer.service';
import {ɵWorkbenchRouter} from '../../routing/ɵworkbench-router.service';
import {canMatchWorkbenchPart} from '../../routing/workbench-route-guards';
import {PartId} from '../../workbench.identifiers';
import {WorkbenchPartRegistry} from '../../part/workbench-part.registry';
import {MicrofrontendHostComponent} from '../microfrontend-host/microfrontend-host.component';
import {MicrofrontendHostPart} from '../microfrontend-host-part/microfrontend-host-part.model';
import {ActivatedMicrofrontend} from '../microfrontend-host/microfrontend-host.model';
import {Microfrontends} from '../common/microfrontend.util';

/**
 * Hint passed to the navigation when navigating a microfrontend part.
 */
export const MICROFRONTEND_PART_NAVIGATION_HINT = 'scion.workbench.microfrontend-part';

/**
 * Provides the route for integrating microfrontend parts.
 */
export function provideMicrofrontendPartRoute(): EnvironmentProviders {
  return makeEnvironmentProviders([
    // Route for embedding non-host microfrontend using <sci-router-outlet>.
    {
      provide: WORKBENCH_ROUTE,
      useFactory: (): Route => ({
        path: '',
        component: MicrofrontendPartComponent,
        canMatch: [canMatchMicrofrontendPart({host: false})], // use a single matcher because Angular evaluates matchers in parallel
      }),
      multi: true,
    },
    // Route for embedding host microfrontend using Angular <router-outlet>.
    {
      provide: WORKBENCH_ROUTE,
      useFactory: (): Route => ({
        path: '',
        component: MicrofrontendHostComponent,
        canMatch: [canMatchMicrofrontendPart({host: true})], // use a single matcher because Angular evaluates matchers in parallel
        providers: [provideActivatedMicrofrontend()],
      }),
      multi: true,
    },
  ]);
}

/**
 * Matches the route if target of a workbench part navigated to a part microfrontend, but only
 * if the part capability exists.
 */
function canMatchMicrofrontendPart(matcher: {host: boolean}): CanMatchFn {
  return (route, segments): boolean => {
    if (!canMatchWorkbenchPart(MICROFRONTEND_PART_NAVIGATION_HINT)(route, segments)) {
      return false;
    }

    // Guards cannot block waiting for platform startup, as the platform may start later in the bootstrapping, causing a deadlock.
    // Guards are re-evaluated after startup. See `runCanMatchGuardsAfterStartup`.
    if (MicrofrontendPlatform.state !== PlatformState.Started) {
      return false;
    }

    const partId = inject(WORKBENCH_OUTLET) as PartId;
    const layout = inject(ɵWorkbenchRouter).getCurrentNavigationContext().layout;
    const part = layout.part({partId});
    const {capabilityId} = part.navigation!.data as unknown as MicrofrontendPartNavigationData;
    const capability = inject(ManifestObjectCache).capability(capabilityId)();
    if (!capability) {
      return false;
    }

    return matcher.host === Microfrontends.isHostProvider(capability);
  };
}

/**
 * Provides {@link ActivatedMicrofrontend} for injection in the host microfrontend.
 */
function provideActivatedMicrofrontend(): StaticProvider {
  return {
    provide: ActivatedMicrofrontend,
    useFactory: () => {
      const part = inject(WorkbenchPartRegistry).get(inject(WORKBENCH_OUTLET) as PartId);
      // Create in part's injection context to bind 'MicrofrontendPart' to the part's lifecycle.
      return runInInjectionContext(part.injector, () => new MicrofrontendHostPart(part));
    },
  };
}
