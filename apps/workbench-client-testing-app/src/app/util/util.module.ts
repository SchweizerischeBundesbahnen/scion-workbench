/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NullIfEmptyPipe} from './null-if-empty.pipe';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    NullIfEmptyPipe,
  ],
  exports: [
    NullIfEmptyPipe,
  ],
})
export class UtilModule {
}
