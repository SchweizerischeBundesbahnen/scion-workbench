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
import BlankTestPageComponent from '../blank-test-page/blank-test-page.component';

export const featureRoutes: Routes = [
  {
    path: 'feature-a',
    component: BlankTestPageComponent,
  },
  {
    path: 'feature-b',
    component: BlankTestPageComponent,
    data: {
      [WorkbenchRouteData.title]: 'Feature B Title',
      [WorkbenchRouteData.heading]: 'Feature B Heading',
      [WorkbenchRouteData.cssClass]: 'e2e-feature-b',
    },
  },
  {
    path: 'feature-c',
    loadComponent: () => import('../blank-test-page/blank-test-page.component'),
  },
  {
    path: 'feature-d',
    loadComponent: () => import('../blank-test-page/blank-test-page.component'),
    data: {
      [WorkbenchRouteData.title]: 'Feature D Title',
      [WorkbenchRouteData.heading]: 'Feature D Heading',
      [WorkbenchRouteData.cssClass]: 'e2e-feature-d',
    },
  },
];
