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
import { SciSashboxComponent } from './sashbox.component';
import { SciSashDirective } from './sash.directive';
import { SciSplitterDirective } from './splitter.directive';
import { SciDimensionModule } from '@scion/toolkit/dimension';
import { SciSashInitializerDirective } from './sash-initializer.directive';

/**
 * Provides a sashbox component that lays out its children in a row or column arrangement and places a splitter between each child.
 *
 * ### Usage:
 *
 * <sci-sashbox direction="row">
 *   <ng-template sciSash size="1">
 *     ...
 *   </ng-template>
 *
 *   <ng-template sciSash size="2">
 *     ...
 *   </ng-template>
 *
 *   <ng-template sciSash size="1">
 *     ...
 *   </ng-template>
 * </sci-sashbox>
 */
@NgModule({
  declarations: [
    SciSashboxComponent,
    SciSashDirective,
    SciSplitterDirective,
    SciSashInitializerDirective,
  ],
  imports: [
    CommonModule,
    SciDimensionModule,
  ],
  exports: [
    SciSashboxComponent,
    SciSashDirective,
  ],
})
export class SciSashboxModule {
}
