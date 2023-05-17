/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {StartPageComponent} from './start-page/start-page.component';
import {WorkbenchComponent} from './workbench/workbench.component';
import {WorkbenchRouteData} from '@scion/workbench';
import {topLevelTestPageRoutes} from './test-pages/routes';

const routes: Routes = [
  {
    path: '', component: WorkbenchComponent, children: [
      {path: '', component: StartPageComponent}, // default page displayed when all views are closed
    ],
  },
  {path: 'start-page', component: StartPageComponent, data: {[WorkbenchRouteData.title]: 'New Tab', [WorkbenchRouteData.cssClass]: 'e2e-start-page'}},
  {
    path: 'test-router',
    loadComponent: () => import('./router-page/router-page.component'),
    data: {[WorkbenchRouteData.title]: 'Workbench Router', [WorkbenchRouteData.heading]: 'Workbench E2E Testpage', [WorkbenchRouteData.cssClass]: 'e2e-test-router', pinToStartPage: true},
  },
  {
    path: 'test-view',
    loadComponent: () => import('./view-page/view-page.component'),
    data: {[WorkbenchRouteData.title]: 'Workbench View', [WorkbenchRouteData.heading]: 'Workbench E2E Testpage', [WorkbenchRouteData.cssClass]: 'e2e-test-view', pinToStartPage: true},
  },
  {
    path: 'test-layout',
    loadComponent: () => import('./layout-page/layout-page.component'),
    data: {[WorkbenchRouteData.title]: 'Workbench Layout', [WorkbenchRouteData.heading]: 'Workbench E2E Testpage', [WorkbenchRouteData.cssClass]: 'e2e-test-layout', pinToStartPage: true},
  },
  {
    path: 'test-message-box',
    loadChildren: (): any => import('./message-box-opener-page/message-box-opener-page.module').then(m => m.MessageBoxOpenerPageModule),
    data: {[WorkbenchRouteData.title]: 'Workbench Messagebox', [WorkbenchRouteData.heading]: 'Workbench E2E Testpage', [WorkbenchRouteData.cssClass]: 'e2e-test-message-box', pinToStartPage: true},
  },
  {
    path: 'test-notification',
    loadChildren: (): any => import('./notification-opener-page/notification-opener-page.module').then(m => m.NotificationOpenerPageModule),
    data: {[WorkbenchRouteData.title]: 'Workbench Notification', [WorkbenchRouteData.heading]: 'Workbench E2E Testpage', [WorkbenchRouteData.cssClass]: 'e2e-test-notification', pinToStartPage: true},
  },
  {
    path: 'test-popup',
    loadChildren: (): any => import('./popup-opener-page/popup-opener-page.module').then(m => m.PopupOpenerPageModule),
    data: {[WorkbenchRouteData.title]: 'Workbench Popup', [WorkbenchRouteData.heading]: 'Workbench E2E Testpage', [WorkbenchRouteData.cssClass]: 'e2e-test-popup', pinToStartPage: true},
  },
  {
    path: 'route-register',
    loadComponent: () => import('./route-register-page/route-register-page.component'),
    data: {[WorkbenchRouteData.title]: 'Route Registrator', [WorkbenchRouteData.heading]: 'Workbench E2E Testpage', [WorkbenchRouteData.cssClass]: 'e2e-route-registrator', pinToStartPage: true},
  },
  {
    path: 'host-popup',
    loadChildren: (): any => import('./host-popup-page/host-popup-page.module').then(m => m.HostPopupPageModule),
  },
  {
    path: 'test-navigation',
    loadChildren: (): any => import('./navigation-test-page/navigation-test-page.module').then(m => m.NavigationTestPageModule),
    data: {[WorkbenchRouteData.title]: 'Navigation Test', [WorkbenchRouteData.heading]: 'Workbench E2E Testpage'},
  },
  {
    path: 'test-pages',
    loadChildren: (): any => import('./test-pages/routes'),
  },
  ...topLevelTestPageRoutes,
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
