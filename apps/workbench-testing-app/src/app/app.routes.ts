/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Routes} from '@angular/router';
import {WorkbenchComponent} from './workbench/workbench.component';
import {topLevelTestPageRoutes} from './test-pages/routes';
import {canMatchWorkbenchView, WorkbenchRouteData} from '@scion/workbench';

export const routes: Routes = [
  {
    path: '',
    component: WorkbenchComponent,
    canMatch: [canMatchWorkbenchView(false)],
    children: [
      {
        path: '',
        loadComponent: () => import('./start-page/start-page.component'),
      },
    ],
  },
  {
    path: 'workbench-page',
    redirectTo: '',
  },
  {
    path: '',
    canMatch: [canMatchWorkbenchView('test-router')],
    loadComponent: () => import('./router-page/router-page.component'),
    data: {
      [WorkbenchRouteData.title]: 'Workbench Router',
      [WorkbenchRouteData.heading]: 'Workbench E2E Testpage',
      [WorkbenchRouteData.cssClass]: 'e2e-test-router',
      path: '',
      navigationHint: 'test-router',
    },
  },
  {
    path: '',
    canMatch: [canMatchWorkbenchView('test-view')],
    loadComponent: () => import('./view-page/view-page.component'),
    data: {
      [WorkbenchRouteData.title]: 'Workbench View',
      [WorkbenchRouteData.heading]: 'Workbench E2E Testpage',
      [WorkbenchRouteData.cssClass]: 'e2e-test-view',
      path: '',
      navigationHint: 'test-view',
    },
  },
  {
    path: 'start-page',
    loadComponent: () => import('./start-page/start-page.component'),
    data: {[WorkbenchRouteData.title]: 'New Tab', [WorkbenchRouteData.cssClass]: 'e2e-start-page'},
  },
  {
    path: 'test-router',
    loadComponent: () => import('./router-page/router-page.component'),
    data: {
      [WorkbenchRouteData.title]: 'Workbench Router',
      [WorkbenchRouteData.heading]: 'Workbench E2E Testpage',
      [WorkbenchRouteData.cssClass]: 'e2e-test-router',
      pinToStartPage: true,
      path: 'test-router',
      navigationHint: '',
    },
  },
  {
    path: 'test-view',
    canMatch: [canMatchWorkbenchView('test-view')],
    loadComponent: () => import('./view-page/view-page.component'),
    data: {
      [WorkbenchRouteData.title]: 'Workbench View',
      [WorkbenchRouteData.heading]: 'Workbench E2E Testpage',
      [WorkbenchRouteData.cssClass]: 'e2e-test-view',
      path: 'test-view',
      navigationHint: 'test-view',
    },
  },
  {
    path: 'test-view',
    loadComponent: () => import('./view-page/view-page.component'),
    data: {
      [WorkbenchRouteData.title]: 'Workbench View',
      [WorkbenchRouteData.heading]: 'Workbench E2E Testpage',
      [WorkbenchRouteData.cssClass]: 'e2e-test-view',
      pinToStartPage: true,
      path: 'test-view',
      navigationHint: '',
    },
  },
  {
    path: 'test-layout',
    loadComponent: () => import('./layout-page/layout-page.component'),
    data: {[WorkbenchRouteData.title]: 'Workbench Layout', [WorkbenchRouteData.heading]: 'Workbench E2E Testpage', [WorkbenchRouteData.cssClass]: 'e2e-test-layout', pinToStartPage: true},
  },
  {
    path: 'test-message-box-opener',
    loadComponent: () => import('./message-box-opener-page/message-box-opener-page.component'),
    data: {[WorkbenchRouteData.title]: 'Workbench Messagebox', [WorkbenchRouteData.heading]: 'Workbench E2E Testpage', [WorkbenchRouteData.cssClass]: 'e2e-test-message-box-opener', pinToStartPage: true},
  },
  {
    path: 'test-dialog-opener',
    loadComponent: () => import('./dialog-opener-page/dialog-opener-page.component'),
    data: {[WorkbenchRouteData.title]: 'Workbench Dialog', [WorkbenchRouteData.heading]: 'Workbench E2E Testpage', [WorkbenchRouteData.cssClass]: 'e2e-test-dialog-opener', pinToStartPage: true},
  },
  {
    path: 'test-notification-opener',
    loadComponent: () => import('./notification-opener-page/notification-opener-page.component'),
    data: {[WorkbenchRouteData.title]: 'Workbench Notification', [WorkbenchRouteData.heading]: 'Workbench E2E Testpage', [WorkbenchRouteData.cssClass]: 'e2e-test-notification-opener', pinToStartPage: true},
  },
  {
    path: 'test-popup-opener',
    loadComponent: () => import('./popup-opener-page/popup-opener-page.component'),
    data: {[WorkbenchRouteData.title]: 'Workbench Popup', [WorkbenchRouteData.heading]: 'Workbench E2E Testpage', [WorkbenchRouteData.cssClass]: 'e2e-test-popup-opener', pinToStartPage: true},
  },
  {
    path: 'test-host-popup',
    loadComponent: () => import('./host-popup-page/host-popup-page.component'),
  },
  {
    path: 'test-host-dialog',
    loadComponent: () => import('./host-dialog-page/host-dialog-page.component'),
  },
  {
    path: 'test-host-message-box',
    loadComponent: () => import('./host-message-box-page/host-message-box-page.component'),
  },
  {
    path: 'test-pages',
    loadChildren: () => import('./test-pages/routes'),
  },
  ...topLevelTestPageRoutes,
];
