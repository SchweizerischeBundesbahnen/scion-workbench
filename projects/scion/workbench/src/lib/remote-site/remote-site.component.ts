/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component, EventEmitter, Input, NgZone, OnDestroy, Output, Renderer2 } from '@angular/core';
import { combineLatest, from, fromEvent, merge, Observable, of, OperatorFunction, Subject } from 'rxjs';
import { mergeMap, takeUntil } from 'rxjs/operators';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { WorkbenchLayoutService } from '../workbench-layout.service';

/**
 * Displays the content of a remote site in an <iframe>.
 * Web components are not applicable yet, because not providing an isolated scripting context.
 *
 * This component provides API to bidirectionally communicate with the remote site.
 * The communication is based on `postMessage` and `onmessage` to safely communicate cross-origin.
 *
 * Use this component inside `<wb-content-as-overlay>` element because an iframe reloads if being moved in the DOM
 * (e.g. when rearranging views in the view grid).
 *
 *
 * ---
 * Usage:
 *
 * <wb-content-as-overlay>
 *   <wb-remote-site [url]="'https://www.google.com/'"></wb-remote-site>
 * </wb-content-as-overlay>
 *
 * @see ContentAsOverlayComponent
 */
@Component({
  selector: 'wb-remote-site',
  templateUrl: './remote-site.component.html',
  styleUrls: ['./remote-site.component.scss']
})
export class RemoteSiteComponent implements OnDestroy {

  private _destroy$ = new Subject<void>();

  private _whenIframe: Promise<HTMLIFrameElement>;
  private _iframeResolveFn: (iframe: HTMLIFrameElement) => void;

  private _siteOrigin: string;
  public siteUrl: SafeUrl;

  /**
   * Sets the URL of the remote site to display.
   */
  @Input()
  public set url(url: string) {
    this.siteUrl = this._sanitizer.bypassSecurityTrustResourceUrl(url);
    this._siteOrigin = new URL(url).origin;
  }

  /**
   * Emits upon the receipt of a message from the remote site.
   *
   * The event is not emitted inside Angular zone.
   */
  @Output()
  public message = new EventEmitter<any>();

  /**
   * Emits if the remote site finished loading.
   * Messages to the remote site are only transported after this event is emitted.
   */
  @Output()
  public load = new EventEmitter<void>();

  constructor(private _sanitizer: DomSanitizer,
              private _workbenchLayout: WorkbenchLayoutService,
              private _renderer: Renderer2,
              private _zone: NgZone) {
    this._whenIframe = new Promise<HTMLIFrameElement>(resolve => this._iframeResolveFn = resolve); // tslint:disable-line:typedef
    this.installWorkbenchLayoutListener();
    this.installIframeMessageListener();
  }

  /**
   * Posts a message to the remote site via 'window.postMessage()' mechanism (cross-origin).
   */
  public postMessage(message: any): void {
    this._whenIframe.then(iframe => iframe.contentWindow.postMessage(message, this._siteOrigin));
  }

  public onSiteLoad(event: Event): void {
    // If the 'onload' event handler is attached before the iframe is appended to the DOM, webkit browsers fire that event twice.
    // To workaround this issue, the existence of the 'src' field is checked. See https://stackoverflow.com/a/38459639.
    const iframe = event.target as HTMLIFrameElement;
    if (iframe.src) {
      this._iframeResolveFn(iframe);
      this.load.emit();
    }
  }

  private installWorkbenchLayoutListener(): void {
    // Suspend pointer events for the duration of a workbench layout change,
    // so that pointer events are not swallowed by the iframe.
    // Otherwise, view drag operation does not work as expected.
    merge(this._workbenchLayout.viewSashDrag$, this._workbenchLayout.viewTabDrag$, this._workbenchLayout.messageBoxMove$)
      .pipe(
        bufferUntil(from<HTMLIFrameElement>(this._whenIframe)),
        takeUntil(this._destroy$))
      .subscribe(([event, iframe]: ['start' | 'end', HTMLIFrameElement]) => {
        if (event === 'start') {
          this._renderer.setStyle(iframe, 'pointer-events', 'none');
        } else {
          this._renderer.removeStyle(iframe, 'pointer-events');
        }
      });
  }

  private installIframeMessageListener(): void {
    this._zone.runOutsideAngular(() => {
      fromEvent<MessageEvent>(window, 'message')
        .pipe(
          bufferUntil(from(this._whenIframe)),
          takeUntil(this._destroy$)
        )
        .subscribe(([messageEvent, iframe]: [MessageEvent, HTMLIFrameElement]) => {
          if (messageEvent.source !== iframe.contentWindow) {
            return;
          }

          if (messageEvent.origin !== this._siteOrigin) {
            throw Error(`[OriginError] Message of illegal origin received [expected=${this._siteOrigin}, actual=${messageEvent.origin}]`);
          }

          this.message.emit(messageEvent.data); // public API: do not emit inside Angular zone
        });
    });
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}

/**
 * Buffers the source Observable values until `closingNotifier$` emits. Once closed,
 * items of the source Observable are emitted as they arrive.
 *
 * Returns an Observables which combines the latest values from the source Observable and the closing notifier.
 */
function bufferUntil<T, CN>(closingNotifier$: Observable<CN>): OperatorFunction<T, [T, CN]> {
  return mergeMap((item: T) => combineLatest(of(item), closingNotifier$));
}
