/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StartPageComponent } from './start-page/start-page.component';
import { WorkbenchComponent } from './workbench/workbench.component';

const routes: Routes = [
  {
    path: '', component: WorkbenchComponent, children: [
      {path: '', component: StartPageComponent}, // default page displayed when all views are closed
    ],
  },
  {path: 'start-page', component: StartPageComponent, data: {title: 'New Tab', cssClass: 'e2e-start-page'}},
  {
    path: 'test-router',
    loadChildren: (): any => import('./router-page/router-page.module').then(m => m.RouterPageModule),
    data: {title: 'Workbench Router', heading: 'Workbench E2E Testpage', cssClass: 'e2e-test-router', pinToStartPage: true},
  },
  {
    path: 'test-view',
    loadChildren: (): any => import('./view-page/view-page.module').then(m => m.ViewPageModule),
    data: {title: 'Workbench View', heading: 'Workbench E2E Testpage', cssClass: 'e2e-test-view', pinToStartPage: true},
  },
  {
    path: 'test-messagebox',
    loadChildren: (): any => import('./message-box-opener-page/message-box-opener-page.module').then(m => m.MessageBoxOpenerPageModule),
    data: {title: 'Workbench Messagebox', heading: 'Workbench E2E Testpage', cssClass: 'e2e-test-messagebox', pinToStartPage: true},
  },
  {
    path: 'test-notification',
    loadChildren: (): any => import('./notification-page/notification-page.module').then(m => m.NotificationPageModule),
    data: {title: 'Workbench Notification', heading: 'Workbench E2E Testpage', cssClass: 'e2e-test-notification', pinToStartPage: true},
  },
  {
    path: 'test-popup',
    loadChildren: (): any => import('./popup-opener-page/popup-opener-page.module').then(m => m.PopupOpenerPageModule),
    data: {title: 'Workbench Popup', heading: 'Workbench E2E Testpage', cssClass: 'e2e-test-popup', pinToStartPage: true},
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
