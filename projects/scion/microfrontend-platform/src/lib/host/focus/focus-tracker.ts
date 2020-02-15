/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { PlatformMessageClient } from '../platform-message-client';
import { Beans, PreDestroy } from '../../bean-manager';
import { BehaviorSubject, Subject } from 'rxjs';
import { distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { takeUntilUnsubscribe } from '../../client/messaging/message-client';
import { MessageHeaders, TopicMessage } from '../../messaging.model';
import { runSafe } from '../../safe-runner';
import { PlatformTopics } from '../../ɵmessaging.model';
import { Client, ClientRegistry } from '../message-broker/client.registry';

/**
 * Tracks the focus across microfrontends and answers {@link PlatformTopics.IsFocusWithin} requests.
 *
 * @see FocusInEventDispatcher
 * @see FocusMonitor
 * @ignore
 */
export class FocusTracker implements PreDestroy {

  private _destroy$ = new Subject<void>();
  private _focusOwner$ = new BehaviorSubject<Client>(undefined);

  constructor() {
    this.monitorFocusInEvents();
    this.replyToIsFocusWithinRequests();
  }

  /**
   * Monitors when a client gains the focus.
   */
  private monitorFocusInEvents(): void {
    Beans.get(PlatformMessageClient).observe$<void>(PlatformTopics.FocusIn)
      .pipe(
        map(event => event.headers.get(MessageHeaders.ClientId)),
        distinctUntilChanged(),
        takeUntil(this._destroy$),
      )
      .subscribe(clientId => runSafe(() => {
        this._focusOwner$.next(Beans.get(ClientRegistry).getByClientId(clientId) || undefined);
      }));
  }

  /**
   * Replies to 'focus-within' requests.
   */
  private replyToIsFocusWithinRequests(): void {
    Beans.get(PlatformMessageClient).observe$<void>(PlatformTopics.IsFocusWithin)
      .pipe(takeUntil(this._destroy$))
      .subscribe((request: TopicMessage<void>) => runSafe(() => {
        const clientId = request.headers.get(MessageHeaders.ClientId);
        const replyTo = request.headers.get(MessageHeaders.ReplyTo);

        this._focusOwner$
          .pipe(
            map(focusOwner => this.isFocusWithin(clientId, focusOwner)),
            distinctUntilChanged(),
            takeUntilUnsubscribe(replyTo, PlatformMessageClient),
            takeUntil(this._destroy$),
          )
          .subscribe((isFocusWithin: boolean) => {
            Beans.get(PlatformMessageClient).publish$(replyTo, isFocusWithin).subscribe();
          });
      }));
  }

  /**
   * Tests whether the given client has received focus or contains embedded web content that has received focus.
   */
  private isFocusWithin(clientId: string, focusOwner: Client | undefined): boolean {
    const clientWindow = Beans.get(ClientRegistry).getByClientId(clientId).window;
    for (let client = focusOwner; client !== undefined; client = this.getParentClient(client)) {
      // Compare against the window instead of the client id because in the host app the
      // {@link MessageClient} and {@link PlatformMessageClient} share the same window
      if (client.window === clientWindow) {
        return true;
      }
    }
    return false;
  }

  private getParentClient(client: Client): Client | undefined {
    if (client.window.parent === client.window) {
      return undefined; // window has no parent as it is the top-level window
    }
    return Beans.get(ClientRegistry).getByWindow(client.window.parent) || undefined;
  }

  public preDestroy(): void {
    this._destroy$.next();
  }
}
