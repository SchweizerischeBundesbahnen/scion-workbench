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
import { CommunicationViewComponent } from './communication-view/communication-view.component';
import { CommunicationNewPopupComponent } from './communication-new-popup/communication-new-popup.component';

const routes: Routes = [
  {path: '', component: CommunicationViewComponent},
  {path: 'new', component: CommunicationNewPopupComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CommunicationRoutingModule {
}
