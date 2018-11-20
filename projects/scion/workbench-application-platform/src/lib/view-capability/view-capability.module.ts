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
import { CoreModule } from '../core/core.module';
import { ViewIntentHandler } from './view-intent-handler.service';
import { WorkbenchModule } from '@scion/workbench';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ViewOutletComponent } from './view-outlet.component';
import { INTENT_HANDLER } from '../core/metadata';

/**
 * Built-in capability to show a view.
 */
@NgModule({
  declarations: [
    ViewOutletComponent,
  ],
  imports: [
    CommonModule,
    CoreModule,
    WorkbenchModule.forChild(),
    RouterModule.forChild([]),
  ],
  providers: [
    {provide: INTENT_HANDLER, useClass: ViewIntentHandler, multi: true},
  ],
  entryComponents: [
    ViewOutletComponent,
  ],
})
export class ViewCapabilityModule {
}
