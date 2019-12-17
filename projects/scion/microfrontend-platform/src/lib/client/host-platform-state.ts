/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { noop, Observable } from 'rxjs';
import { filter, shareReplay, take } from 'rxjs/operators';
import { PlatformTopics } from '../ɵmessaging.model';
import { PlatformStates } from '../platform-state';
import { mapToBody, MessageClient } from './message-client';
import { Beans } from '../bean-manager';
import { PlatformMessageClient } from '../host/platform-message-client';

/**
 * Allows observing the state of the host platform.
 */
export class HostPlatformState {

  private _state$: Observable<PlatformStates>;

  constructor() {
    const messageClient = Beans.get(PlatformMessageClient, {orElseSupply: (): MessageClient => Beans.get(MessageClient)});
    this._state$ = messageClient.observe$<PlatformStates>(PlatformTopics.HostPlatformState)
      .pipe(
        mapToBody(),
        shareReplay(1),
      );
  }

  /**
   * Returns a Promise that resolves when the host app started. If already started, the promise resolves immediately.
   */
  public whenStarted(): Promise<void> {
    return this._state$
      .pipe(filter(it => it === PlatformStates.Started), take(1))
      .toPromise()
      .then(state => state ? Promise.resolve() : new Promise<never>(noop)); // {@link Observable.toPromise} resolves to `undefined` if not emitted a value and the stream completes, e.g. on shutdown. Then, never resolve the promise.
  }
}
