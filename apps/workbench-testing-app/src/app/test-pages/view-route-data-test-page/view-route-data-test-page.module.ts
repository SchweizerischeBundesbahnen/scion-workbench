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
import {RouterModule} from '@angular/router';
import {WorkbenchRouteData} from '@scion/workbench';
import {featureRoutes} from './feature-routes';

/**
 * Test setup:
 *
 *                              +------------------+
 *                              | AppRoutingModule |
 *                              +------------------+
 *                                       |
 *                      test-pages/view-route-data-test-page
 *                                       |
 *                        +-----------------------------+
 *                        | ViewRouteDataTestPageModule |
 *                        +-----------------------------+
 *                                       |
 *                  +--------------------+-------------------+
 *                  |                                        |
 *          features/eager (data)                      features/lazy (data)
 *                  |                                        |
 * +----------------------------------+     +----------------------------------+
 * | Child Routes                     |     | FeaturesLazyModule               |
 * | @see feature-routes.ts           |     | @see feature-routes.ts           |
 * |==================================|     |==================================|
 * | feature-a                        |     | feature-a                        |
 * | feature-b (data)                 |     | feature-b (data)                 |
 * | feature-c (lazy)                 |     | feature-c (lazy)                 |
 * | feature-d (lazy, data)           |     | feature-d (lazy, data)           |
 * | feature-part (data)              |     | feature-part (data)              |
 * | feature-part/part-1              |     | feature-part/part-1              |
 * | feature-part/part-2 (data)       |     | feature-part/part-2 (data)       |
 * | feature-part/part-3 (lazy)       |     | feature-part/part-3 (lazy)       |
 * | feature-part/part-4 (lazy, data) |     | feature-part/part-4 (lazy, data) |
 * +----------------------------------+     +----------------------------------+
 */

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: 'features/eager',
        data: {
          [WorkbenchRouteData.title]: 'Features Title',
          [WorkbenchRouteData.heading]: 'Features Heading',
          [WorkbenchRouteData.cssClass]: 'e2e-features',
        },
        children: featureRoutes,
      },
      {
        path: 'features/lazy',
        data: {
          [WorkbenchRouteData.title]: 'Features Lazy Title',
          [WorkbenchRouteData.heading]: 'Features Lazy Heading',
          [WorkbenchRouteData.cssClass]: 'e2e-features-lazy',
        },
        loadChildren: (): any => import('./features-lazy.module'),
      },
    ]),
  ],
})
export default class ViewRouteDataTestPageModule {
}
