/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SciCheckboxModule, SciFormFieldModule, SciPropertyModule } from '@scion/toolkit.internal/widgets';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ViewPageComponent } from './view-page.component';
import { WorkbenchModule } from '@scion/workbench';

const routes = [
  {path: '', component: ViewPageComponent},
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    SciFormFieldModule,
    SciPropertyModule,
    SciCheckboxModule,
    WorkbenchModule.forChild(),
  ],
  declarations: [
    ViewPageComponent,
  ],
})
export class ViewPageModule {
}
