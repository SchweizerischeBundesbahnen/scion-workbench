/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Directive, ElementRef, Input, OnChanges, OnDestroy, Renderer2, SimpleChanges } from '@angular/core';
import { NativeScrollbarTrackSize, SciNativeScrollbarTrackSizeProvider } from './native-scrollbar-track-size-provider.service';
import { map, takeUntil } from 'rxjs/operators';
import { merge, Subject } from 'rxjs';

/**
 * Makes the host `<div>` natively scrollable and optionally hides native scrollbars.
 *
 * Because there is no cross-browser API to hide scrollbars without losing native scroll support, we set 'overflow'
 * to 'scroll' but shift the native scrollbars out of the visible viewport area. The shift offset is computed upfront.
 */
@Directive({
  selector: 'div[sciScrollable]'
})
export class SciScrollableDirective implements OnChanges, OnDestroy {

  private _destroy$ = new Subject<void>();
  private _inputChange$ = new Subject<void>();

  /**
   * Controls whether to display native scrollbars.
   * Has no effect if the native scrollbar sits on top of the content, e.g. in OS X.
   */
  @Input('sciScrollableDisplayNativeScrollbar') // tslint:disable-line:no-input-rename
  public isDisplayNativeScrollbar: boolean = false; // tslint:disable-line:no-inferrable-types

  constructor(private _host: ElementRef<HTMLDivElement>,
              private _renderer: Renderer2,
              nativeScrollbarTrackSizeProvider: SciNativeScrollbarTrackSizeProvider) {
    merge(
      nativeScrollbarTrackSizeProvider.trackSize$,
      this._inputChange$.pipe(map(() => nativeScrollbarTrackSizeProvider.trackSize))
    )
      .pipe(takeUntil(this._destroy$))
      .subscribe((nativeScrollbarTrackSize: NativeScrollbarTrackSize) => {
        if (nativeScrollbarTrackSize === null) { // the native scrollbar sits on top of the content
          this.useNativeScrollbars();
        }
        else {
          this.isDisplayNativeScrollbar ? this.useNativeScrollbars() : this.shiftNativeScrollbars(nativeScrollbarTrackSize);
        }
      });
  }

  /**
   * Uses the native scrollbars when content overflows.
   */
  private useNativeScrollbars(): void {
    this.setStyle(this._host.nativeElement, {
      overflow: 'auto',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    });
  }

  /**
   * Shifts the native scrollbars out of the visible viewport area.
   */
  private shiftNativeScrollbars(nativeScrollbarTrackSize: NativeScrollbarTrackSize): void {
    this.setStyle(this._host.nativeElement, {
      overflow: 'scroll',
      top: 0,
      right: `${-nativeScrollbarTrackSize.vScrollbarTrackWidth}px`,
      bottom: `${-nativeScrollbarTrackSize.hScrollbarTrackHeight}px`,
      left: 0
    });
  }

  private setStyle(element: Element, style: { [key: string]: any }): void {
    Object.keys(style).forEach(key => this._renderer.setStyle(element, key, style[key]));
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this._inputChange$.next();
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
