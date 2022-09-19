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
import {RouterModule, Routes} from '@angular/router';
import {NavigationTestPageComponent} from './navigation-test-page.component';

const routes: Routes = [
  {path: '', component: NavigationTestPageComponent},
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  declarations: [
    NavigationTestPageComponent,
  ],
})
export class NavigationTestPageModule {
}
