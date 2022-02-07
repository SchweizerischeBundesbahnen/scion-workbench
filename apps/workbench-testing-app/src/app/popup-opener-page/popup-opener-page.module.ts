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
import {SciAccordionModule, SciCheckboxModule, SciFormFieldModule} from '@scion/toolkit.internal/widgets';
import {ReactiveFormsModule} from '@angular/forms';
import {RouterModule, Routes} from '@angular/router';
import {PopupOpenerPageComponent} from './popup-opener-page.component';
import {WorkbenchModule} from '@scion/workbench';
import {SciViewportModule} from '@scion/toolkit/viewport';
import {A11yModule} from '@angular/cdk/a11y';
import {PopupPageModule} from '../popup-page/popup-page.module';
import {PopupFocusPageModule} from '../popup-focus-page/popup-focus-page.module';

const routes: Routes = [
  {path: '', component: PopupOpenerPageComponent},
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    SciFormFieldModule,
    SciCheckboxModule,
    SciViewportModule,
    SciAccordionModule,
    WorkbenchModule.forChild(),
    A11yModule,
    PopupPageModule,
    PopupFocusPageModule,
  ],
  declarations: [
    PopupOpenerPageComponent,
  ],
})
export class PopupOpenerPageModule {
}
