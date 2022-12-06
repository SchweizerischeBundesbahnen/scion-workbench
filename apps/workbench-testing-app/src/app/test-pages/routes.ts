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

export const routes: Routes = [
  {
    path: 'bulk-navigation-test-page',
    loadComponent: (): any => import('./bulk-navigation-test-page/bulk-navigation-test-page.component').then(m => m.BulkNavigationTestPageComponent),
    data: {[WorkbenchRouteData.title]: 'Bulk Navigation Test', [WorkbenchRouteData.heading]: 'Workbench E2E Testpage', [WorkbenchRouteData.cssClass]: 'e2e-test-bulk-navigation'},
  },
  {
    path: 'view-route-data-test-page',
    loadChildren: (): any => import('./view-route-data-test-page/view-route-data-test-page.module').then(m => m.ViewRouteDataTestPageModule),
    data: {[WorkbenchRouteData.title]: 'View Route Data Test', [WorkbenchRouteData.heading]: 'Workbench E2E Testpage', [WorkbenchRouteData.cssClass]: 'e2e-test-view-route-data'},
  },
  {
    path: 'input-field-test-page',
    loadComponent: (): any => import('./input-field-test-page/input-field-test-page.component').then(m => m.InputFieldTestPageComponent),
    data: {[WorkbenchRouteData.title]: 'Input Field Test Page', [WorkbenchRouteData.heading]: 'Workbench E2E Testpage', [WorkbenchRouteData.cssClass]: 'e2e-test-input-field'},
  },
];
