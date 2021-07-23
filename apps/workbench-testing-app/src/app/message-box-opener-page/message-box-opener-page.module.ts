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
import {SciCheckboxModule, SciFormFieldModule, SciParamsEnterModule} from '@scion/toolkit.internal/widgets';
import {ReactiveFormsModule} from '@angular/forms';
import {MessageBoxOpenerPageComponent} from './message-box-opener-page.component';
import {RouterModule, Routes} from '@angular/router';
import {WorkbenchModule} from '@scion/workbench';

const routes: Routes = [
  {path: '', component: MessageBoxOpenerPageComponent},
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    SciFormFieldModule,
    SciParamsEnterModule,
    SciCheckboxModule,
    WorkbenchModule.forChild(),
  ],
  declarations: [
    MessageBoxOpenerPageComponent,
  ],
})
export class MessageBoxOpenerPageModule {
}
