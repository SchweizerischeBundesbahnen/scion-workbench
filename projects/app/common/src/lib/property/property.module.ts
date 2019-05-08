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
import { SciPropertyComponent } from './property.component';

/**
 * Allows to show the properties of an object.
 */
@NgModule({
  declarations: [
    SciPropertyComponent,
  ],
  exports: [
    SciPropertyComponent,
  ],
  imports: [
    CommonModule,
  ],
})
export class SciPropertyModule {
}
