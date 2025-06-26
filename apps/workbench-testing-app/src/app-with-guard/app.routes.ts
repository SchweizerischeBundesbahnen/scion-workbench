/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {CanActivateFn, GuardResult, MaybeAsync, RedirectCommand, Router, Routes} from '@angular/router';
import {canMatchWorkbenchOutlet, canMatchWorkbenchPart, canMatchWorkbenchView, WorkbenchRouteData} from '@scion/workbench';
import {inject} from '@angular/core';
import {WorkbenchComponent} from '../app/workbench/workbench.component';

export function routes(options: Record<string, string>): Routes {
  return [
    // PROTECTED ROUTES
    {
      path: '',
      canActivate: [authorizedGuard({forbidden: options['forbidden'] === 'true'})],
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
              path: 'test-view',
              loadComponent: () => import('../app/view-page/view-page.component'),
            },
            {
              path: '',
              canMatch: [canMatchWorkbenchView('test-view')],
              loadComponent: () => import('../app/view-page/view-page.component'),
            },
            {
              path: 'test-part',
              loadComponent: () => import('../app/part-page/part-page.component'),
            },
            {
              path: '',
              canMatch: [canMatchWorkbenchPart('test-part')],
              loadComponent: () => import('../app/part-page/part-page.component'),
            },
            {
              path: 'test-layout',
              loadComponent: () => import('../app/layout-page/layout-page.component'),
              data: {[WorkbenchRouteData.title]: 'Workbench Layout', [WorkbenchRouteData.cssClass]: 'e2e-test-layout', pinToDesktop: true},
            },
            {
              path: 'test-host-popup',
              loadComponent: () => import('../app/host-popup-page/host-popup-page.component'),
            },
            {
              path: 'test-host-dialog',
              loadComponent: () => import('../app/host-dialog-page/host-dialog-page.component'),
            },
            {
              path: 'test-host-message-box',
              loadComponent: () => import('../app/host-message-box-page/host-message-box-page.component'),
            },
          ],
        },
      ],
    },
    // UNPROTECTED ROUTES
    {
      path: 'forbidden',
      loadComponent: () => import('./forbidden/forbidden.component'),
    },
    {
      path: '**',
      redirectTo: '',
    },
  ];
}

function authorizedGuard(options: {forbidden: boolean}): CanActivateFn {
  let callCount = 0;

  return (): MaybeAsync<GuardResult> => {
    const router = inject(Router);

    if (options.forbidden) {
      if (++callCount === 100) {
        console.error('[AuthorizedGuardError] Infinite loop!');
        return false;
      }
      return new RedirectCommand(router.parseUrl('/forbidden'));
    }

    callCount = 0;
    return true;
  };
}
