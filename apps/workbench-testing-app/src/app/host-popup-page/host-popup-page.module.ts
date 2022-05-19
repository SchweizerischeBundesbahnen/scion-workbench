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
import {HostPopupPageComponent} from './host-popup-page.component';
import {RouterModule, Routes} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {SciAccordionModule} from '@scion/components.internal/accordion';
import {SciFormFieldModule} from '@scion/components.internal/form-field';
import {SciPropertyModule} from '@scion/components.internal/property';
import {SciViewportModule} from '@scion/components/viewport';
import {UtilModule} from '../util/util.module';
import {A11yModule} from '@angular/cdk/a11y';

const routes: Routes = [
  {path: '', component: HostPopupPageComponent},
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
    RouterModule.forChild(routes),
  ],
  declarations: [
    HostPopupPageComponent,
  ],
})
export class HostPopupPageModule {
}
