/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Route} from '@angular/router';
import {EnvironmentProviders, makeEnvironmentProviders} from '@angular/core';
import {WORKBENCH_ROUTE} from '../../workbench.constants';
import {canMatchWorkbenchMessageBoxCapability} from '../microfrontend-host/microfrontend-host-routes';

/**
 * Provides the route for the built-in {@link WorkbenchMessageBoxCapability}.
 */
export function provideMicrofrontendTextMessageBoxRoute(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: WORKBENCH_ROUTE,
      useFactory: (): Route => ({
        path: '',
        loadComponent: () => import('../microfrontend-host-message-box/text-message/text-message.component'),
        canMatch: [canMatchWorkbenchMessageBoxCapability({})],
      }),
      multi: true,
    },
  ]);
}
