/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { fromEvent, merge, Observable, Observer, Subject, TeardownLogic } from 'rxjs';
import { filter, first, take, takeUntil, tap } from 'rxjs/operators';
import { UUID } from './uuid.util';
import { Service } from './metadata';
import { MessageEnvelope, parseMessageEnvelopeElseNull, PROTOCOL } from '@scion/workbench-application-platform.api';

/**
 * Message bus to communicate with workbench application platform.
 */
export abstract class MessageBus implements Service {

  /**
   * Allows to receive messages sent by application platform.
   */
  public abstract get receive$(): Observable<MessageEnvelope>;

  /**
   * Initiates a request and receives replies continuously.
   *
   * Provide options object to control the subscription.
   */
  public abstract requestReceive$(envelope: MessageEnvelope, options?: { once: boolean }): Observable<MessageEnvelope>;

  /**
   * Posts a message to the application platform.
   */
  public abstract postMessage(envelope: MessageEnvelope): void;

  /**
   * Initiates a request-reply communication with the application platform.
   */
  public abstract requestReply(envelope: MessageEnvelope): Promise<MessageEnvelope>;

  /**
   * Lifecycle hook that is called when this service is destroyed.
   */
  public abstract onDestroy(): void;
}

/**
 * Default implementation of {MessageBus}.
 *
 * Communication is based on `postMessage` and `onmessage` to safely communicate cross-origin with the window parent.
 */
export class DefaultMessageBus implements MessageBus {

  private _destroy$ = new Subject<void>();
  private _ancestorOrigin: string;
  private _stream$ = new Subject<MessageEnvelope>();

  public constructor() {
    this._ancestorOrigin = determineAncestorOrigin();

    this.installHostMessageListener();
  }

  public installHostMessageListener(): void {
    fromEvent(window, 'message')
      .pipe(takeUntil(this._destroy$))
      .subscribe((event: MessageEvent) => {
        if (event.source === window) {
          return;
        }

        if (this._ancestorOrigin && event.origin !== this._ancestorOrigin) {
          throw Error(`[OriginError] Message of illegal origin received [expected=${this._ancestorOrigin}, actual=${event.origin}]`);
        }

        const envelope = parseMessageEnvelopeElseNull(event.data);
        if (!envelope) {
          return;
        }

        if (envelope.channel === 'host' && envelope.message.type === 'error') {
          console && console.error && console.error(envelope.message.payload);
          return;
        }

        this._stream$.next(envelope);
      });
  }

  public get receive$(): Observable<MessageEnvelope> {
    return this._stream$.asObservable();
  }

  public postMessage(envelope: MessageEnvelope): void {
    envelope.protocol = PROTOCOL;
    window.parent.postMessage(envelope, this._ancestorOrigin || '*');
  }

  public requestReceive$(envelope: MessageEnvelope, options?: { once: boolean }): Observable<MessageEnvelope> {
    const replyToUid = UUID.randomUUID();
    envelope.replyToUid = replyToUid;
    envelope.protocol = PROTOCOL;

    return new Observable((observer: Observer<MessageEnvelope>): TeardownLogic => {
      const destroy$ = new Subject<void>();
      this._stream$
        .pipe(
          filter(env => env.channel === 'reply'),
          filter(env => env.replyToUid === replyToUid),
          options && options.once ? take(1) : tap(),
          takeUntil(merge(destroy$, this._destroy$)),
        )
        .subscribe(observer);

      this.postMessage(envelope);

      return (): void => {
        destroy$.next();
      };
    });
  }

  public requestReply(envelope: MessageEnvelope): Promise<MessageEnvelope> {
    const replyToUid = UUID.randomUUID();
    envelope.replyToUid = replyToUid;
    envelope.protocol = PROTOCOL;

    const replyPromise = this._stream$
      .pipe(
        filter(env => env.channel === 'reply'),
        filter(env => env.replyToUid === replyToUid),
        first(),
        takeUntil(this._destroy$),
      )
      .toPromise();
    this.postMessage(envelope);
    return replyPromise;
  }

  public onDestroy(): void {
    this._destroy$.next();
  }
}

/**
 * Returns the ancestor origin, or `null` if not supported by the user agent.
 */
export function determineAncestorOrigin(): string {
  return location['ancestorOrigins'] && location['ancestorOrigins'][0];
}
