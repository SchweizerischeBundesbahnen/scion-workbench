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
import {CommonModule} from '@angular/common';
import {BulkNavigationPageComponent} from './bulk-navigation-page.component';
import {RouterModule, Routes} from '@angular/router';
import {ReactiveFormsModule} from '@angular/forms';
import {SciFormFieldModule} from '@scion/components.internal/form-field';

const routes: Routes = [
  {path: '', component: BulkNavigationPageComponent},
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    SciFormFieldModule,
  ],
  declarations: [
    BulkNavigationPageComponent,
  ],
})
export class BulkNavigationPageModule {
}
