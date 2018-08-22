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
import { SciViewportComponent } from './viewport.component';
import { SciScrollbarComponent } from './scrollbar/scrollbar.component';
import { SciScrollableDirective } from './scrollable.directive';
import { ScrollDispatchModule } from '@angular/cdk/scrolling';
import { SciDimensionModule } from '../dimension/dimension.module';

/**
 * Provides a viewport with its `<ng-content>` as its native scrollable viewport client
 * with scrollbars that sit on top of the viewport client.
 */
@NgModule({
  imports: [
    CommonModule,
    ScrollDispatchModule,
    SciDimensionModule,
  ],
  declarations: [
    SciViewportComponent,
    SciScrollbarComponent,
    SciScrollableDirective,
  ],
  exports: [
    SciViewportComponent,
  ],
})
export class SciViewportModule {
}
