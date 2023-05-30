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
    data: {[WorkbenchRouteData.title]: 'Navigation Test Page', [WorkbenchRouteData.heading]: 'Workbench E2E Testpage'},
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

