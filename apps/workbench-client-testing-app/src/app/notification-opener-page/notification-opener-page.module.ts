/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SciFormFieldModule, SciParamsEnterModule} from '@scion/toolkit.internal/widgets';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule, Routes} from '@angular/router';
import {NotificationOpenerPageComponent} from './notification-opener-page.component';

const routes: Routes = [
  {path: '', component: NotificationOpenerPageComponent},
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    SciFormFieldModule,
    SciParamsEnterModule,
  ],
  declarations: [
    NotificationOpenerPageComponent,
  ],
})
export class NotificationOpenerPageModule {
}
