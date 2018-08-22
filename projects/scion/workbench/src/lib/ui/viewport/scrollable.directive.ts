/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Directive, ElementRef, Input, OnChanges, Renderer2, SimpleChanges } from '@angular/core';
import { SciNativeScrollbarTrackSize } from './native-scrollbar-track-size';

/**
 * Makes the host `<div>` natively scrollable and optionally hides native scrollbars.
 *
 * Because there is no cross-browser API to hide scrollbars without losing native scroll support, we set 'overflow'
 * to 'scroll' but shift the native scrollbars out of the visible viewport area. The shift offset is computed upfront.
 */
@Directive({
  selector: 'div[sciScrollable]'
})
export class SciScrollableDirective implements OnChanges {

  /**
   * Controls whether to display native scrollbars. By default, scrollbars are not displayed.
   */
  @Input('sciScrollableScrollbarsVisible') // tslint:disable-line:no-input-rename
  public scrollbarsVisible: boolean = false; // tslint:disable-line:no-inferrable-types

  constructor(private _host: ElementRef<HTMLDivElement>,
              private _renderer: Renderer2,
              private _nativeTrackSize: SciNativeScrollbarTrackSize) {
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.scrollbarsVisible ? this.showNativeScrollbars() : this.hideNativeScrollbars();
  }

  private showNativeScrollbars(): void {
    this.setStyle(this._host.nativeElement, {
      overflow: 'auto',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    });
  }

  private hideNativeScrollbars(): void {
    this.setStyle(this._host.nativeElement, {
      overflow: 'scroll',
      top: 0,
      right: `${-this._nativeTrackSize.vScrollbarTrackWidth}px`, // shift native scrollbar out of the visible viewport range
      bottom: `${-this._nativeTrackSize.hScrollbarTrackHeight}px`, // shift native scrollbar out of the visible viewport range
      left: 0
    });
  }

  private setStyle(element: Element, style: { [key: string]: any }): void {
    Object.keys(style).forEach(key => this._renderer.setStyle(element, key, style[key]));
  }
}
