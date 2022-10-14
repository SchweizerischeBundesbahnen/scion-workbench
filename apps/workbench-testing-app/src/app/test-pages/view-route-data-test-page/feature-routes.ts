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
import {BlankComponent} from '../../blank/blank.component';

export const featureRoutes: Routes = [
  {
    path: 'feature-a',
    component: BlankComponent,
  },
  {
    path: 'feature-b',
    component: BlankComponent,
    data: {
      [WorkbenchRouteData.title]: 'Feature B Title',
      [WorkbenchRouteData.heading]: 'Feature B Heading',
      [WorkbenchRouteData.cssClass]: 'e2e-feature-b',
    },
  },
  {
    path: 'feature-c',
    loadComponent: (): any => import('../../blank/blank.component').then(m => m.BlankComponent),
  },
  {
    path: 'feature-d',
    loadComponent: (): any => import('../../blank/blank.component').then(m => m.BlankComponent),
    data: {
      [WorkbenchRouteData.title]: 'Feature D Title',
      [WorkbenchRouteData.heading]: 'Feature D Heading',
      [WorkbenchRouteData.cssClass]: 'e2e-feature-d',
    },
  },
  {
    path: 'feature-part',
    children: [
      {
        path: 'part-1',
        component: BlankComponent,
      },
      {
        path: 'part-2',
        component: BlankComponent,
        data: {[WorkbenchRouteData.part]: 'PREFERRED_PART_2'},
      },
      {
        path: 'part-3',
        loadComponent: (): any => import('../../blank/blank.component').then(m => m.BlankComponent),
      },
      {
        path: 'part-4',
        loadComponent: (): any => import('../../blank/blank.component').then(m => m.BlankComponent),
        data: {[WorkbenchRouteData.part]: 'PREFERRED_PART_4'},
      },
    ],
    data: {[WorkbenchRouteData.part]: 'PREFERRED_PART'},
  },
];
