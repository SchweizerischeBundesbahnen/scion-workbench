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
import { SciViewportComponent } from './viewport.component';
import { SciScrollbarComponent } from './scrollbar/scrollbar.component';
import { SciScrollableDirective } from './scrollable.directive';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { SciDimensionModule } from '@scion/dimension';

/**
 * Provides a viewport component with scrollbars that sit on top of the viewport client.
 */
@NgModule({
  imports: [
    CommonModule,
    ScrollingModule,
    SciDimensionModule,
  ],
  declarations: [
    SciViewportComponent,
    SciScrollbarComponent,
    SciScrollableDirective,
  ],
  exports: [
    SciViewportComponent,
    SciScrollbarComponent,
    SciScrollableDirective,
  ],
})
export class SciViewportModule {
}
