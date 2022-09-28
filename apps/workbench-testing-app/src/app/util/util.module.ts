/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NullIfEmptyPipe} from './null-if-empty.pipe';
import {StringifyPipe} from './stringify.pipe';
import {PluckPipe} from './pluck.pipe';
import {FilterPipe} from './filter.pipe';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    NullIfEmptyPipe,
    StringifyPipe,
    PluckPipe,
    FilterPipe,
  ],
  exports: [
    NullIfEmptyPipe,
    StringifyPipe,
    PluckPipe,
    FilterPipe,
  ],
})
export class UtilModule {
}
