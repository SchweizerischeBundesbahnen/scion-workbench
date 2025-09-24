/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
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
    loadComponent: () => import('./router-page/router-page.component'),
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
    loadComponent: () => import('./popup-opener-page/popup-opener-page.component'),
  },
  {
    path: 'test-popup',
    loadComponent: () => import('./popup-page/popup-page.component'),
  },
  {
    path: 'test-dialog-opener',
    loadComponent: () => import('./dialog-opener-page/dialog-opener-page.component'),
  },
  {
    path: 'test-dialog',
    loadComponent: () => import('./dialog-page/dialog-page.component'),
  },
  {
    path: 'test-message-box-opener',
    loadComponent: () => import('./message-box-opener-page/message-box-opener-page.component'),
  },
  {
    path: 'test-message-box',
    loadComponent: () => import('./message-box-page/message-box-page.component'),
  },
  {
    path: 'test-notification-opener',
    loadComponent: () => import('./notification-opener-page/notification-opener-page.component'),
  },
  {
    path: 'register-workbench-capability',
    loadComponent: () => import('./register-workbench-capability-page/register-workbench-capability-page.component'),
  },
  {
    path: 'unregister-workbench-capability',
    loadComponent: () => import('./unregister-workbench-capability-page/unregister-workbench-capability-page.component'),
  },
  {
    path: 'register-workbench-intention',
    loadComponent: () => import('./register-workbench-intention-page/register-workbench-intention-page.component'),
  },
  {
    path: 'messaging',
    loadComponent: () => import('./messaging-page/messaging-page.component'),
  },
  {
    path: 'test-pages',
    loadChildren: () => import('./test-pages/routes'),
  },
  {
    path: 'perspective-pages',
    children: [
      {path: 'bookmarks', loadComponent: () => import('./perspective-pages/bookmarks.component')},
      {path: 'main-area', loadComponent: () => import('./perspective-pages/main-area.component')},
      {path: 'projects', loadComponent: () => import('./perspective-pages/projects.component')},
      {path: 'find', loadComponent: () => import('./perspective-pages/find.component')},
      {path: 'structure', loadComponent: () => import('./perspective-pages/structure.component')},
      {path: 'terminal', loadComponent: () => import('./perspective-pages/terminal.component')},
      {path: 'problems', loadComponent: () => import('./perspective-pages/problems.component')},
    ],
  },
  {
    path: '', // empty-path route is used to test opening a microfrontend with an empty-path (view/popup/dialog)
    pathMatch: 'full',
    loadComponent: () => import('./test-pages/microfrontend-test-page/microfrontend-test-page.component'),
  },
];
