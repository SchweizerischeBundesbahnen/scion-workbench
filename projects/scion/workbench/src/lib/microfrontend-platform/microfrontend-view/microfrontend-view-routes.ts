/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {CanMatchFn, Params, Route} from '@angular/router';
import {WorkbenchViewCapability} from '@scion/workbench-client';
import {EnvironmentProviders, inject, makeEnvironmentProviders, runInInjectionContext, StaticProvider} from '@angular/core';
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
import {ActivatedMicrofrontend} from '../microfrontend-host/microfrontend-host.model';
import {Microfrontends} from '../common/microfrontend.util';

/**
 * Hint passed to the navigation when navigating a microfrontend view.
 */
export const MICROFRONTEND_VIEW_NAVIGATION_HINT = 'scion.workbench.microfrontend-view';

/**
 * Key for associating transient parameters with the navigation state of a microfrontend view navigation.
 */
export const MICROFRONTEND_VIEW_STATE_TRANSIENT_PARAMS = 'transientParams';

/**
 * Splits given params into URL and transient params.
 */
export function splitMicrofrontendViewParams(params: Params, capability: WorkbenchViewCapability): {params: Params; transientParams: Params} {
  const transientParamNames = new Set(capability.params?.filter(param => param.transient).map(param => param.name));

  return Object.entries(params).reduce((groups, [name, value]: [string, unknown]) => {
    if (transientParamNames.has(name)) {
      groups.transientParams[name] = value;
    }
    else {
      groups.params[name] = value;
    }
    return groups;
  }, {params: {} as Params, transientParams: {} as Params});
}

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
  return (route, segments): boolean => {
    if (!canMatchWorkbenchView(MICROFRONTEND_VIEW_NAVIGATION_HINT)(route, segments)) {
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
function provideActivatedMicrofrontend(): StaticProvider {
  return {
    provide: ActivatedMicrofrontend,
    useFactory: () => {
      const view = inject(WorkbenchViewRegistry).get(inject(WORKBENCH_OUTLET) as ViewId);
      // Create in view's injection context to bind 'MicrofrontendView' to the view's lifecycle.
      return runInInjectionContext(view.injector, () => new MicrofrontendHostView(view));
    },
  };
}
