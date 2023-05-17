/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {NonStandaloneViewTestPageComponent} from './non-standalone-view-test-page.component';

export const routes: Routes = [
  {
    path: '',
    component: NonStandaloneViewTestPageComponent,
  },
];

@NgModule({
  declarations: [
    NonStandaloneViewTestPageComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
  ],
})
export class NonStandaloneViewTestPageModule {
}
