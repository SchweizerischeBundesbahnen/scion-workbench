/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Routes} from '@angular/router';
import {WorkbenchRouteData} from '@scion/workbench';
import StandaloneViewTestPageComponent from './standalone-view-test-page/standalone-view-test-page.component';
import {NonStandaloneViewTestPageComponent} from './non-standalone-view-test-page/non-standalone-view-test-page.component';

export default [
  {
    path: 'bulk-navigation-test-page',
    loadComponent: () => import('./bulk-navigation-test-page/bulk-navigation-test-page.component'),
    data: {[WorkbenchRouteData.title]: 'Bulk Navigation Test', [WorkbenchRouteData.heading]: 'Workbench E2E Testpage', [WorkbenchRouteData.cssClass]: 'e2e-test-bulk-navigation'},
  },
  {
    path: 'view-route-data-test-page',
    loadChildren: () => import('./view-route-data-test-page/view-route-data-test-page.module'),
    data: {[WorkbenchRouteData.title]: 'View Route Data Test', [WorkbenchRouteData.heading]: 'Workbench E2E Testpage', [WorkbenchRouteData.cssClass]: 'e2e-test-view-route-data'},
  },
  {
    path: 'input-field-test-page',
    loadComponent: () => import('./input-field-test-page/input-field-test-page.component'),
    data: {[WorkbenchRouteData.title]: 'Input Field Test Page', [WorkbenchRouteData.heading]: 'Workbench E2E Testpage', [WorkbenchRouteData.cssClass]: 'e2e-test-input-field'},
  },
  {
    path: 'navigation-test-page',
    loadChildren: () => import('./navigation-test-page/routes'),
    data: {[WorkbenchRouteData.title]: 'Navigation Test Page', [WorkbenchRouteData.heading]: 'Workbench E2E Testpage', [WorkbenchRouteData.cssClass]: 'e2e-navigation-test-page'},
  },
  {
    path: 'blank-test-page',
    loadComponent: () => import('./blank-test-page/blank-test-page.component'),
    data: {[WorkbenchRouteData.title]: 'Blank Test Page', [WorkbenchRouteData.heading]: 'Workbench E2E Testpage'},
  },
  {
    path: 'workbench-theme-test-page',
    loadComponent: () => import('./workbench-theme-test-page/workbench-theme-test-page.component'),
    data: {[WorkbenchRouteData.title]: 'Workbench Theme Test Page', [WorkbenchRouteData.heading]: 'Workbench E2E Testpage', [WorkbenchRouteData.cssClass]: 'e2e-test-workbench-theme'},
  },
  {
    path: 'focus-test-page',
    loadComponent: () => import('./focus-test-page/focus-test-page.component'),
    data: {[WorkbenchRouteData.title]: 'Focus Test Page', [WorkbenchRouteData.heading]: 'Workbench E2E Testpage', [WorkbenchRouteData.cssClass]: 'e2e-focus-test-page'},
  },
  {
    path: 'host-focus-test-page',
    loadComponent: () => import('./host-focus-test-page/host-focus-test-page.component'),
    data: {[WorkbenchRouteData.title]: 'Focus Test Page', [WorkbenchRouteData.heading]: 'Workbench E2E Testpage', [WorkbenchRouteData.cssClass]: 'e2e-focus-test-page'},
  },
  {
    path: 'angular-router-test-page',
    loadComponent: () => import('./angular-router-test-page/angular-router-test-page.component'),
    data: {[WorkbenchRouteData.title]: 'Angular Router Test Page', [WorkbenchRouteData.heading]: 'Workbench E2E Testpage', [WorkbenchRouteData.cssClass]: 'e2e-angular-router-test-page'},
  },
  {
    path: 'popup-position-test-page',
    loadComponent: () => import('./popup-position-test-page/popup-position-test-page.component'),
    data: {[WorkbenchRouteData.title]: 'Popup Position Test Page', [WorkbenchRouteData.heading]: 'Workbench E2E Testpage', [WorkbenchRouteData.cssClass]: 'e2e-popup-position-test-page'},
  },
  {
    path: 'size-test-page',
    loadComponent: () => import('./size-test-page/size-test-page.component'),
  },
  {
    path: 'blocking-can-close-test-page',
    loadComponent: () => import('./blocking-can-close-test-page/blocking-can-close-test-page.component'),
  },
  {
    path: 'lifecycle-logger-test-page',
    loadComponent: () => import('./lifecycle-logger-test-page/lifecycle-logger-test-page.component'),
  },
] satisfies Routes;

/**
 * Routes for standalone component test pages.
 */
const standaloneComponentTestPagesRoutes: Routes = [
  {
    path: 'test-pages/standalone-view-test-page/component',
    component: StandaloneViewTestPageComponent,
    data: {[WorkbenchRouteData.title]: 'Standalone View Test Page', [WorkbenchRouteData.heading]: 'Route: {component: component}'},
  },
  {
    path: 'test-pages/standalone-view-test-page/load-component',
    loadComponent: () => import('./standalone-view-test-page/standalone-view-test-page.component'),
    data: {[WorkbenchRouteData.title]: 'Standalone View Test Page', [WorkbenchRouteData.heading]: 'Route: {loadComponent: () => component}'},
  },
  {
    path: 'test-pages/standalone-view-test-page/load-children/module',
    loadChildren: () => import('./standalone-view-test-page/standalone-view-test-page.module'),
    data: {[WorkbenchRouteData.title]: 'Standalone View Test Page', [WorkbenchRouteData.heading]: 'Route: {loadChildren: () => module}'},
  },
  {
    path: 'test-pages/standalone-view-test-page/load-children/routes',
    loadChildren: () => import('./standalone-view-test-page/standalone-view-test-page.module').then(m => m.routes),
    data: {[WorkbenchRouteData.title]: 'Standalone View Test Page', [WorkbenchRouteData.heading]: 'Route: {loadChildren: () => routes}'},
  },
  {
    path: 'test-pages/standalone-view-test-page/children',
    children: [
      {path: '', component: StandaloneViewTestPageComponent},
    ],
    data: {[WorkbenchRouteData.title]: 'Standalone View Test Page', [WorkbenchRouteData.heading]: 'Route: {children: routes}'},
  },
];

/**
 * Routes for non-standalone component test pages.
 */
const nonStandaloneComponentTestPagesRoutes: Routes = [
  {
    path: 'test-pages/non-standalone-view-test-page/component',
    component: NonStandaloneViewTestPageComponent,
    data: {[WorkbenchRouteData.title]: 'Non Standalone View Test Page', [WorkbenchRouteData.heading]: 'Route: {component: component}'},
  },
  {
    path: 'test-pages/non-standalone-view-test-page/load-children/module',
    loadChildren: () => import('./non-standalone-view-test-page/non-standalone-view-test-page.module'),
    data: {[WorkbenchRouteData.title]: 'Non Standalone View Test Page', [WorkbenchRouteData.heading]: 'Route: {loadChildren: () => module}'},
  },
  {
    path: 'test-pages/non-standalone-view-test-page/children',
    children: [
      {path: '', component: NonStandaloneViewTestPageComponent},
    ],
    data: {[WorkbenchRouteData.title]: 'Non Standalone View Test Page', [WorkbenchRouteData.heading]: 'Route: {children: routes}'},
  },
];

/**
 * Routes that should be registered in the app routing module as top-level routes, i.e., not as children of another route.
 */
export const topLevelTestPageRoutes: Routes = [
  ...standaloneComponentTestPagesRoutes,
  ...nonStandaloneComponentTestPagesRoutes,
];
