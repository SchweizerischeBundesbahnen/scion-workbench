/*
 * Copyright (c) 2018-2020 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'activator',
    loadChildren: (): any => import('./activator/activator.module').then(m => m.ActivatorModule),
  },
  {
    path: 'test-router',
    loadChildren: (): any => import('./router-page/router-page.module').then(m => m.RouterPageModule),
  },
  {
    path: 'test-view',
    loadChildren: (): any => import('./view-page/view-page.module').then(m => m.ViewPageModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
