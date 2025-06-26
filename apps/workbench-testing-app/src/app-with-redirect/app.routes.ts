/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Routes} from '@angular/router';
import {canMatchWorkbenchOutlet, canMatchWorkbenchPart, WorkbenchRouteData} from '@scion/workbench';
import {WorkbenchComponent} from '../app/workbench/workbench.component';

export function routes(options: Record<string, string>): Routes {
  switch (options['routes']) {
    case 'flat':
      return [
        {
          path: '',
          canMatch: [canMatchWorkbenchOutlet(false)],
          component: WorkbenchComponent,
        },
        {
          path: '',
          canMatch: [canMatchWorkbenchPart('main-area')],
          loadComponent: () => import('../app/start-page/start-page.component'),
        },
        {
          path: 'start-page',
          loadComponent: () => import('../app/start-page/start-page.component'),
        },
        {
          path: 'test-layout',
          loadComponent: () => import('../app/layout-page/layout-page.component'),
          data: {[WorkbenchRouteData.title]: 'Workbench Layout', [WorkbenchRouteData.cssClass]: 'e2e-test-layout', pinToDesktop: true},
        },
        {
          path: 'redirect',
          loadComponent: () => import('./redirect/redirect.component'),
        },
        {
          path: '**',
          redirectTo: 'redirect',
        },
      ];
    case 'nested':
      return [
        {
          path: '',
          children: [
            {
              path: '',
              canMatch: [canMatchWorkbenchOutlet(false)],
              component: WorkbenchComponent,
            },
            {
              path: '',
              canMatch: [canMatchWorkbenchOutlet(true)],
              children: [
                {
                  path: '',
                  canMatch: [canMatchWorkbenchPart('main-area')],
                  loadComponent: () => import('../app/start-page/start-page.component'),
                },
                {
                  path: 'start-page',
                  loadComponent: () => import('../app/start-page/start-page.component'),
                },
                {
                  path: 'test-layout',
                  loadComponent: () => import('../app/layout-page/layout-page.component'),
                  data: {[WorkbenchRouteData.title]: 'Workbench Layout', [WorkbenchRouteData.cssClass]: 'e2e-test-layout', pinToDesktop: true},
                },
              ],
            },
          ],
        },
        {
          path: 'redirect',
          loadComponent: () => import('./redirect/redirect.component'),
        },
        {
          path: '**',
          redirectTo: 'redirect',
        },
      ];
    default: {
      throw Error(`[AppWithRedirectError] Unsupported 'routes' option: ${options['routes']}`);
    }
  }
}
