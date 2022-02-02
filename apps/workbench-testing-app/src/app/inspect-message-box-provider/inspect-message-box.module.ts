/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {InspectMessageBoxComponent} from './inspect-message-box.component';
import {UtilModule} from '../util/util.module';
import {SciViewportModule} from '@scion/toolkit/viewport';
import {SciFormFieldModule, SciParamsEnterModule} from '@scion/toolkit.internal/widgets';
import {ReactiveFormsModule} from '@angular/forms';
import {MICROFRONTEND_PLATFORM_POST_STARTUP} from '@scion/workbench';
import {InspectMessageBoxIntentHandler} from './inspect-message-box-intent-handler.service';

@NgModule({
  declarations: [
    InspectMessageBoxComponent,
  ],
  imports: [
    CommonModule,
    UtilModule,
    SciFormFieldModule,
    SciViewportModule,
    SciParamsEnterModule,
    ReactiveFormsModule,
  ],
})
export class InspectMessageBoxModule {

  public static forRoot(): ModuleWithProviders<InspectMessageBoxModule> {
    return {
      ngModule: InspectMessageBoxModule,
      providers: [
        {provide: MICROFRONTEND_PLATFORM_POST_STARTUP, useClass: InspectMessageBoxIntentHandler, multi: true},
      ],
    };
  }
}
