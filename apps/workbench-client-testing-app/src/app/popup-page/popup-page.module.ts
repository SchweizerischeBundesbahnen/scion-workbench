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
import {RouterModule, Routes} from '@angular/router';
import {SciAccordionModule, SciFormFieldModule, SciPropertyModule} from '@scion/toolkit.internal/widgets';
import {FormsModule} from '@angular/forms';
import {PopupPageComponent} from './popup-page.component';
import {UtilModule} from '../util/util.module';
import {SciViewportModule} from '@scion/toolkit/viewport';
import {A11yModule} from '@angular/cdk/a11y';

const routes: Routes = [
  {path: '', component: PopupPageComponent},
  {path: ':segment1/segment2/:segment3', component: PopupPageComponent},
  {path: 'popup1', component: PopupPageComponent},
  {path: 'popup2', component: PopupPageComponent},
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    A11yModule,
    SciFormFieldModule,
    SciPropertyModule,
    SciAccordionModule,
    SciViewportModule,
    UtilModule,
  ],
  declarations: [
    PopupPageComponent,
  ],
})
export class PopupPageModule {
}
