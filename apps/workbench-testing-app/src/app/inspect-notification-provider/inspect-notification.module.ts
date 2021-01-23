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
import { InspectNotificationComponent } from './inspect-notification.component';
import { UtilModule } from '../util/util.module';
import { SciViewportModule } from '@scion/toolkit/viewport';

@NgModule({
  declarations: [
    InspectNotificationComponent,
  ],
  imports: [
    CommonModule,
    UtilModule,
    SciViewportModule,
  ],
})
export class InspectNotificationModule {
}
