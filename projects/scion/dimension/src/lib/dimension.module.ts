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
import { SciDimensionDirective } from './dimension.directive';

/**
 * Provides a directive for observing changes to host element's size.
 *
 * Note:
 * Web Performance Working Group is working on a W3C recommendation for natively observing changes to Element’s size.
 * The Web API draft is still work in progress and support limited to Google Chrome and Opera.
 *
 * You can control if to use the native {ResizeObserver} by default with {USE_NATIVE_RESIZE_OBSERVER} DI injection token.
 * If not provided, the native resize observable is used, unless explicitly set via options object when creating the resize observable.
 *
 * @see https://wicg.github.io/ResizeObserver/
 * @see https://caniuse.com/#feat=resizeobserver
 */
@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    SciDimensionDirective,
  ],
  exports: [
    SciDimensionDirective,
  ],
})
export class SciDimensionModule {
}
