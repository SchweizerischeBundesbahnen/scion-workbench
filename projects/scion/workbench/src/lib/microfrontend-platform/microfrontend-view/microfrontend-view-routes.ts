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
import {EnvironmentProviders, inject, makeEnvironmentProviders} from '@angular/core';
import {ɵWorkbenchRouter} from '../../routing/ɵworkbench-router.service';
import {ViewId} from '../../workbench.identifiers';
import {MicrofrontendPlatform, PlatformState} from '@scion/microfrontend-platform';
import {ManifestObjectCache} from '../manifest-object-cache.service';
import {canMatchWorkbenchView} from '../../routing/workbench-route-guards';
import {WORKBENCH_ROUTE} from '../../workbench.constants';
import {MicrofrontendViewComponent} from './microfrontend-view.component';
import {MicrofrontendViewNavigationData} from './microfrontend-view-navigation-data';
import {WORKBENCH_OUTLET} from '../../routing/workbench-auxiliary-route-installer.service';

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
    {
      provide: WORKBENCH_ROUTE,
      multi: true,
      useFactory: (): Route => ({
        path: '',
        component: MicrofrontendViewComponent,
        canMatch: [canMatchMicrofrontendView()], // use a single matcher because Angular evaluates matchers in parallel
      }),
    },
  ]);
}

/**
 * Matches the route if target of a workbench view navigated to a view microfrontend, but only
 * if the view capability exists.
 */
function canMatchMicrofrontendView(): CanMatchFn {
  return (route, segments): boolean => {
    if (!canMatchWorkbenchView(MICROFRONTEND_VIEW_NAVIGATION_HINT)(route, segments)) {
      return false;
    }

    if (MicrofrontendPlatform.state !== PlatformState.Started) {
      return true; // match until started the microfrontend platform to avoid flickering.
    }

    const viewId = inject(WORKBENCH_OUTLET) as ViewId;
    const layout = inject(ɵWorkbenchRouter).getCurrentNavigationContext().layout;
    const view = layout.view({viewId});
    const {capabilityId} = view.navigation!.data as unknown as MicrofrontendViewNavigationData;
    return inject(ManifestObjectCache).hasCapability(capabilityId);
  };
}
