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
import { SciCheckboxModule, SciFormFieldModule } from '@scion/toolkit.internal/widgets';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { PopupPageComponent } from './popup-page.component';
import { WorkbenchModule } from '@scion/workbench';
import { PopupComponent } from './popup/popup.component';
import { SciViewportModule } from '@scion/toolkit/viewport';
import { A11yModule } from '@angular/cdk/a11y';

const routes: Routes = [
  {path: '', component: PopupPageComponent},
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    SciFormFieldModule,
    SciCheckboxModule,
    WorkbenchModule.forChild(),
    SciViewportModule,
    A11yModule,
  ],
  declarations: [
    PopupPageComponent,
    PopupComponent,
  ],
})
export class PopupPageModule {
}
