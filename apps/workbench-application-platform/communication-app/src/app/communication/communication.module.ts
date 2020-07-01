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
import { SciViewportModule } from '@scion/viewport';
import { SciAccordionModule, SciPopupShellModule, SciSessionStorageModule } from 'app-common';
import { CommunicationViewComponent } from './communication-view/communication-view.component';
import { CommunicationAccordionItemHeaderComponent } from './communication-accordion-item-header/communication-accordion-item-header.component';
import { CommunicationRoutingModule } from './communication-routing.module';
import { CommunicationNewPopupComponent } from './communication-new-popup/communication-new-popup.component';
import { ReactiveFormsModule } from '@angular/forms';
import { WorkbenchApplicationModule } from '@scion/workbench-application.angular';

@NgModule({
  declarations: [
    CommunicationViewComponent,
    CommunicationNewPopupComponent,
    CommunicationAccordionItemHeaderComponent,
  ],
  imports: [
    CommonModule,
    SciViewportModule,
    CommunicationRoutingModule,
    SciAccordionModule,
    SciPopupShellModule,
    SciSessionStorageModule,
    ReactiveFormsModule,
    WorkbenchApplicationModule.forChild(),
  ],
  exports: [],
})
export class CommunicationModule {
}
