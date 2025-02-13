/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {fromEvent, merge, Observable, Subject} from 'rxjs';
import {map} from 'rxjs/operators';

/**
 * Allows sending events between browsing contexts of this origin.
 *
 * Like the native `BroadcastChannel`, but also receives events posted on this channel instance.
 */
export class WorkbenchBroadcastChannel<T> {

  /**
   * Channel to transport events to other `BroadcastChannel` instances.
   */
  private _broadcastChannel: BroadcastChannel;
  /**
   * Subject to transport events to this instance since the native `BroadcastChannel` transports events only to other `BroadcastChannel` instances.
   */
  private _localBrowsingContextEvent$ = new Subject<T>();
  /**
   * Receives events posted on this broadcast channel. Events are received across app instances of the same origin.
   */
  public readonly observe$: Observable<T>;

  constructor(name: string) {
    this._broadcastChannel = new BroadcastChannel(name);
    this.observe$ = merge(this._localBrowsingContextEvent$, fromEvent<MessageEvent<T>>(this._broadcastChannel, 'message').pipe(map(event => event.data)));
  }

  /**
   * Posts the given event to app instances of this origin.
   */
  public postMessage(event?: T): void {
    this._localBrowsingContextEvent$.next(event as T); // Emit locally since the native broadcast channel does not emit on the instance that posted the message.
    this._broadcastChannel.postMessage(event);
  }

  public destroy(): void {
    this._broadcastChannel.close();
    this._localBrowsingContextEvent$.complete();
  }
}
