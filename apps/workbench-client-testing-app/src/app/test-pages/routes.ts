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

export const routes: Routes = [
  {
    path: 'bulk-navigation-test-page',
    loadComponent: (): any => import('./bulk-navigation-test-page/bulk-navigation-test-page.component').then(m => m.BulkNavigationTestPageComponent),
  },
  {
    path: 'view-properties-test-page',
    loadComponent: (): any => import('./view-properties-test-page/view-properties-test-page.component').then(m => m.ViewPropertiesTestPageComponent),
  },
  {
    path: 'input-field-test-page',
    loadComponent: (): any => import('./input-field-test-page/input-field-test-page.component').then(m => m.InputFieldTestPageComponent),
  },
];
