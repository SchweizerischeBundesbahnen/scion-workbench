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
import {SciAccordionModule, SciFormFieldModule} from '@scion/toolkit.internal/widgets';
import {FormsModule} from '@angular/forms';
import {WorkbenchModule} from '@scion/workbench';
import {PopupPageComponent} from './popup-page.component';
import {SciViewportModule} from '@scion/toolkit/viewport';
import {UtilModule} from '../util/util.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SciFormFieldModule,
    SciViewportModule,
    SciAccordionModule,
    WorkbenchModule.forChild(),
    UtilModule,
  ],
  declarations: [
    PopupPageComponent,
  ],
  exports: [
    PopupPageComponent,
  ],
})
export class PopupPageModule {
}
