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
import { RouterModule, Routes } from '@angular/router';
import { ContactActivityComponent } from './contact-activity/contact-activity.component';
import { ContactNewPopupComponent } from './contact-new-popup/contact-new-popup.component';
import { ContactViewComponent } from './contact-view/contact-view.component';
import { RelatedContactAddPopupComponent } from './related-contact-add-popup/related-contact-add-popup.component';

const routes: Routes = [
  {path: 'list', component: ContactActivityComponent},
  {path: 'new', component: ContactNewPopupComponent},
  {path: ':id', component: ContactViewComponent},
  {path: ':id/add-related-contact', component: RelatedContactAddPopupComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContactRoutingModule {
}
