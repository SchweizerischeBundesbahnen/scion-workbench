/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { fromEvent, merge, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, takeUntil } from 'rxjs/operators';
import { Service } from './metadata';
import { installMouseDispatcher, SciMouseDispatcher } from '@scion/mouse-dispatcher';

/**
 * Platform private event bus to dispatch events.
 *
 * Communication is based on `postMessage` and `onmessage` to safely communicate cross-origin with the window parent.
 */
export class PlatformEventBus implements Service {

  private _destroy$ = new Subject<void>();

  private _ancestorOrigin: string;
  private _mouseDispatcher: SciMouseDispatcher;

  public constructor() {
    this._ancestorOrigin = determineAncestorOrigin();

    this.installPlatformEventDispatcher();
    this._mouseDispatcher = installMouseDispatcher(window.parent, this._ancestorOrigin || '*');
  }

  /**
   * Dispatches some specific events to the workbench application platform.
   */
  private installPlatformEventDispatcher(): void {
    // 'focusin' and 'focusout' event
    merge(fromEvent<FocusEvent>(document, 'focusin'), fromEvent<FocusEvent>(document, 'focusout'))
      .pipe(
        debounceTime(15),
        map((event: FocusEvent) => event.type),
        distinctUntilChanged(),
        takeUntil(this._destroy$),
      )
      .subscribe((eventType: string) => {
        window.parent.postMessage({
          protocol: 'sci://workbench/remote-site',
          event: `sci-${eventType}`,
        }, this._ancestorOrigin || '*');
      });

    // 'escape' event
    fromEvent<KeyboardEvent>(document, 'keydown')
      .pipe(
        filter((event: KeyboardEvent) => event.key === 'Escape'),
        takeUntil(this._destroy$)
      )
      .subscribe(() => {
        window.parent.postMessage({
          protocol: 'sci://workbench/remote-site',
          event: 'sci-escape',
        }, this._ancestorOrigin || '*');
      });
  }

  public onDestroy(): void {
    this._destroy$.next();
    this._mouseDispatcher.dispose();
  }
}

/**
 * Returns the ancestor origin, or `null` if not supported by the user agent.
 */
function determineAncestorOrigin(): string {
  return location['ancestorOrigins'] && location['ancestorOrigins'][0];
}
