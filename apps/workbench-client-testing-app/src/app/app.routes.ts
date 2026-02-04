/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: 'activator',
    loadChildren: () => import('./activator/activator.module'),
  },
  {
    path: 'test-router',
    loadComponent: () => import('workbench-client-testing-app-common').then(m => m.RouterPageComponent),
  },
  {
    path: 'test-view',
    loadComponent: () => import('./view-page/view-page.component'),
  },
  {
    path: 'test-part',
    loadComponent: () => import('./part-page/part-page.component'),
  },
  {
    path: 'test-popup-opener',
    loadComponent: () => import('workbench-client-testing-app-common').then(m => m.PopupOpenerPageComponent),
  },
  {
    path: 'test-popup',
    loadComponent: () => import('./popup-page/popup-page.component'),
  },
  {
    path: 'test-dialog-opener',
    loadComponent: () => import('workbench-client-testing-app-common').then(m => m.DialogOpenerPageComponent),
  },
  {
    path: 'test-dialog',
    loadComponent: () => import('./dialog-page/dialog-page.component'),
  },
  {
    path: 'test-message-box-opener',
    loadComponent: () => import('workbench-client-testing-app-common').then(m => m.MessageBoxOpenerPageComponent),
  },
  {
    path: 'test-message-box',
    loadComponent: () => import('./message-box-page/message-box-page.component'),
  },
  {
    path: 'test-notification-opener',
    loadComponent: () => import('workbench-client-testing-app-common').then(m => m.NotificationOpenerPageComponent),
  },
  {
    path: 'test-notification',
    loadComponent: () => import('./notification-page/notification-page.component'),
  },
  {
    path: 'register-workbench-capability',
    loadComponent: () => import('workbench-client-testing-app-common').then(m => m.RegisterWorkbenchCapabilityPageComponent),
  },
  {
    path: 'unregister-workbench-capability',
    loadComponent: () => import('workbench-client-testing-app-common').then(m => m.UnregisterWorkbenchCapabilityPageComponent),
  },
  {
    path: 'register-workbench-intention',
    loadComponent: () => import('workbench-client-testing-app-common').then(m => m.RegisterWorkbenchIntentionPageComponent),
  },
  {
    path: 'messaging',
    loadComponent: () => import('workbench-client-testing-app-common').then(m => m.MessagingPageComponent),
  },
  {
    path: 'test-pages',
    loadChildren: () => import('./test-pages/routes'),
  },
  {
    path: '', // empty-path route is used to test opening a microfrontend with an empty-path (view/popup/dialog)
    pathMatch: 'full',
    loadComponent: () => import('./test-pages/microfrontend-test-page/microfrontend-test-page.component'),
  },
];
