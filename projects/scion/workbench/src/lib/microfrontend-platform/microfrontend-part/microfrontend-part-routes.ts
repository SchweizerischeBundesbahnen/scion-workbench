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
import {computed, EnvironmentProviders, inject, makeEnvironmentProviders} from '@angular/core';
import {APP_IDENTITY, MicrofrontendPlatform, PlatformState} from '@scion/microfrontend-platform';
import {MicrofrontendPartNavigationData} from './microfrontend-part-navigation-data';
import {ManifestObjectCache} from '../manifest-object-cache.service';
import {WORKBENCH_ROUTE} from '../../workbench.constants';
import {MicrofrontendPartComponent} from './microfrontend-part.component';
import {WORKBENCH_OUTLET} from '../../routing/workbench-auxiliary-route-installer.service';
import {ɵWorkbenchRouter} from '../../routing/ɵworkbench-router.service';
import {canMatchWorkbenchPart} from '../../routing/workbench-route-guards';
import {PartId} from '../../workbench.identifiers';
import {Beans} from '@scion/toolkit/bean-manager';
import {firstValueFrom} from 'rxjs';
import {MicrofrontendHostComponent} from '../microfrontend-host/microfrontend-host.component';
import {Maps} from '@scion/toolkit/util';
import {WORKBENCH_PART_REGISTRY} from '../../part/workbench-part.registry';
import {createMicrofrontendHostContext, MicrofrontendHostContext} from '../microfrontend-host/microfrontend-host-context';

/**
 * Hint passed to the navigation when navigating a part microfrontend.
 *
 * @see MicrofrontendPartNavigationData
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
        component: MicrofrontendHostComponent,
        canMatch: [canMatchMicrofrontendPart({host: true})], // use a single matcher because Angular evaluates matchers in parallel
        providers: [provideMicrofrontendHostPartContext()],
      }),
    },
  ]);
}

/**
 * Matches the route if target of a workbench part navigated to a part microfrontend, but only
 * if the part capability exists.
 */
function canMatchMicrofrontendPart(filter: {host: boolean}): CanMatchFn {
  return async (route, segments): Promise<boolean> => {
    if (!canMatchWorkbenchPart(MICROFRONTEND_PART_NAVIGATION_HINT)(route, segments)) {
      return false;
    }

    if (MicrofrontendPlatform.state !== PlatformState.Started) {
      return false; // match until started the microfrontend platform to avoid flickering.
    }

    // Do not block to not block startup, e.g, do not wait for mpf
    // console.log('>>> canMatchMicrofrontendPart', partId, PlatformState[MicrofrontendPlatform.state]);
    // match until started the microfrontend platform to avoid flickering.
    // await MicrofrontendPlatform.whenState(PlatformState.Started);

    // return runInInjectionContext(injector, () => {
    const partId = inject(WORKBENCH_OUTLET) as PartId;
    const layout = inject(ɵWorkbenchRouter).getCurrentNavigationContext().layout;
    const part = layout.part({partId: partId});
    const {capabilityId} = part.navigation!.data as unknown as MicrofrontendPartNavigationData;
    const capability = await firstValueFrom(inject(ManifestObjectCache).observeCapability$(capabilityId));
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

function provideMicrofrontendHostPartContext(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: MicrofrontendHostContext,
      useFactory: (): MicrofrontendHostContext => {
        const partId = inject(WORKBENCH_OUTLET) as PartId;
        const part = inject(WORKBENCH_PART_REGISTRY).get(partId);
        const partNavigationData = computed(() => part.navigation()!.data as unknown as MicrofrontendPartNavigationData);
        return createMicrofrontendHostContext(computed(() => partNavigationData().capabilityId), computed(() => Maps.coerce(partNavigationData().params)))
        // return {
        //   capabilityId: computed(() => partNavigationData().capabilityId),
        //   params: computed(() => Maps.coerce(partNavigationData().params)),
        // }
      },
    },
  ]);
}
