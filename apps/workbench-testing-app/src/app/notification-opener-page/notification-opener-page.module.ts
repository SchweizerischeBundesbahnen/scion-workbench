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
import {SciCheckboxModule} from '@scion/components.internal/checkbox';
import {SciFormFieldModule} from '@scion/components.internal/form-field';
import {ReactiveFormsModule} from '@angular/forms';
import {NotificationOpenerPageComponent} from './notification-opener-page.component';
import {RouterModule, Routes} from '@angular/router';
import {WorkbenchModule} from '@scion/workbench';

const routes: Routes = [
  {path: '', component: NotificationOpenerPageComponent},
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    SciFormFieldModule,
    SciCheckboxModule,
    WorkbenchModule.forChild(),
  ],
  declarations: [
    NotificationOpenerPageComponent,
  ],
})
export class NotificationOpenerPageModule {
}
