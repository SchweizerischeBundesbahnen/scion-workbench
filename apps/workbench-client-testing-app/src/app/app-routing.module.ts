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

const routes: Routes = [
  {
    path: 'activator',
    loadChildren: (): any => import('./activator/activator.module').then(m => m.ActivatorModule),
  },
  {
    path: 'microfrontend',
    loadComponent: (): any => import('./microfrontend-page/microfrontend-page.component').then(m => m.MicrofrontendPageComponent),
  },
  {
    path: 'test-router',
    loadChildren: (): any => import('./router-page/router-page.module').then(m => m.RouterPageModule),
  },
  {
    path: 'test-view',
    loadChildren: (): any => import('./view-page/view-page.module').then(m => m.ViewPageModule),
  },
  {
    path: 'test-popup',
    loadChildren: (): any => import('./popup-opener-page/popup-opener-page.module').then(m => m.PopupOpenerPageModule),
  },
  {
    path: 'popup',
    loadChildren: (): any => import('./popup-page/popup-page.module').then(m => m.PopupPageModule),
  },
  {
    path: 'test-message-box',
    loadChildren: (): any => import('./message-box-opener-page/message-box-opener-page.module').then(m => m.MessageBoxOpenerPageModule),
  },
  {
    path: 'test-notification',
    loadChildren: (): any => import('./notification-opener-page/notification-opener-page.module').then(m => m.NotificationOpenerPageModule),
  },
  {
    path: 'register-workbench-capability',
    loadChildren: (): any => import('./register-workbench-capability-page/register-workbench-capability-page.module').then(m => m.RegisterWorkbenchCapabilityPageModule),
  },
  {
    path: 'unregister-workbench-capability',
    loadChildren: (): any => import('./unregister-workbench-capability-page/unregister-workbench-capability-page.module').then(m => m.UnregisterWorkbenchCapabilityPageModule),
  },
  {
    path: 'register-workbench-intention',
    loadChildren: (): any => import('./register-workbench-intention-page/register-workbench-intention-page.module').then(m => m.RegisterWorkbenchIntentionPageModule),
  },
  {
    path: 'test-pages',
    loadChildren: (): any => import('./test-pages/routes').then(m => m.routes),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
