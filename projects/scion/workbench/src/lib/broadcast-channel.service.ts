/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { fromEvent, merge, Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';

const BROADCAST_CHANNEL_ITEM_KEY = 'workbench/broadcast-channel';

/**
 * Allows sending messages between browsing contexts of the same origin.
 *
 * Like the native `BroadcastChannel` but based on `LocalStorage` for wider browser support.
 */
@Injectable()
export class BroadcastChannelService {

  // Subject to dispatch local messages because a storage event is only dispatched between different browsing contexts.
  private readonly _localBrowsingContextChange$: Subject<Message>;
  private readonly _externalBrowsingContextChange$: Observable<Message>;

  constructor() {
    this._localBrowsingContextChange$ = new Subject<Message>();
    this._externalBrowsingContextChange$ = fromEvent<StorageEvent>(window, 'storage')
      .pipe(
        filter(event => event.storageArea === localStorage),
        filter(event => event.key === BROADCAST_CHANNEL_ITEM_KEY),
        filter(event => event.newValue !== null), // skip item remove events
        map(event => JSON.parse(event.newValue!)),
      );
  }

  /**
   * Sends the message to each listener in any browsing context with the same origin.
   */
  public postMessage<T>(destination: string, message?: T): void {
    const msg: Message = {
      destination: destination,
      payload: message,
    };

    // Put the message into local storage to trigger a storage change event and remove it immediately afterwards.
    localStorage.setItem(BROADCAST_CHANNEL_ITEM_KEY, JSON.stringify(msg));
    localStorage.removeItem(BROADCAST_CHANNEL_ITEM_KEY);
    this._localBrowsingContextChange$.next(msg);
  }

  /**
   * Emits upon the receipt of a message sent to the given destination.
   */
  public message$<T>(destination: string): Observable<T> {
    return merge(this._localBrowsingContextChange$, this._externalBrowsingContextChange$)
      .pipe(
        filter(message => message.destination === destination),
        map(message => message.payload as T),
      );
  }
}

interface Message {
  destination: string;
  payload: any;
}
