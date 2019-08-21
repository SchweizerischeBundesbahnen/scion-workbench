/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component, ElementRef, EventEmitter, Input, isDevMode, NgZone, OnDestroy, Output, ViewChild } from '@angular/core';
import { combineLatest, from, fromEvent, merge, Observable, of, OperatorFunction, Subject } from 'rxjs';
import { mergeMap, takeUntil } from 'rxjs/operators';
import { WorkbenchLayoutService } from '../workbench-layout.service';
import { installMouseDispatcher, SciMouseDispatcher } from '@scion/mouse-dispatcher';
import { setStyle } from '../dom.util';

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
  styleUrls: ['./remote-site.component.scss'],
})
export class RemoteSiteComponent implements OnDestroy {

  private _destroy$ = new Subject<void>();

  private _whenIframe = new Promise<HTMLIFrameElement>(resolve => this._whenIframeResolveFn = resolve); // tslint:disable-line:typedef
  private _whenIframeResolveFn: (iframe: HTMLIFrameElement) => void;

  private _whenSiteLoaded: Promise<HTMLIFrameElement>;

  private _siteUrl: URL;
  private _mouseDispatcher: SciMouseDispatcher;

  /**
   * Sets the URL of the remote site to display.
   */
  @Input()
  public set url(url: string) {
    const siteUrl = new URL(url);

    // Determine if setting given URL causes a new page to be loaded into the iframe. A 'page load' is not caused if only the URL fragment changes.
    // When the page loads anew, posting of messages to that site must be delayed until loading completed, so the site is ready to receive them.
    const isPageAboutToLoad = !this._siteUrl || !siteUrl.hash || toUrlWithoutFragment(this._siteUrl) !== toUrlWithoutFragment(siteUrl);
    if (isPageAboutToLoad) {
      this.installSiteLoadPromise();
      this.installMouseDispatcher();
      this._whenSiteLoaded.then(() => this.load.emit());
    }

    this._siteUrl = siteUrl;

    // Set the iframe URL via `Location.replace` instead of modifying the iframe src attribute.
    // Otherwise, if changing the src attribute of an already attached iframe, a history entry would be added to the browser's history,
    // which would compromise the browser's history back functionality. Removing the iframe from the DOM before setting the src attribute
    // is also not applicable as this always causes the page to load anew, which is not the desired effect if using hash-based routing
    // and navigating within the same site.
    this._whenIframe.then(iframe => iframe.contentWindow.location.replace(url));
  }

  /**
   * CSS classes to be added to the iframe tag.
   */
  @Input()
  public cssClass: string | string[];

  /**
   * Emits upon the receipt of a message from the remote site.
   *
   * The event is not emitted inside Angular zone.
   */
  @Output()
  public message = new EventEmitter<any>();

  /**
   * Emits after the remote site finished loading, and every time
   * after loading a new document, e.g. due to an URL change.
   */
  @Output()
  public load = new EventEmitter<void>();

  /**
   * Emits when the remote site is about to lose focus.
   *
   * Requires the remote site to support this feature.
   */
  @Output()
  public synthFocusout = new EventEmitter<void>();

  /**
   * Emits when the remote site is about to receive focus.
   *
   * Requires the remote site to support this feature.
   */
  @Output()
  public synthFocusin = new EventEmitter<void>();

  /**
   * Emits when escape keystroke is pressed in the remote site.
   *
   * Requires the remote site to support this feature.
   */
  @Output()
  public synthEscape = new EventEmitter<void>();

  @ViewChild('iframe', {static: true})
  public set setIframe(iframe: ElementRef<HTMLIFrameElement>) {
    this._whenIframeResolveFn(iframe.nativeElement);
  }

  constructor(private _workbenchLayout: WorkbenchLayoutService, private _zone: NgZone) {
    this.installWorkbenchLayoutListener();
    this.installIframeMessageListener();
  }

  /**
   * Posts a message to the remote site via 'window.postMessage()' mechanism (cross-origin).
   *
   * This method requires a site URL to be set.
   */
  public postMessage(message: any): void {
    if (!this._whenSiteLoaded && isDevMode() && console && console.error) {
      console.error('Cannot post a message to a remote site because its URL is not set yet.');
      return;
    }

    this._whenSiteLoaded.then(iframe => iframe.contentWindow.postMessage(message, this._siteUrl.origin));
  }

  /**
   * Sets the `whenSiteLoaded` promise which resolves once the site finished loading.
   */
  private installSiteLoadPromise(): void {
    let resolveFn: (iframe: HTMLIFrameElement) => void;
    this._whenSiteLoaded = new Promise<HTMLIFrameElement>(resolve => resolveFn = resolve); // tslint:disable-line:typedef

    this._whenIframe.then(iframe => {
      iframe.addEventListener('load', () => resolveFn(iframe), {once: true});
    });
  }

  /**
   * Installs mouse event dispatching between the application window and the iframe.
   *
   * Mouse event dispatching is essential if using custom scrollbars in combination with iframes. It provides
   * continued delivery of mouse events even when the cursor goes past the boundary of the iframe boundary.
   */
  private installMouseDispatcher(): void {
    this._mouseDispatcher && this._mouseDispatcher.dispose();
    this._mouseDispatcher = null;

    this._whenSiteLoaded.then(iframe => {
      this._zone.runOutsideAngular(() => {
        this._mouseDispatcher = installMouseDispatcher(iframe.contentWindow, this._siteUrl.origin);
      });
    });
  }

  private installWorkbenchLayoutListener(): void {
    // Suspend pointer events for the duration of a workbench layout change, so that pointer events are not swallowed by the iframe.
    // Otherwise, view drag and view sash operation does not work as expected.
    merge(this._workbenchLayout.viewSashDrag$, this._workbenchLayout.viewDrag$, this._workbenchLayout.messageBoxMove$)
      .pipe(
        bufferUntil(from(this._whenIframe)),
        takeUntil(this._destroy$),
      )
      .subscribe(([event, iframe]: ['start' | 'end', HTMLIFrameElement]) => {
        setStyle(iframe, {
          'pointer-events': (event === 'start') ? 'none' : null,
        });
      });
  }

  private installIframeMessageListener(): void {
    this._zone.runOutsideAngular(() => {
      fromEvent<MessageEvent>(window, 'message')
        .pipe(
          bufferUntil(from(this._whenIframe)),
          takeUntil(this._destroy$),
        )
        .subscribe(([messageEvent, iframe]: [MessageEvent, HTMLIFrameElement]) => {
          if (messageEvent.source !== iframe.contentWindow) {
            return;
          }

          if (messageEvent.origin !== this._siteUrl.origin) {
            throw Error(`[OriginError] Message of illegal origin received [expected=${this._siteUrl.origin}, actual=${messageEvent.origin}]`);
          }

          const synthEvent = parseSynthEvent(messageEvent.data);
          if (synthEvent === 'sci-focusin') {
            this._zone.run(() => this.synthFocusin.emit());
            return;
          }
          if (synthEvent === 'sci-focusout') {
            this._zone.run(() => this.synthFocusout.emit());
            return;
          }
          if (synthEvent === 'sci-escape') {
            this._zone.run(() => this.synthEscape.emit());
            document.dispatchEvent(new Event(synthEvent));
            return;
          }

          this.message.emit(messageEvent.data); // public API: do not emit inside Angular zone
        });
    });
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._mouseDispatcher && this._mouseDispatcher.dispose();
  }
}

/**
 * Buffers the source Observable values until `closingNotifier$` emits. Once closed,
 * items of the source Observable are emitted as they arrive.
 *
 * Returns an Observables which combines the latest values from the source Observable and the closing notifier.
 */
function bufferUntil<T, CN>(closingNotifier$: Observable<CN>): OperatorFunction<T, [T, CN]> {
  return mergeMap((item: T) => combineLatest([of(item), closingNotifier$]));
}

/**
 * Parses synthetic event sent by the remote site.
 */
function parseSynthEvent(data: any): string | null {
  if (isNullOrUndefined(data) || typeof data !== 'object') {
    return null;
  }
  if (data.protocol !== 'sci://workbench/remote-site') {
    return null;
  }
  if (isNullOrUndefined(data.event)) {
    return null;
  }

  return data.event;
}

function isNullOrUndefined(value: any): boolean {
  return value === null || value === undefined;
}

/**
 * Returns given URL without its fragment.
 */
function toUrlWithoutFragment(url: URL): string {
  const href = url.href;
  const fragmentIndex = href.indexOf('#');
  return (fragmentIndex === -1) ? href : href.substring(0, fragmentIndex);
}

