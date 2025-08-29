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

const routes: Routes = [
  {
    path: 'bulk-navigation-test-page',
    loadComponent: (): any => import('./bulk-navigation-test-page/bulk-navigation-test-page.component'),
  },
  {
    path: 'view-properties-test-page',
    loadComponent: (): any => import('./view-properties-test-page/view-properties-test-page.component'),
  },
  {
    path: 'dialog-properties-test-page',
    loadComponent: (): any => import('./dialog-properties-test-page/dialog-properties-test-page.component'),
  },
  {
    path: 'input-field-test-page',
    loadComponent: (): any => import('./input-field-test-page/input-field-test-page.component'),
  },
  {
    path: 'focus-test-page',
    loadComponent: () => import('./focus-test-page/focus-test-page.component'),
  },
  {
    path: 'angular-zone-test-page',
    loadComponent: (): any => import('./angular-zone-test-page/angular-zone-test-page.component'),
  },
  {
    path: 'microfrontend-test-page',
    loadComponent: () => import('./microfrontend-test-page/microfrontend-test-page.component'),
  },
  {
    path: 'signal-ready-test-page',
    loadComponent: () => import('./signal-ready-test-page/signal-ready-test-page.component'),
  },
  {
    path: 'popup-test-page',
    children: [
      {
        path: 'popup1',
        loadComponent: () => import('../popup-page/popup-page.component'),
      },
      {
        path: 'popup2',
        loadComponent: () => import('../popup-page/popup-page.component'),
      },
      {
        path: ':segment1/segment2/:segment3',
        loadComponent: () => import('../popup-page/popup-page.component'),
      },
    ],
  },
  {
    path: 'dialog-test-page',
    children: [
      {
        path: ':segment',
        loadComponent: () => import('../dialog-page/dialog-page.component'),
      },
    ],
  },
  {
    path: 'message-box-test-page',
    children: [
      {
        path: ':segment1/segment2',
        loadComponent: () => import('../message-box-page/message-box-page.component'),
      },
    ],
  },
  {
    path: 'view-test-page',
    children: [
      {
        path: 'view1',
        loadComponent: () => import('../view-page/view-page.component'),
      },
      {
        path: 'view2',
        loadComponent: () => import('../view-page/view-page.component'),
      },
      {
        path: ':segment1',
        loadComponent: () => import('../view-page/view-page.component'),
      },
      {
        path: ':segment1/:segment2',
        loadComponent: () => import('../view-page/view-page.component'),
      },
      {
        path: ':segment1/segment2/:segment3',
        loadComponent: () => import('../view-page/view-page.component'),
      },
    ],
  },
  {
    path: 'workbench-theme-test-page',
    loadComponent: (): any => import('./workbench-theme-test-page/workbench-theme-test-page.component'),
  },
  {
    path: 'size-test-page',
    loadComponent: () => import('./size-test-page/size-test-page.component'),
  },
  {
    path: 'text-test-page',
    loadComponent: () => import('./text-test-page/text-test-page.component'),
  },
];

export default routes;
