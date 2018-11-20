/*
 * Copyright (c) 2018 Swiss Federal Railways
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
import { ContactRoutingModule } from './contact-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { WorkbenchApplicationModule } from '@scion/workbench-application.angular';
import { HttpClientModule } from '@angular/common/http';
import { ContactActivityComponent } from './contact-activity/contact-activity.component';
import { ContactViewComponent } from './contact-view/contact-view.component';
import { ContactNewPopupComponent } from './contact-new-popup/contact-new-popup.component';
import { RelatedContactAddPopupComponent } from './related-contact-add-popup/related-contact-add-popup.component';
import { SciFilterFieldModule, SciListModule, SciPopupShellModule, SciSessionStorageModule } from '@scion/app/common';
import { ContactService } from './contact.service';

@NgModule({
  declarations: [
    ContactActivityComponent,
    ContactViewComponent,
    ContactNewPopupComponent,
    RelatedContactAddPopupComponent,
  ],
  imports: [
    CommonModule,
    SciViewportModule,
    ContactRoutingModule,
    SciPopupShellModule,
    SciSessionStorageModule,
    SciFilterFieldModule,
    SciListModule,
    ReactiveFormsModule,
    HttpClientModule,
    WorkbenchApplicationModule.forChild(),
  ],
  exports: [],
  providers: [
    ContactService
  ]
})
export class ContactModule {
}
