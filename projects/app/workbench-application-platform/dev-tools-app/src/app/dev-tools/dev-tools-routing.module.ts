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
import { RouterModule, Routes } from '@angular/router';
import { ApplicationListComponent } from './application-list/application-list.component';
import { ApplicationViewComponent } from './application-view/application-view.component';
import { OutletCapabilityExecPopupComponent } from './outlet-capability-exec-popup/outlet-capability-exec-popup.component';

const routes: Routes = [
  {path: 'application-list', component: ApplicationListComponent},
  {path: 'application/:symbolicName', component: ApplicationViewComponent},
  {path: 'view-capability/:id', component: OutletCapabilityExecPopupComponent},
  {path: 'popup-capability/:id', component: OutletCapabilityExecPopupComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DevToolsRoutingModule {
}
