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
import { WorkbenchModule } from '@scion/workbench';
import { CommonModule } from '@angular/common';
import { PopupOutletComponent } from './popup-outlet.component';
import { INTENT_HANDLER } from '../core/metadata';
import { PopupIntentHandler } from './popup-intent-handler.service';

/**
 * Built-in capability to show a popup.
 */
@NgModule({
  declarations: [
    PopupOutletComponent,
  ],
  imports: [
    CommonModule,
    CoreModule,
    WorkbenchModule.forChild(),
  ],
  providers: [
    {provide: INTENT_HANDLER, useClass: PopupIntentHandler, multi: true},
  ],
  entryComponents: [
    PopupOutletComponent,
  ],
})
export class PopupCapabilityModule {
}
