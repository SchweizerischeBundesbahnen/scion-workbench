/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { concat, EMPTY, NEVER, Observable, Observer, of, Subject, TeardownLogic } from 'rxjs';
import { expand, filter, map, mergeMapTo, share, take, takeUntil } from 'rxjs/operators';
import { UUID } from '@scion/toolkit/util';
import { Beans } from '../../bean-manager';
import { MessageClient } from '../message-client';
import { MessageHeaders, ResponseStatusCodes } from '../../messaging.model';
import { Contexts } from './context.model';
import { IS_PLATFORM_HOST } from '../../platform.model';

/**
 * Allows looking up values which are set on the current or a parent context.
 *
 * A context is a hierarchical key-value map which are linked together to form a tree structure.
 * When a key is not found in a context, the lookup is retried on the parent, repeating until either a
 * value is found or the root of the tree has been reached.
 */
export class ContextService {

  private _contextTreeChange$: Observable<Contexts.ContextTreeChangeEvent>;

  constructor() {
    this._contextTreeChange$ = this.notifyOnContextTreeChange$().pipe(share());
  }

  /**
   * Observes the context value associated with the given name.
   *
   * When the key is not found in a context, the lookup is retried on the parent context, repeating until either a value is found
   * or the root of the tree has been reached.
   *
   * @param  name
   *         The name of the value to return.
   * @return An Observable that emits the context value associated with the given key.
   *         Upon subscription, the tree of contexts is looked up for a value registered under the given name.
   *         If not found, the Observable emits `null`. The Observable never completes. It emits every time
   *         a value for the specified name is set or removed, and this at all levels of the tree.
   */
  public observe$<T>(name: string): Observable<T | null> {
    if (Beans.get(IS_PLATFORM_HOST)) {
      return concat(of(null), NEVER);
    }

    const lookupOnChange$ = this._contextTreeChange$.pipe(filter(event => event.name === name), mergeMapTo(this.lookupContextValue$<T>(name)));
    return this.lookupContextValue$<T>(name).pipe(expand(() => lookupOnChange$.pipe(take(1))));
  }

  /**
   * Observes the names of context values registered at any level in the context tree.
   *
   * @return An Observable that emits the names of context values registered at any level in the context tree.
   *         Upon subscription, it emits the names of context values currently registered, and then it emits whenever
   *         some value is registered or unregistered from a context. The Observable never completes.
   */
  public names$(): Observable<Set<string>> {
    if (Beans.get(IS_PLATFORM_HOST)) {
      return concat(of(new Set<string>()), NEVER);
    }

    const lookupOnChange$ = this._contextTreeChange$.pipe(mergeMapTo(this.lookupContextNames$()));
    return this.lookupContextNames$().pipe(expand(() => lookupOnChange$.pipe(take(1))));
  }

  /**
   * Looks up the context tree for a value associated with the given name.
   *
   * @param  name
   *         The name of the value to return.
   * @return An Observable that emits the context value associated with the given key and then completes.
   *         When the requested value is not found in a context, the Observable emits `null` and then completes.
   */
  private lookupContextValue$<T>(name: string): Observable<T | null> {
    return new Observable((observer: Observer<T>): TeardownLogic => {
      const replyTo = UUID.randomUUID();
      const unsubscribe$ = new Subject<void>();
      const contextValueLookupRequest = Contexts.newContextValueLookupRequest(name, replyTo);

      // Wait until the reply is received.
      Beans.get(MessageClient).observe$<T>(replyTo)
        .pipe(
          take(1),
          map(reply => reply.headers.get(MessageHeaders.Status) === ResponseStatusCodes.OK ? reply.body : null),
          takeUntil(unsubscribe$),
        )
        .subscribe(observer);

      // Send the request.
      whenSubscribedToReplyTopic(replyTo).then(() => window.parent.postMessage(contextValueLookupRequest, '*'));
      return (): void => unsubscribe$.next();
    });
  }

  /**
   * Looks up the context names of all values registered in the current and parent contexts.
   *
   * @return An Observable that emits the names of all values registered in the current and parent contexts and then completes.
   */
  private lookupContextNames$(): Observable<Set<string>> {
    return new Observable((observer: Observer<Set<string>>): TeardownLogic => {
      const replyTo = UUID.randomUUID();
      const unsubscribe$ = new Subject<void>();
      const contextNamesLookupRequest = Contexts.newContextTreeNamesLookupRequest(replyTo);

      // Wait until the reply is received.
      Beans.get(MessageClient).observe$<Set<string>>(replyTo)
        .pipe(
          take(1),
          map(reply => reply.headers.get(MessageHeaders.Status) === ResponseStatusCodes.OK ? reply.body : new Set()),
          takeUntil(unsubscribe$),
        )
        .subscribe(observer);

      // Send the request.
      whenSubscribedToReplyTopic(replyTo).then(() => window.parent.postMessage(contextNamesLookupRequest, '*'));
      return (): void => unsubscribe$.next();
    });
  }

  /**
   * Notifies when some context value changes at any level in the context tree.
   *
   * @return An Observable that emits upon a context tree change; the Observable never completes.
   */
  private notifyOnContextTreeChange$(): Observable<Contexts.ContextTreeChangeEvent> {
    return new Observable((observer: Observer<Contexts.ContextTreeChangeEvent>): TeardownLogic => {
      const replyTo = UUID.randomUUID();
      const unsubscribe$ = new Subject<void>();
      const contextObserveRequest = Contexts.newContextTreeObserveRequest(replyTo);

      // Receive change notifications.
      Beans.get(MessageClient).observe$<Contexts.ContextTreeChangeEvent>(replyTo)
        .pipe(
          map(message => message.body),
          takeUntil(unsubscribe$),
        )
        .subscribe(observer);

      // Send the request.
      whenSubscribedToReplyTopic(replyTo).then(() => window.parent.postMessage(contextObserveRequest, '*'));
      return (): void => unsubscribe$.next();
    });
  }
}

/**
 * Resolves when subscribed to the given reply topic.
 */
function whenSubscribedToReplyTopic(topic: string): Promise<void> {
  return Beans.get(MessageClient).subscriberCount$(topic)
    .pipe(
      filter(count => count === 1),
      take(1),
      mergeMapTo(EMPTY))
    .toPromise()
    .then(() => Promise.resolve());
}
