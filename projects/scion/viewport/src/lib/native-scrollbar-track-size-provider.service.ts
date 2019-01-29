/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Inject, Injectable, NgZone, OnDestroy, Renderer2, RendererFactory2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject, fromEvent, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith, takeUntil } from 'rxjs/operators';

/**
 * Provides the native scrollbar tracksize.
 */
@Injectable({providedIn: 'root'})
export class SciNativeScrollbarTrackSizeProvider implements OnDestroy {

  private readonly _trackSize$ = new BehaviorSubject<NativeScrollbarTrackSize | null>(null);
  private readonly _renderer: Renderer2;
  private readonly _destroy$ = new Subject<void>();

  constructor(@Inject(DOCUMENT) private _document: any, rendererFactory: RendererFactory2, private _zone: NgZone) {
    this._renderer = rendererFactory.createRenderer(null, null);
    this.installNativeScrollbarTrackSizeListener();
  }

  /**
   * Returns an {Observable} which emits the native scrollbar track size, if any, or else `null`.
   *
   * Upon subscription, it emits the track size immediately, and then continuously emits when the track size changes.
   */
  public get trackSize$(): Observable<NativeScrollbarTrackSize | null> {
    return this._trackSize$;
  }

  /**
   * Returns the native scrollbar track size, if any, or else `null`.
   */
  public get trackSize(): NativeScrollbarTrackSize {
    return this._trackSize$.getValue();
  }

  /**
   * Computes the native scrollbar track size.
   *
   * @returns native track size, or `null` if the native scrollbars sit on top of the content.
   */
  private computeTrackSize(): NativeScrollbarTrackSize {
    // create temporary viewport and viewport client with native scrollbars to compute scrolltrack width
    const viewportDiv = this._renderer.createElement('div');
    this.setStyle(this._renderer, viewportDiv, {
      position: 'absolute',
      overflow: 'scroll',
      height: '100px',
      width: '100px',
      border: 0,
      visibility: 'hidden',
    });

    const viewportClientDiv = this._renderer.createElement('div');
    this.setStyle(this._renderer, viewportClientDiv, {
      height: '100%',
      width: '100%',
      border: 0,
    });

    this._renderer.appendChild(viewportDiv, viewportClientDiv);
    this._renderer.appendChild(this._document.body, viewportDiv);

    const trackSize: NativeScrollbarTrackSize = {
      hScrollbarTrackHeight: viewportDiv.offsetHeight - viewportClientDiv.offsetHeight,
      vScrollbarTrackWidth: viewportDiv.offsetWidth - viewportClientDiv.offsetWidth,
    };

    // destroy temporary viewport
    this._renderer.removeChild(this._document.body, viewportDiv);
    if (trackSize.hScrollbarTrackHeight === 0 && trackSize.vScrollbarTrackWidth === 0) {
      return null;
    }

    return trackSize;
  }

  private installNativeScrollbarTrackSizeListener(): void {
    // Listen for window resize events to (re-)compute the native scrollbar track size.
    // For instance, if the document is not displayed (e.g., in hidden iframes), the track of native scrollbars do not have a dimension.
    // However, once displayed, the window sends a resize event.
    this._zone.runOutsideAngular(() => {
      fromEvent(window, 'resize')
        .pipe(
          debounceTime(5),
          startWith(null), // trigger the initial computation
          map((): NativeScrollbarTrackSize => this.computeTrackSize()),
          distinctUntilChanged((t1: NativeScrollbarTrackSize, t2: NativeScrollbarTrackSize) => JSON.stringify(t1) === JSON.stringify(t2)),
          takeUntil(this._destroy$),
        )
        .subscribe((trackSize: NativeScrollbarTrackSize) => {
          this._zone.run(() => this._trackSize$.next(trackSize));
        });
    });
  }

  private setStyle(renderer: Renderer2, element: Element, style: { [key: string]: any }): void {
    Object.keys(style).forEach(key => renderer.setStyle(element, key, style[key]));
  }

  public ngOnDestroy(): void {
    this._renderer.destroy();
    this._destroy$.next();
  }
}

/**
 * Represents the native scrollbar track size.
 */
export interface NativeScrollbarTrackSize {
  hScrollbarTrackHeight: number;
  vScrollbarTrackWidth: number;
}
