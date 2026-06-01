/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {CanMatchFn, Route} from '@angular/router';
import {EnvironmentProviders, inject, makeEnvironmentProviders, Provider} from '@angular/core';
import {ɵWorkbenchRouter} from '../../routing/ɵworkbench-router.service';
import {ViewId} from '../../workbench.identifiers';
import {MicrofrontendPlatform, PlatformState} from '@scion/microfrontend-platform';
import {ManifestObjectCache} from '../manifest-object-cache.service';
import {canMatchWorkbenchView} from '../../routing/workbench-route-guards';
import {WORKBENCH_ROUTE} from '../../workbench.constants';
import {MicrofrontendViewComponent} from './microfrontend-view.component';
import {MicrofrontendViewNavigationData} from './microfrontend-view-navigation-data';
import {WORKBENCH_OUTLET} from '../../routing/workbench-auxiliary-route-installer.service';
import {MicrofrontendHostComponent} from '../microfrontend-host/microfrontend-host.component';
import {WorkbenchViewRegistry} from '../../view/workbench-view.registry';
import {MicrofrontendHostView} from '../microfrontend-host-view/microfrontend-host-view.model';
import {ACTIVATED_MICROFRONTEND_FACTORY} from '../microfrontend-host/microfrontend-host.model';
import {Microfrontends} from '../common/microfrontend.util';

/**
 * Hint passed to the navigation when navigating a microfrontend view.
 */
export const MICROFRONTEND_VIEW_NAVIGATION_HINT = 'scion.workbench.microfrontend-view';

/**
 * Provides the route for integrating microfrontend views.
 */
export function provideMicrofrontendViewRoute(): EnvironmentProviders {
  return makeEnvironmentProviders([
    // Route for embedding non-host microfrontend using <sci-router-outlet>.
    {
      provide: WORKBENCH_ROUTE,
      useFactory: (): Route => ({
        path: '',
        component: MicrofrontendViewComponent,
        canMatch: [canMatchMicrofrontendView({host: false})], // use a single matcher because Angular evaluates matchers in parallel
      }),
      multi: true,
    },
    // Route for embedding host microfrontend using Angular <router-outlet>.
    {
      provide: WORKBENCH_ROUTE,
      useFactory: (): Route => ({
        path: '',
        component: MicrofrontendHostComponent,
        canMatch: [canMatchMicrofrontendView({host: true})], // use a single matcher because Angular evaluates matchers in parallel
        providers: [provideActivatedMicrofrontend()],
      }),
      multi: true,
    },
  ]);
}

/**
 * Matches the route if target of a workbench view navigated to a view microfrontend, but only
 * if the view capability exists.
 */
function canMatchMicrofrontendView(matcher: {host: boolean}): CanMatchFn {
  return (route, segments, currentSnapshot): boolean => {
    if (!canMatchWorkbenchView(MICROFRONTEND_VIEW_NAVIGATION_HINT)(route, segments, currentSnapshot)) {
      return false;
    }

    // Guards cannot block waiting for platform startup, as the platform may start later in the bootstrapping, causing a deadlock.
    // Guards are re-evaluated after startup. See `runCanMatchGuardsAfterStartup`.
    if (MicrofrontendPlatform.state !== PlatformState.Started) {
      return false;
    }

    const viewId = inject(WORKBENCH_OUTLET) as ViewId;
    const layout = inject(ɵWorkbenchRouter).getCurrentNavigationContext().layout;
    const view = layout.view({viewId});
    const {capabilityId} = view.navigation!.data as unknown as MicrofrontendViewNavigationData;
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
function provideActivatedMicrofrontend(): Provider {
  return {
    provide: ACTIVATED_MICROFRONTEND_FACTORY,
    useValue: () => new MicrofrontendHostView(inject(WorkbenchViewRegistry).get(inject(WORKBENCH_OUTLET) as ViewId)),
  };
}
